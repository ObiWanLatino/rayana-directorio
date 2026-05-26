"use client";

import { useCategorias } from "@/hooks/useCategorias";
import { useFeaturedSuppliers } from "@/hooks/useFeaturedSuppliers";
import Script from "next/script";
import { useEffect, useState } from "react";
import { LandingMarkup } from "./landing-markup";
import "./home-landing.css";

export default function HomeLandingClient() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { suppliers, loading } = useFeaturedSuppliers("56");
  const { categorias, loading: catLoading, conteos } = useCategorias();

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = document.getElementById("mk-landing");
    if (!root) return;

    const onFaqClick = (e: Event) => {
      const t = e.target as HTMLElement | null;
      const q = t?.closest(".faq-q");
      if (!q || !root.contains(q)) return;
      const item = q.closest(".faq-item");
      if (!item) return;
      const was = item.classList.contains("open");
      root.querySelectorAll(".faq-item").forEach((i) => {
        i.classList.remove("open");
      });
      if (!was) item.classList.add("open");
    };
    root.addEventListener("click", onFaqClick);

    const obs = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          en.target.classList.add("visible");
          obs.unobserve(en.target);
        }
      },
      { threshold: 0.1 },
    );
    root.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest(
        "a[href^='#']",
      ) as HTMLAnchorElement | null;
      if (!a || !root.contains(a)) return;
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const id = href.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setMobileOpen(false);
      }
    };
    root.addEventListener("click", onAnchor);

    return () => {
      root.removeEventListener("click", onFaqClick);
      root.removeEventListener("click", onAnchor);
      obs.disconnect();
    };
  }, []);

  return (
    <div id="mk-landing" className="flex w-full flex-1 flex-col">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"
        strategy="lazyOnload"
      />
      <LandingMarkup
        navScrolled={navScrolled}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen((o) => !o)}
        onMobileNavigate={() => setMobileOpen(false)}
        featuredSuppliers={suppliers}
        featuredLoading={loading}
        categorias={categorias}
        catLoading={catLoading}
        conteos={conteos}
      />
    </div>
  );
}

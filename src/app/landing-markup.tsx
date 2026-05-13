"use client";

import Image from "next/image";
import Link from "next/link";

type LandingMarkupProps = {
  navScrolled?: boolean;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
  onMobileNavigate?: () => void;
};

export function LandingMarkup({
  navScrolled = false,
  mobileOpen = false,
  onMobileToggle,
  onMobileNavigate,
}: LandingMarkupProps) {
  return (
    <>
      {/* NAV */}
      <nav id="navbar" className={navScrolled ? "scrolled" : ""}>
  <div className="nav-inner">
    <Link href="/" className="nav-logo">
      <Image
        src="/Logo-makeray.png"
        alt="Makeray"
        width={220}
        height={44}
        className="h-11 w-auto"
        priority
      />
    </Link>
    <ul className="nav-links">
      <li><a href="#problema">El Problema</a></li>
      <li><a href="#categorias">Categorías</a></li>
      <li><a href="#precio">Precio</a></li>
      <li><a href="#faq">FAQ</a></li>
      <li><Link href="/login" className="btn-nav">Acceder ahora</Link></li>
    </ul>
    <button
      type="button"
      className="nav-mobile-btn"
      id="mobileBtn"
      aria-label="Menú"
      aria-expanded={mobileOpen}
      onClick={() => onMobileToggle?.()}
    >
      <i className="fas fa-bars"></i>
    </button>
  </div>
  <div
    className={`mobile-menu${mobileOpen ? " open" : ""}`}
    id="mobileMenu"
    onClick={(e) => {
      if ((e.target as HTMLElement).closest("a")) onMobileNavigate?.();
    }}
  >
    <a href="#problema">El Problema</a>
    <a href="#categorias">Categorías</a>
    <a href="#precio">Precio</a>
    <a href="#faq">FAQ</a>
    <Link href="/login" className="btn-mob">Acceder ahora →</Link>
  </div>
</nav>

{/* HERO */}
<section style={{padding: 0}}>
  <div className="hero">
    {/* Texto */}
    <div className="hero-text">
      <div className="hero-badge">
        <span className="dot"></span>
        Para emprendedoras en Chile · @makeray.youtube
      </div>
      <h1>Los proveedores que <em>cambiarán</em> tu negocio.</h1>
      <p className="hero-sub">
        <strong>+ 1000 proveedores mayoristas verificados.</strong> Contacto directo por WhatsApp desde tu celular.
      </p>
      <div className="hero-cta">
        <Link href="/login" className="btn-primary">
          Acceder ahora <i className="fas fa-arrow-right"></i>
        </Link>
        <a href="#incluye" className="btn-secondary">Ver qué incluye</a>
      </div>
      <div className="price-hint" style={{marginBottom: '20px'}}>
        <i className="fas fa-lock" style={{color: 'var(--primary)', fontSize: '.75rem'}}></i>
        <strong>$19.990</strong> / mes · cancela cuando quieras
      </div>
      <div className="social-proof">
        <div className="avatars">
          <img src="https://placehold.co/64x64/592f92/ffffff?text=A" alt="" />
          <img src="https://placehold.co/64x64/ff108a/ffffff?text=B" alt="" />
          <img src="https://placehold.co/64x64/2d1157/ffffff?text=C" alt="" />
          <img src="https://placehold.co/64x64/7c52b8/ffffff?text=D" alt="" />
        </div>
        <span>+5000 emprendedoras ya dentro</span>
      </div>
    </div>

    {/* Visual */}
    <div className="hero-visual">
      <div className="phone-wrap">
        <div className="phone-glow"></div>
        <div className="phone-float">
          {/* Floating badges */}
          <div className="fbadge fbadge-1">
            <span className="num">1000+</span>
            <div>
              <div style={{fontSize: '.65rem', color: 'var(--muted)'}}>Proveedores</div>
              <div style={{fontSize: '.7rem'}}>verificados ✓</div>
            </div>
          </div>
          <div className="fbadge fbadge-2">
            <i className="fab fa-whatsapp" style={{color: '#25D366', fontSize: '1rem'}}></i>
            <div>
              <div style={{fontSize: '.7rem'}}>1 tap a</div>
              <div style={{fontSize: '.65rem', color: 'var(--muted)'}}>WhatsApp</div>
            </div>
          </div>

          <div className="phone-frame">
            <div className="phone-screen">
              {/* Header */}
              <div className="pscreen-header">
                <div className="ps-top">
                  <span>9:41</span>
                  <span><i className="fas fa-signal"></i> <i className="fas fa-wifi"></i> <i className="fas fa-battery-full"></i></span>
                </div>
                <h3>Plataforma de Proveedores</h3>
                <p>+ 1000 proveedores verificados</p>
              </div>
              {/* Search */}
              <div className="pscreen-search">
                <i className="fas fa-search" style={{fontSize: '.7rem'}}></i>
                Buscar por código #47…
              </div>
              {/* Categories */}
              <div className="pscreen-cats" style={{marginBottom: '10px'}}>
                <div className="pcat active">👗 Moda</div>
                <div className="pcat">💍 Joyas</div>
                <div className="pcat">🏠 Deco</div>
              </div>
              {/* Provider list */}
              <div className="pscreen-list">
                <div className="pcard">
                  <div className="pcard-avatar" style={{background: 'linear-gradient(135deg,#592f92,#ff108a)'}}>#47</div>
                  <div className="pcard-info">
                    <div className="code">#47 · Moda Femenina</div>
                    <div className="name">Atelier Rosé</div>
                    <div className="badge-verified">✓ Verificado</div>
                  </div>
                  <div className="pcard-wa"><i className="fab fa-whatsapp"></i></div>
                </div>
                <div className="pcard">
                  <div className="pcard-avatar" style={{background: 'linear-gradient(135deg,#1a0633,#592f92)'}}>#48</div>
                  <div className="pcard-info">
                    <div className="code">#48 · Joyas</div>
                    <div className="name">Joyería Maipú</div>
                    <div className="badge-verified">✓ Verificado</div>
                  </div>
                  <div className="pcard-wa"><i className="fab fa-whatsapp"></i></div>
                </div>
                <div className="pcard">
                  <div className="pcard-avatar" style={{background: 'linear-gradient(135deg,#ff108a,#ff6eb4)'}}>#49</div>
                  <div className="pcard-info">
                    <div className="code">#49 · Deco Hogar</div>
                    <div className="name">Deco Lo Espejo</div>
                    <div className="badge-verified">✓ Verificado</div>
                  </div>
                  <div className="pcard-wa"><i className="fab fa-whatsapp"></i></div>
                </div>
                <div className="pcard" style={{opacity: '.5'}}>
                  <div className="pcard-avatar" style={{background: '#d1c7e0'}}>#50</div>
                  <div className="pcard-info">
                    <div className="code" style={{filter: 'blur(4px)'}}>#50 · Importadora</div>
                    <div className="name" style={{filter: 'blur(4px)'}}>••••••••</div>
                  </div>
                  <div style={{fontSize: '.6rem', color: 'var(--muted)'}}><i className="fas fa-lock"></i></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* STATS BAR */}
<div className="stats-bar">
  <div className="stats-inner">
    <div className="stat-item">
      <div className="stat-num">1000<span>+</span></div>
      <div className="stat-label">Proveedores</div>
    </div>
    <div className="stat-item">
      <div className="stat-num">4</div>
      <div className="stat-label">Países diferentes</div>
    </div>
    <div className="stat-item">
      <div className="stat-num">1<span> tap</span></div>
      <div className="stat-label">a WhatsApp</div>
    </div>
    <div className="stat-item">
      <div className="stat-num">100<span>%</span></div>
      <div className="stat-label">Verificados</div>
    </div>
  </div>
</div>

{/* PROBLEMA */}
<section id="problema" className="problema">
  <div className="container">
    <div className="reveal">
      <div className="section-tag">La realidad del emprendimiento</div>
      <h2 className="section-title">Emprender en Chile<br/><em style={{fontStyle: 'italic', color: 'var(--accent)'}}>no debería</em> ser un dolor de cabeza.</h2>
      <p className="section-sub">Sabemos lo que frena tu crecimiento — y cómo los proveedores correctos lo cambian</p>
    </div>
    <div className="problema-grid">
      <div className="prob-card reveal reveal-delay-1">
        <div className="prob-icon" style={{background: 'rgba(89,47,146,.1)', color: 'var(--primary)'}}>
          <i className="fas fa-search-dollar"></i>
        </div>
        <h4>Pagas de más</h4>
        <p>Comprar a intermediarios en redes sociales está comiendo tu margen. Necesitas llegar directamente a la fuente.</p>
      </div>
      <div className="prob-card reveal reveal-delay-2">
        <div className="prob-icon" style={{background: 'rgba(255,16,138,.1)', color: 'var(--accent)'}}>
          <i className="fas fa-clock"></i>
        </div>
        <h4>Pierdes tiempo</h4>
        <p>Horas en Meiggs o Patronato buscando calidad, cuando podrías estar enfocada en vender y hacer crecer tu marca.</p>
      </div>
      <div className="prob-card reveal reveal-delay-3">
        <div className="prob-icon" style={{background: 'rgba(26,6,51,.06)', color: 'var(--navy)'}}>
          <i className="fas fa-shield-alt"></i>
        </div>
        <h4>Miedo a estafas</h4>
        <p>Transferir a perfiles dudosos es un riesgo real. Necesitas contactos verificados por alguien de confianza.</p>
      </div>
    </div>
  </div>
</section>

{/* PRODUCTO */}
<section id="incluye" className="producto">
  <div className="container">
    <div className="producto-grid">
      {/* Texto izquierda */}
      <div className="reveal">
        <div className="section-tag">Directorio Makeray</div>
        <h2 className="section-title" style={{color: '#fff'}}>Todo lo que necesitas<br/>en un solo lugar.</h2>
        <ul className="features-list">
          <li>
            <div className="feat-icon"><i className="fas fa-list"></i></div>
            <div>
              <strong>+1000 Proveedores Verificados</strong>
              Moda Mujer, Hombre, Niño, Accesorios, Joyas, Deco Hogar, Fardos de Ropa, Importadoras, Electronicos y más. Verificados personalmente por Rayana.
            </div>
          </li>
          <li>
            <div className="feat-icon"><i className="fab fa-whatsapp"></i></div>
            <div>
              <strong>Directo a WhatsApp</strong>
              Un tap y estás hablando con el proveedor.
            </div>
          </li>
          <li>
            <div className="feat-icon"><i className="fas fa-sync-alt"></i></div>
            <div>
              <strong>Siempre Actualizado</strong>
              Rayana agrega proveedores cada mes. Siempre tendrás contactos frescos.
            </div>
          </li>
          <li>
            <div className="feat-icon"><i className="fas fa-mobile-alt"></i></div>
            <div>
              <strong>Diseñado para tu celular</strong>
              Úsalo en cualquier lugar: ferias, shows de moda, donde estés.
            </div>
          </li>
          <li className="reveal reveal-delay-2">
            <div className="feat-icon"><i className="fas fa-globe-americas"></i></div>
            <div>
              <strong>Alcance Internacional</strong>
              Accede a proveedores de Chile, Brasil, Argentina, Perú.
            </div>
          </li>
        </ul>
        <div className="cta-producto">
          <Link href="/login" className="btn-accent-big">
            Suscribirme ahora <i className="fas fa-arrow-right"></i>
          </Link>
          <div className="price-pill">
            <strong>$19.990</strong> / mes
          </div>
        </div>
      </div>

      {/* Preview card derecha */}
      <div className="reveal reveal-delay-1">
        <div className="preview-card">
          <div className="preview-header">
            <div>
              <h3>Plataforma de Proveedores</h3>
              <p>Proveedores mayoristas de Chile</p>
            </div>
            <div className="preview-badge">2026</div>
          </div>
          <div className="preview-rows prev-blur" {...{ "data-count": "1000" }}>
            <div className="prev-row">
              <div className="prev-row-left">
                <div className="prev-avatar" style={{background: 'linear-gradient(135deg,#592f92,#ff108a)'}}>#47</div>
                <div>
                  <div className="prev-name">Atelier Rosé</div>
                  <div className="prev-cat">Moda Femenina</div>
                </div>
              </div>
              <div className="verified-badge">✓ Verificado</div>
            </div>
            <div className="prev-row">
              <div className="prev-row-left">
                <div className="prev-avatar" style={{background: 'linear-gradient(135deg,#1a0633,#592f92)'}}>#48</div>
                <div>
                  <div className="prev-name">Joyería Maipú</div>
                  <div className="prev-cat">Joyas</div>
                </div>
              </div>
              <div className="verified-badge">✓ Verificado</div>
            </div>
            <div className="prev-row">
              <div className="prev-row-left">
                <div className="prev-avatar" style={{background: 'linear-gradient(135deg,#ff108a,#ff6eb4)'}}>#49</div>
                <div>
                  <div className="prev-name">Deco Lo Espejo</div>
                  <div className="prev-cat">Deco Hogar</div>
                </div>
              </div>
              <div className="verified-badge">✓ Verificado</div>
            </div>
            <div className="prev-row" style={{opacity: '.35'}}>
              <div className="prev-row-left">
                <div className="prev-avatar" style={{background: '#333'}}>#50</div>
                <div>
                  <div className="prev-name" style={{filter: 'blur(5px)', userSelect: 'none'}}>••••••••••</div>
                  <div className="prev-cat" style={{filter: 'blur(3px)'}}>••••</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* CATEGORÍAS */}
<section id="categorias" className="categorias">
  <div className="container">
    <div className="reveal" style={{textAlign: 'center'}}>
      <div className="section-tag">Qué tipo de proveedores encontrarás</div>
      <h2 className="section-title">Plataforma organizada por categorias</h2>
      <p style={{fontSize: '.85rem', color: 'var(--muted)', fontWeight: 600, marginTop: '8px'}}>más ventas, mas ganancias.</p>
    </div>
    <div className="cat-grid">
      <div className="cat-card reveal reveal-delay-1">
        <span className="cat-emoji"><i className="fas fa-female"></i></span>
        <div className="cat-name">Moda Femenina</div>
      </div>
      <div className="cat-card reveal reveal-delay-1">
        <span className="cat-emoji"><i className="fas fa-male"></i></span>
        <div className="cat-name">Moda Masculina</div>
      </div>
      <div className="cat-card reveal reveal-delay-2">
        <span className="cat-emoji"><i className="fas fa-child"></i></span>
        <div className="cat-name">Moda Infantil</div>
      </div>
      <div className="cat-card reveal reveal-delay-2">
        <span className="cat-emoji"><i className="fas fa-running"></i></span>
        <div className="cat-name">Moda Deportiva</div>
      </div>
      <div className="cat-card reveal reveal-delay-3">
        <span className="cat-emoji"><i className="fas fa-heart"></i></span>
        <div className="cat-name">Lenceria</div>
      </div>
      <div className="cat-card reveal reveal-delay-3">
        <span className="cat-emoji"><i className="fas fa-fire"></i></span>
        <div className="cat-name">Sex Shop</div>
      </div>
      <div className="cat-card reveal reveal-delay-3">
        <span className="cat-emoji"><i className="fas fa-paw"></i></span>
        <div className="cat-name">Accesorios para mascotas</div>
      </div>
      <div className="cat-card reveal reveal-delay-3">
        <span className="cat-emoji"><i className="fas fa-shoe-prints"></i></span>
        <div className="cat-name">Calzados</div>
      </div>
      <div className="cat-card reveal reveal-delay-1">
        <span className="cat-emoji"><i className="fas fa-shopping-bag"></i></span>
        <div className="cat-name">Carteras y accesorios</div>
      </div>
      <div className="cat-card reveal reveal-delay-1">
        <span className="cat-emoji"><i className="fas fa-gem"></i></span>
        <div className="cat-name">Joyas y Bisutería</div>
      </div>
      <div className="cat-card reveal reveal-delay-2">
        <span className="cat-emoji"><i className="fas fa-spa"></i></span>
        <div className="cat-name">Cosmética y Maquillaje</div>
      </div>
      <div className="cat-card reveal reveal-delay-2">
        <span className="cat-emoji"><i className="fas fa-home"></i></span>
        <div className="cat-name">Deco Hogar</div>
      </div>
      <div className="cat-card reveal reveal-delay-3">
        <span className="cat-emoji"><i className="fas fa-box-open"></i></span>
        <div className="cat-name">Fardos de ropa</div>
      </div>
      <div className="cat-card reveal reveal-delay-3">
        <span className="cat-emoji"><i className="fas fa-laptop"></i></span>
        <div className="cat-name">Electronicos</div>
      </div>
      <div className="cat-card reveal reveal-delay-3">
        <span className="cat-emoji"><i className="fas fa-ship"></i></span>
        <div className="cat-name">Importadoras</div>
      </div>
    </div>
  </div>
</section>

{/* MOBILE UX */}
<section className="mobile-sec">
  <div className="container">
    <div className="mobile-inner">
      <div className="reveal">
        <div className="section-tag">En tu bolsillo</div>
        <h2 className="section-title">Diseñado para usar<br/>desde tu celular.</h2>
        <p className="section-sub">En ferias, en la tienda o en la calle — el listado de proveedores completo, siempre contigo.</p>
        <div className="mobile-points">
          <div className="m-point">
            <div className="m-icon" style={{background: 'rgba(89,47,146,.1)', color: 'var(--primary)'}}>
              <i className="fas fa-search"></i>
            </div>
            <div>
              <h4>Busca por código #47</h4>
              <p>Cada proveedor tiene su código único. Búscalos al instante.</p>
            </div>
          </div>
          <div className="m-point">
            <div className="m-icon" style={{background: 'rgba(37,211,102,.1)', color: '#25D366'}}>
              <i className="fab fa-whatsapp"></i>
            </div>
            <div>
              <h4>WhatsApp con un tap</h4>
              <p>Mensaje pre-escrito listo para enviar. Sin copiar números.</p>
            </div>
          </div>
          <div className="m-point">
            <div className="m-icon" style={{background: 'rgba(255,16,138,.1)', color: 'var(--accent)'}}>
              <i className="fas fa-filter"></i>
            </div>
            <div>
              <h4>Filtros por categoría</h4>
              <p>Ve solo moda, solo joyas, solo deco. Como tú lo necesites.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="phone-demo-wrap reveal reveal-delay-1">
        <div className="phone-demo">
          <div className="phone-demo-screen">
            <div className="pdemo-header">
              <div className="time">9:41 ● ● ●</div>
              <h4>Plataforma de Proveedores</h4>
              <p>Buscar #47…</p>
            </div>
            <div className="pdemo-search">
              <i className="fas fa-search" style={{fontSize: '.65rem'}}></i>
              Buscar por código…
            </div>
            <div style={{padding: '0 10px', display: 'flex', gap: '6px', marginBottom: '10px'}}>
              <div className="pcat active" style={{fontSize: '.62rem', padding: '4px 10px'}}>👗 Moda</div>
              <div className="pcat" style={{fontSize: '.62rem', padding: '4px 10px'}}>💍 Joyas</div>
              <div className="pcat" style={{fontSize: '.62rem', padding: '4px 10px'}}>🏠 Deco</div>
            </div>
            <div className="pdemo-cards">
              <div className="pdemo-card">
                <div className="pdemo-av" style={{background: 'linear-gradient(135deg,#592f92,#ff108a)'}}>#47</div>
                <div className="pdemo-info">
                  <div className="code">#47</div>
                  <div className="nm">Atelier Rosé</div>
                  <div className="ct">Moda femenina</div>
                </div>
                <div className="pdemo-wa"><i className="fab fa-whatsapp"></i></div>
              </div>
              <div className="pdemo-card">
                <div className="pdemo-av" style={{background: 'linear-gradient(135deg,#1a0633,#7c52b8)'}}>#48</div>
                <div className="pdemo-info">
                  <div className="code">#48</div>
                  <div className="nm">Joyería Maipú</div>
                  <div className="ct">Joyas</div>
                </div>
                <div className="pdemo-wa"><i className="fab fa-whatsapp"></i></div>
              </div>
              <div className="pdemo-card">
                <div className="pdemo-av" style={{background: 'linear-gradient(135deg,#ff108a,#ff6eb4)'}}>#49</div>
                <div className="pdemo-info">
                  <div className="code">#49</div>
                  <div className="nm">Deco Lo Espejo</div>
                  <div className="ct">Deco Hogar</div>
                </div>
                <div className="pdemo-wa"><i className="fab fa-whatsapp"></i></div>
              </div>
              <div className="pdemo-card">
                <div className="pdemo-av" style={{background: 'linear-gradient(135deg,#592f92,#1a0633)'}}>#50</div>
                <div className="pdemo-info">
                  <div className="code">#50</div>
                  <div className="nm">Importadora Norte</div>
                  <div className="ct">Importadoras</div>
                </div>
                <div className="pdemo-wa"><i className="fab fa-whatsapp"></i></div>
              </div>
            </div>
          </div>
        </div>
        {/* decoration ring */}
        <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '320px', height: '320px', borderRadius: '50%', border: '1px dashed rgba(89,47,146,.15)', zIndex: 1, pointerEvents: 'none'}}></div>
        <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '400px', height: '400px', borderRadius: '50%', border: '1px dashed rgba(89,47,146,.08)', zIndex: 1, pointerEvents: 'none'}}></div>
      </div>
    </div>
  </div>
</section>

{/* RAYANA */}
<section className="rayana-sec">
  <div className="container">
    <div className="rayana-card reveal">
      <div className="rayana-photo">
        <div className="ring"></div>
        <Image
          src="/foto-rayana.jpg"
          alt="Rayana"
          width={180}
          height={180}
        />
      </div>
      <div className="rayana-info">
        <div className="tag">✦ LA CEO</div>
        <h3>Soy Rayana</h3>
        <p>Brasileña viviendo en Chile. Comparto diariamente contenido, sobre emprendimiento a través de mis Redes Sociales, donde impacto a millones de personas en YouTube, Instagram y TikTok.<br/><br/>
        Mi misión es ayudar a personas comunes a comenzar su propio negocio con proveedores de confianza y vender todos los días.</p>
        <div className="rayana-socials">
          <a href="https://www.instagram.com/makeray.youtube" target="_blank" rel="noopener" className="soc-btn"><i className="fab fa-instagram"></i></a>
          <a href="https://www.youtube.com/@makeray.youtube" target="_blank" rel="noopener" className="soc-btn"><i className="fab fa-youtube"></i></a>
          <a href="https://www.tiktok.com/@makeray.youtube" target="_blank" rel="noopener" className="soc-btn"><i className="fab fa-tiktok"></i></a>
        </div>
      </div>
    </div>
  </div>
</section>

{/* PRECIO */}
<section id="precio" className="precio-sec">
  <div className="container" style={{textAlign: 'center'}}>
    <div className="reveal">
      <div className="section-tag">Acceso completo</div>
      <h2 className="section-title">Un solo precio.<br/>Todo incluido.</h2>
    </div>
    <div className="pricing-card reveal reveal-delay-1">
      <div className="pricing-top">
        <div>
          <h3>Directorio Makeray</h3>
          <p style={{color: 'rgba(255,255,255,.5)', fontSize: '.8rem', marginTop: '4px'}}>Acceso completo al directorio</p>
        </div>
        <div className="edition">Edición 2026</div>
      </div>
      <div className="pricing-amount">
        <div className="price">$19.990</div>
        <div className="per">CLP / mes · cancela cuando quieras</div>
      </div>
      <ul className="pricing-features">
        <li><i className="fas fa-check-circle"></i> Acceso a + 1000 proveedores</li>
        <li><i className="fas fa-check-circle"></i> Contacto directo por WhatsApp</li>
        <li><i className="fas fa-check-circle"></i> Filtros por categoría y búsqueda por código</li>
        <li><i className="fas fa-check-circle"></i> Verificados por Rayana, con sello de confianza</li>
        <li><i className="fas fa-check-circle"></i> Actualizaciones mensuales incluidas</li>
        <li><i className="fas fa-check-circle"></i> Cancela cuando quieras</li>
      </ul>
      <Link href="/login" className="btn-pricing">Suscribirme ahora</Link>
      <p className="pricing-note">Sin reembolsos. Mantén el acceso hasta el fin del período pagado. Pago seguro.</p>
    </div>
  </div>
</section>

{/* FAQ */}
<section id="faq" className="faq-sec">
  <div className="container" style={{textAlign: 'center'}}>
    <div className="reveal">
      <div className="section-tag">Preguntas frecuentes</div>
      <h2 className="section-title">Tenemos las respuestas.</h2>
    </div>
    <div className="faq-list">
      <div className="faq-item">
        <div className="faq-q">
          ¿Cómo accedo al directorio?
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="faq-a"><p>Luego de suscribirte con tarjeta de crédito o débito, recibes acceso inmediato al directorio completo.</p></div>
      </div>
      <div className="faq-item">
        <div className="faq-q">
          ¿Puedo cancelar cuando quiera?
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="faq-a"><p>Sí. Puedes cancelar en cualquier momento desde tu panel. Mantendrás el acceso hasta el fin del período pagado. No hay reembolsos.</p></div>
      </div>
      <div className="faq-item">
        <div className="faq-q">
          ¿Los proveedores están en todo Chile?
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="faq-a"><p>La mayoría está en Santiago, especialmente en Patronato y zonas mayoristas. Algunos tienen despacho a regiones.</p></div>
      </div>
      <div className="faq-item">
        <div className="faq-q">
          ¿Cómo contacto a los proveedores?
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="faq-a"><p>Con un tap en el botón de WhatsApp de cada proveedor. Se abre directamente con un mensaje pre-escrito listo para enviar.</p></div>
      </div>
      <div className="faq-item">
        <div className="faq-q">
          ¿Es seguro pagar?
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="faq-a"><p>Sí. Los pagos se procesan de forma segura. Nunca almacenamos tus datos bancarios.</p></div>
      </div>
      <div className="faq-item">
        <div className="faq-q">
          ¿Qué pasa si Rayana agrega nuevos proveedores?
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="faq-a"><p>Los ves automáticamente sin costo adicional. La suscripción incluye todas las actualizaciones mensuales.</p></div>
      </div>
    </div>
    <p style={{marginTop: '28px', fontSize: '.85rem', color: 'var(--muted)'}}>¿Tienes otra pregunta? <a href="mailto:hola@makeray.cl" style={{color: 'var(--primary)', fontWeight: 600}}>hola@makeray.cl</a></p>
  </div>
</section>

{/* CTA FINAL */}
<section className="cta-final">
  <div className="container">
    <div className="reveal">
      <h2>Tu negocio <em>empieza aquí.</em></h2>
      <p>Únete a cientos de emprendedoras que ya tienen acceso a los mejores proveedores mayoristas de Chile.</p>
      <Link href="/login" className="btn-accent-big">
        Suscribirme — $19.990/mes <i className="fas fa-arrow-right"></i>
      </Link>
      <div className="cta-hint">cancela cuando quieras · pago seguro</div>
    </div>
  </div>
</section>

{/* FOOTER */}
<footer>
  <div className="footer-inner">
    <div className="footer-top">
      <Link href="/" className="footer-logo">
        <Image
          src="/Logo-makeray.png"
          alt="Makeray"
          width={240}
          height={48}
          className="h-12 w-auto opacity-90 [filter:brightness(0)_invert(1)]"
        />
      </Link>
      <div className="footer-links">
        <a href="#">Términos</a>
        <a href="#">Privacidad</a>
        <a href="mailto:hola@makeray.cl">Contacto</a>
      </div>
    </div>
    <div className="footer-bottom">
      <div className="footer-copy">© 2026 Makeray. Todos los derechos reservados.</div>
      <div className="footer-desc">El directorio de proveedores mayoristas de Rayana. Hecho en Chile, para emprendedoras chilenas.</div>
    </div>
  </div>
</footer>
    </>
  );
}

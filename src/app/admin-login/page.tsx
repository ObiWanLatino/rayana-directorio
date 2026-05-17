import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <AdminLoginHeader />
        <Suspense
          fallback={
            <p className="text-center text-sm text-zinc-500">Cargando…</p>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}

function AdminLoginHeader() {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-xl font-semibold text-white">Makeray Admin</h1>
      <p className="mt-1 text-sm text-zinc-500">Acceso restringido</p>
    </div>
  );
}

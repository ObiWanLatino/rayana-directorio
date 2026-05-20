# Backlog — Rayana / Makeray

## Deuda técnica crítica (pre go-live)

### SEC-001 — RLS incompleto en tablas sensibles

| Campo | Valor |
|-------|--------|
| **Prioridad** | Crítica — bloqueante antes del lanzamiento público |
| **Sprint objetivo** | Sprint 4 **o antes de go-live** (no Sprint 2) |
| **Estado** | Registrado — **no implementar ahora** |
| **Registrado** | 2026-05-20 |

#### Problema

Varias tablas con datos sensibles (PII, tokens, chats) **no tienen Row Level Security (RLS)** o quedan expuestas vía PostgREST con `anon` / `authenticated`. Acceso directo desde el cliente Supabase podría filtrar datos sin pasar por el backend.

#### Tablas afectadas (nombres de dominio)

| Tabla | Datos sensibles |
|-------|-----------------|
| `WholesalerApplication` | RUT, teléfono, email |
| `ResellerInvite` | Tokens de invitación |
| `AdminInvite` | Tokens de invitación |
| `Conversation` | Chats de clientes |
| `ResellListing` | Listados / datos comerciales |
| `AdminUser` | Cuentas admin |
| `AdminChat` | Chats admin |

> **Nota Rayana actual:** En este repo, `admin_users` y `admin_access_log` ya tienen RLS habilitado sin policies (solo `service_role`). Otras tablas del directorio (`suppliers`, `profiles`, etc.) tienen políticas documentadas en `supabase/schema.sql`. Las tablas listadas arriba corresponden al producto ampliado / esquema pendiente de endurecer.

#### Fix requerido (por tabla)

```sql
ALTER TABLE "NombreTabla" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_only" ON "NombreTabla"
  FOR ALL
  USING (false)
  WITH CHECK (false);
  -- Bloquea acceso PostgREST directo con anon/authenticated.
  -- El SERVICE_ROLE_KEY del backend (Next.js API routes) bypassa RLS correctamente.
```

#### Criterios de aceptación

- [ ] Cada tabla sensible tiene RLS `ENABLE`
- [ ] Sin políticas que permitan `SELECT`/`INSERT`/`UPDATE`/`DELETE` a `anon` o `authenticated` salvo las explícitamente diseñadas
- [ ] Smoke test: cliente con `NEXT_PUBLIC_SUPABASE_ANON_KEY` no puede leer filas de esas tablas
- [ ] Rutas API con `createAdminSupabaseClient()` / service role siguen funcionando
- [ ] Migración aplicada en staging y producción antes de go-live

#### Fuera de alcance ahora

- No modificar RLS en Sprint 2 (directorio / proveedores destacados).
- No crear migraciones en esta tarea hasta Sprint 4 o ventana pre-lanzamiento.

---

## Sprint 2 (en curso)

Continuar trabajo de producto (vitrina destacados, admin proveedores, etc.) sin abordar SEC-001.

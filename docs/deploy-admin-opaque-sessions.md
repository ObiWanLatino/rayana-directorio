# Deploy: sesiones admin opacas (`admin_sessions`)

## Orden obligatorio

1. **Aplicar migración `010` en Supabase** (panel SQL o `supabase db push`)
   - Archivo: `supabase/migrations/010_admin_sessions.sql`
   - Verificar: tabla `admin_sessions` + índice `idx_admin_sessions_token`
2. **Deploy del código** (staging/preview primero)
3. **Verificar login admin** en URL de staging/preview con host admin configurado
4. **Merge a producción** (repetir paso 1 en prod si staging usa otro proyecto Supabase)
5. **Avisar a los admins** que deben volver a iniciar sesión (texto abajo)

> Si el código se despliega antes que la migración, el login admin fallará al crear la sesión.

---

## Checklist de verificación (staging)

- [ ] `ADMIN_SECRET` configurado en el entorno (solo valida el body del login, no va en la cookie)
- [ ] Host admin resuelve al deployment (`ADMIN_HOSTNAME` / `ADMIN_EXTRA_HOSTNAMES` en preview si aplica)
- [ ] Login en `/admin-login` con email, contraseña y código de acceso
- [ ] Cookie `admin_session` ≈ 64 caracteres alfanuméricos (no igual a `ADMIN_SECRET`)
- [ ] Panel carga tras login (`/` en admin host)
- [ ] `POST /api/admin/logout` revoca sesión y redirige a `/admin-login`
- [ ] Rutas `/admin` y `/api/admin/*` en dominio público siguen bloqueadas (403 / redirect)

---

## Cuerpo sugerido para el PR

### Summary

- Reemplaza cookie `admin_session = ADMIN_SECRET` por token opaco almacenado en `admin_sessions` (8h, revocable).
- Migración `010_admin_sessions.sql`.
- Login genera token; proxy y `getAdminUser()` validan contra DB; nuevo `POST/GET /api/admin/logout`.
- `ADMIN_SECRET` queda solo para el campo `secret` del POST `/api/admin/login`.

### Deploy plan

1. Migración `010` en Supabase
2. Deploy
3. Smoke test login en staging (host admin)
4. Merge a prod
5. Comunicar re-login a admins (ver mensaje abajo)

### Test plan

- [ ] Migración aplicada
- [ ] Login admin OK; cookie opaca
- [ ] Logout revoca y borra cookie
- [ ] Dominio público: `/api/admin/*` → 403

---

## Mensaje para admins (Slack / email)

**Asunto:** Panel admin — volver a iniciar sesión

Hola,

Actualizamos la seguridad del panel de administración en **admin.makeray.cl**. Por este cambio, **todas las sesiones anteriores dejaron de ser válidas**.

**Qué deben hacer:** cerrar el panel si lo tenían abierto e **iniciar sesión de nuevo** en admin.makeray.cl con su email, contraseña y código de acceso habitual.

Si tienen problemas para entrar, avísenos.

Gracias.

---

## Mensaje corto (Slack)

🔐 Actualización de seguridad en **admin.makeray.cl**: hay que **volver a iniciar sesión** (email + contraseña + código de acceso). Las sesiones previas ya no sirven. Cualquier problema, avisen.

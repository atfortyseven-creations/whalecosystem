# Tareas de Fortificación Nanoscópica

- [x] Capa 1: Integridad Criptográfica de Peticiones
  - [x] Implementar Vector 7 HMAC en `lib/security/waf-engine.ts`
  - [x] Inyectar cabeceras de máxima paranoia en `middleware.ts`
- [x] Capa 2: Anti-Tamper del DOM
  - [x] Crear `components/security/AntiTamperCore.tsx`
  - [x] Inyectar `<AntiTamperCore />` en `app/layout.tsx`
- [x] Capa 3: Verificación de Entorno
  - [x] Crear `lib/security/vault-sentinel.ts`
  - [x] Integrar sentinela en `instrumentation.ts`

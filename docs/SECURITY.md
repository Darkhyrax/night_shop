# 🔒 Guía de Seguridad - Night Shop CMS

## 📋 Resumen

Este documento detalla las medidas de seguridad implementadas en Night Shop CMS y las recomendaciones para mantener la aplicación segura en producción.

---

## 🛡️ Correcciones de Seguridad P1 (Críticas) - Implementadas

### 1. Validación de JWT_SECRET ✅

**Problema:** Sin JWT_SECRET configurado, se usaba una clave débil por defecto.

**Solución Implementada:**
- Archivo: `src/config/security.config.ts`
- Valida que `JWT_SECRET` esté configurado en producción
- Valida longitud mínima de 32 caracteres en producción
- Lanza error si no cumple requisitos
- Se ejecuta al iniciar la aplicación (`main.ts`)

**Configuración en docker-compose:**
```yaml
backend:
  environment:
    JWT_SECRET: ${JWT_SECRET}  # Debe estar configurado
    NODE_ENV: production
```

**Cómo generar JWT_SECRET seguro:**

Linux/Mac:
```bash
openssl rand -base64 32
```

Windows (PowerShell):
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
```

---

### 2. Rate Limiting en Login ✅

**Problema:** Sin protección contra ataques de fuerza bruta.

**Solución Implementada:**
- Paquete: `@nestjs/throttler`
- Límite: 5 intentos por minuto en `/auth/login`
- Configurado en: `src/auth/auth.module.ts` y `src/auth/auth.controller.ts`
- Devuelve HTTP 429 (Too Many Requests) si se excede

**Comportamiento:**
- Usuario puede intentar login 5 veces en 60 segundos
- Si intenta más, recibe error 429 por 60 segundos
- Se resetea después de 60 segundos

---

### 3. Validación de Contraseña Fuerte ✅

**Problema:** Aceptaba contraseñas muy cortas.

**Solución Implementada:**
- Validador: `@MinLength(8)` en `LoginDto`
- Mensaje claro: "La contraseña debe tener al menos 8 caracteres"
- Aplicado en: `src/auth/dto/login.dto.ts`
- Validación en cliente y servidor

**Requisitos de Contraseña:**
- Mínimo 8 caracteres
- Se recomienda: mayúsculas, minúsculas, números y símbolos

---

## 🔐 Medidas de Seguridad Existentes

### Autenticación
- ✅ JWT tokens con expiración configurable (24h por defecto)
- ✅ Bcrypt con salt rounds configurables (default 10)
- ✅ Validación de credenciales con comparación segura
- ✅ Guards en rutas protegidas (JwtAuthGuard)
- ✅ Verificación de usuario activo

### Validación
- ✅ DTOs con class-validator
- ✅ Validación en cliente y servidor
- ✅ Sanitización de entrada
- ✅ Whitelist de campos en ValidationPipe

### Base de Datos
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Índices en campos críticos
- ✅ Relaciones con FK configuradas
- ✅ Validación de unicidad (DNI, email, username)

### API
- ✅ CORS configurado
- ✅ Payload limit: 50MB
- ✅ Swagger/OpenAPI documentado
- ✅ Manejo de errores genérico

---

## ⚠️ Recomendaciones P2 (Alto)

### 1. Logging de Intentos Fallidos
```typescript
// Agregar en auth.service.ts
logger.warn(`Failed login attempt for user: ${username}`);
```

### 2. CORS Restrictivo en Producción
```yaml
backend:
  environment:
    CORS_ORIGIN: https://tu-dominio.com
```

### 3. Auditoría de Cambios
- Registrar quién cambió qué y cuándo
- Especialmente para usuarios y configuración

---

## 📊 Recomendaciones P3 (Medio)

### 1. Refresh Tokens
- Implementar tokens de corta duración (15 min)
- Refresh tokens de larga duración (7 días)

### 2. Autenticación de Dos Factores (2FA)
- TOTP (Time-based One-Time Password)
- SMS como alternativa

### 3. Auditoría Completa
- Historial de login
- Cambios de configuración
- Acceso a datos sensibles

---

## 🚀 Configuración de Producción

### Variables de Entorno Requeridas

```yaml
# .env o docker-compose.yml
NODE_ENV=production
JWT_SECRET=<generar-con-openssl>  # OBLIGATORIO
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10

# Base de Datos
DB_HOST=postgres
DB_PORT=5432
DB_USER=<usuario-seguro>
DB_PASSWORD=<contraseña-fuerte>
DB_NAME=night_shop_db

# CORS
CORS_ORIGIN=https://tu-dominio.com
CORS_CREDENTIALS=true

# Puerto
PORT=3000
```

### Checklist de Seguridad para Producción

- [ ] JWT_SECRET configurado (min 32 caracteres)
- [ ] Credenciales de BD cambiadas
- [ ] CORS_ORIGIN configurado a tu dominio
- [ ] HTTPS/SSL habilitado
- [ ] Firewall configurado
- [ ] Backups automáticos configurados
- [ ] Logs monitoreados
- [ ] Contraseñas de admin cambiadas
- [ ] Imágenes Docker actualizadas
- [ ] Rate limiting verificado

---

## 🔍 Verificación de Seguridad

### Verificar JWT_SECRET
```bash
# En docker-compose
docker-compose logs backend | grep "Security configuration"
```

### Verificar Rate Limiting
```bash
# Hacer 6 requests rápidos a /auth/login
# El 6to debe devolver 429 Too Many Requests
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Verificar Validación de Contraseña
```bash
# Intentar con contraseña corta (< 8 caracteres)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"short"}'
# Debe devolver error de validación
```

---

## 📚 Recursos de Seguridad

### OWASP Top 10
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

### NestJS Security
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [NestJS Throttling](https://docs.nestjs.com/security/rate-limiting)

### JWT
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [JWT Debugger](https://jwt.io/)

---

## 🔄 Actualización de Dependencias

```bash
# Verificar vulnerabilidades
npm audit

# Actualizar dependencias
npm update

# Actualizar a versiones mayores (cuidado)
npm outdated
```

---

## 📞 Soporte de Seguridad

Si encuentras una vulnerabilidad:
1. **NO** la publiques públicamente
2. Contacta al equipo de desarrollo
3. Proporciona detalles de la vulnerabilidad
4. Espera confirmación antes de divulgar

---

**Última actualización:** Enero 2026
**Versión:** 1.0.0
**Estado:** Producción

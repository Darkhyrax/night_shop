# 📚 Documentación Técnica - Night Shop CMS

Documentación para **desarrolladores** que trabajan en el proyecto.

> **👥 Para usuarios finales:** Ver [`README.md`](../README.md) y [`DEPLOYMENT.md`](../DEPLOYMENT.md) en la raíz del proyecto.

---

## 🗺️ Mapa de Documentación

| Documento | Propósito | Audiencia |
|-----------|-----------|-----------|
| **FEATURES.md** | Qué se puede hacer (características) | Product managers, QA, stakeholders |
| **ARCHITECTURE.md** | Cómo está construido (técnico) | Arquitectos, desarrolladores senior |
| **SECURITY.md** | Cómo está protegido (seguridad) | Desarrolladores, DevOps, security |
| **DOCKER_GUIDE.md** | Cómo desarrollar localmente | Desarrolladores, DevOps |
| **GITHUB_SETUP.md** | Cómo configurar CI/CD | DevOps, maintainers |

---

## 📖 Documentos Detallados

### 1. **FEATURES.md** - Características Implementadas
**¿Qué puedo hacer con Night Shop?**

Lista completa de funcionalidades:
- Gestión de ventas (contado/crédito)
- Gestión de clientes y deudas
- Inventario y productos
- Tasas de cambio automáticas
- Reportes y análisis
- Dashboard con KPIs
- Seguridad y autenticación

👉 **Leer si:** Quieres saber qué características tiene el sistema

---

### 2. **ARCHITECTURE.md** - Arquitectura Técnica
**¿Cómo está construido Night Shop?**

Detalles técnicos:
- Estructura del proyecto (backend/frontend)
- Modelo de datos (entidades y relaciones)
- Flujos principales (venta, autenticación, etc.)
- Patrones de diseño (modular, service layer)
- Roadmap v2.0 (multi-tienda)

👉 **Leer si:** Necesitas entender la arquitectura o agregar nuevas características

---

### 3. **SECURITY.md** - Seguridad
**¿Cómo está protegido Night Shop?**

Medidas de seguridad implementadas:
- Autenticación JWT
- Rate limiting en login
- Validación de contraseñas
- Encriptación de datos
- Checklist de seguridad para producción

👉 **Leer si:** Necesitas entender o mejorar la seguridad

---

### 4. **DOCKER_GUIDE.md** - Desarrollo Local
**¿Cómo desarrollo localmente?**

Guía para desarrollo con Docker:
- Inicio rápido
- Comandos principales
- Hot-reload
- Debugging
- Troubleshooting

👉 **Leer si:** Estás desarrollando localmente o necesitas configurar el entorno

---

### 5. **GITHUB_SETUP.md** - CI/CD
**¿Cómo configurar GitHub Actions?**

Configuración de automatización:
- GitHub Actions
- Construcción de imágenes Docker
- Push a GHCR
- Monitoreo de builds

👉 **Leer si:** Necesitas configurar o mantener CI/CD

---

## 🎯 Próximos Pasos

1. **Primeros pasos:** Lee `DOCKER_GUIDE.md` para configurar tu entorno local
2. **Entender el código:** Lee `ARCHITECTURE.md` para conocer la estructura
3. **Agregar features:** Lee `FEATURES.md` para ver qué ya existe
4. **Mejorar seguridad:** Lee `SECURITY.md` para entender las medidas implementadas
5. **Desplegar:** Lee `GITHUB_SETUP.md` para configurar CI/CD

---

## 📞 Referencia Rápida

**Estructura del proyecto:**
- `night-shop-backend/` - API NestJS (autenticación, ventas, clientes, reportes)
- `night-shop-frontend/` - Frontend React (UI, formularios, dashboard)
- `docs/` - Documentación técnica
- `README.md` - Inicio rápido para usuarios finales
- `DEPLOYMENT.md` - Guía de despliegue

**Comandos principales:**
```bash
docker-compose up -d          # Iniciar servicios
docker-compose logs -f        # Ver logs
docker-compose down           # Detener servicios
```

**URLs locales:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs

---

**Última actualización:** Enero 2026 | **Versión:** 1.0.0

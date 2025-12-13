# 📚 Documentación de Desarrollo - Night Shop CMS

Esta carpeta contiene documentación para **desarrolladores** que trabajan en el proyecto.

**Para usuarios finales**, consulta los archivos en la raíz del proyecto:
- `README.md` - Guía de inicio rápido con Docker
- `DEPLOYMENT.md` - Instrucciones detalladas de despliegue
- `docker-compose.prod.yml` - Configuración de producción

---

## 📖 Índice de Documentación

### 1. **ARCHITECTURE.md**
Documentación completa de la arquitectura del proyecto.

**Contenido:**
- Estructura del proyecto
- Modelo de datos (entidades)
- Flujos principales
- Patrones de diseño
- Roadmap v2.0 (Multi-tienda)
- Configuración

**Para quién:** Arquitectos, desarrolladores senior, nuevos miembros del equipo

---

### 2. **DOCKER_GUIDE.md**
Guía completa de Docker para desarrollo local.

**Contenido:**
- Inicio rápido
- Comandos principales
- Troubleshooting
- Configuración avanzada
- Mantenimiento
- Monitoreo
- Desarrollo con hot-reload
- Producción

**Para quién:** Desarrolladores, DevOps, QA

---

### 3. **GITHUB_SETUP.md**
Pasos ordenados para configurar GitHub Actions y GHCR.

**Contenido:**
- Preparación del repositorio
- Habilitación de GitHub Actions
- Creación de tokens
- Configuración de secrets
- Monitoreo de builds
- Verificación de imágenes

**Para quién:** DevOps, maintainers, administradores del repositorio

---

## 🚀 Flujo de Trabajo para Desarrolladores

### Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Darkhyrax/night-shop.git
cd night-shop

# 2. Iniciar servicios con Docker
docker-compose up -d

# 3. Ver logs
docker-compose logs -f

# 4. Acceder a la aplicación
# Frontend: http://localhost:3001
# Backend: http://localhost:3000
# Swagger: http://localhost:3000/api/docs
```

Ver `DOCKER_GUIDE.md` para más detalles.

### Despliegue a Producción

```bash
# 1. Hacer push a main (dispara GitHub Actions)
git push origin main

# 2. GitHub Actions construye y sube imágenes a GHCR
# (Monitorear en https://github.com/Darkhyrax/night-shop/actions)

# 3. Usuarios descargan imágenes desde GHCR
docker pull ghcr.io/Darkhyrax/night-shop-backend:latest
docker pull ghcr.io/Darkhyrax/night-shop-frontend:latest

# 4. Usuarios despliegan con docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d
```

Ver `GITHUB_SETUP.md` para configuración inicial.

---

## 🏗️ Estructura del Proyecto

```
night-shop/
├── night-shop-backend/          # API NestJS
│   ├── src/
│   │   ├── auth/                # Autenticación
│   │   ├── users/               # Gestión de usuarios
│   │   ├── products/            # Catálogo
│   │   ├── inventory/           # Inventario
│   │   ├── sales/               # Ventas
│   │   ├── customers/           # Clientes
│   │   ├── exchange-rates/      # Tasas de cambio
│   │   ├── reports/             # Reportes
│   │   ├── config/              # Configuración
│   │   ├── migrations/          # Migraciones
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── night-shop-frontend/         # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes
│   │   ├── features/            # Módulos
│   │   ├── services/            # API client
│   │   ├── types/               # Tipos TypeScript
│   │   ├── hooks/               # Custom hooks
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docs/                        # Documentación de desarrollo
│   ├── README.md                # Este archivo
│   ├── ARCHITECTURE.md
│   ├── DOCKER_GUIDE.md
│   └── GITHUB_SETUP.md
│
├── README.md                    # Guía para usuarios finales
├── DEPLOYMENT.md                # Instrucciones de despliegue
├── docker-compose.yml           # Desarrollo
├── docker-compose.prod.yml      # Producción
├── .dockerignore
├── .gitignore
├── .env.example
└── .github/
    └── workflows/
        └── docker-build.yml     # GitHub Actions
```

---

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ejecutar migraciones
docker-compose exec backend npm run migration:run

# Acceder a la BD
docker-compose exec postgres psql -U nightshop -d night_shop_db

# Detener servicios
docker-compose down
```

### Testing

```bash
# Backend
docker-compose exec backend npm run test

# Frontend
docker-compose exec frontend npm run test
```

### Limpieza

```bash
# Eliminar todo (incluyendo datos)
docker-compose down -v

# Limpiar imágenes no utilizadas
docker image prune -a
```

---

## 📊 Entidades Principales

Ver `ARCHITECTURE.md` para detalles completos.

- **Users** - Usuarios del sistema
- **Customers** - Clientes de la tienda
- **Products** - Catálogo de productos
- **InventoryBatches** - Lotes de compra
- **Sales** - Registro de ventas
- **SaleDetails** - Detalles de productos en ventas
- **CustomerAccounts** - Deudas de clientes
- **CustomerPayments** - Pagos registrados
- **ExchangeRates** - Tasas de cambio
- **ExchangeRateSyncLogs** - Historial de sincronizaciones

---

## 🔐 Seguridad

### Desarrollo
- JWT_SECRET: `your-secret-key-change-in-production`
- Credenciales BD: usuario/contraseña por defecto

### Producción
- Cambiar `JWT_SECRET` a clave aleatoria fuerte
- Cambiar credenciales de BD
- Usar HTTPS/SSL
- Configurar firewall
- Realizar backups regulares

Ver `DEPLOYMENT.md` para más detalles.

---

## 🚀 Roadmap v2.0

Próximas características planeadas:
- [ ] Multi-tienda
- [ ] Personalización visual
- [ ] Integración de pagos
- [ ] Notificaciones (Email/SMS)
- [ ] Backup automático
- [ ] Auditoría completa
- [ ] API pública
- [ ] Aplicación móvil

Ver `ARCHITECTURE.md` para estrategia de migración.

---

## 🤝 Contribución

### Estándares de Código
- ESLint + Prettier
- TypeScript strict mode
- Convenciones de nombres
- Commits semánticos

### Workflow
1. Fork del repositorio
2. Rama feature: `feature/nombre`
3. Commits descriptivos
4. Pull request con descripción
5. Code review
6. Merge a main

---

## 📞 Soporte

Para preguntas sobre desarrollo:
1. Revisa la documentación en esta carpeta
2. Consulta el README.md principal
3. Abre un issue en GitHub
4. Contacta al equipo

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

---

**Última actualización:** Enero 2025
**Versión:** 1.0.0

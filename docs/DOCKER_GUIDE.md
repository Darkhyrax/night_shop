# 🐳 Guía Completa de Docker para Night Shop

**Documentación para desarrolladores**

## Inicio Rápido

### Windows
```bash
# Hacer doble clic en start.bat
# O ejecutar desde terminal:
start.bat
```

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

---

## Requisitos Previos

1. **Docker Desktop** instalado y ejecutándose
   - [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Verificar instalación: `docker --version`

2. **Git** (para clonar el repositorio)
   - [Descargar Git](https://git-scm.com/downloads)

3. **Mínimo 4GB RAM** disponible para Docker

---

## Estructura de Servicios

```
┌─────────────────────────────────────────┐
│         Docker Compose Network          │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Frontend   │  │   Backend    │   │
│  │   (Nginx)    │  │   (NestJS)   │   │
│  │  :3001       │  │   :3000      │   │
│  └──────────────┘  └──────────────┘   │
│         │                  │            │
│         └──────────────────┘            │
│                  │                      │
│         ┌────────▼────────┐            │
│         │   PostgreSQL    │            │
│         │   :5432         │            │
│         └─────────────────┘            │
│                                         │
│         ┌─────────────────┐            │
│         │    pgAdmin      │            │
│         │    :5050        │            │
│         └─────────────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Comandos Principales

### Iniciar servicios
```bash
docker-compose up -d
```

### Ver estado de servicios
```bash
docker-compose ps
```

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo base de datos
docker-compose logs -f postgres
```

### Detener servicios
```bash
docker-compose down
```

### Reiniciar servicios
```bash
docker-compose restart
```

### Reiniciar un servicio específico
```bash
docker-compose restart backend
```

### Ejecutar comandos en contenedores
```bash
# Ejecutar migraciones
docker-compose exec backend npm run migration:run

# Acceder a PostgreSQL
docker-compose exec postgres psql -U nightshop -d night_shop_db

# Ejecutar npm en backend
docker-compose exec backend npm install
```

### Eliminar todo (incluyendo datos)
```bash
docker-compose down -v
```

---

## Troubleshooting

### Error: "Docker daemon is not running"
**Solución:**
- Abre Docker Desktop
- Espera a que Docker inicie completamente
- Verifica con `docker ps`

### Error: "Port 3000 is already in use"
**Solución:**
```bash
# Opción 1: Cambiar puerto en .env
BACKEND_PORT=3001

# Opción 2: Liberar el puerto
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

### Error: "Cannot connect to database"
**Solución:**
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Esperar 10 segundos y reintentar
```

### Error: "Frontend shows blank page"
**Solución:**
```bash
# Verificar logs del frontend
docker-compose logs frontend

# Reconstruir frontend
docker-compose down
docker-compose build frontend
docker-compose up -d frontend
```

### Error: "CORS error in browser console"
**Solución:**
```bash
# Verificar CORS_ORIGIN en .env
CORS_ORIGIN=*

# O especificar el origen:
CORS_ORIGIN=http://localhost:3001

# Reiniciar backend
docker-compose restart backend
```

### Error: "Migraciones no se ejecutan"
**Solución:**
```bash
# Ejecutar migraciones manualmente
docker-compose exec backend npm run migration:run

# Ver estado de migraciones
docker-compose exec backend npm run migration:show

# Revertir última migración
docker-compose exec backend npm run migration:revert
```

### Error: "Out of memory"
**Solución:**
- Aumentar memoria asignada a Docker Desktop
  - Docker Desktop → Preferences → Resources → Memory
  - Asignar mínimo 4GB

### Error: "pgAdmin no carga"
**Solución:**
```bash
# Reiniciar pgAdmin
docker-compose restart pgadmin

# Acceder con credenciales por defecto
# Email: admin@nightshop.local
# Password: admin
```

---

## Configuración Avanzada

### Cambiar puertos
Editar `.env`:
```env
BACKEND_PORT=3000
FRONTEND_PORT=3001
DB_PORT=5432
PGADMIN_PORT=5050
```

### Cambiar credenciales de base de datos
Editar `.env`:
```env
DB_USER=nightshop
DB_PASSWORD=nightshop123
DB_NAME=night_shop_db
```

### Cambiar credenciales de pgAdmin
Editar `.env`:
```env
PGADMIN_EMAIL=admin@nightshop.com
PGADMIN_PASSWORD=admin
```

### Usar variables de entorno personalizadas
```bash
# Crear archivo .env personalizado
cp .env.example .env.production

# Editar .env.production con tus valores

# Usar archivo personalizado
docker-compose --env-file .env.production up -d
```

---

## Mantenimiento

### Limpiar imágenes no utilizadas
```bash
docker image prune -a
```

### Limpiar volúmenes no utilizados
```bash
docker volume prune
```

### Limpiar todo (imágenes, contenedores, volúmenes)
```bash
docker system prune -a --volumes
```

### Actualizar imágenes base
```bash
docker-compose pull
docker-compose up -d
```

### Backup de base de datos
```bash
# Crear backup
docker-compose exec postgres pg_dump -U nightshop night_shop_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U nightshop night_shop_db < backup.sql
```

---

## Monitoreo

### Ver consumo de recursos
```bash
docker stats
```

### Ver detalles de un contenedor
```bash
docker inspect night_shop_backend
```

### Ver eventos en tiempo real
```bash
docker events
```

---

## Desarrollo

### Modo desarrollo con hot-reload
```bash
# El backend y frontend ya tienen volúmenes configurados
# Los cambios en src/ se reflejan automáticamente

# Para backend (NestJS)
docker-compose logs -f backend

# Para frontend (React)
docker-compose logs -f frontend
```

### Agregar dependencias
```bash
# Backend
docker-compose exec backend npm install <package-name>

# Frontend
docker-compose exec frontend npm install <package-name>
```

### Ejecutar tests
```bash
# Backend
docker-compose exec backend npm run test

# Frontend
docker-compose exec frontend npm run test
```

---

## Producción

### Construir imágenes optimizadas
```bash
docker-compose build --no-cache
```

### Usar archivo docker-compose.prod.yml
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Verificar seguridad
```bash
# Escanear imágenes
docker scan night_shop_backend
docker scan night_shop_frontend
```

---

## Recursos Útiles

- [Documentación Docker](https://docs.docker.com/)
- [Documentación Docker Compose](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL en Docker](https://hub.docker.com/_/postgres)
- [Nginx en Docker](https://hub.docker.com/_/nginx)

---

## Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica que Docker Desktop está ejecutándose
3. Asegúrate de tener suficiente espacio en disco
4. Intenta: `docker-compose down -v && docker-compose up -d`
5. Si persiste, abre un issue en GitHub con los logs

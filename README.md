# 🌙 Night Shop CMS

**Sistema de Gestión para Tiendas Locales**

Un CMS profesional y escalable diseñado para tiendas locales, con soporte para múltiples monedas, gestión de inventario, ventas, clientes y reportes avanzados.

---

## 🚀 Inicio Rápido (Docker)

### Requisitos
- **Docker Desktop**: [Descargar](https://www.docker.com/products/docker-desktop)
- **Mínimo 4GB RAM** disponible

### Pasos

#### 1. Descargar la imagen
```bash
docker pull ghcr.io/Darkhyrax/night-shop-backend:latest
docker pull ghcr.io/Darkhyrax/night-shop-frontend:latest
```

#### 2. Crear archivo `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: nightshop
      POSTGRES_PASSWORD: nightshop123
      POSTGRES_DB: night_shop_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nightshop"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: ghcr.io/Darkhyrax/night-shop-backend:latest
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: nightshop
      DB_PASSWORD: nightshop123
      DB_NAME: night_shop_db
      JWT_SECRET: your-secret-key-change-in-production
      JWT_EXPIRATION: 24h
      CORS_ORIGIN: http://localhost:3001
      PORT: 3000
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    image: ghcr.io/Darkhyrax/night-shop-frontend:latest
    environment:
      REACT_APP_API_URL: http://localhost:3000
    ports:
      - "3001:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### 3. Iniciar los servicios
```bash
docker-compose up -d
```

#### 4. Acceder a la aplicación
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

#### 5. Detener la aplicación
```bash
docker-compose down
```

---

## 📋 Características Principales

### Gestión de Ventas
- ✅ Ventas de Contado y Crédito
- ✅ Múltiples Monedas (USD y Bolívares)
- ✅ Cálculo automático de cambio
- ✅ Historial de pagos y abonos

### Gestión de Inventario
- ✅ Control de stock en tiempo real
- ✅ Lotes de compra con costos
- ✅ Alertas de stock bajo
- ✅ Múltiples monedas de compra

### Gestión de Clientes
- ✅ Perfiles detallados
- ✅ Seguimiento de deudas
- ✅ Historial de compras
- ✅ Abonos flexibles

### Tasas de Cambio
- ✅ Sincronización automática (diaria a las 4 PM)
- ✅ Sincronización manual
- ✅ Historial de cambios
- ✅ Alertas visuales

### Reportes
- ✅ Resumen de ventas
- ✅ Productos más vendidos
- ✅ Clientes más activos
- ✅ Clientes con mayor deuda
- ✅ Inventario bajo
- ✅ Filtros por fecha

### Dashboard
- ✅ KPIs en tiempo real
- ✅ Gráficos visuales
- ✅ Desglose por moneda
- ✅ Alertas del sistema

---

## 🔧 Configuración

### Variables de Entorno

Edita el `docker-compose.yml` para cambiar:

```yaml
# Base de datos
DB_USER: nightshop
DB_PASSWORD: nightshop123
DB_NAME: night_shop_db

# JWT (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET: your-secret-key-change-in-production
JWT_EXPIRATION: 24h

# CORS
CORS_ORIGIN: http://localhost:3001

# Puertos
# Backend: 3000
# Frontend: 3001
# PostgreSQL: 5432
```

### Generar JWT_SECRET Seguro

Para producción, genera una clave segura:

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
```

Copia el resultado y reemplaza `your-secret-key-change-in-production` en tu `docker-compose.yml`.

### Cambiar Puertos

En `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "3000:3000"  # Cambiar primer número
  
  frontend:
    ports:
      - "3001:80"    # Cambiar primer número
```

---

## 📚 Documentación

### API
La documentación interactiva está disponible en:
```
http://localhost:3000/api/docs
```

### Endpoints Principales

**Autenticación**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

**Productos**
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar
- `DELETE /api/products/:id` - Eliminar

**Ventas**
- `GET /api/sales` - Listar ventas
- `POST /api/sales` - Crear venta
- `GET /api/sales/:id` - Detalle
- `PUT /api/sales/:id/complete` - Completar

**Clientes**
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Crear cliente
- `GET /api/customers/:id/debts` - Deudas
- `POST /api/customers/:id/payments` - Registrar pago

**Reportes**
- `GET /api/reports/sales` - Reporte de ventas
- `GET /api/reports/products/top` - Top productos
- `GET /api/reports/customers/top` - Top clientes
- `GET /api/reports/customers/top-debtors` - Mayor deuda
- `GET /api/reports/inventory/low-stock` - Stock bajo

**Tasas de Cambio**
- `GET /api/exchange-rates/current` - Tasa actual
- `POST /api/exchange-rates/sync-bcv` - Sincronizar BCV
- `GET /api/exchange-rates/sync-status` - Estado
- `GET /api/exchange-rates/sync-history` - Historial

---

## 🐳 Comandos Docker Útiles

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Reiniciar servicios
docker-compose restart

# Reiniciar un servicio
docker-compose restart backend

# Detener servicios
docker-compose down

# Detener y eliminar datos
docker-compose down -v

# Ejecutar migraciones
docker-compose exec backend npm run migration:run

# Acceder a la base de datos
docker-compose exec postgres psql -U nightshop -d night_shop_db

# Backup de base de datos
docker-compose exec postgres pg_dump -U nightshop night_shop_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U nightshop night_shop_db < backup.sql
```

---

## 🔐 Seguridad

- **Autenticación JWT** con expiración configurable
- **Validación de entrada** en cliente y servidor
- **CORS configurado** para restricción de orígenes
- **Roles y permisos** (Admin, Employee)
- **Encriptación de contraseñas** con Bcrypt

### Recomendaciones para Producción

1. **Cambiar JWT_SECRET**
   ```yaml
   JWT_SECRET: tu-clave-secreta-muy-larga-y-aleatoria
   ```

2. **Cambiar credenciales de BD**
   ```yaml
   DB_USER: nuevo-usuario
   DB_PASSWORD: contraseña-fuerte
   ```

3. **Usar HTTPS**
   - Configurar proxy inverso (Nginx, Traefik)
   - Obtener certificado SSL/TLS

4. **Backups regulares**
   ```bash
   docker-compose exec postgres pg_dump -U nightshop night_shop_db > backup-$(date +%Y%m%d).sql
   ```

---

## 🆘 Solución de Problemas

### "Docker daemon is not running"
- Abre Docker Desktop
- Espera a que inicie completamente
- Verifica con `docker ps`

### "Port 3000 is already in use"
Cambia el puerto en `docker-compose.yml`:
```yaml
backend:
  ports:
    - "3001:3000"  # Usa 3001 en lugar de 3000
```

### "Cannot connect to database"
```bash
# Verifica que PostgreSQL está corriendo
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reinicia PostgreSQL
docker-compose restart postgres
```

### "Frontend shows blank page"
```bash
# Verifica los logs
docker-compose logs frontend

# Reconstruye la imagen
docker-compose down
docker-compose pull
docker-compose up -d
```

### "CORS error in browser"
Verifica `CORS_ORIGIN` en `docker-compose.yml`:
```yaml
CORS_ORIGIN: http://localhost:3001
```

---

## 📞 Soporte

Para reportar problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica que Docker Desktop está ejecutándose
3. Asegúrate de tener suficiente espacio en disco
4. Intenta: `docker-compose down -v && docker-compose up -d`

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 🙏 Agradecimientos

Desarrollado con ❤️ para tiendas locales.

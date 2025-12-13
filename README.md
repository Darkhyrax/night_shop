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
docker pull ghcr.io/darkhyrax/night_shop-backend:latest
docker pull ghcr.io/darkhyrax/night_shop-frontend:latest
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
    image: ghcr.io/darkhyrax/night_shop-backend:latest
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
    image: ghcr.io/darkhyrax/night_shop-frontend:latest
    environment:
      REACT_APP_API_URL: http://localhost:3000
    ports:
      - "3001:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

> **⚠️ IMPORTANTE:** Antes del paso 3, reemplaza `your-secret-key-change-in-production` con una clave segura. Ver **Paso 3** en [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones.

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

## 📖 Documentación

Para configuración avanzada, cambiar puertos, generar claves seguras y troubleshooting, consulta **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

### API Swagger

La documentación interactiva de la API está disponible en:
```
http://localhost:3000/api/docs
```

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 🙏 Agradecimientos

Desarrollado con ❤️ para tiendas locales.

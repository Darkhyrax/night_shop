# 🌙 Night Shop CMS

**Sistema de Gestión para Tiendas Locales**

Un CMS profesional y escalable diseñado para tiendas locales, con soporte para múltiples monedas, gestión de inventario, ventas, clientes y reportes avanzados.

---

## ⚡ Inicio Rápido (3 pasos)

### 1️⃣ Requisitos
- **Docker Desktop**: [Descargar](https://www.docker.com/products/docker-desktop)
- **Mínimo 4GB RAM** disponible

### 2️⃣ Crear `docker-compose.yml`

Copia este contenido en un archivo `docker-compose.yml`:

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
      JWT_SECRET: tu-clave-segura-aqui-32-caracteres-minimo
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

> **⚠️ IMPORTANTE:** Reemplaza `tu-clave-segura-aqui-32-caracteres-minimo` con una clave aleatoria. Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para generar una clave segura.

### 3️⃣ Iniciar

```bash
docker-compose up -d
```

Accede a:
- **Frontend**: http://localhost:3001
- **API Docs**: http://localhost:3000/api/docs

---

## � Documentación

### Para Usuarios Finales
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de despliegue, configuración y troubleshooting

### Para Desarrolladores
- **[docs/README.md](./docs/README.md)** - Índice de documentación técnica
- **[docs/FEATURES.md](./docs/FEATURES.md)** - Características implementadas
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Arquitectura y modelo de datos
- **[docs/SECURITY.md](./docs/SECURITY.md)** - Seguridad y mejores prácticas
- **[docs/DOCKER_GUIDE.md](./docs/DOCKER_GUIDE.md)** - Desarrollo local con Docker

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 🙏 Agradecimientos

Desarrollado con ❤️ para tiendas locales.

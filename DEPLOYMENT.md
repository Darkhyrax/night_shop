# 🚀 Guía de Despliegue - Night Shop CMS

Esta guía está diseñada para usuarios finales que descargan las imágenes Docker desde GHCR.

---

## 📋 Requisitos Previos

### Windows
- **Docker Desktop** para Windows: [Descargar](https://www.docker.com/products/docker-desktop)
- **Mínimo 4GB RAM** asignada a Docker
- **Mínimo 10GB espacio en disco**

### Linux
- **Docker**: `sudo apt-get install docker.io`
- **Docker Compose**: `sudo apt-get install docker-compose`
- **Mínimo 4GB RAM**
- **Mínimo 10GB espacio en disco**

### macOS
- **Docker Desktop** para Mac: [Descargar](https://www.docker.com/products/docker-desktop)
- **Mínimo 4GB RAM** asignada a Docker
- **Mínimo 10GB espacio en disco**

---

## 🚀 Instalación Rápida

### Paso 1: Crear directorio del proyecto

```bash
# Windows (PowerShell)
mkdir night-shop
cd night-shop

# Linux/Mac
mkdir night-shop
cd night-shop
```

### Paso 2: Crear archivo `docker-compose.yml`

Copia el siguiente contenido en un archivo llamado `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: night_shop_postgres
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
    restart: unless-stopped

  backend:
    image: ghcr.io/darkhyrax/night_shop-backend:latest
    container_name: night_shop_backend
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
    restart: unless-stopped

  frontend:
    image: ghcr.io/darkhyrax/night_shop-frontend:latest
    container_name: night_shop_frontend
    environment:
      REACT_APP_API_URL: http://localhost:3000
    ports:
      - "3001:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### Paso 3: Generar JWT_SECRET Seguro

Antes de iniciar los servicios, genera una clave segura para JWT_SECRET:

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
```

Copia el resultado y edita tu `docker-compose.yml` para reemplazar `your-secret-key-change-in-production` con la clave generada:

```yaml
services:
  backend:
    environment:
      JWT_SECRET: tu-clave-generada-aqui
```

**Ejemplo:**
```
JWT_SECRET: a7K9mL2pQ5xZ8vN3bC6dE9fG2hI5jK8mN1oP4qR7sT0uV3wX6yZ9aB2cD5eF8gH
```

### Paso 4: Iniciar los servicios

```bash
docker-compose up -d
```

### Paso 5: Verificar que todo está funcionando

```bash
# Ver estado de los contenedores
docker-compose ps

# Ver logs
docker-compose logs -f
```

### Paso 6: Acceder a la aplicación

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

---

## 🔧 Configuración Avanzada

### Cambiar Puertos

Edita `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "8000:3000"  # Acceso en puerto 8000
  
  frontend:
    ports:
      - "8001:80"    # Acceso en puerto 8001
  
  postgres:
    ports:
      - "5433:5432"  # Acceso en puerto 5433
```

### Cambiar Credenciales de Base de Datos

```yaml
services:
  postgres:
    environment:
      POSTGRES_USER: mi-usuario
      POSTGRES_PASSWORD: mi-contraseña-fuerte
      POSTGRES_DB: mi-base-datos
  
  backend:
    environment:
      DB_USER: mi-usuario
      DB_PASSWORD: mi-contraseña-fuerte
      DB_NAME: mi-base-datos
```

### Cambiar JWT Secret (IMPORTANTE EN PRODUCCIÓN)

**Generar una clave segura:**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
```

Luego, copia el resultado y actualiza tu `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      JWT_SECRET: tu-clave-generada-aqui-muy-larga-y-aleatoria
```

**Ejemplo de salida:**
```
JWT_SECRET: a7K9mL2pQ5xZ8vN3bC6dE9fG2hI5jK8mN1oP4qR7sT0uV3wX6yZ9aB2cD5eF8gH
```

### Usar HTTPS (Producción)

Para usar HTTPS, necesitas un proxy inverso como Nginx o Traefik. Ejemplo con Nginx:

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: night_shop_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - frontend
      - backend

  # ... resto de servicios
```

---

## 📊 Mantenimiento

### Backups de Base de Datos

**Crear backup:**
```bash
docker-compose exec postgres pg_dump -U nightshop night_shop_db > backup-$(date +%Y%m%d-%H%M%S).sql
```

**Restaurar backup:**
```bash
docker-compose exec -T postgres psql -U nightshop night_shop_db < backup-2025-01-15-120000.sql
```

### Actualizar Imágenes

```bash
# Descargar las últimas versiones
docker-compose pull

# Reiniciar servicios con nuevas imágenes
docker-compose down
docker-compose up -d
```

### Limpiar Datos

```bash
# Detener servicios
docker-compose down

# Eliminar volúmenes (CUIDADO: elimina datos)
docker-compose down -v

# Reiniciar desde cero
docker-compose up -d
```

### Monitoreo

```bash
# Ver consumo de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

---

## 🔐 Seguridad en Producción

### Checklist de Seguridad

- [ ] Cambiar `JWT_SECRET` a una clave aleatoria fuerte
- [ ] Cambiar credenciales de base de datos
- [ ] Cambiar `CORS_ORIGIN` a tu dominio
- [ ] Usar HTTPS/SSL
- [ ] Configurar firewall
- [ ] Realizar backups regulares
- [ ] Monitorear logs
- [ ] Usar contraseñas fuertes
- [ ] Actualizar imágenes regularmente

### Variables de Entorno Recomendadas para Producción

```yaml
services:
  backend:
    environment:
      NODE_ENV: production
      JWT_SECRET: $(openssl rand -base64 32)
      CORS_ORIGIN: https://tu-dominio.com
      DB_USER: usuario-seguro
      DB_PASSWORD: contraseña-muy-fuerte-32-caracteres
```

---

## 🆘 Solución de Problemas

### Error: "Cannot pull image"

```bash
# Verificar que tienes acceso a GHCR
docker login ghcr.io
# Username: Darkhyrax
# Password: tu-token-github

# Luego intentar de nuevo
docker-compose pull
```

### Error: "Port already in use"

```bash
# Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Error: "Cannot connect to database"

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

```bash
# Verificar logs del frontend
docker-compose logs frontend

# Verificar que el backend está accesible
curl http://localhost:3000/api/docs

# Reconstruir
docker-compose down
docker-compose pull
docker-compose up -d
```

### Error: "CORS error in browser"

```yaml
# Editar docker-compose.yml
services:
  backend:
    environment:
      CORS_ORIGIN: http://localhost:3001
```

### Error: "Out of memory"

**Windows/Mac:**
- Abre Docker Desktop
- Settings → Resources → Memory
- Aumenta a mínimo 4GB

**Linux:**
```bash
# Aumentar memoria disponible para Docker
# Editar /etc/docker/daemon.json
{
  "memory": "4g"
}
```

---

## 📈 Escalado

### Aumentar Recursos

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Múltiples Instancias del Backend

```yaml
services:
  backend-1:
    image: ghcr.io/darkhyrax/night_shop-backend:latest
    ports:
      - "3000:3000"
  
  backend-2:
    image: ghcr.io/darkhyrax/night_shop-backend:latest
    ports:
      - "3001:3000"
  
  # Usar Nginx como load balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    # ... configuración de load balancing
```

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs:**
   ```bash
   docker-compose logs -f
   ```

2. **Verifica que Docker está ejecutándose:**
   ```bash
   docker ps
   ```

3. **Intenta reiniciar:**
   ```bash
   docker-compose restart
   ```

4. **Última opción - reinicia desde cero:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

---

## 📚 Recursos Útiles

- [Documentación Docker](https://docs.docker.com/)
- [Documentación Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL en Docker](https://hub.docker.com/_/postgres)
- [Nginx en Docker](https://hub.docker.com/_/nginx)

---

**Última actualización:** Enero 2025
**Versión:** 1.0.0

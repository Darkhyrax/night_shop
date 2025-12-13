# 🚀 Configuración de GitHub Actions - Pasos Ordenados

**Documentación para desarrolladores**

## Paso 1: Preparar el Repositorio en GitHub

```
1. Crear repositorio en GitHub (si no existe)
   - Ir a https://github.com/new
   - Nombre: night-shop
   - Descripción: Sistema de gestión para tiendas locales
   - Público (para GHCR gratuito)
   - Crear repositorio

2. Clonar y subir código
   git clone https://github.com/Darkhyrax/night-shop.git
   cd night-shop
   git add .
   git commit -m "Initial commit"
   git push -u origin main
```

---

## Paso 2: Verificar Estructura de Carpetas

```
night-shop/
├── .github/
│   └── workflows/
│       └── docker-build.yml          ✅ Ya existe
├── night-shop-backend/
│   ├── Dockerfile                    ✅ Ya existe
│   └── ...
├── night-shop-frontend/
│   ├── Dockerfile                    ✅ Ya existe
│   ├── nginx.conf                    ✅ Ya existe
│   └── ...
├── docker-compose.yml                ✅ Ya existe
├── .env.example                      ✅ Ya existe
└── README.md                         ✅ Ya existe
```

---

## Paso 3: Habilitar GitHub Actions

```
1. En GitHub, ir a: Settings → Actions → General

2. Permitir GitHub Actions:
   ✅ "Allow all actions and reusable workflows"

3. Guardar cambios
```

---

## Paso 4: Crear GitHub Token (Personal Access Token)

```
1. Ir a: https://github.com/settings/tokens

2. Hacer clic en "Generate new token" → "Generate new token (classic)"

3. Configurar token:
   - Note: "Docker Build Token"
   - Expiration: 90 days (o más)
   - Scopes necesarios:
     ✅ write:packages
     ✅ read:packages
     ✅ delete:packages

4. Copiar el token (aparece una sola vez)
   - Guardar en lugar seguro
```

---

## Paso 5: Agregar Secrets a GitHub

```
1. En GitHub, ir a: Settings → Secrets and variables → Actions

2. Crear nuevo secret:
   - Name: GITHUB_TOKEN
   - Value: (pegar el token del Paso 4)
   
   Nota: GITHUB_TOKEN ya existe automáticamente en GitHub Actions
   No necesitas agregarlo manualmente, pero puedes verificar
```

---

## Paso 6: Verificar Workflow

```
1. En GitHub, ir a: Actions

2. Buscar "Build and Push Docker Images"

3. Verificar que aparezca en la lista de workflows

4. El workflow se ejecutará automáticamente cuando:
   - Hagas push a main o develop
   - Crees un tag (v1.0.0)
```

---

## Paso 7: Primer Push para Activar Workflow

```bash
# Hacer un cambio pequeño para disparar el workflow
echo "# Night Shop" > TEST.md

# Subir cambios
git add TEST.md
git commit -m "Test GitHub Actions"
git push origin main
```

---

## Paso 8: Monitorear Construcción

```
1. En GitHub, ir a: Actions

2. Ver el workflow en ejecución:
   - "Build and Push Docker Images" debe estar en progreso

3. Esperar a que termine (5-10 minutos)

4. Verificar resultados:
   ✅ Verde = Éxito
   ❌ Rojo = Error (revisar logs)
```

---

## Paso 9: Verificar Imágenes en GHCR

```
1. Una vez completado el workflow, ir a:
   https://github.com/Darkhyrax/night-shop/pkgs/container

2. Deberías ver:
   - night-shop-backend
   - night-shop-frontend

3. Cada una con tags:
   - latest
   - main
   - sha-xxxxx
```

---

## Paso 10: Descargar y Usar Imágenes

```bash
# Iniciar sesión en GHCR
docker login ghcr.io
# Username: Darkhyrax
# Password: token-del-paso-4

# Descargar imágenes
docker pull ghcr.io/Darkhyrax/night-shop-backend:latest
docker pull ghcr.io/Darkhyrax/night-shop-frontend:latest

# Usar en docker-compose.yml
# Reemplazar secciones "build:" con "image:"
```

---

## Resumen de Pasos

| Paso | Acción | Tiempo |
|------|--------|--------|
| 1 | Crear repositorio GitHub | 2 min |
| 2 | Verificar estructura | 1 min |
| 3 | Habilitar GitHub Actions | 1 min |
| 4 | Crear token | 2 min |
| 5 | Agregar secrets | 1 min |
| 6 | Verificar workflow | 1 min |
| 7 | Primer push | 1 min |
| 8 | Monitorear construcción | 10 min |
| 9 | Verificar imágenes | 1 min |
| 10 | Descargar imágenes | 2 min |

**Total: ~22 minutos**

---

## Checklist Final

- [ ] Repositorio creado en GitHub
- [ ] Código subido a main
- [ ] GitHub Actions habilitado
- [ ] Token creado
- [ ] Secrets configurados
- [ ] Workflow ejecutado exitosamente
- [ ] Imágenes visibles en GHCR
- [ ] Imágenes descargadas localmente
- [ ] docker-compose.yml actualizado con imágenes
- [ ] Servicios iniciados correctamente

---

## Próximos Pasos

Una vez completados estos 10 pasos:
1. Procederemos con ajustes si es necesario
2. Documentaremos cualquier cambio
3. Crearemos guías adicionales si es necesario

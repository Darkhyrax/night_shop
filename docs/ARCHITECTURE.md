# Arquitectura de Night Shop CMS

## 📐 Visión General

Night Shop es un CMS modular y escalable diseñado para tiendas locales. La arquitectura actual está optimizada para una única tienda, pero ha sido diseñada con extensibilidad en mente para soportar múltiples tiendas en versiones futuras.

## 🏗️ Estructura del Proyecto

```
night_shop/
├── night-shop-backend/          # API NestJS
│   ├── src/
│   │   ├── auth/                # Autenticación y autorización
│   │   ├── users/               # Gestión de usuarios
│   │   ├── products/            # Catálogo de productos
│   │   ├── inventory/           # Control de inventario
│   │   ├── sales/               # Gestión de ventas
│   │   ├── customers/           # Gestión de clientes
│   │   ├── exchange-rates/      # Tasas de cambio
│   │   ├── reports/             # Reportes y análisis
│   │   ├── config/              # Configuración
│   │   ├── migrations/          # Migraciones de BD
│   │   └── main.ts              # Punto de entrada
│   └── package.json
│
├── night-shop-frontend/         # Frontend React + Vite
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   ├── features/            # Módulos de características
│   │   ├── services/            # Servicios API
│   │   ├── types/               # Tipos TypeScript
│   │   ├── hooks/               # Custom hooks
│   │   └── App.tsx              # Componente raíz
│   └── package.json
│
└── README.md                    # Documentación principal
```

## 🗄️ Modelo de Datos

### Entidades Principales

#### Users (Usuarios)
```
- id (UUID)
- email (único)
- username (único)
- firstName, lastName
- phoneNumber, dni
- password (hasheada)
- role (admin | employee)
- isActive
- timestamps
```

#### Customers (Clientes)
```
- id (UUID)
- firstName, lastName
- email, phone, address
- dni (único)
- isActive
- timestamps
```

#### Products (Productos)
```
- id (UUID)
- name
- description, imageUrl
- currentCostPrice
- currentProfitPercentage
- currentSellingPrice
- totalStock
- isActive
- timestamps
```

#### Sales (Ventas)
```
- id (UUID)
- status (pending | completed)
- saleType (cash | credit)
- totalAmountUsd, totalAmountBs
- paidAmountUsd, paidAmountBs
- changeUsd, changeBS
- changePaymentMethod (usd | bs | mixed)
- exchangeRateId (FK)
- customerId (FK, nullable)
- userId (FK)
- timestamps
```

#### CustomerAccounts (Deudas)
```
- id (UUID)
- customerId (FK)
- saleId (FK)
- debtUsd
- timestamps
```

#### CustomerPayments (Pagos)
```
- id (UUID)
- customerId (FK)
- amountUsd
- paidInCurrency (usd | bs)
- amountPaidInOriginalCurrency
- exchangeRateId (FK, nullable)
- isInitialPayment
- timestamps
```

#### ExchangeRates (Tasas de Cambio)
```
- id (UUID)
- rate
- effectiveDate
- isActive
- source (BCV)
- notes
- timestamps
```

#### ExchangeRateSyncLogs (Logs de Sincronización)
```
- id (UUID)
- syncedAt
- success
- errorMessage (nullable)
- rate (nullable)
- source (BCV)
```

## 🔄 Flujos Principales

### 1. Flujo de Venta

```
1. Usuario selecciona tipo de venta (Contado/Crédito)
2. Agrega productos al carrito
3. Si es crédito:
   - Selecciona cliente existente o crea uno nuevo
4. Registra pago:
   - Contado: Ingresa montos en USD y/o Bs
   - Crédito: Ingresa abono inicial (opcional)
5. Sistema calcula:
   - Cambio (si aplica)
   - Distribución de pago entre cuentas
6. Crea registros:
   - Sale
   - SaleDetails
   - CustomerPayments (si aplica)
   - CustomerAccounts (si es crédito)
```

### 2. Flujo de Sincronización de Tasas

```
1. Scheduler ejecuta diariamente a las 4 PM
2. Intenta obtener tasa desde BCV
3. Si éxito:
   - Crea nuevo ExchangeRate
   - Registra log exitoso
4. Si fallo:
   - Registra log con error
   - Usuario puede sincronizar manualmente
5. Frontend muestra estado y permite sincronización manual
```

### 3. Flujo de Reportes

```
1. Usuario accede a sección de Reportes
2. Selecciona tipo de reporte:
   - Ventas (con filtros de fecha)
   - Productos (top N)
   - Clientes (más activos / mayor deuda)
   - Inventario (stock bajo)
3. Sistema consulta API
4. Frontend visualiza datos en tablas
```

## 🔐 Seguridad

### Autenticación
- JWT tokens con expiración configurable
- Refresh tokens para renovación
- Almacenamiento seguro en localStorage

### Autorización
- Roles: Admin, Employee
- Guards en rutas protegidas
- Validación en backend

### Validación
- DTOs con class-validator
- Validación en cliente y servidor
- Sanitización de entrada

## 📊 Patrones de Diseño

### Backend (NestJS)

#### Modular Architecture
```
Cada módulo contiene:
- Entity (modelo de BD)
- DTO (validación)
- Service (lógica)
- Controller (endpoints)
- Module (configuración)
```

#### Repository Pattern
```
- Inyección de repositorios
- Queries reutilizables
- Separación de responsabilidades
```

#### Service Layer
```
- Lógica de negocio centralizada
- Métodos reutilizables
- Manejo de errores consistente
```

### Frontend (React)

#### Component Composition
```
- Componentes pequeños y reutilizables
- Props bien tipadas
- Separación de responsabilidades
```

#### Custom Hooks
```
- Lógica reutilizable
- Estado centralizado
- Efectos secundarios controlados
```

#### API Service
```
- Cliente HTTP centralizado
- Interceptores para autenticación
- Manejo de errores global
```

## 🚀 Roadmap v2.0 - Multi-Tienda

### Cambios Requeridos

#### 1. Base de Datos
```sql
-- Nueva tabla
CREATE TABLE stores (
  id UUID PRIMARY KEY,
  name VARCHAR,
  slug VARCHAR UNIQUE,
  logo_url VARCHAR,
  theme_color VARCHAR,
  owner_id UUID FK,
  is_active BOOLEAN,
  timestamps
);

-- Modificar tablas existentes
ALTER TABLE users ADD COLUMN store_id UUID FK;
ALTER TABLE products ADD COLUMN store_id UUID FK;
ALTER TABLE sales ADD COLUMN store_id UUID FK;
-- ... etc para todas las tablas
```

#### 2. Backend - Cambios Arquitectónicos

**Middleware de Tienda**
```typescript
// Extraer store_id del JWT o header
// Validar acceso del usuario a la tienda
// Inyectar store_id en contexto de request
```

**Queries Filtradas**
```typescript
// Todas las queries deben filtrar por store_id
// Usar scopes globales en TypeORM
```

**Endpoints Multi-Tienda**
```typescript
// Rutas: /api/stores/:storeId/sales
// Validar acceso antes de procesar
```

#### 3. Frontend - Cambios

**Selector de Tienda**
```typescript
// Dropdown para cambiar entre tiendas
// Guardar en localStorage
// Incluir en todas las llamadas API
```

**Temas Dinámicos**
```typescript
// Cargar colores y logo desde API
// Aplicar dinámicamente al tema de MUI
```

**URLs Dinámicas**
```typescript
// Incluir storeId en rutas
// Ejemplo: /stores/abc123/sales
```

### Estrategia de Migración

#### Fase 1: Preparación
- [ ] Agregar columna store_id a todas las tablas
- [ ] Crear tabla stores
- [ ] Migrar datos existentes a store_id = default

#### Fase 2: Backend
- [ ] Implementar middleware de tienda
- [ ] Actualizar queries con filtros
- [ ] Crear endpoints multi-tienda
- [ ] Validar acceso por tienda

#### Fase 3: Frontend
- [ ] Agregar selector de tienda
- [ ] Actualizar rutas
- [ ] Implementar temas dinámicos
- [ ] Pruebas de integración

#### Fase 4: Testing
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Performance testing

## 🔧 Configuración

### Variables de Entorno

**Backend (.env)**
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=night_shop

JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h

CORS_ORIGIN=http://localhost:3001
PORT=3000
NODE_ENV=development
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3000/api
```

## 📈 Performance

### Optimizaciones Implementadas
- Paginación en reportes
- Índices en BD (synced_at, success)
- Lazy loading en frontend
- Memoización de componentes

### Recomendaciones Futuras
- Caché de reportes
- Compresión de datos
- CDN para assets
- Database replication

## 🧪 Testing

### Estrategia Actual
- Tests unitarios en servicios
- Tests E2E en flujos críticos

### Mejoras Futuras
- Cobertura de código >80%
- Tests de performance
- Tests de seguridad
- Tests de accesibilidad

## 📚 Documentación

### API
- Swagger/OpenAPI en `/api/docs`
- Documentación de endpoints
- Ejemplos de requests/responses

### Código
- Comentarios en funciones complejas
- README en cada módulo
- Guías de contribución

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

## 📞 Soporte

Para preguntas sobre la arquitectura:
- Revisar este documento
- Consultar README.md
- Abrir issue en GitHub
- Contactar al equipo

---

**Última actualización:** Diciembre 2025
**Versión:** 1.0.0
**Próxima versión:** 2.0.0 (Multi-Tienda)

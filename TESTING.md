# 🧪 Guía de Testing - Night Shop CMS

## 📋 Resumen

Este documento describe la estrategia de testing para Night Shop CMS, incluyendo tests unitarios, de integración y E2E que se ejecutan automáticamente en el pipeline de CI/CD.

---

## 🏗️ Estructura de Tests

### Tests Unitarios
Ubicación: `src/**/*.spec.ts`

Tests para servicios individuales sin dependencias externas:
- `auth.service.spec.ts` - Autenticación y JWT
- `sales.service.spec.ts` - Lógica de ventas
- `customers.service.spec.ts` - Gestión de clientes
- `products.service.spec.ts` - Catálogo de productos

### Tests de Integración
Ubicación: `src/**/*.controller.spec.ts`

Tests para controladores con dependencias inyectadas:
- `auth.controller.spec.ts`
- `users.controller.spec.ts`

### Tests E2E
Ubicación: `test/jest-e2e.json`

Tests de flujos completos (requieren BD real):
- Login y autenticación
- Crear venta
- Gestión de clientes
- Reportes

---

## 🚀 Ejecutar Tests Localmente

### Tests Unitarios
```bash
cd night-shop-backend
npm run test
```

### Tests con Watch Mode
```bash
npm run test:watch
```

### Tests con Coverage
```bash
npm run test:cov
```

### Tests E2E
```bash
npm run test:e2e
```

---

## 🔄 Pipeline de CI/CD

### GitHub Actions Workflow
Archivo: `.github/workflows/test.yml`

**Triggers:**
- Push a `main` o `develop`
- Pull requests a `main` o `develop`

**Pasos:**
1. Setup Node.js 20
2. Instalar dependencias
3. Ejecutar linter (ESLint)
4. Ejecutar tests unitarios
5. Generar coverage
6. Instalar dependencias frontend
7. Ejecutar linter frontend
8. Build frontend
9. (Si push a main) Build y push imágenes Docker

**Servicios:**
- PostgreSQL 15 (para tests que requieren BD)

---

## 📊 Coverage

### Objetivo
- Mínimo 70% de cobertura en servicios críticos
- 100% en funciones de autenticación y seguridad

### Generar Reporte
```bash
npm run test:cov
```

El reporte se genera en `coverage/` y se sube a Codecov automáticamente en el pipeline.

---

## ✅ Checklist de Testing

Antes de hacer push a `main`:

- [ ] Todos los tests pasan localmente (`npm run test`)
- [ ] Coverage es adecuado (`npm run test:cov`)
- [ ] Linter pasa sin errores (`npm run lint`)
- [ ] Tests E2E pasan si hay cambios en flujos críticos
- [ ] No hay warnings en la consola

---

## 🎯 Mejores Prácticas

### Naming
```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should return access token on successful login', () => {
      // test
    });
  });
});
```

### Setup y Cleanup
```typescript
beforeEach(async () => {
  // Setup antes de cada test
});

afterEach(() => {
  jest.clearAllMocks();
});
```

### Mocking
```typescript
const mockUsersService = {
  findByUsername: jest.fn().mockResolvedValue(mockUser),
};
```

### Assertions
```typescript
expect(result).toEqual(expectedValue);
expect(mockService.method).toHaveBeenCalledWith(arg);
expect(() => service.method()).toThrow(Error);
```

---

## 🐛 Debugging Tests

### Ejecutar un test específico
```bash
npm run test -- auth.service.spec.ts
```

### Debug mode
```bash
npm run test:debug
```

### Watch mode para desarrollo
```bash
npm run test:watch
```

---

## 📈 Métricas

### Comandos útiles
```bash
# Ver cobertura detallada
npm run test:cov

# Generar reporte HTML
npm run test:cov -- --coverage-reporters=html

# Ver reporte en navegador
open coverage/index.html
```

---

## 🔐 Tests de Seguridad

### Autenticación
- ✅ Login con credenciales válidas
- ✅ Rechazo con credenciales inválidas
- ✅ Rate limiting en login (5 intentos/minuto)
- ✅ Validación de contraseña (mínimo 8 caracteres)

### Autorización
- ✅ Endpoints protegidos requieren JWT
- ✅ Usuarios inactivos no pueden acceder
- ✅ Roles se validan correctamente

---

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Última actualización:** Enero 2026
**Versión:** 1.0.0

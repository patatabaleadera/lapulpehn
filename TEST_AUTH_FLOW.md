# 🧪 Guía de Prueba del Flujo de Autenticación

## Objetivo
Verificar que el bug de autenticación está completamente resuelto.

## ✅ Criterios de Éxito
- NO debe haber loop de "sesión expirada"
- Login debe funcionar en el primer intento
- Navegación debe ser fluida sin redirects inesperados
- Sesión debe persistir correctamente

## 📋 Casos de Prueba

### Test 1: Login Nuevo Usuario
**Pasos:**
1. Abrir navegador en modo incógnito
2. Ir a la landing page
3. Click "Comenzar con Google"
4. Completar autenticación con Google
5. Esperar redirección

**Resultado Esperado:**
- ✅ Redirige a `/select-type` sin loops
- ✅ Muestra opciones "Soy Cliente" / "Tengo una Pulpería"
- ✅ No hay mensajes de "sesión expirada"

### Test 2: Selección de Tipo
**Pasos:**
1. Desde `/select-type`, seleccionar "Soy Cliente"
2. Esperar procesamiento

**Resultado Esperado:**
- ✅ Muestra loading spinner
- ✅ Toast de éxito "¡Cuenta configurada correctamente!"
- ✅ Redirige a `/map`
- ✅ No hay errores en consola

### Test 3: Navegación Entre Páginas
**Pasos:**
1. Estando en `/map`, ir a `/search`
2. Luego a `/cart`
3. Luego a `/profile`
4. Volver a `/map`

**Resultado Esperado:**
- ✅ Todas las navegaciones son instantáneas
- ✅ No hay verificaciones de auth visibles
- ✅ No redirige a login
- ✅ No hay loops

### Test 4: Refresh de Página
**Pasos:**
1. Estando logueado en `/map`
2. Presionar F5 o recargar página

**Resultado Esperado:**
- ✅ Muestra loading spinner breve
- ✅ Permanece en `/map` después de cargar
- ✅ No redirige a login
- ✅ Datos del usuario siguen disponibles

### Test 5: Login Usuario Existente
**Pasos:**
1. Hacer logout
2. Volver a hacer login con la misma cuenta de Google

**Resultado Esperado:**
- ✅ Va DIRECTO a `/map` (no pide tipo de usuario)
- ✅ No hay loops
- ✅ Login es rápido (< 3 segundos)

### Test 6: Logout
**Pasos:**
1. Ir a `/profile`
2. Click "Cerrar Sesión"

**Resultado Esperado:**
- ✅ Toast "Sesión cerrada correctamente"
- ✅ Redirige a `/`
- ✅ Carrito se limpia

### Test 7: Acceso a Ruta Protegida Sin Auth
**Pasos:**
1. Estando sin login, escribir manualmente en URL: `/map`
2. Presionar Enter

**Resultado Esperado:**
- ✅ Redirige a `/` inmediatamente
- ✅ No hay loop
- ✅ No muestra "sesión expirada" repetidamente

### Test 8: Sesión Expirada Natural
**Pasos (Avanzado):**
1. Login normalmente
2. En DevTools: Application → Cookies
3. Borrar la cookie `session_token`
4. Intentar navegar a otra página

**Resultado Esperado:**
- ✅ Detecta que no hay sesión
- ✅ Redirige a `/` UNA VEZ
- ✅ Muestra mensaje "Sesión expirada. Por favor inicia sesión nuevamente."
- ✅ NO entra en loop

## 🐛 Problemas Potenciales y Soluciones

### Problema: Sigue habiendo loop
**Diagnóstico:**
```javascript
// Revisar en consola del navegador
- ¿Hay múltiples llamadas a /api/auth/me?
- ¿Hay redirects en cadena?
```

**Solución:**
- Verificar que AuthContext esté en App.js
- Confirmar que ProtectedRoute usa useAuth()
- Limpiar caché del navegador

### Problema: "Session token not found"
**Diagnóstico:**
```javascript
// En Network tab verificar:
- ¿Las requests incluyen cookies?
- ¿El header withCredentials está configurado?
```

**Solución:**
- Verificar CORS_ORIGINS en backend
- Confirmar que todas las requests axios tienen `withCredentials: true`

### Problema: Login funciona pero refresh no
**Diagnóstico:**
```javascript
// La cookie no persiste correctamente
```

**Solución:**
- Verificar en backend que la cookie tiene:
  - httponly: true
  - secure: true
  - samesite: "none"
  - max_age: 7 days

## 📊 Checklist de Verificación

Marca cada item después de probarlo:

- [ ] Test 1: Login Nuevo Usuario
- [ ] Test 2: Selección de Tipo
- [ ] Test 3: Navegación Entre Páginas
- [ ] Test 4: Refresh de Página
- [ ] Test 5: Login Usuario Existente
- [ ] Test 6: Logout
- [ ] Test 7: Acceso Sin Auth
- [ ] Test 8: Sesión Expirada

## ✅ Aprobación Final

Si TODOS los tests pasan:
- ✅ El bug está resuelto
- ✅ La app está lista para producción
- ✅ Puede ser lanzada

Si algún test falla:
- ❌ Reportar cuál falló y el comportamiento observado
- ❌ Revisar logs en /var/log/supervisor/
- ❌ Aplicar solución correspondiente

---

**Notas:**
- Usar siempre modo incógnito para tests de nuevo usuario
- Limpiar cookies entre tests
- Verificar consola del navegador en cada test
- Anotar cualquier warning o error

**Tiempo estimado:** 15-20 minutos para todos los tests

**Estado:** Listo para ejecutar

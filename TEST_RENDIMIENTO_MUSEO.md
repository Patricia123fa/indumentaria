# Test Rápido De Rendimiento (Museo)

## Objetivo
Validar que el interactivo va fluido en el hardware real del museo tras la optimización de imágenes.

## Preparación (1 min)
1. Abrir el proyecto en modo producción (`npm run build` y `npm run preview`).
2. Cerrar otras apps pesadas del equipo.
3. Usar la resolución real de la pantalla del museo.
4. Abrir DevTools solo para medir (si está permitido).

## Prueba A: Carga Inicial
1. Recargar en duro (`Ctrl+F5`).
2. Medir tiempo hasta que aparece la pantalla interactiva usable.
3. Repetir 3 veces.

Umbral recomendado:
- Bueno: <= 3 s
- Aceptable: 3–5 s
- A revisar: > 5 s

## Prueba B: Cambio De Bando
1. Ir a un conflicto con 2 bandos.
2. Pulsar botón derecha (1->2) y luego izquierda (2->1).
3. Repetir 10 cambios seguidos.

Qué observar:
- Sin congelaciones visibles.
- Tiempo de respuesta por cambio <= 300 ms.
- Sin parpadeos de imagen largos.

## Prueba C: Apertura De Prendas
1. Abrir 5 hotspots distintos (incluye uno con imagen grande como gorro rayadillo).
2. Cerrar y abrir rápidamente 2-3 veces cada uno.

Qué observar:
- Apertura del detalle <= 400 ms.
- Scroll y animaciones suaves.
- Sin bloqueos al volver al maniquí.

## Prueba D: Estabilidad Continua (5 min)
1. Navegar entre siglos/conflictos sin parar durante 5 minutos.
2. Alternar bandos y abrir/cerrar prendas.

Qué observar:
- No cuelgues.
- No subida progresiva de tirones.
- No errores visuales acumulados.

## Registro De Resultado
Anotar:
1. Equipo/pantalla usada.
2. Tiempo medio de carga inicial.
3. Si hubo tirones en cambios de bando.
4. Si hubo tirones al abrir prendas.
5. Resultado final: `OK museo` o `revisar`.

## Criterio De Aceptación
Se considera válido para museo si:
1. Carga inicial media <= 5 s.
2. Cambios de bando sin bloqueos visibles.
3. Apertura de prendas estable en toda la sesión.

---
title: "Fórmula para calcular el precio de venta con margen (ejemplo paso a paso)"
date: "2026-04-16"
excerpt: "Si quieres ganar 30% de margen en MercadoLibre Chile, el precio de venta no es costo ÷ 0,7. Hay comisión, IVA y envío que cambian el número. Acá está la fórmula completa."
category: "Pricing"
---

Cuando quieres lograr un margen específico en MercadoLibre, la fórmula simple de `costo ÷ (1 − margen)` no funciona. No considera las comisiones, el IVA sobre esas comisiones ni el costo de envío. El resultado es que publicas a un precio que crees que te deja 30% de margen y en realidad te deja 10%.

## La fórmula completa

```
Precio de venta = Costo ÷ (1 − Margen objetivo − Comisión efectiva − % envío)
```

Donde:
- **Comisión efectiva** = Comisión de categoría × 1,19 (con IVA incluido)
- **% envío** = Costo de envío estimado ÷ precio de venta (circular, se aproxima)

## Ejemplo paso a paso

**Objetivo:** lograr 25% de margen neto en ML Chile  
**Costo del producto:** $18.000 CLP  
**Categoría:** Deportes (13% comisión)  
**Publicación:** Premium (envío estimado $4.500)

**Paso 1: Comisión efectiva con IVA**
```
13% × 1,19 = 15,47%
```

**Paso 2: Aproximar el % de envío**

Para un precio estimado de $50.000, el envío de $4.500 es ~9%. Para un precio de $35.000, es ~12,8%. Usa el precio estimado como punto de partida.

**Paso 3: Aplicar la fórmula**
```
Precio = $18.000 ÷ (1 − 0,25 − 0,1547 − 0,09)
Precio = $18.000 ÷ 0,5053
Precio = $35.622 CLP
```

**Paso 4: Verificar**

Con precio $35.622:
- Comisión ML (13%): −$4.631
- IVA sobre comisión: −$879
- Envío: −$4.500
- Ingreso neto: $25.612
- Costo: $18.000
- Ganancia: $7.612
- Margen: $7.612 ÷ $35.622 = **21,4%**

El margen resultó menor porque el % de envío fue mayor de lo estimado al usar un precio más bajo. La solución: iterar con el precio calculado para ajustar el % de envío, o usar una calculadora que lo haga automaticamente.

## Por qué el cálculo es circular

El % de envío depende del precio de venta, que a su vez depende del % de envío. Hay dos formas de resolverlo:

**Opción A — Envío como monto fijo:**
```
Precio = (Costo + Envío) ÷ (1 − Margen objetivo − Comisión efectiva)
Precio = ($18.000 + $4.500) ÷ (1 − 0,25 − 0,1547)
Precio = $22.500 ÷ 0,5953
Precio = $37.796 CLP
```

**Opción B — Calculadora** que itera automaticamente hasta converger al precio correcto.

## Qué margen objetivo usar

Como referencia para MercadoLibre Chile:

- Margen bruto menor a 15%: negocio en riesgo, cualquier variación de costos lo hace negativo
- Margen bruto 15–25%: viable pero ajustado
- Margen bruto mayor a 25%: zona cómoda para absorber devoluciones y costos operativos

Define tu margen objetivo antes de fijar el precio, no al revés.

**[Calcula el precio de venta exacto para tu margen objetivo →](https://margenreal.io/calculadora-ml)**

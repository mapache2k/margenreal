# Margen Real — Registro de Proyecto

**Proyecto:** Proyecto 7 — margenreal.io
**Stack:** Next.js 16 + TypeScript · Vercel · Cloudflare DNS · Resend · Lemon Squeezy · PostHog · Anthropic Claude API

---

## Infraestructura

| Componente | Detalle |
|---|---|
| Hosting | Vercel (deploy automatico desde GitHub mapache2k/margenreal) |
| DNS | Cloudflare (migrado desde Namecheap para habilitar MX records) |
| Email transaccional | Resend desde contacto@margenreal.io |
| Pagos | Lemon Squeezy — Starter USD 19 / Pro USD 49 |
| Analytics | PostHog |
| IA generacion contenido | Anthropic Claude API (claude-sonnet-4-6) |

---

## Variables de entorno (.env.local y Vercel)

- NEXT_PUBLIC_POSTHOG_KEY
- NEXT_PUBLIC_POSTHOG_HOST
- NEXT_PUBLIC_LS_STORE_ID
- NEXT_PUBLIC_LS_VARIANT_STARTER
- NEXT_PUBLIC_LS_VARIANT_PRO
- RESEND_API_KEY
- LS_API_KEY
- ANTHROPIC_API_KEY

---

## Paginas del sitio

| Ruta | Descripcion |
|---|---|
| / | Landing principal con CTA a calculadora y suscripcion |
| /calculadora-ml | Calculadora de margen para MercadoLibre Chile |
| /gratis | Formulario de suscripcion — entrega checklist por email |
| /guias | Index de guias educativas |
| /guias/[slug] | Pagina de guia individual (MDX) |
| /shop | Tienda para vendedores de importados |
| /gracias | Pagina post-compra — dispara evento purchase_complete en PostHog |
| /terms | Terminos de Uso |
| /privacy | Politica de Privacidad |
| /admin/pipeline | Generador de borradores con Claude API (uso interno) |
| /admin/emails | Templates de emails nurture para copiar en Resend (uso interno) |

---

## Calculadora ML Chile (/calculadora-ml)

Calcula en tiempo real:
- Margen real despues de comisiones ML (11-17% segun categoria)
- Costo de envio
- IVA del servicio
- Precio minimo para no perder
- Precio optimo segun margen objetivo

---

## Guias (MDX pipeline)

Archivos en content/guias/*.mdx con frontmatter (title, description, tags, draft).
getStaticPaths genera rutas estaticas en build.

Guias publicadas:
1. comisiones-ml-chile — Cuanto cobra realmente MercadoLibre en Chile
2. precio-minimo-ml — Como calcular el precio minimo para no vender a perdida

---

## Captacion de leads y secuencia de email

**Email 1 (inmediato):** Checklist — Los 5 errores de pricing
- Se envia automaticamente al suscribirse en /gratis
- API route: pages/api/subscribe.ts → Resend

**Email 2 (dia 3-5):** El error que destruye tu margen en MercadoLibre
- Tema: comisiones reales ML + formula de margen
- CTA: calculadora-ml
- Envio manual via Resend Broadcasts (template en /admin/emails)

**Email 3 (dia 7-10):** Tu precio minimo: el numero que te protege de vender a perdida
- Tema: formula precio minimo + ejemplo con numeros reales
- CTA: /shop
- Envio manual via Resend Broadcasts (template en /admin/emails)

---

## Eventos PostHog instrumentados

| Evento | Donde se dispara |
|---|---|
| calculator_started | Primera interaccion con la calculadora |
| calculator_completed | Calculo realizado (boton calcular) |
| shop_page_view | Visita a /shop (importados) |
| guide_view | Apertura de cualquier guia (con slug y tags) |
| purchase_complete | Pagina /gracias despues de compra Lemon Squeezy |
| free_signup | Suscripcion exitosa en /gratis |

Funnel principal: calculator_started → calculator_completed → free_signup → checkout_started → purchase_complete

---

## Pagos — Lemon Squeezy

| Plan | Precio | Variant ID | Redirect post-compra |
|---|---|---|---|
| Starter | USD 19 | 1553460 | https://margenreal.io/gracias?plan=starter |
| Pro | USD 49 | 1553463 | https://margenreal.io/gracias?plan=pro |

---

## Generador de contenido (/admin/pipeline)

API route: pages/api/pipeline.ts
Llama a Claude API con prompts del CTO Build Spec.

Tipos de contenido disponibles:
- tier3_case_study: Case study de empresa grande (requiere texto de investigacion)
- tier3_framework: Framework avanzado de pricing
- tier2_strategy: Estrategia de pricing
- tier2_channel_margin: Margen por canal (fijo, no requiere input de tema)

Modelo: claude-sonnet-4-6 | max_tokens: 4000

---

## Paginas legales

- /terms: Terminos de Uso — describe el producto real (calculadora, guias, ebooks). Ley aplicable: Chile.
- /privacy: Politica de Privacidad — menciona Resend, Lemon Squeezy, PostHog. Datos de calculadora no salen del navegador.

---

## Historial de cambios clave

| Fecha | Cambio |
|---|---|
| 2026-04 | DNS migrado a Cloudflare, MX records configurados en Resend |
| 2026-04 | Email template simplificado a HTML plano para evitar pestaña Promociones |
| 2026-04 | Todo el copy del sitio traducido de castellano argentino a espanol neutro latinoamericano |
| 2026-04 | Instrumentacion PostHog completa (5 eventos clave) |
| 2026-04 | Pagina /gracias creada con evento purchase_complete |
| 2026-04 | Pipeline de contenido con Claude API (/admin/pipeline) |
| 2026-04 | ANTHROPIC_API_KEY agregada a Vercel |
| 2026-04 | Lemon Squeezy redirect configurado a /gracias?plan=X |
| 2026-04 | Terms y Privacy actualizados al producto real + Layout actual |
| 2026-04 | Templates email 2 y 3 creados en /admin/emails |

---

## Pendientes

- [ ] Enviar Email 2 cuando haya suficientes suscriptores (3-5 dias post-suscripcion)
- [ ] Enviar Email 3 cuando haya suficientes suscriptores (7-10 dias post-suscripcion)
- [ ] Revisar PostHog para ver datos del funnel
- [ ] Producir primer contenido con /admin/pipeline (case study o framework)

---

*Registro generado: abril 2026*

# Landing de Monterrial POS

Página de venta del sistema, hecha con el mismo método que Dulcident: un solo
mostrador 3D (Three.js) fijo detrás de la página que cambia de pose según la
sección, y scroll suave con Lenis. No necesita build.

## Qué hay

- **Hero jugable**: monitor con el POS, ticketera, celular y productos flotando.
  Toca un producto: vuela al lector, pita y entra al carrito del monitor.
  Toca **Cobrar** en el monitor (o el botón, o `F4`): la ticketera imprime la boleta.
- **Rubros**: al elegir un rubro, el monitor cambia de tienda, categorías y productos.
- **Funciones**: el monitor queda a la izquierda y cambia entre Venta, Inventario,
  Caja y Reportes mientras bajas.
- **SUNAT**: la ticketera al frente con la boleta completa.
- **Contacto**: arma un mensaje y lo abre en WhatsApp.

## Antes de publicar

1. En `src/main.js`, completa `CONTACT.whatsapp` (código de país y número, solo
   dígitos, por ejemplo `51987654321`) y, si quieres, `CONTACT.email`.
   Sin número, el botón de WhatsApp queda desactivado.
2. Opcional, capturas reales: guarda tus capturas en `screens/` como
   `pos.png`, `inventario.png`, `caja.png`, `reportes.png` o `sunat.png`
   (proporción 16:10, idealmente 1600×1000) y agrega sus claves a `REAL_SHOTS`
   en `src/screens.js`. La captura reemplaza al dibujo en el monitor 3D.
   Con una captura en `pos`, el carrito interactivo deja de verse.
   No uses capturas con datos reales de clientes.

## Cómo verlo

Los módulos no abren con doble clic; necesitas un servidor local en esta carpeta:

```
npx serve .
```

o `python -m http.server`. Necesita internet para las fuentes y para Three.js y
Lenis desde jsDelivr. Para publicarla basta con subir `index.html`, `src/` y
`screens/` a cualquier hosting estático (Netlify, Vercel, GitHub Pages, cPanel).

## Dónde está cada cosa

| Parte | Archivo |
| --- | --- |
| Estructura y textos | `index.html` |
| Colores, tipografías y estilos | `src/styles.css` (bloque `:root`) |
| Arranque, scroll, rubros, formulario | `src/main.js` |
| Poses del 3D por sección | `src/stage.js` |
| Escena 3D: monitor, ticketera, celular, productos | `src/scene.js` |
| Pantallas del POS, ticket y celular (canvas) | `src/screens.js` |
| Rubros, productos de ejemplo y carrito | `src/data.js` |
| Pitido y ticketera (Web Audio) | `src/sound.js` |

Las pantallas reproducen el diseño real del POS (`tailwind.config.ts`,
`src/components/pos/*`). Los productos, tiendas, montos y el RUC del ticket son
datos de ejemplo.
# marketPOS-Landing

/* Pantallas del POS dibujadas en canvas 2D: se usan como textura del monitor,
   del ticket y del celular. Reproducen el diseño real del sistema
   (colores de tailwind.config.ts, PosTopbar, CartPanel, SunatComprobanteSelector).
   Si existe screens/<clave>.png, esa captura real reemplaza al dibujo. */
import { state, rubro, money, qty, cartTotals } from './data.js';

export const SW = 1600, SH = 1000;          // monitor
export const TW = 576, TH = 1640;           // ticket térmico de 80 mm
export const PW = 540, PH = 1110;           // celular

const C = {
  bg: '#f6f8f7', surface: '#ffffff', text: '#0d1b13', sec: '#4c9a6b', mute: '#6b7c72',
  border: '#e7f3ec', subtle: '#cfe7d9', primary: '#2bee79', primaryDark: '#16a34a',
  amber: '#f59e0b', red: '#ef4444', blue: '#3b82f6',
};
const F = (w, s) => `${w} ${s}px Inter, "Segoe UI", system-ui, sans-serif`;
const M = (w, s) => `${w} ${s}px "JetBrains Mono", Consolas, monospace`;

/* ── Capturas reales opcionales ──
   Guarda la captura en screens/<clave>.png (1600×1000 o proporción 16:10) y agrega
   su clave aquí. Claves: pos, inventario, caja, reportes, sunat. */
export const REAL_SHOTS = [];
const shots = {};
export function loadShots(onLoad){
  for (const k of REAL_SHOTS){
    const img = new Image();
    img.onload = () => { shots[k] = img; onLoad(k); };
    img.src = `screens/${k}.png`;
  }
}

/* ── Utilidades de dibujo ── */
function rr(g, x, y, w, h, r, fill, stroke, lw = 2){
  g.beginPath(); g.roundRect(x, y, w, h, r);
  if (fill){ g.fillStyle = fill; g.fill(); }
  if (stroke){ g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
}
function tx(g, s, x, y, font, color, align = 'left', base = 'alphabetic'){
  g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = base; g.fillText(s, x, y);
}
function fit(g, s, w, font){
  g.font = font;
  if (g.measureText(s).width <= w) return s;
  while (s.length > 1 && g.measureText(s + '…').width > w) s = s.slice(0, -1);
  return s + '…';
}
function tint(hex, a){ return hex + Math.round(a * 255).toString(16).padStart(2, '0'); }

/* Zonas tocables del monitor (en píxeles del canvas), para el 3D */
export const hits = [];

/* ── Barra superior común (PosTopbar) ── */
function topbar(g, title, sub){
  const R = rubro();
  g.fillStyle = C.surface; g.fillRect(0, 0, SW, 92);
  g.fillStyle = C.border; g.fillRect(0, 92, SW, 2);
  rr(g, 28, 18, 56, 56, 16, tint(C.primary, .14));
  // carrito
  g.strokeStyle = C.primaryDark; g.lineWidth = 4; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); g.moveTo(40, 34); g.lineTo(46, 34); g.lineTo(52, 56); g.lineTo(70, 56); g.lineTo(74, 41); g.lineTo(49, 41); g.stroke();
  g.fillStyle = C.primaryDark; g.beginPath(); g.arc(55, 64, 3.6, 0, 7); g.arc(68, 64, 3.6, 0, 7); g.fill();
  tx(g, title, 102, 47, F(700, 26), C.text);
  tx(g, sub, 102, 75, F(500, 17), C.sec);
  // tienda y turno
  const pill = `${R.store}  •  Turno abierto 07:58`;
  g.font = F(600, 18); const pw = g.measureText(pill).width + 64;
  rr(g, SW / 2 - pw / 2 + 60, 24, pw, 46, 12, C.bg, C.border);
  g.fillStyle = C.primary; g.beginPath(); g.arc(SW / 2 - pw / 2 + 88, 47, 6, 0, 7); g.fill();
  tx(g, pill, SW / 2 - pw / 2 + 104, 54, F(600, 18), C.text);
  // ventas del día
  rr(g, 1190, 18, 230, 58, 12, C.bg, C.border);
  tx(g, money(state.dayTotal), 1404, 47, F(700, 22), C.text, 'right');
  tx(g, `${state.sales} ventas hoy`, 1404, 68, F(500, 14), C.sec, 'right');
  g.fillStyle = tint(C.primary, .25); g.beginPath(); g.arc(1530, 47, 26, 0, 7); g.fill();
  tx(g, 'CM', 1530, 54, F(700, 18), C.primaryDark, 'center');
}

/* ── Venta (pantalla principal del POS) ── */
function drawPos(g){
  const R = rubro(), items = R.items;
  topbar(g, 'Monterrial', 'Sistema de ventas');
  hits.length = 0;
  // buscador
  rr(g, 28, 116, 1000, 64, 14, C.surface, C.border);
  g.strokeStyle = C.mute; g.lineWidth = 3; g.beginPath(); g.arc(64, 146, 11, 0, 7); g.moveTo(72, 154); g.lineTo(82, 164); g.stroke();
  tx(g, 'Buscar producto o escanear código…', 98, 156, F(500, 21), C.mute);
  rr(g, 950, 130, 62, 36, 8, C.bg, C.border); tx(g, 'F2', 981, 155, F(700, 17), C.mute, 'center');
  // categorías
  let x = 28;
  const chips = [['Todos', C.text], ...R.cats];
  chips.forEach(([n, col], k) => {
    g.font = F(600, 18); const w = g.measureText(n).width + (k ? 52 : 36);
    rr(g, x, 200, w, 46, 23, k ? C.surface : C.text, k ? C.border : null);
    if (k){ g.fillStyle = col; g.beginPath(); g.arc(x + 22, 223, 7, 0, 7); g.fill(); }
    tx(g, n, x + (k ? 38 : 18), 229, F(600, 18), k ? C.text : '#fff');
    x += w + 12;
  });
  // grilla de productos
  const cw = 238, ch = 196, gap = 16;
  items.forEach((it, k) => {
    const cx = 28 + (k % 4) * (cw + gap), cy = 266 + Math.floor(k / 4) * (ch + gap);
    const col = R.cats[it.c][1], on = state.flash === k;
    rr(g, cx, cy, cw, ch, 16, on ? '#f0fdf5' : C.surface, on ? C.primary : C.border, on ? 4 : 2);
    rr(g, cx + 16, cy + 16, 52, 52, 14, tint(col, .16));
    tx(g, it.n.slice(0, 1), cx + 42, cy + 51, F(800, 24), col, 'center');
    tx(g, fit(g, it.n, cw - 32, F(600, 19)), cx + 16, cy + 102, F(600, 19), C.text);
    tx(g, money(it.p), cx + 16, cy + 140, F(800, 24), C.text);
    tx(g, '/ ' + it.u, cx + 18 + g.measureText(money(it.p)).width + 4, cy + 140, F(500, 16), C.mute);
    if (it.st != null){
      const low = it.st < 8;
      rr(g, cx + 16, cy + 156, low ? 130 : 110, 26, 13, low ? '#fef3c7' : tint(C.primary, .14));
      tx(g, (low ? 'Bajo · ' : 'Stock ') + qty(it.st), cx + 28, cy + 175, F(600, 14), low ? '#b45309' : C.primaryDark);
    } else {
      rr(g, cx + 16, cy + 156, 96, 26, 13, '#eef2ff'); tx(g, 'Servicio', cx + 28, cy + 175, F(600, 14), '#4f46e5');
    }
    hits.push({ x: cx, y: cy, w: cw, h: ch, kind: 'item', i: k });
  });
  // carrito
  const px = 1056, pw = 516;
  rr(g, px, 116, pw, 860, 18, C.surface, C.border);
  tx(g, 'Carrito', px + 28, 166, F(700, 26), C.text);
  const t = cartTotals();
  rr(g, px + 140, 140, 52, 32, 16, tint(C.primary, .18)); tx(g, qty(t.units), px + 166, 163, F(700, 17), C.primaryDark, 'center');
  tx(g, 'Vaciar', px + pw - 28, 164, F(600, 17), C.mute, 'right');
  g.fillStyle = C.border; g.fillRect(px, 190, pw, 2);
  let y = 212;
  if (!state.cart.length){
    tx(g, 'Escanea o toca un producto', px + pw / 2, 420, F(600, 21), C.mute, 'center');
    tx(g, 'para empezar la venta', px + pw / 2, 450, F(500, 18), C.mute, 'center');
  }
  state.cart.slice(-5).forEach(l => {
    const it = rubro().items[l.i], on = state.flash === l.i;
    if (on) rr(g, px + 12, y - 6, pw - 24, 92, 12, '#f0fdf5');
    tx(g, fit(g, it.n, 300, F(600, 20)), px + 28, y + 28, F(600, 20), C.text);
    tx(g, `${qty(l.q)} ${it.u} × ${money(it.p)}`, px + 28, y + 60, F(500, 17), C.sec);
    tx(g, money(it.p * l.q), px + pw - 28, y + 28, F(700, 20), C.text, 'right');
    // stepper
    rr(g, px + pw - 136, y + 42, 108, 34, 10, C.bg, C.border);
    tx(g, '−', px + pw - 116, y + 66, F(700, 20), C.mute, 'center');
    tx(g, qty(l.q), px + pw - 82, y + 66, F(700, 17), C.text, 'center');
    tx(g, '+', px + pw - 48, y + 66, F(700, 20), C.primaryDark, 'center');
    y += 96;
  });
  // comprobante
  const sy = 686;
  g.fillStyle = C.border; g.fillRect(px, sy - 18, pw, 2);
  rr(g, px + 24, sy, pw - 48, 52, 12, C.bg);
  ['Ticket', 'Boleta', 'Factura'].forEach((n, k) => {
    const bw = (pw - 56) / 3, bx = px + 28 + k * bw;
    if (k === 1) rr(g, bx, sy + 4, bw, 44, 10, C.surface, C.border);
    tx(g, n, bx + bw / 2, sy + 33, F(k === 1 ? 700 : 500, 18), k === 1 ? C.text : C.mute, 'center');
  });
  tx(g, 'Op. gravada', px + 28, sy + 92, F(500, 18), C.mute); tx(g, money(t.base), px + pw - 28, sy + 92, F(600, 18), C.text, 'right');
  tx(g, 'IGV 18%', px + 28, sy + 120, F(500, 18), C.mute); tx(g, money(t.igv), px + pw - 28, sy + 120, F(600, 18), C.text, 'right');
  tx(g, 'Total', px + 28, sy + 170, F(700, 24), C.text); tx(g, money(t.total), px + pw - 28, sy + 172, F(800, 40), C.text, 'right');
  const by = sy + 194;
  rr(g, px + 24, by, pw - 48, 80, 16, state.cart.length ? C.primary : '#c9f5da');
  tx(g, 'Cobrar', px + pw / 2 - 18, by + 51, F(800, 28), C.text, 'center');
  rr(g, px + pw / 2 + 56, by + 24, 48, 32, 8, 'rgba(13,27,19,.12)'); tx(g, 'F4', px + pw / 2 + 80, by + 47, F(700, 16), C.text, 'center');
  hits.push({ x: px + 24, y: by, w: pw - 48, h: 80, kind: 'pay' });
}

/* ── Inventario ── */
function drawInventory(g){
  const R = rubro();
  topbar(g, 'Inventario', `${R.items.length * 23 + 4} productos · ${R.label}`);
  rr(g, 28, 116, 700, 60, 14, C.surface, C.border);
  tx(g, 'Buscar por nombre, código o categoría', 70, 154, F(500, 19), C.mute);
  rr(g, 1176, 116, 190, 60, 14, C.surface, C.border); tx(g, 'Importar Excel', 1271, 153, F(600, 18), C.text, 'center');
  rr(g, 1382, 116, 190, 60, 14, C.primary); tx(g, '+ Nuevo', 1477, 153, F(700, 19), C.text, 'center');
  rr(g, 28, 196, 1544, 780, 18, C.surface, C.border);
  const cols = [['Producto', 52], ['Categoría', 520], ['Presentaciones', 760], ['Stock', 1080], ['Precio', 1250], ['Estado', 1400]];
  g.fillStyle = C.bg; g.fillRect(30, 198, 1540, 58);
  cols.forEach(([n, x]) => tx(g, n.toUpperCase(), x, 234, F(700, 14), C.mute));
  R.items.forEach((it, k) => {
    const y = 256 + k * 88, cat = R.cats[it.c];
    g.fillStyle = C.border; g.fillRect(30, y + 86, 1540, 2);
    rr(g, 52, y + 20, 48, 48, 12, tint(cat[1], .16)); tx(g, it.n[0], 76, y + 52, F(800, 20), cat[1], 'center');
    tx(g, fit(g, it.n, 380, F(600, 20)), 118, y + 42, F(600, 20), C.text);
    tx(g, it.lot || 'SKU ' + (77510000 + k * 137), 118, y + 68, F(500, 15), it.lot ? '#b45309' : C.mute);
    rr(g, 520, y + 30, 18, 18, 9, cat[1]); tx(g, cat[0], 548, y + 46, F(500, 18), C.text);
    const pres = it.u === 'kg' ? 'kg · saco 50 kg' : it.u === 'm' ? 'metro · rollo 100 m' : it.u === 'tab' || it.u === 'cáp' ? 'unidad · blíster · caja' : it.st == null ? '—' : 'unidad · paquete x12';
    tx(g, pres, 760, y + 50, F(500, 17), C.sec);
    tx(g, it.st == null ? '—' : qty(it.st) + ' ' + it.u, 1080, y + 50, M(600, 18), C.text);
    tx(g, money(it.p), 1250, y + 50, M(600, 18), C.text);
    const low = it.st != null && it.st < 8, exp = !!it.lot && /2026/.test(it.lot);
    const [lab, bg, fg] = exp ? ['Por vencer', '#fee2e2', '#b91c1c'] : low ? ['Stock bajo', '#fef3c7', '#b45309'] : ['Activo', tint(C.primary, .16), C.primaryDark];
    rr(g, 1400, y + 26, 132, 34, 17, bg); tx(g, lab, 1466, y + 49, F(600, 15), fg, 'center');
  });
}

/* ── Caja y turnos ── */
function drawShift(g){
  topbar(g, 'Caja', 'Turno #128 · Cajero: Carla M.');
  const t = state.dayTotal;
  const parts = [['Efectivo', .46, '#16a34a'], ['Yape', .27, '#7c3aed'], ['Plin', .09, '#0ea5e9'], ['Tarjeta', .12, '#f59e0b'], ['Fiado', .06, '#ef4444']];
  parts.forEach(([n, f, col], k) => {
    const x = 28 + k * 312;
    rr(g, x, 116, 296, 150, 18, C.surface, C.border);
    rr(g, x + 24, 140, 14, 14, 7, col); tx(g, n, x + 48, 154, F(600, 18), C.mute);
    tx(g, money(t * f), x + 24, 214, F(800, 32), C.text);
    tx(g, Math.round(f * state.sales) + ' operaciones', x + 24, 246, F(500, 15), C.sec);
  });
  // barra de mezcla de pagos
  rr(g, 28, 290, 1544, 30, 15, C.border);
  let bx = 28;
  g.save(); g.beginPath(); g.roundRect(28, 290, 1544, 30, 15); g.clip();
  parts.forEach(([, f, col]) => { g.fillStyle = col; g.fillRect(bx, 290, 1544 * f, 30); bx += 1544 * f; });
  g.restore();
  // cuadre
  rr(g, 28, 346, 640, 630, 18, C.surface, C.border);
  tx(g, 'Cuadre del turno', 56, 398, F(700, 24), C.text);
  [['Apertura de caja', 150], ['Ventas en efectivo', t * .46], ['Ingresos extra', 20], ['Egresos (compras menores)', -35.5]].forEach(([n, v], k) => {
    const y = 456 + k * 64;
    tx(g, n, 56, y, F(500, 19), C.mute); tx(g, money(v), 640, y, M(600, 20), v < 0 ? C.red : C.text, 'right');
    g.fillStyle = C.border; g.fillRect(56, y + 22, 584, 2);
  });
  tx(g, 'Efectivo esperado', 56, 740, F(700, 20), C.text);
  tx(g, money(150 + t * .46 + 20 - 35.5), 640, 744, F(800, 32), C.text, 'right');
  rr(g, 56, 860, 584, 84, 16, C.text); tx(g, 'Cerrar turno', 348, 912, F(700, 24), '#fff', 'center');
  // movimientos
  rr(g, 692, 346, 880, 630, 18, C.surface, C.border);
  tx(g, 'Últimas ventas', 720, 398, F(700, 24), C.text);
  const R = rubro();
  for (let k = 0; k < 7; k++){
    const y = 452 + k * 74, it = R.items[(k * 3) % R.items.length], m = parts[[0, 1, 0, 3, 1, 2, 4][k]];
    tx(g, `B001-${String(state.serial - 1 - k).padStart(8, '0')}`, 720, y, M(600, 18), C.text);
    tx(g, fit(g, it.n, 300, F(500, 16)) + ' y más', 720, y + 26, F(500, 16), C.mute);
    rr(g, 1180, y - 22, 120, 34, 17, tint(m[2], .14)); tx(g, m[0], 1240, y + 1, F(600, 15), m[2], 'center');
    tx(g, money(it.p * (2 + k % 3)), 1544, y, M(700, 19), C.text, 'right');
    tx(g, `${(9 + k) % 12 + 1}:${String((k * 17) % 60).padStart(2, '0')} p. m.`, 1544, y + 26, F(500, 15), C.mute, 'right');
  }
}

/* ── Reportes ── */
function drawReports(g){
  topbar(g, 'Reportes', 'Hoy · martes 27 de octubre');
  const kpis = [['Ventas del día', money(state.dayTotal), '+12%'], ['Tickets', String(state.sales), '+5'], ['Ticket promedio', money(state.dayTotal / state.sales), '+6%'], ['Margen bruto', '27.4%', '+1.1 pts']];
  kpis.forEach(([n, v, d], k) => {
    const x = 28 + k * 390;
    rr(g, x, 116, 374, 150, 18, C.surface, C.border);
    tx(g, n, x + 26, 158, F(600, 18), C.mute);
    tx(g, v, x + 26, 216, F(800, 38), C.text);
    rr(g, x + 26, 230, 96, 26, 13, tint(C.primary, .16)); tx(g, d, x + 74, 249, F(700, 14), C.primaryDark, 'center');
  });
  rr(g, 28, 290, 1000, 686, 18, C.surface, C.border);
  tx(g, 'Ventas por hora', 56, 342, F(700, 24), C.text);
  const hrs = [3, 8, 14, 11, 9, 7, 12, 16, 10, 8, 13, 19, 22, 17, 9, 4];
  const max = 22, bw = 46, base = 900;
  for (let k = 0; k <= 4; k++){ const y = base - k * 120; g.fillStyle = C.border; g.fillRect(84, y, 912, 2); tx(g, money(k * 30).replace('.00', ''), 76, y + 6, F(500, 13), C.mute, 'right'); }
  hrs.forEach((v, k) => {
    const h = v / max * 480, x = 100 + k * 56;
    rr(g, x, base - h, bw, h, [8, 8, 0, 0], k === 12 ? C.primaryDark : C.primary);
    if (k % 2 === 0) tx(g, `${7 + k}h`, x + bw / 2, base + 32, F(500, 14), C.mute, 'center');
  });
  rr(g, 1052, 290, 520, 686, 18, C.surface, C.border);
  tx(g, 'Más vendidos', 1080, 342, F(700, 24), C.text);
  const R = rubro();
  R.items.slice(0, 6).forEach((it, k) => {
    const y = 400 + k * 84, f = 1 - k * .14;
    tx(g, fit(g, it.n, 300, F(600, 18)), 1080, y, F(600, 18), C.text);
    tx(g, Math.round(64 * f) + ' ' + it.u, 1544, y, M(600, 16), C.mute, 'right');
    rr(g, 1080, y + 16, 464, 14, 7, C.border); rr(g, 1080, y + 16, 464 * f, 14, 7, R.cats[it.c][1]);
  });
  rr(g, 1080, 900, 464, 56, 14, C.text); tx(g, 'Exportar a Excel', 1312, 936, F(700, 19), '#fff', 'center');
}

/* ── Comprobantes SUNAT ── */
function drawSunat(g){
  topbar(g, 'Comprobantes', 'Facturación electrónica SUNAT');
  const tabs = ['Todos', 'Boletas', 'Facturas', 'Notas de crédito', 'Resúmenes'];
  let x = 28;
  tabs.forEach((n, k) => {
    g.font = F(600, 18); const w = g.measureText(n).width + 40;
    rr(g, x, 116, w, 48, 24, k ? C.surface : C.text, k ? C.border : null); tx(g, n, x + 20, 147, F(600, 18), k ? C.text : '#fff'); x += w + 12;
  });
  rr(g, 28, 186, 1544, 790, 18, C.surface, C.border);
  g.fillStyle = C.bg; g.fillRect(30, 188, 1540, 56);
  [['Comprobante', 56], ['Cliente', 420], ['Fecha', 820], ['Total', 1060], ['Estado SUNAT', 1260]].forEach(([n, x]) => tx(g, n.toUpperCase(), x, 223, F(700, 14), C.mute));
  const s = state.serial;
  const rows = [
    [`B001-${String(s - 1).padStart(8, '0')}`, 'Boleta', 'Clientes varios', 18.4, 'Aceptado'],
    [`F001-${String(32).padStart(8, '0')}`, 'Factura', 'Distribuidora Norte S.A.C.', 842.6, 'Aceptado'],
    [`B001-${String(s - 2).padStart(8, '0')}`, 'Boleta', 'DNI 4•••••21', 56.0, 'Aceptado'],
    [`BC01-${String(3).padStart(8, '0')}`, 'Nota de crédito', 'Clientes varios', -12.5, 'Aceptado'],
    [`B001-${String(s - 3).padStart(8, '0')}`, 'Boleta', 'Clientes varios', 9.3, 'En resumen diario'],
    [`F001-${String(31).padStart(8, '0')}`, 'Factura', 'Inversiones Sur E.I.R.L.', 1290.0, 'Aceptado'],
    ['RC-20261027-1', 'Resumen diario', '14 boletas', 486.2, 'Enviado'],
    [`B001-${String(s - 4).padStart(8, '0')}`, 'Boleta', 'Clientes varios', 31.7, 'Aceptado'],
  ];
  rows.forEach(([id, type, cli, tot, st], k) => {
    const y = 244 + k * 90;
    g.fillStyle = C.border; g.fillRect(30, y + 88, 1540, 2);
    tx(g, id, 56, y + 42, M(700, 19), C.text); tx(g, type, 56, y + 68, F(500, 15), C.mute);
    tx(g, fit(g, cli, 360, F(500, 18)), 420, y + 52, F(500, 18), C.text);
    tx(g, `27/10/2026  ${8 + k}:${String(k * 7 % 60).padStart(2, '0')}`, 820, y + 52, M(500, 16), C.mute);
    tx(g, money(tot), 1060, y + 52, M(700, 19), tot < 0 ? C.red : C.text);
    const ok = st === 'Aceptado';
    const [bg, fg] = ok ? [tint(C.primary, .16), C.primaryDark] : ['#e0f2fe', '#0369a1'];
    g.font = F(600, 15); const w = g.measureText(st).width + 50;
    rr(g, 1260, y + 28, w, 34, 17, bg);
    g.fillStyle = fg; g.beginPath(); g.arc(1280, y + 45, 5, 0, 7); g.fill();
    tx(g, st, 1294, y + 50, F(600, 15), fg);
    if (ok){ tx(g, 'CDR', 1260 + w + 16, y + 50, F(700, 14), C.mute); tx(g, 'XML', 1260 + w + 66, y + 50, F(700, 14), C.mute); }
  });
}

const DRAW = { pos: drawPos, inventario: drawInventory, caja: drawShift, reportes: drawReports, sunat: drawSunat };

export function drawScreen(g, key){
  g.clearRect(0, 0, SW, SH);
  if (shots[key]){
    const im = shots[key], k = Math.max(SW / im.width, SH / im.height);
    g.drawImage(im, (SW - im.width * k) / 2, 0, im.width * k, im.height * k);
    if (key === 'pos') hits.length = 0;
    return;
  }
  g.fillStyle = C.bg; g.fillRect(0, 0, SW, SH);
  (DRAW[key] || drawPos)(g);
}

/* ── Ticket térmico: boleta electrónica de ejemplo ── */
export function drawTicket(g){
  const sale = state.lastSale || { cart: state.cart, serial: state.serial, ...cartTotals() };
  const R = rubro(), W = TW;
  g.fillStyle = '#fbfaf4'; g.fillRect(0, 0, W, TH);
  const ink = '#1d1f1c';
  let y = 70;
  const line = (s, font, align = 'center', col = ink) => { tx(g, s, align === 'center' ? W / 2 : align === 'left' ? 34 : W - 34, y, font, col, align); };
  const dash = () => { g.fillStyle = ink; for (let x = 34; x < W - 34; x += 14) g.fillRect(x, y - 6, 8, 2); };
  line(R.store.toUpperCase(), M(800, 30)); y += 36;
  line('RUC 20XXXXXXXXX · EJEMPLO', M(500, 18)); y += 26;
  line('Av. Principal 123 - Lima', M(500, 18)); y += 40;
  dash(); y += 34;
  line('BOLETA DE VENTA ELECTRÓNICA', M(800, 21)); y += 32;
  line(`B001-${String(sale.serial).padStart(8, '0')}`, M(700, 24)); y += 34;
  dash(); y += 30;
  line('Fecha: 27/10/2026 12:41', M(500, 17), 'left'); y += 26;
  line('Cliente: CLIENTES VARIOS', M(500, 17), 'left'); y += 26;
  line('Pago: Yape', M(500, 17), 'left'); y += 30;
  dash(); y += 32;
  line('Cant  Descripción', M(700, 17), 'left'); line('Importe', M(700, 17), 'right'); y += 30;
  (sale.cart.length ? sale.cart : []).slice(0, 7).forEach(l => {
    const it = R.items[l.i];
    line(`${qty(l.q).padEnd(4)}  ${fit(g, it.n.toUpperCase(), 330, M(500, 17))}`, M(500, 17), 'left');
    line((it.p * l.q).toFixed(2), M(600, 17), 'right'); y += 26;
  });
  if (!sale.cart.length){ line('— sin productos —', M(500, 17)); y += 26; }
  y += 6; dash(); y += 34;
  line('OP. GRAVADA', M(500, 18), 'left'); line(sale.base.toFixed(2), M(600, 18), 'right'); y += 28;
  line('IGV 18%', M(500, 18), 'left'); line(sale.igv.toFixed(2), M(600, 18), 'right'); y += 28;
  line('ICBPER', M(500, 18), 'left'); line('0.00', M(600, 18), 'right'); y += 38;
  line('TOTAL S/', M(800, 26), 'left'); line(sale.total.toFixed(2), M(800, 30), 'right'); y += 50;
  dash(); y += 40;
  // código QR de muestra (patrón decorativo, no codifica datos)
  const q = 21, cs = 9, qx = W / 2 - q * cs / 2;
  let seed = sale.serial * 9301 + 49297;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let r = 0; r < q; r++) for (let c = 0; c < q; c++){
    const fin = (r < 7 && c < 7) || (r < 7 && c >= q - 7) || (r >= q - 7 && c < 7);
    let on;
    if (fin){ const a = r >= q - 7 ? r - (q - 7) : r, b = c >= q - 7 ? c - (q - 7) : c; on = a === 0 || a === 6 || b === 0 || b === 6 || (a > 1 && a < 5 && b > 1 && b < 5); }
    else on = rnd() > .52;
    if (on){ g.fillStyle = ink; g.fillRect(qx + c * cs, y + r * cs, cs, cs); }
  }
  y += q * cs + 44;
  line('Representación impresa de la', M(500, 16)); y += 24;
  line('Boleta de Venta Electrónica', M(500, 16)); y += 24;
  line('Consulte su comprobante en SUNAT', M(500, 16)); y += 40;
  line('¡Gracias por su compra!', M(700, 19)); y += 34;
  line('Monterrial POS', M(500, 15), 'center', '#6b6f68');
}

/* ── Celular: catálogo online del negocio ── */
export function drawPhone(g){
  const R = rubro();
  g.fillStyle = '#f6f8f7'; g.fillRect(0, 0, PW, PH);
  g.fillStyle = C.text; g.fillRect(0, 0, PW, 210);
  tx(g, '9:41', 40, 50, F(700, 22), '#fff');
  rr(g, 36, 82, 62, 62, 18, C.primary); tx(g, R.store[0], 67, 124, F(800, 30), C.text, 'center');
  tx(g, R.store, 116, 108, F(700, 26), '#fff');
  tx(g, 'Catálogo online · Abierto', 116, 138, F(500, 17), '#9fe8bd');
  rr(g, 36, 164, PW - 72, 30, 15, 'rgba(255,255,255,.12)'); tx(g, 'Buscar en la tienda', 60, 185, F(500, 15), 'rgba(255,255,255,.7)');
  R.items.slice(0, 6).forEach((it, k) => {
    const w = (PW - 92) / 2, x = 36 + (k % 2) * (w + 20), y = 236 + Math.floor(k / 2) * 250, col = R.cats[it.c][1];
    rr(g, x, y, w, 230, 18, C.surface, C.border);
    rr(g, x + 14, y + 14, w - 28, 110, 12, tint(col, .14)); tx(g, it.n[0], x + w / 2, y + 86, F(800, 44), col, 'center');
    tx(g, fit(g, it.n, w - 28, F(600, 17)), x + 14, y + 156, F(600, 17), C.text);
    tx(g, money(it.p), x + 14, y + 190, F(800, 21), C.text);
    rr(g, x + w - 52, y + 168, 38, 38, 19, C.primary); tx(g, '+', x + w - 33, y + 196, F(800, 26), C.text, 'center');
  });
  rr(g, 36, PH - 104, PW - 72, 70, 20, '#25d366'); tx(g, 'Pedir por WhatsApp', PW / 2, PH - 60, F(800, 22), '#fff', 'center');
}

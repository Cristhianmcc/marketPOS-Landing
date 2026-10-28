/* Datos de ejemplo por rubro. Las categorías y colores salen de
   src/lib/businessProfiles.ts del POS; los productos y tiendas son de muestra. */

export const RUBROS = {
  bodega: {
    label: 'Bodega / Minimarket', store: 'Bodega Don Lucho',
    cats: [['Abarrotes', '#F59E0B'], ['Bebidas', '#3B82F6'], ['Lácteos', '#93C5FD'], ['Limpieza', '#6366F1'], ['Golosinas', '#F97316']],
    items: [
      { n: 'Gaseosa 500 ml', p: 3.5, c: 1, st: 48, u: 'und' },
      { n: 'Arroz extra 1 kg', p: 4.8, c: 0, st: 36, u: 'kg' },
      { n: 'Leche evaporada 400 g', p: 4.2, c: 2, st: 60, u: 'und' },
      { n: 'Aceite vegetal 1 L', p: 10.9, c: 0, st: 14, u: 'und' },
      { n: 'Azúcar rubia', p: 4.0, c: 0, st: 22.5, u: 'kg' },
      { n: 'Detergente 520 g', p: 6.5, c: 3, st: 18, u: 'und' },
      { n: 'Agua sin gas 625 ml', p: 1.8, c: 1, st: 72, u: 'und' },
      { n: 'Galletas soda x6', p: 2.6, c: 4, st: 5, u: 'pqt' },
    ],
    cart: [[0, 2], [1, 1], [2, 3]],
  },
  ferreteria: {
    label: 'Ferretería', store: 'Ferretería El Perno',
    cats: [['Herramientas', '#F59E0B'], ['Electricidad', '#3B82F6'], ['Plomería', '#0EA5E9'], ['Pinturas', '#A855F7'], ['Tornillería', '#6B7280']],
    items: [
      { n: 'Cable THW 14 AWG', p: 1.8, c: 1, st: 340, u: 'm' },
      { n: 'Martillo uña 16 oz', p: 28, c: 0, st: 9, u: 'und' },
      { n: 'Tubo PVC 1/2"', p: 6.5, c: 2, st: 40, u: 'und' },
      { n: 'Pintura látex galón', p: 45, c: 3, st: 12, u: 'gal' },
      { n: 'Clavos 2"', p: 7.5, c: 4, st: 18.4, u: 'kg' },
      { n: 'Foco LED 9 W', p: 6.9, c: 1, st: 64, u: 'und' },
      { n: 'Cinta aislante', p: 3.5, c: 1, st: 4, u: 'und' },
      { n: 'Tornillo autorrosc. x100', p: 9.0, c: 4, st: 25, u: 'caja' },
    ],
    cart: [[0, 12], [4, 0.5], [5, 2]],
  },
  botica: {
    label: 'Botica / Farmacia', store: 'Botica Santa Rosa',
    cats: [['Analgésicos', '#EF4444'], ['Antigripales', '#3B82F6'], ['Vitaminas', '#10B981'], ['Genéricos', '#6366F1'], ['Cuidado personal', '#EC4899']],
    items: [
      { n: 'Paracetamol 500 mg', p: 0.5, c: 0, st: 300, u: 'tab', lot: 'Vence 03/2027' },
      { n: 'Ibuprofeno 400 mg', p: 0.8, c: 0, st: 180, u: 'tab', lot: 'Vence 11/2026' },
      { n: 'Antigripal x blíster', p: 4.5, c: 1, st: 24, u: 'blíster' },
      { n: 'Vitamina C 1 g', p: 12.9, c: 2, st: 15, u: 'tubo' },
      { n: 'Amoxicilina 500 mg', p: 0.9, c: 3, st: 6, u: 'cáp', lot: 'Vence 12/2026' },
      { n: 'Alcohol 70° 250 ml', p: 5.5, c: 4, st: 30, u: 'und' },
      { n: 'Suero oral 500 ml', p: 6.0, c: 3, st: 20, u: 'und' },
      { n: 'Mascarilla KN95', p: 1.5, c: 4, st: 90, u: 'und' },
    ],
    cart: [[0, 10], [2, 1], [3, 1]],
  },
  polleria: {
    label: 'Pollería / Restaurante', store: 'Pollería La Brasa',
    cats: [['Pollos', '#EF4444'], ['Combos', '#F59E0B'], ['Bebidas', '#3B82F6'], ['Extras', '#10B981']],
    items: [
      { n: '1/4 pollo + papas', p: 18.9, c: 0, st: null, u: 'plato' },
      { n: '1/2 pollo + papas', p: 34.9, c: 0, st: null, u: 'plato' },
      { n: 'Pollo entero', p: 62.9, c: 0, st: null, u: 'plato' },
      { n: 'Combo familiar', p: 79.9, c: 1, st: null, u: 'combo' },
      { n: 'Chicha morada jarra', p: 12, c: 2, st: null, u: 'jarra' },
      { n: 'Gaseosa 1.5 L', p: 9, c: 2, st: 24, u: 'und' },
      { n: 'Ensalada fresca', p: 5, c: 3, st: null, u: 'porción' },
      { n: 'Porción de papas', p: 8, c: 3, st: null, u: 'porción' },
    ],
    cart: [[1, 1], [4, 1], [6, 2]],
  },
  lavanderia: {
    label: 'Lavandería', store: 'Lavandería Espuma',
    cats: [['Por kilo', '#0EA5E9'], ['Por prenda', '#A855F7'], ['Al seco', '#F59E0B']],
    items: [
      { n: 'Lavado y secado', p: 6, c: 0, st: null, u: 'kg' },
      { n: 'Edredón 2 plazas', p: 25, c: 1, st: null, u: 'und' },
      { n: 'Camisa planchada', p: 5, c: 1, st: null, u: 'und' },
      { n: 'Terno completo', p: 22, c: 2, st: null, u: 'und' },
      { n: 'Casaca de cuero', p: 45, c: 2, st: null, u: 'und' },
      { n: 'Cortina por paño', p: 15, c: 1, st: null, u: 'paño' },
      { n: 'Zapatillas', p: 18, c: 1, st: null, u: 'par' },
      { n: 'Lavado express', p: 9, c: 0, st: null, u: 'kg' },
    ],
    cart: [[0, 4.5], [2, 3]],
  },
  taller: {
    label: 'Taller / Servicio técnico', store: 'TecniFix',
    cats: [['Mano de obra', '#6366F1'], ['Repuestos', '#F59E0B'], ['Diagnóstico', '#10B981']],
    items: [
      { n: 'Diagnóstico', p: 20, c: 2, st: null, u: 'serv' },
      { n: 'Cambio de pantalla', p: 80, c: 0, st: null, u: 'serv' },
      { n: 'Pantalla A12', p: 145, c: 1, st: 3, u: 'und' },
      { n: 'Batería 5000 mAh', p: 65, c: 1, st: 7, u: 'und' },
      { n: 'Mantenimiento laptop', p: 60, c: 0, st: null, u: 'serv' },
      { n: 'Pasta térmica', p: 15, c: 1, st: 12, u: 'und' },
      { n: 'Pin de carga', p: 35, c: 1, st: 9, u: 'und' },
      { n: 'Formateo + respaldo', p: 50, c: 0, st: null, u: 'serv' },
    ],
    cart: [[1, 1], [2, 1]],
  },
  hostal: {
    label: 'Hostal / Hotel', store: 'Hostal Los Andes',
    cats: [['Habitaciones', '#0EA5E9'], ['Consumos', '#F59E0B'], ['Servicios', '#10B981']],
    items: [
      { n: 'Simple x noche', p: 60, c: 0, st: 4, u: 'noche' },
      { n: 'Doble x noche', p: 90, c: 0, st: 3, u: 'noche' },
      { n: 'Matrimonial x noche', p: 100, c: 0, st: 2, u: 'noche' },
      { n: 'Desayuno americano', p: 12, c: 1, st: null, u: 'und' },
      { n: 'Late check-out', p: 20, c: 2, st: null, u: 'serv' },
      { n: 'Agua 625 ml', p: 2.5, c: 1, st: 40, u: 'und' },
      { n: 'Lavado de ropa', p: 15, c: 2, st: null, u: 'serv' },
      { n: 'Traslado aeropuerto', p: 40, c: 2, st: null, u: 'serv' },
    ],
    cart: [[2, 2], [3, 2]],
  },
  tech: {
    label: 'Accesorios / Tech', store: 'Click Store',
    cats: [['Cargadores', '#3B82F6'], ['Audio', '#A855F7'], ['Protección', '#10B981'], ['Cables', '#6B7280']],
    items: [
      { n: 'Cargador USB-C 25 W', p: 35, c: 0, st: 18, u: 'und' },
      { n: 'Audífonos bluetooth', p: 59, c: 1, st: 11, u: 'und' },
      { n: 'Mica de vidrio', p: 15, c: 2, st: 60, u: 'und' },
      { n: 'Case antigolpes', p: 20, c: 2, st: 34, u: 'und' },
      { n: 'Cable USB-C 1 m', p: 18, c: 3, st: 27, u: 'und' },
      { n: 'Power bank 10000', p: 79, c: 0, st: 6, u: 'und' },
      { n: 'Parlante portátil', p: 89, c: 1, st: 4, u: 'und' },
      { n: 'Soporte de auto', p: 25, c: 2, st: 15, u: 'und' },
    ],
    cart: [[0, 1], [2, 1], [3, 1]],
  },
};

/* Estado compartido entre el 3D y la página */
export const state = {
  rubro: 'bodega',
  screen: 'pos',
  cart: [],          // { i: índice de producto, q: cantidad }
  flash: -1,         // producto recién agregado (se resalta en pantalla)
  sales: 37,         // ventas del día en el ejemplo
  dayTotal: 1284.5,
  serial: 245,       // correlativo de la boleta B001
  lastSale: null,    // copia del carrito al cobrar, para el ticket
};

export const bus = new EventTarget();
export const emit = (type, detail) => bus.dispatchEvent(new CustomEvent(type, { detail }));

export const rubro = () => RUBROS[state.rubro];
export const money = v => 'S/ ' + v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const qty = q => (Number.isInteger(q) ? String(q) : q.toLocaleString('es-PE', { maximumFractionDigits: 3 }));

export function cartTotals(cart = state.cart){
  const items = rubro().items;
  const total = cart.reduce((s, l) => s + items[l.i].p * l.q, 0);
  const base = total / 1.18;   // precios con IGV incluido
  return { total, base, igv: total - base, units: cart.reduce((s, l) => s + l.q, 0) };
}

export function setRubro(key){
  if (!RUBROS[key] || state.rubro === key) return;
  state.rubro = key;
  state.cart = RUBROS[key].cart.map(([i, q]) => ({ i, q }));
  state.flash = -1;
  emit('change');
}

export function addItem(i){
  const it = rubro().items[i];
  const step = it.u === 'kg' || it.u === 'm' ? .5 : 1;
  const line = state.cart.find(l => l.i === i);
  if (line) line.q += step; else state.cart.push({ i, q: step });
  state.flash = i;
  emit('change');
}

export function checkout(){
  if (!state.cart.length) return false;
  const t = cartTotals();
  state.lastSale = { cart: state.cart.map(l => ({ ...l })), rubro: state.rubro, serial: state.serial, ...t };
  state.serial++; state.sales++; state.dayTotal += t.total;
  state.cart = []; state.flash = -1;
  emit('sale', state.lastSale);
  emit('change');
  return true;
}

state.cart = RUBROS.bodega.cart.map(([i, q]) => ({ i, q }));

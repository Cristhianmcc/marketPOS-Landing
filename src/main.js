/* Orden de arranque: scroll, escena 3D y controles de la página */
import { measure } from './stage.js';
import { bus, setRubro, cartTotals, money, qty, RUBROS } from './data.js';
import { api } from './scene.js';
import { setSound, soundOn } from './sound.js';

/* ── Datos de contacto: completar antes de publicar ──
   whatsapp: número con código de país, solo dígitos (ej. 51987654321) */
const CONTACT = { whatsapp:'51955195324', email:'' };

/* ── Scroll suave con Lenis (si carga) ── */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;
(async () => {
  if (!reduce){
    try {
      const { default: Lenis } = await import('lenis');
      lenis = new Lenis({ lerp:.1, wheelMultiplier:.9 });
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch (e){ console.warn('Lenis no cargó; uso el scroll nativo', e); }
  }
  measure();
  document.fonts?.ready.then(measure);
  new ResizeObserver(measure).observe(document.body);
})();

document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const id = a.getAttribute('href'); if (id.length < 2) return;
  const t = document.querySelector(id); if (!t) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(t, { duration:1.3, offset:id === '#inicio' ? 0 : -10 });
  else t.scrollIntoView({ behavior:reduce ? 'auto' : 'smooth' });
});

/* ── Carrito del hero ── */
const cartCount = document.getElementById('cartCount'), cartTotal = document.getElementById('cartTotal');
function syncCart(){
  const t = cartTotals();
  cartCount.textContent = qty(t.units);
  cartTotal.textContent = money(t.total);
}
bus.addEventListener('change', syncCart); syncCart();
document.getElementById('payBtn').addEventListener('click', () => api.print());
addEventListener('keydown', e => {
  if (e.key === 'F4' && !e.target.closest('input, textarea, select')){ e.preventDefault(); api.print(); }
});

/* ── Rubros ── */
const rubroBtns = [...document.querySelectorAll('[data-rubro]')];
rubroBtns.forEach(b => b.addEventListener('click', () => {
  setRubro(b.dataset.rubro);
  rubroBtns.forEach(o => o.setAttribute('aria-pressed', String(o === b)));
  const sel = document.getElementById('fType'); if (sel && RUBROS[b.dataset.rubro]) sel.value = b.dataset.rubro;
}));

/* ── Sonido ── */
const soundBtn = document.getElementById('soundBtn');
soundBtn.addEventListener('click', () => {
  setSound(!soundOn());
  soundBtn.setAttribute('aria-pressed', String(soundOn()));
});

/* ── Formulario: arma el mensaje y lo abre en WhatsApp ── */
const form = document.getElementById('contactForm');
const wa = document.getElementById('waLink'), copyBtn = document.getElementById('copyBtn');
const err = document.getElementById('formError'), alt = document.getElementById('contactAlt');
const nameIn = document.getElementById('fName');

function message(){
  const f = new FormData(form);
  const type = form.querySelector('#fType').selectedOptions[0].textContent;
  const lines = [
    `Hola, soy ${f.get('nombre').trim() || '(nombre)'} y quiero una demo de Monterrial POS.`,
    f.get('negocio').trim() && `Negocio: ${f.get('negocio').trim()}`,
    `Rubro: ${type}`,
    f.get('ciudad').trim() && `Ciudad: ${f.get('ciudad').trim()}`,
    f.get('mensaje').trim() && `Me interesa: ${f.get('mensaje').trim()}`,
  ];
  return lines.filter(Boolean).join('\n');
}
function sync(){
  const ok = !!CONTACT.whatsapp;
  wa.href = ok ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message())}` : '#';
  wa.setAttribute('aria-disabled', String(!ok));
}
form.addEventListener('input', () => { sync(); if (nameIn.value.trim()){ err.hidden = true; nameIn.removeAttribute('aria-invalid'); } });
form.addEventListener('submit', e => e.preventDefault());
wa.addEventListener('click', e => {
  if (!nameIn.value.trim()){ e.preventDefault(); err.hidden = false; nameIn.setAttribute('aria-invalid', 'true'); nameIn.focus(); }
});
copyBtn.addEventListener('click', async () => {
  const text = message();
  try { await navigator.clipboard.writeText(text); copyBtn.textContent = 'Mensaje copiado'; }
  catch { copyBtn.textContent = 'No se pudo copiar'; }
  setTimeout(() => { copyBtn.textContent = 'Copiar mensaje'; }, 2200);
});
if (CONTACT.whatsapp || CONTACT.email){
  const parts = [];
  if (CONTACT.whatsapp) parts.push(`WhatsApp <b>+${CONTACT.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, '$1 $2 $3 $4')}</b>`);
  if (CONTACT.email) parts.push(`correo <b>${CONTACT.email}</b>`);
  alt.innerHTML = 'También puedes escribirnos al ' + parts.join(' o al ') + '.';
} else alt.hidden = true;
sync();


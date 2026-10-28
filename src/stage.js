/* El escenario, como en Dulcident: cada sección con data-pose dice dónde va el
   equipo 3D (monitor, impresora, celular y productos). Mientras una sección llena
   la pantalla el equipo se queda quieto; entre dos secciones se mezcla según el scroll.
   x: posición horizontal (0 a 1) · dy: subir/bajar · s: escala · rx/ry: inclinación y giro
   focus: 1 centra la impresora en vez del monitor · ticket: cuánto papel sale (0 a 1)
   phone: aparece el celular · prod: productos flotando alrededor · pr: ticketera visible · mon: monitor visible */
export const POSES = {
  hero:    { x:.7,  dy:-.15, s:1.0,  rx:.05, ry:-.34, focus:0, ticket:.2, phone:0, prod:1, pr:1, mon:1 },
  rubros:  { x:.74, dy:.1,   s:.82,  rx:.03, ry:-.42, focus:0, ticket:.12, phone:0, prod:.35, pr:1, mon:1 },
  feat:    { x:.3,  dy:0,    s:1.02, rx:.04, ry:.3,   focus:0, ticket:.12, phone:0, prod:0, pr:0, mon:1 },
  sunat:   { x:.72, dy:-.35, s:1.5, rx:.1,  ry:.12,  focus:1, ticket:1,   phone:0, prod:0, pr:1, mon:0 },
  multi:   { x:.68, dy:-.1,  s:.82,  rx:.04, ry:-.18, focus:0, ticket:.15, phone:1, prod:0, pr:1, mon:1 },
  contact: { x:.24, dy:.1,   s:.62,  rx:.04, ry:.36,  focus:0, ticket:.2,  phone:0, prod:.5, pr:0, mon:1 },
  away:    { x:.5,  dy:8,    s:.7,   rx:0,   ry:0,    focus:0, ticket:.12, phone:0, prod:0, pr:1, mon:1 },
};
const KEYS = Object.keys(POSES.hero);

let marks = [];   // { start, end, p, el } en píxeles de documento

export function measure(){
  const vh = innerHeight;
  marks = [...document.querySelectorAll('[data-pose]')].map(el => {
    const r = el.getBoundingClientRect(), top = r.top + scrollY;
    return { start:top - vh * .15, end:Math.max(top, top + r.height - vh * .85), p:POSES[el.dataset.pose] || POSES.away, el };
  });
}
addEventListener('resize', measure);

const smooth = k => k * k * (3 - 2 * k);

/* Pose objetivo para el scroll actual; out.el es la sección dominante */
export function targetPose(out = {}){
  if (!marks.length) measure();
  const y = scrollY;
  let a = marks[0], b = marks[0], k = 0;
  for (let i = 0; i < marks.length; i++){
    const m = marks[i];
    if (y < m.start){
      if (i === 0){ a = b = m; break; }
      a = marks[i - 1]; b = m;
      k = smooth(Math.min(1, Math.max(0, (y - a.end) / Math.max(1, b.start - a.end))));
      break;
    }
    a = b = m; k = 0;
    if (y <= m.end) break;
  }
  for (const key of KEYS) out[key] = a.p[key] + (b.p[key] - a.p[key]) * k;
  out.el = k > .5 ? b.el : a.el;
  return out;
}

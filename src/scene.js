/* ════════════════════════════════════════════════════════════
   El mostrador 3D: monitor con el POS, ticketera, celular y productos.
   Todo se arma con primitivas de Three.js; las pantallas son canvas 2D.
   Toca un producto: vuela al lector, pita y entra al carrito del monitor.
   Toca "Cobrar" en el monitor: la ticketera imprime la boleta.
   ════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { targetPose } from './stage.js';
import { state, bus, addItem, checkout, rubro } from './data.js';
import { SW, SH, TW, TH, PW, PH, drawScreen, drawTicket, drawPhone, hits, loadShots } from './screens.js';
import { beep, printSound } from './sound.js';

const canvas = document.getElementById('scene');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow = matchMedia('(max-width: 860px)');

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' }); }
catch (e){ console.warn('Sin WebGL: la página sigue sin 3D', e); }

export const api = { ready:false, setScreen(){}, print(){} };
if (renderer) start(); else document.documentElement.classList.add('no3d');

function canvasTex(w, h){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return { c, g:c.getContext('2d'), t };
}

function labelTex(bg, fg, big, small, stripe){
  const { c, g, t } = canvasTex(512, 256);
  g.fillStyle = bg; g.fillRect(0, 0, 512, 256);
  if (stripe){ g.fillStyle = stripe; g.fillRect(0, 168, 512, 30); g.fillRect(0, 40, 512, 10); }
  g.fillStyle = fg; g.textAlign = 'center';
  g.font = '900 64px "Bricolage Grotesque", "Arial Black", sans-serif'; g.fillText(big, 256, 132);
  g.font = '700 30px Inter, Arial, sans-serif'; g.fillText(small, 256, 236);
  void c; return t;
}

function start(){
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .7;

  const camera = new THREE.PerspectiveCamera(30, 1, .1, 80);
  camera.position.set(0, .4, 12);
  camera.lookAt(0, 0, 0);

  /* ── Luces: mañana de tienda, clave cálida y contraluz verde de marca ── */
  const key = new THREE.DirectionalLight(0xfff6ea, 2.1); key.position.set(4, 7, 6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 10; key.shadow.bias = -.0005;
  Object.assign(key.shadow.camera, { left:-9, right:9, top:9, bottom:-9, near:1, far:30 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x2bee79, 1.1); rim.position.set(-5, 2, -4); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb5a8, .55));

  /* ── Materiales ── */
  const shell = new THREE.MeshStandardMaterial({ color:'#1b221e', roughness:.42, metalness:.35 });
  const shellBack = new THREE.MeshStandardMaterial({ color:'#28302b', roughness:.55, metalness:.25 });
  const plastic = new THREE.MeshStandardMaterial({ color:'#e8ece9', roughness:.38, metalness:0 });
  const metal = new THREE.MeshStandardMaterial({ color:'#d7dcd9', roughness:.25, metalness:1 });
  const dark = new THREE.MeshStandardMaterial({ color:'#121714', roughness:.6 });

  const rig = new THREE.Group(); scene.add(rig);
  const unit = new THREE.Group(); rig.add(unit);
  const FLOOR = -1.405;

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.ShadowMaterial({ opacity:.16 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR - .002; floor.receiveShadow = true; unit.add(floor);

  const cast = m => { m.castShadow = true; return m; };

  /* ── Monitor ── */
  const monitor = new THREE.Group(); monitor.position.set(0, .32, 0); unit.add(monitor);
  monitor.add(cast(new THREE.Mesh(new RoundedBoxGeometry(3.3, 2.12, .14, 4, .07), shell)));
  const backBump = cast(new THREE.Mesh(new RoundedBoxGeometry(2.1, 1.3, .2, 3, .08), shellBack)); backBump.position.z = -.13; monitor.add(backBump);
  const neck = cast(new THREE.Mesh(new RoundedBoxGeometry(.34, .9, .12, 2, .05), shellBack)); neck.position.set(0, -1.2, -.24); monitor.add(neck);
  const base = cast(new THREE.Mesh(new RoundedBoxGeometry(1.35, .07, .78, 2, .03), shellBack)); base.position.set(0, FLOOR - .32 + .035, -.12); monitor.add(base);
  const scr = canvasTex(SW, SH);
  const screenMat = new THREE.MeshBasicMaterial({ map:scr.t, toneMapped:false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.14, 1.9625), screenMat);
  screen.position.z = .0705; monitor.add(screen);
  const glare = new THREE.Mesh(new THREE.PlaneGeometry(3.14, 1.9625), new THREE.MeshPhysicalMaterial({ color:'#ffffff', transparent:true, opacity:.06, roughness:.05, clearcoat:1, depthWrite:false }));
  glare.position.z = .072; monitor.add(glare);

  /* ── Ticketera ── */
  const printer = new THREE.Group(); printer.position.set(2.2, FLOOR, .8); printer.rotation.y = -.25; unit.add(printer);
  const pBody = cast(new THREE.Mesh(new RoundedBoxGeometry(.95, .5, .95, 4, .09), plastic)); pBody.position.y = .25; printer.add(pBody);
  const lid = cast(new THREE.Mesh(new RoundedBoxGeometry(.9, .07, .58, 3, .03), shell)); lid.position.set(0, .5, -.16); printer.add(lid);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(.72, .02, .05), dark); slot.position.set(0, .505, .19); printer.add(slot);
  const led = new THREE.Mesh(new THREE.SphereGeometry(.028, 12, 8), new THREE.MeshBasicMaterial({ color:'#2bee79' })); led.position.set(.34, .32, .48); printer.add(led);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .03, 20), shell); btn.rotation.x = Math.PI / 2; btn.position.set(.22, .32, .48); printer.add(btn);

  // papel: cinta que sube de la ranura y se enrolla hacia atrás
  const tk = canvasTex(TW, TH);
  const PAPER_W = .62, FULL = PAPER_W * TH / TW, N = 90;
  const ribbonGeo = new THREE.BufferGeometry();
  const rPos = new Float32Array((N + 1) * 2 * 3), rUv = new Float32Array((N + 1) * 2 * 2), rIdx = [];
  for (let i = 0; i < N; i++){ const a = i * 2; rIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  ribbonGeo.setIndex(rIdx);
  ribbonGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
  ribbonGeo.setAttribute('uv', new THREE.BufferAttribute(rUv, 2));
  const paperMat = new THREE.MeshStandardMaterial({ map:tk.t, roughness:.85, side:THREE.DoubleSide });
  const ribbon = cast(new THREE.Mesh(ribbonGeo, paperMat)); ribbon.position.set(0, .505, .19); ribbon.frustumCulled = false; printer.add(ribbon);

  function shapeRibbon(geo, pos, uv, len, stiff){
    // tramo recto S, luego una curva de radio R que da la vuelta hacia atrás (ángulo A) y cae
    const S = .7 + stiff * 1.25, R = .3, A = Math.PI * .95;
    for (let i = 0; i <= N; i++){
      const d = len * i / N;
      let y, z;
      if (d <= S){ y = d; z = d * -.08; }
      else {
        const th = Math.min((d - S) / R, A), rest = Math.max(0, d - S - R * A);
        y = S + R * Math.sin(th) + rest * Math.cos(A);
        z = S * -.08 - R * (1 - Math.cos(th)) - rest * Math.sin(A);
      }
      const v = 1 - (len - d) / FULL;
      for (let s = 0; s < 2; s++){
        const k = (i * 2 + s);
        pos[k * 3] = (s ? .5 : -.5) * PAPER_W; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z;
        uv[k * 2] = s; uv[k * 2 + 1] = v;
      }
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.uv.needsUpdate = true;
    geo.computeVertexNormals(); geo.computeBoundingSphere();
  }

  /* ── Celular con el catálogo online ── */
  const phone = new THREE.Group(); phone.position.set(-2.3, FLOOR, .95); unit.add(phone);
  const phoneTilt = new THREE.Group(); phoneTilt.rotation.set(-.16, .32, 0); phone.add(phoneTilt);
  const pBodyM = cast(new THREE.Mesh(new RoundedBoxGeometry(.8, 1.64, .09, 4, .08), shell)); pBodyM.position.y = .84; phoneTilt.add(pBodyM);
  const ph = canvasTex(PW, PH);
  const pScreen = new THREE.Mesh(new THREE.PlaneGeometry(.72, .72 * PH / PW), new THREE.MeshBasicMaterial({ map:ph.t, toneMapped:false }));
  pScreen.position.set(0, .84, .047); phoneTilt.add(pScreen);
  const stand = cast(new THREE.Mesh(new RoundedBoxGeometry(.5, .08, .4, 2, .03), shellBack)); stand.position.set(0, .04, -.05); phone.add(stand);

  /* ── Productos que se pueden escanear ── */
  const prods = [];
  function product(mesh, home, item){
    mesh.traverse(o => { if (o.isMesh) o.castShadow = true; });
    mesh.position.copy(home);
    unit.add(mesh);
    prods.push({ mesh, home:home.clone(), item, ph:Math.random() * 6, spin:(Math.random() - .5) * .6, scan:-1, hover:0, pop:1 });
  }
  const capMat = metal;
  { // lata de gaseosa
    const g = new THREE.Group();
    const side = new THREE.MeshStandardMaterial({ map:labelTex('#d7263d', '#fff', 'GASEOSA', '500 ml', '#ffffff33'), roughness:.3, metalness:.5 });
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .58, 40, 1, true), side));
    const top = new THREE.Mesh(new THREE.CylinderGeometry(.17, .2, .04, 40), capMat); top.position.y = .31; g.add(top);
    const bot = top.clone(); bot.position.y = -.31; bot.rotation.x = Math.PI; g.add(bot);
    g.rotation.z = .25; product(g, new THREE.Vector3(.4, 1.95, .45), 0);
  }
  { // arroz
    const front = new THREE.MeshStandardMaterial({ map:labelTex('#fff4d6', '#0d1b13', 'ARROZ', 'extra · 1 kg', '#f59e0b'), roughness:.7 });
    const plain = new THREE.MeshStandardMaterial({ color:'#f5c76a', roughness:.7 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(.66, .48, .16), [plain, plain, plain, plain, front, front]);
    m.rotation.set(.1, .3, .2); product(m, new THREE.Vector3(-1.05, -1.1, 1.95), 1);
  }
  { // leche
    const g = new THREE.Group();
    const side = new THREE.MeshStandardMaterial({ map:labelTex('#1d4ed8', '#fff', 'LECHE', 'evaporada 400 g', '#93c5fd'), roughness:.35, metalness:.4 });
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .32, 40, 1, true), side));
    const top = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .03, 40), capMat); top.position.y = .17; g.add(top);
    const bot = top.clone(); bot.position.y = -.17; g.add(bot);
    g.rotation.x = .4; product(g, new THREE.Vector3(1.95, 1.55, .9), 2);
  }
  { // detergente
    const front = new THREE.MeshStandardMaterial({ map:labelTex('#6d28d9', '#fff', 'DETERGENTE', '520 g', '#c4b5fd'), roughness:.6 });
    const plain = new THREE.MeshStandardMaterial({ color:'#7c3aed', roughness:.6 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(.56, .44, .18), [plain, plain, plain, plain, front, front]);
    m.rotation.set(-.1, -.4, -.15); product(m, new THREE.Vector3(2.55, .6, .35), 5);
  }
  { // agua
    const g = new THREE.Group();
    const pts = [[0, -.4], [.16, -.4], [.17, -.36], [.17, .12], [.12, .26], [.06, .32], [.06, .42], [0, .42]].map(([x, y]) => new THREE.Vector2(x, y));
    g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 36), new THREE.MeshPhysicalMaterial({ color:'#d9f1ff', roughness:.05, transmission:.92, thickness:.35, ior:1.4, transparent:true })));
    const band = new THREE.Mesh(new THREE.CylinderGeometry(.174, .174, .2, 36, 1, true), new THREE.MeshStandardMaterial({ map:labelTex('#0ea5e9', '#fff', 'AGUA', 'sin gas · 625 ml'), roughness:.4 }));
    band.position.y = -.06; g.add(band);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .07, 20), new THREE.MeshStandardMaterial({ color:'#2563eb', roughness:.4 })); cap.position.y = .45; g.add(cap);
    g.rotation.z = -.3; product(g, new THREE.Vector3(-1.15, 1.85, 1.0), 6);
  }
  { // galletas
    const front = new THREE.MeshStandardMaterial({ map:labelTex('#f97316', '#fff', 'GALLETAS', 'soda · x6', '#fed7aa'), roughness:.55 });
    const plain = new THREE.MeshStandardMaterial({ color:'#fb923c', roughness:.55 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(.72, .22, .2), [plain, plain, plain, plain, front, front]);
    m.rotation.set(.2, -.2, .08); product(m, new THREE.Vector3(.6, -1.05, 2.1), 7);
  }

  // lector: línea láser donde se escanea
  const SCAN = new THREE.Vector3(1.35, -.5, 1.55);
  const laser = new THREE.Mesh(new THREE.PlaneGeometry(.9, .025), new THREE.MeshBasicMaterial({ color:'#ff2d3a', transparent:true, opacity:0, toneMapped:false, depthWrite:false }));
  laser.position.copy(SCAN).add(new THREE.Vector3(0, 0, .3)); unit.add(laser);

  /* ── Pantallas: dibujar cuando cambia algo ── */
  let screenKey = 'pos', screenFlash = 0;
  const paintScreen = () => { drawScreen(scr.g, screenKey); scr.t.needsUpdate = true; };
  const paintTicket = () => { drawTicket(tk.g); tk.t.needsUpdate = true; };
  const paintPhone = () => { drawPhone(ph.g); ph.t.needsUpdate = true; };
  const paintAll = () => { paintScreen(); paintTicket(); paintPhone(); };
  paintAll();
  document.fonts?.ready.then(paintAll);
  loadShots(k => { if (k === screenKey) paintScreen(); });
  let lastRubro = state.rubro;
  bus.addEventListener('change', () => {
    paintScreen();
    if (!printing) paintTicket();
    if (lastRubro !== state.rubro){ lastRubro = state.rubro; paintPhone(); screenFlash = 1; }
  });

  api.setScreen = k => { if (k === screenKey) return; screenKey = k; screenFlash = 1; paintScreen(); };

  /* ── Impresión al cobrar ── */
  let printing = 0, printT = 0;          // 1: imprimiendo · 2: listo para arrancar
  const torn = [];
  bus.addEventListener('sale', () => {
    paintTicket();
    printing = 1; printT = 0;
    printSound();
  });
  api.print = () => { if (!checkout()) beep(220, .12); };

  function tear(len){
    const geo = new THREE.BufferGeometry();
    const p = rPos.slice(), u = rUv.slice();
    geo.setIndex(rIdx); geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(u, 2));
    geo.computeVertexNormals();
    const tex = new THREE.CanvasTexture(tk.c); tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshStandardMaterial({ map:tex, roughness:.85, side:THREE.DoubleSide, transparent:true });
    const m = new THREE.Mesh(geo, mat); m.frustumCulled = false;
    m.position.copy(ribbon.position); printer.add(m);
    torn.push({ m, t:0, len });
  }

  /* ── Puntero: escanear productos y tocar el monitor ── */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let mx = 0, my = 0, hovered = null;
  const blocked = el => !!el?.closest?.('a, button, input, select, textarea, label, summary, .opaque, .panel, .try, .nav');
  function pick(e){
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const targets = prods.filter(p => p.mesh.visible && p.scan < 0).map(p => p.mesh);
    if (screenKey === 'pos') targets.push(screen);
    const hit = ray.intersectObjects(targets, true)[0];
    if (!hit) return null;
    if (hit.object === screen){
      const x = hit.uv.x * SW, y = (1 - hit.uv.y) * SH;
      const h = hits.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
      return h ? { screenHit:h } : null;
    }
    let o = hit.object; while (o.parent && o.parent !== unit) o = o.parent;
    return { prod:prods.find(p => p.mesh === o) };
  }
  addEventListener('pointermove', e => {
    mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5;
    if (e.pointerType !== 'mouse') return;
    const h = blocked(e.target) ? null : pick(e);
    hovered = h?.prod || null;
    document.body.classList.toggle('grab', !!h);
  }, { passive:true });
  addEventListener('pointerdown', e => {
    if (blocked(e.target)) return;
    const h = pick(e); if (!h) return;
    if (h.prod){ h.prod.scan = 0; return; }
    if (h.screenHit.kind === 'item'){ addItem(h.screenHit.i); beep(); }
    else if (h.screenHit.kind === 'pay') api.print();
  });

  /* ── Tamaño ── */
  let viewW = 1, viewH = 1;
  function resize(){
    const w = innerWidth, h = innerHeight;
    if (!w || !h) return;   // pestaña aún sin tamaño: se mide cuando lo tenga
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    viewH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    viewW = viewH * camera.aspect;
  }
  addEventListener('resize', resize); new ResizeObserver(resize).observe(canvas); resize();

  /* ── Bucle ── */
  const cur = { ...targetPose() }, tgt = {};
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  let ribbonLen = -1, ribbonStiff = -1;
  let first = true;   // el primer cuadro salta directo a la pose, sin viajar
  api.ready = true;

  renderer.setAnimationLoop(() => {
    if (!innerWidth || !innerHeight) return;
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    targetPose(tgt);
    // celular: el equipo arriba al centro, ocupando el ancho; el texto pasa por debajo
    if (narrow.matches){ tgt.x = .5; tgt.s *= Math.min(1, viewW / 5.4) * (1 - .22 * tgt.prod); tgt.dy = tgt.dy * .3 + viewH * .25; tgt.ry *= .5; }
    const k = reduce || first ? 1 : 1 - Math.exp(-dt * 4.2);
    first = false;
    for (const key in tgt) if (typeof tgt[key] === 'number') cur[key] += (tgt[key] - cur[key]) * k;
    const sc = tgt.el?.dataset.screen; if (sc) api.setScreen(sc);

    const s = cur.s * (narrow.matches ? 1 : Math.max(.55, Math.min(1, camera.aspect / 1.55)));
    rig.scale.setScalar(s);
    rig.position.set((cur.x - .5) * viewW, cur.dy + (reduce ? 0 : Math.sin(t * .8) * .04), 0);
    rig.rotation.set(cur.rx + (reduce ? 0 : my * .06), cur.ry + (reduce ? 0 : mx * .14), 0);
    // focus: llevar la impresora al centro del equipo
    tmp.copy(printer.position).setY(printer.position.y + 1.1).multiplyScalar(cur.focus);
    unit.position.set(-tmp.x, -tmp.y * .6, -tmp.z);

    // papel
    let len = cur.ticket * FULL;
    if (printing === 1){
      printT = Math.min(1, printT + dt / 2.6);
      len = Math.max(len, printT * FULL);
      if (printT >= 1){ printing = 2; printT = 0; }
    } else if (printing === 2){
      printT += dt;
      len = FULL;
      if (printT > 2.2){ tear(len); printing = 0; paintTicket(); ribbonLen = -1; }
    }
    if (Math.abs(len - ribbonLen) > .001 || Math.abs(cur.focus - ribbonStiff) > .002){
      ribbonLen = len; ribbonStiff = cur.focus;
      shapeRibbon(ribbonGeo, rPos, rUv, Math.max(.02, len), cur.focus);
    }
    for (let i = torn.length - 1; i >= 0; i--){
      const o = torn[i]; o.t += dt;
      o.m.position.y += dt * (1.2 + o.t * 2); o.m.position.z += dt * .8; o.m.rotation.x -= dt * .9; o.m.rotation.z += dt * .5;
      o.m.material.opacity = Math.max(0, 1 - o.t / 1.1);
      if (o.t > 1.1){ printer.remove(o.m); o.m.geometry.dispose(); o.m.material.map.dispose(); o.m.material.dispose(); torn.splice(i, 1); }
    }

    monitor.visible = cur.mon > .02;
    monitor.scale.setScalar(Math.max(.001, cur.mon));

    // ticketera: se hunde y desaparece donde estorba al texto
    const pr = cur.pr;
    printer.visible = pr > .02;
    printer.scale.setScalar(Math.max(.001, pr));

    // celular
    const pv = cur.phone;
    phone.visible = pv > .02;
    phone.scale.setScalar(Math.max(.001, pv));
    phone.position.y = FLOOR + (1 - pv) * -.6;

    // productos
    const pvis = cur.prod;
    for (const p of prods){
      const m = p.mesh;
      p.hover += ((hovered === p ? 1 : 0) - p.hover) * Math.min(1, dt * 10);
      if (p.scan >= 0){
        p.scan += dt;
        const a = Math.min(1, p.scan / .38);
        if (p.scan < .38) m.position.lerpVectors(p.home, SCAN, a * a * (3 - 2 * a));
        else if (p.scan < .62){
          m.position.copy(SCAN);
          laser.material.opacity = .9 * Math.sin((p.scan - .38) / .24 * Math.PI);
          if (!p.beeped){ p.beeped = true; beep(); addItem(p.item % rubro().items.length); }
        } else {
          p.pop = 0; m.position.copy(p.home); p.scan = -1; p.beeped = false; laser.material.opacity = 0;
        }
        m.rotation.y += dt * 6;
      } else {
        p.pop = Math.min(1, p.pop + dt * 2.2);
        const bob = reduce ? 0 : Math.sin(t * 1.1 + p.ph) * .07;
        m.position.set(p.home.x, p.home.y + bob, p.home.z);
        if (!reduce) m.rotation.y += dt * (p.spin + p.hover * 2.5);
      }
      const pop = p.pop < 1 ? 1 - Math.pow(1 - p.pop, 3) * Math.cos(p.pop * 9) : 1;
      const sv = pvis * pop * (1 + p.hover * .14);
      m.scale.setScalar(Math.max(.001, sv));
      m.visible = sv > .01;
    }

    // destello al cambiar de pantalla
    if (screenFlash > 0){ screenFlash = Math.max(0, screenFlash - dt * 3.2); screenMat.color.setScalar(1 - screenFlash * .55); }
    led.material.color.set(printing === 1 && Math.sin(t * 30) > 0 ? '#f59e0b' : '#2bee79');

    renderer.render(scene, camera);
  });
}

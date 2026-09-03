import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const stage = document.querySelector('.cube-area');
const rollButton = document.getElementById('rollBtn');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

if (!stage) {
  window.homeDice = { roll: () => delay(1700), ready: false };
} else {
  stage.classList.add('three-dice-stage');
  stage.innerHTML = `
    <div class="dice-stage-aura" aria-hidden="true"></div>
    <div class="dice-canvas-host" id="diceCanvasHost"></div>
    <div class="dice-fallback" id="diceFallback" hidden aria-hidden="true">🎲</div>
    <div class="dice-stage-floor" aria-hidden="true"></div>
  `;

  if (!document.getElementById('threeDiceStyles')) {
    const style = document.createElement('style');
    style.id = 'threeDiceStyles';
    style.textContent = `
      .three-dice-stage{
        position:relative!important;
        isolation:isolate;
        width:100%;
        min-height:278px!important;
        margin:4px 0 8px!important;
        overflow:hidden;
        border-radius:24px;
        perspective:none!important;
        background:
          radial-gradient(circle at 50% 34%,rgba(142,162,255,.16),transparent 32%),
          radial-gradient(circle at 50% 92%,rgba(112,225,200,.12),transparent 34%),
          linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.008));
        border:1px solid rgba(255,255,255,.055);
      }
      .three-dice-stage::before{
        content:"";
        position:absolute;
        inset:0;
        z-index:0;
        pointer-events:none;
        background:linear-gradient(180deg,rgba(255,255,255,.04),transparent 34%);
      }
      .dice-stage-aura{
        position:absolute;
        left:50%;
        top:50%;
        width:min(78vw,390px);
        aspect-ratio:1;
        transform:translate(-50%,-48%);
        border-radius:50%;
        z-index:0;
        pointer-events:none;
        background:radial-gradient(circle,rgba(124,151,255,.14),rgba(112,225,200,.045) 44%,transparent 68%);
        filter:blur(8px);
      }
      .dice-canvas-host{
        position:absolute;
        inset:0;
        z-index:2;
        width:100%;
        height:100%;
      }
      .dice-webgl-canvas{
        display:block;
        width:100%!important;
        height:100%!important;
        touch-action:manipulation;
      }
      .dice-stage-floor{
        position:absolute;
        z-index:1;
        left:22%;
        right:22%;
        bottom:12%;
        height:16%;
        border-radius:50%;
        pointer-events:none;
        background:radial-gradient(ellipse,rgba(0,0,0,.25),transparent 68%);
        filter:blur(12px);
        opacity:.7;
      }
      .dice-fallback{
        position:absolute;
        z-index:3;
        inset:0;
        display:grid;
        place-items:center;
        font-size:7rem;
        filter:drop-shadow(0 25px 22px rgba(0,0,0,.35));
      }
      .dice-fallback[hidden]{display:none!important}
      .dice-fallback.rolling{animation:premiumDiceFallback 1.45s cubic-bezier(.18,.8,.2,1)}
      @keyframes premiumDiceFallback{
        0%{transform:translateY(0) rotate(0) scale(1)}
        35%{transform:translateY(-46px) rotate(390deg) scale(1.08)}
        72%{transform:translateY(-12px) rotate(760deg) scale(.97)}
        88%{transform:translateY(3px) rotate(820deg) scale(1.04,.94)}
        100%{transform:none}
      }
      @media(max-width:450px){
        .three-dice-stage{min-height:250px!important;border-radius:19px}
      }
      @media(min-width:861px){
        .three-dice-stage{min-height:352px!important;margin:8px 0 12px!important;border-radius:28px}
      }
      @media(prefers-reduced-motion:reduce){
        .dice-fallback.rolling{animation-duration:.45s}
      }
    `;
    document.head.appendChild(style);
  }

  const host = document.getElementById('diceCanvasHost');
  const fallback = document.getElementById('diceFallback');

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    const CAMERA_HOME = new THREE.Vector3(4.8, 3.5, 7.1);
    camera.position.copy(CAMERA_HOME);
    camera.lookAt(0, 0.15, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'dice-webgl-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04).texture;
    scene.environment = environment;
    room.dispose();
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xc8d8ff, 0x121629, 1.45));

    const key = new THREE.DirectionalLight(0xffffff, 3.6);
    key.position.set(4.5, 7, 5.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 24;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.025;
    scene.add(key);

    const fill = new THREE.PointLight(0x70e1c8, 13, 10, 2);
    fill.position.set(-3.4, 1.8, 4.2);
    scene.add(fill);

    const rim = new THREE.PointLight(0x8ea2ff, 17, 10, 2);
    rim.position.set(3.5, 0.8, -4.2);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ color: 0x030712, opacity: 0.34 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.08;
    floor.receiveShadow = true;
    scene.add(floor);

    const glowTexture = (() => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(112,225,200,.28)');
      gradient.addColorStop(0.45, 'rgba(142,162,255,.13)');
      gradient.addColorStop(1, 'rgba(112,225,200,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    })();

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 5.6),
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.72
      })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -1.065;
    scene.add(glow);

    const presentation = new THREE.Group();
    const die = new THREE.Group();
    presentation.add(die);
    scene.add(presentation);

    const body = new THREE.Mesh(
      new RoundedBoxGeometry(2, 2, 2, 6, 0.22),
      new THREE.MeshPhysicalMaterial({
        color: 0x879bff,
        roughness: 0.2,
        metalness: 0.08,
        clearcoat: 0.92,
        clearcoatRoughness: 0.16,
        sheen: 0.2,
        sheenColor: new THREE.Color(0xaedfd7),
        envMapIntensity: 1.25
      })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    die.add(body);

    const pipMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x11172a,
      roughness: 0.28,
      metalness: 0.18,
      clearcoat: 0.55,
      clearcoatRoughness: 0.2,
      envMapIntensity: 0.85
    });
    const pipGeometry = new THREE.CylinderGeometry(0.115, 0.115, 0.045, 28);
    const yAxis = new THREE.Vector3(0, 1, 0);

    const pattern = {
      1: [[0, 0]],
      2: [[-0.38, 0.38], [0.38, -0.38]],
      3: [[-0.4, 0.4], [0, 0], [0.4, -0.4]],
      4: [[-0.38, 0.38], [0.38, 0.38], [-0.38, -0.38], [0.38, -0.38]],
      5: [[-0.4, 0.4], [0.4, 0.4], [0, 0], [-0.4, -0.4], [0.4, -0.4]],
      6: [[-0.38, 0.43], [-0.38, 0], [-0.38, -0.43], [0.38, 0.43], [0.38, 0], [0.38, -0.43]]
    };

    const faces = [
      { value: 1, normal: new THREE.Vector3(0, 1, 0), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, -1) },
      { value: 6, normal: new THREE.Vector3(0, -1, 0), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1) },
      { value: 2, normal: new THREE.Vector3(0, 0, 1), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 1, 0) },
      { value: 5, normal: new THREE.Vector3(0, 0, -1), u: new THREE.Vector3(-1, 0, 0), v: new THREE.Vector3(0, 1, 0) },
      { value: 3, normal: new THREE.Vector3(1, 0, 0), u: new THREE.Vector3(0, 0, -1), v: new THREE.Vector3(0, 1, 0) },
      { value: 4, normal: new THREE.Vector3(-1, 0, 0), u: new THREE.Vector3(0, 0, 1), v: new THREE.Vector3(0, 1, 0) }
    ];

    const faceNormalByValue = new Map();
    const faceDepth = 1.012;

    faces.forEach(face => {
      faceNormalByValue.set(face.value, face.normal.clone());
      pattern[face.value].forEach(([x, y]) => {
        const pip = new THREE.Mesh(pipGeometry, pipMaterial);
        pip.quaternion.setFromUnitVectors(yAxis, face.normal);
        pip.position.copy(face.normal).multiplyScalar(faceDepth);
        pip.position.addScaledVector(face.u, x);
        pip.position.addScaledVector(face.v, y);
        pip.castShadow = true;
        pip.receiveShadow = true;
        die.add(pip);
      });
    });

    const BASE_Y = 0.04;
    presentation.position.y = BASE_Y;
    die.rotation.set(-0.48, 0.62, 0.18);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rolling = false;
    let visible = true;

    const tempQuaternion = new THREE.Quaternion();
    const progressQuaternion = new THREE.Quaternion();
    const spinA = new THREE.Quaternion();
    const spinB = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);

    function targetQuaternionFor(value) {
      const localNormal = faceNormalByValue.get(value) || faceNormalByValue.get(1);
      const base = new THREE.Quaternion().setFromUnitVectors(localNormal, up);
      const yaw = new THREE.Quaternion().setFromAxisAngle(up, Math.floor(Math.random() * 4) * Math.PI / 2);
      return yaw.multiply(base);
    }

    const easeOutQuint = t => 1 - Math.pow(1 - t, 5);
    const clamp01 = t => Math.max(0, Math.min(1, t));

    function resize() {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 420 ? 32 : 29;
      camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
      }, { rootMargin: '120px' });
      observer.observe(host);
    }

    function renderFrame(time) {
      requestAnimationFrame(renderFrame);
      if (!visible || document.hidden) return;

      if (!rolling) {
        presentation.position.y = BASE_Y + Math.sin(time * 0.0017) * 0.035;
        presentation.rotation.y = Math.sin(time * 0.00105) * 0.035;
        presentation.rotation.x = Math.sin(time * 0.0013) * 0.012;
        glow.material.opacity = 0.66 + Math.sin(time * 0.0014) * 0.06;
      }

      renderer.render(scene, camera);
    }
    requestAnimationFrame(renderFrame);

    async function roll({ result } = {}) {
      if (rolling) return;
      rolling = true;
      const value = Number.isInteger(result) && result >= 1 && result <= 6
        ? result
        : 1 + Math.floor(Math.random() * 6);
      const duration = reducedMotion ? 460 : 1680;
      const startTime = performance.now();
      const startQuaternion = die.quaternion.clone();
      const targetQuaternion = targetQuaternionFor(value);
      const axisA = new THREE.Vector3(1, 0.55, 0.35).normalize();
      const axisB = new THREE.Vector3(-0.28, 0.72, 1).normalize();
      const turnsA = 4 + Math.floor(Math.random() * 2);
      const turnsB = 3 + Math.floor(Math.random() * 2);
      const launchX = (Math.random() - 0.5) * 0.28;
      const launchZ = (Math.random() - 0.5) * 0.14;

      presentation.rotation.set(0, 0, 0);
      if (navigator.vibrate && !reducedMotion) navigator.vibrate(8);

      await new Promise(resolve => {
        function animate(now) {
          const p = clamp01((now - startTime) / duration);
          const eased = easeOutQuint(p);

          progressQuaternion.slerpQuaternions(startQuaternion, targetQuaternion, eased);
          const remaining = Math.pow(1 - p, 1.12);
          spinA.setFromAxisAngle(axisA, Math.PI * 2 * turnsA * remaining);
          spinB.setFromAxisAngle(axisB, Math.PI * 2 * turnsB * remaining);
          tempQuaternion.copy(spinA).multiply(spinB).multiply(progressQuaternion);
          die.quaternion.copy(tempQuaternion);

          let height;
          if (p < 0.78) {
            const flight = p / 0.78;
            height = Math.sin(Math.PI * flight) * (reducedMotion ? 0.52 : 2.05);
          } else {
            const settle = (p - 0.78) / 0.22;
            height = Math.abs(Math.sin(settle * Math.PI * 2.15)) * 0.28 * (1 - settle);
          }

          presentation.position.set(
            Math.sin(Math.PI * p) * launchX,
            BASE_Y + height,
            Math.sin(Math.PI * p) * launchZ
          );

          const impact = Math.exp(-Math.pow((p - 0.79) / 0.037, 2));
          presentation.scale.set(1 + impact * 0.045, 1 - impact * 0.075, 1 + impact * 0.045);
          glow.material.opacity = 0.48 + (1 - Math.min(height / 2, 1)) * 0.25;

          const shake = reducedMotion ? 0 : impact * 0.025;
          camera.position.x = CAMERA_HOME.x + Math.sin(now * 0.09) * shake;
          camera.position.y = CAMERA_HOME.y + Math.cos(now * 0.075) * shake;
          camera.lookAt(0, 0.15, 0);

          if (p < 1) {
            requestAnimationFrame(animate);
          } else {
            die.quaternion.copy(targetQuaternion);
            presentation.position.set(0, BASE_Y, 0);
            presentation.scale.set(1, 1, 1);
            camera.position.copy(CAMERA_HOME);
            camera.lookAt(0, 0.15, 0);
            rolling = false;
            if (navigator.vibrate && !reducedMotion) navigator.vibrate(12);
            resolve(value);
          }
        }
        requestAnimationFrame(animate);
      });

      return value;
    }

    window.homeDice = { ready: true, roll };
    host.classList.add('is-ready');
    fallback.hidden = true;

    if (rollButton) {
      rollButton.addEventListener('click', () => {
        if (!rolling) roll();
      });
    }
  } catch (error) {
    console.warn('Three.js dice unavailable, using fallback:', error);
    host.classList.add('has-fallback');
    fallback.hidden = false;

    async function fallbackRoll() {
      fallback.classList.remove('rolling');
      void fallback.offsetWidth;
      fallback.classList.add('rolling');
      await delay(1450);
      fallback.classList.remove('rolling');
    }

    window.homeDice = { ready: false, roll: fallbackRoll };
    rollButton?.addEventListener('click', fallbackRoll);
  }
}

import * as THREE from "three";

function makeGradientTexture(stops, w = 8, h = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  stops.forEach(([offset, color]) => grad.addColorStop(offset, color));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSoftDotTexture(color = "255,255,255") {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${color},1)`);
  grad.addColorStop(0.5, `rgba(${color},0.55)`);
  grad.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function createStars(count, spread, size, opacity) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = spread * (0.5 + Math.random() * 0.5);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.6 + 1;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - spread * 0.2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size,
    transparent: true,
    opacity,
    sizeAttenuation: true,
    map: makeSoftDotTexture(),
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

function createMountains() {
  const shape = new THREE.Shape();
  shape.moveTo(-12, -3);
  const pts = [0.2, 1.1, 0.4, 2.2, 0.55, 1.4, 0.7, 2.6, 0.85, 1.6, 1.0, 1.0];
  shape.lineTo(-12, -0.6);
  for (let i = 0; i < pts.length; i += 2) {
    shape.lineTo(-12 + pts[i] * 24, -0.6 + pts[i + 1]);
  }
  shape.lineTo(12, -3);
  shape.lineTo(-12, -3);
  const geo = new THREE.ShapeGeometry(shape);
  const mat = new THREE.MeshBasicMaterial({ color: 0x140a24 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, -1.1, -4);
  return mesh;
}

function createCloud(scale, x, y, z) {
  const tex = makeSoftDotTexture("255,255,255");
  const group = new THREE.Group();
  const puffs = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < puffs; i++) {
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.9, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set((Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.3);
    const s = (0.7 + Math.random() * 0.6) * scale;
    sprite.scale.set(s * 1.6, s, 1);
    group.add(sprite);
  }
  group.position.set(x, y, z);
  group.userData.speed = 0.04 + Math.random() * 0.05;
  group.userData.baseX = x;
  return group;
}

export function createBackgroundManager(scene) {
  const extras = new THREE.Group();
  scene.add(extras);

  let currentColor = "#ffffff";
  let currentPreset = "plain";
  let skydome = null;
  const clouds = [];
  let stars = null;

  function clearExtras() {
    clouds.length = 0;
    stars = null;
    skydome = null;
    for (let i = extras.children.length - 1; i >= 0; i--) {
      const obj = extras.children[i];
      obj.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
      extras.remove(obj);
    }
  }

  function addSkydome(stops) {
    const tex = makeGradientTexture(stops);
    const geo = new THREE.SphereGeometry(40, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, depthWrite: false });
    skydome = new THREE.Mesh(geo, mat);
    extras.add(skydome);
  }

  function setColor(hex) {
    currentColor = hex;
    if (currentPreset === "plain") {
      scene.background = new THREE.Color(hex);
    }
  }

  function setPreset(name) {
    currentPreset = name;
    clearExtras();

    if (name === "plain") {
      scene.background = new THREE.Color(currentColor);
      return;
    }

    if (name === "space") {
      scene.background = new THREE.Color(0x03040c);
      stars = createStars(1600, 22, 0.09, 0.9);
      extras.add(stars);

      const planetGeo = new THREE.SphereGeometry(1.4, 24, 24);
      const planetMat = new THREE.MeshStandardMaterial({ color: 0x6a4fb8, roughness: 1, emissive: 0x1a1030 });
      const planet = new THREE.Mesh(planetGeo, planetMat);
      planet.position.set(5.5, 3.2, -10);
      extras.add(planet);

      const moonGeo = new THREE.SphereGeometry(0.5, 20, 20);
      const moonMat = new THREE.MeshStandardMaterial({ color: 0xdfe6f2, roughness: 0.9 });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      moon.position.set(-4.5, 2.4, -8);
      extras.add(moon);
      return;
    }

    if (name === "stars") {
      scene.background = new THREE.Color(0x0c0820);
      addSkydome([
        [0, "#0a0620"],
        [0.45, "#2a1a4f"],
        [0.75, "#7a4a7a"],
        [1, "#e8926a"],
      ]);
      stars = createStars(900, 20, 0.08, 0.85);
      extras.add(stars);

      const moonGeo = new THREE.SphereGeometry(0.6, 24, 24);
      const moonMat = new THREE.MeshBasicMaterial({ color: 0xfff6e0 });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      moon.position.set(3.2, 3.6, -9);
      extras.add(moon);

      extras.add(createMountains());
      return;
    }

    if (name === "glass") {
      scene.background = new THREE.Color(0xbfe3f7);
      addSkydome([
        [0, "#8fc7ef"],
        [0.55, "#cdeaf9"],
        [1, "#f3fbff"],
      ]);

      const cloudDefs = [
        [1.1, -3.5, 1.4, -5],
        [0.8, 3.2, 0.6, -6],
        [1.4, 0, 2.4, -8],
        [0.9, -2, -0.8, -4],
        [1.0, 2.6, -1.2, -6],
      ];
      cloudDefs.forEach(([s, x, y, z]) => {
        const cloud = createCloud(s, x, y, z);
        extras.add(cloud);
        clouds.push(cloud);
      });

      const glassGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.12, 48);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xeaf6ff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.05,
        metalness: 0,
        transmission: 0.9,
        thickness: 0.4,
        clearcoat: 1,
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.y = -1.55;
      extras.add(glass);
      return;
    }
  }

  function update(dt) {
    if (stars) stars.rotation.y += dt * 0.01;
    clouds.forEach((cloud) => {
      cloud.position.x += cloud.userData.speed * dt;
      if (cloud.position.x - cloud.userData.baseX > 6) {
        cloud.position.x = cloud.userData.baseX - 6;
      }
    });
  }

  setPreset("plain");

  return { setColor, setPreset, update, get preset() { return currentPreset; }, get color() { return currentColor; } };
}

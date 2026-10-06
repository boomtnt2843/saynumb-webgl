import * as THREE from "three";
import { createCharacter } from "./character.js";
import { createBackgroundManager } from "./background.js";

const canvas = document.getElementById("scene");
const hint = document.getElementById("hint");
const bubble = document.getElementById("bubble");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.05, 4.4);
camera.lookAt(0, -0.1, 0);

const ambient = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambient);
const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
keyLight.position.set(2.5, 3.5, 4);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xbdd9ff, 0.4);
fillLight.position.set(-3, 1, 2);
scene.add(fillLight);

const character = createCharacter();
character.group.position.set(0, -0.1, 0);
scene.add(character.group);

const bg = createBackgroundManager(scene);

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

// ---------- drag and drop ----------
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
const dragPlane = new THREE.Plane();
const planeHit = new THREE.Vector3();
const dragOffset = new THREE.Vector3();

let dragging = false;
let pointerDownPos = null;
let hintHidden = false;
let bounceTimer = 0;
let bouncing = false;

const BOUNDS = { x: 2.1, yMin: -1.9, yMax: 1.6 };

function setPointerNDC(e) {
  const rect = canvas.getBoundingClientRect();
  pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function hitCharacter() {
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObject(character.group, true);
  return hits.length > 0;
}

function planeFromCamera(point) {
  const normal = new THREE.Vector3();
  camera.getWorldDirection(normal);
  dragPlane.setFromNormalAndCoplanarPoint(normal, point);
}

canvas.addEventListener("pointerdown", (e) => {
  setPointerNDC(e);
  pointerDownPos = { x: e.clientX, y: e.clientY };
  if (hitCharacter()) {
    planeFromCamera(character.group.position);
    raycaster.ray.intersectPlane(dragPlane, planeHit);
    dragOffset.copy(character.group.position).sub(planeHit);
    dragging = true;
    canvas.classList.add("dragging");
    canvas.setPointerCapture(e.pointerId);
    character.squash(0.12);
    if (!hintHidden) {
      hint.classList.add("is-hidden");
      hintHidden = true;
    }
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  setPointerNDC(e);
  raycaster.setFromCamera(pointerNDC, camera);
  if (raycaster.ray.intersectPlane(dragPlane, planeHit)) {
    const target = planeHit.clone().add(dragOffset);
    target.x = THREE.MathUtils.clamp(target.x, -BOUNDS.x, BOUNDS.x);
    target.y = THREE.MathUtils.clamp(target.y, BOUNDS.yMin, BOUNDS.yMax);
    character.group.position.x = target.x;
    character.group.position.y = target.y;
  }
});

function endDrag(e) {
  if (!dragging) {
    pointerDownPos = null;
    return;
  }
  dragging = false;
  canvas.classList.remove("dragging");
  bouncing = true;
  bounceTimer = 0;

  if (pointerDownPos) {
    const dx = e.clientX - pointerDownPos.x;
    const dy = e.clientY - pointerDownPos.y;
    if (Math.sqrt(dx * dx + dy * dy) < 6) {
      sayHi();
    }
  }
  pointerDownPos = null;
}

canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

// ---------- speech bubble ----------
let bubbleVisible = false;
let bubbleTimeout = null;

function updateBubblePosition() {
  const headWorld = new THREE.Vector3();
  character.headGroup.getWorldPosition(headWorld);
  headWorld.y += 0.95;
  headWorld.project(camera);
  const rect = canvas.getBoundingClientRect();
  const x = (headWorld.x * 0.5 + 0.5) * rect.width;
  const y = (-headWorld.y * 0.5 + 0.5) * rect.height;
  bubble.style.transform = `translate(${x - 20}px, ${y}px)`;
}

function showBubble(text, duration) {
  bubble.textContent = text;
  bubble.classList.add("is-visible");
  bubbleVisible = true;
  clearTimeout(bubbleTimeout);
  bubbleTimeout = setTimeout(() => {
    bubble.classList.remove("is-visible");
    bubbleVisible = false;
  }, duration);
}

function sayHi() {
  character.wave();
  showBubble("Hi~ !", 1700);
}

// ---------- UI wiring ----------
document.getElementById("sayHiBtn").addEventListener("click", sayHi);

const emotionRow = document.getElementById("emotionRow");
emotionRow.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-emotion]");
  if (!btn) return;
  character.setEmotion(btn.dataset.emotion);
  [...emotionRow.children].forEach((c) => c.classList.toggle("is-active", c === btn));
});

const colorRow = document.getElementById("colorRow");
const presetRow = document.getElementById("presetRow");
const colorPicker = document.getElementById("colorPicker");

function activatePlain(hex) {
  bg.setPreset("plain");
  bg.setColor(hex);
  [...presetRow.children].forEach((c) => c.classList.toggle("is-active", c.dataset.preset === "plain"));
  [...colorRow.querySelectorAll(".swatch")].forEach((s) => s.classList.toggle("is-active", s.dataset.color === hex));
  colorPicker.value = hex;
}

colorRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".swatch");
  if (!btn) return;
  activatePlain(btn.dataset.color);
});

colorPicker.addEventListener("input", (e) => activatePlain(e.target.value));

presetRow.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-preset]");
  if (!btn) return;
  bg.setPreset(btn.dataset.preset);
  [...presetRow.children].forEach((c) => c.classList.toggle("is-active", c === btn));
  if (btn.dataset.preset !== "plain") {
    [...colorRow.querySelectorAll(".swatch")].forEach((s) => s.classList.remove("is-active"));
  } else {
    activatePlain(bg.color);
  }
});

document.querySelector('.swatch[data-color="#ffffff"]').classList.add("is-active");

const panelToggle = document.getElementById("panelToggle");
const panel = document.getElementById("panel");
panelToggle.addEventListener("click", () => panel.classList.toggle("is-open"));

// ---------- animation loop ----------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  character.update(dt);
  bg.update(dt);

  if (bouncing) {
    bounceTimer += dt;
    const t = Math.min(bounceTimer / 0.4, 1);
    const amount = (1 - t) * Math.sin(t * Math.PI * 3) * 0.08;
    character.squash(Math.max(amount, 0) * (1 - t));
    if (t >= 1) {
      bouncing = false;
      character.squash(0);
    }
  }

  if (bubbleVisible) updateBubblePosition();

  renderer.render(scene, camera);
}

animate();

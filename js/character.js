import * as THREE from "three";

const INK = "#320000";
const HEAD_COLOR = 0xdbfbfe;
const HEAD_SHADOW = 0xa5f4fe;
const NECK_COLOR = 0xdbfbfe;
const BODY_COLOR = 0x0067b6;
const BODY_SHADOW = 0x0224b6;
const HAIR_HEX = INK;

const FACE_SIZE = 512;

function drawRoundEye(ctx, cx, cy, r, pupilR, openness, lookX, lookY) {
  openness = THREE.MathUtils.clamp(openness, 0.02, 1);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, openness);

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = INK;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(lookX * r * 0.25, lookY * r * 0.25, pupilR, 0, Math.PI * 2);
  ctx.fillStyle = INK;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(lookX * r * 0.25 - pupilR * 0.35, lookY * r * 0.25 - pupilR * 0.35, pupilR * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fill();

  ctx.restore();
}

function drawClosedEye(ctx, cx, cy, r, curveUp) {
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.quadraticCurveTo(cx, cy + (curveUp ? -r * 0.9 : r * 0.9), cx + r, cy);
  ctx.lineWidth = 7;
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  ctx.stroke();
}

function drawHeart(ctx, cx, cy, s, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-14, -8, -26, 6, 0, 22);
  ctx.bezierCurveTo(26, 6, 14, -8, 0, 6);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawFace(ctx, emotion, blink) {
  const c = FACE_SIZE;
  ctx.clearRect(0, 0, c, c);

  const cx1 = c * 0.37, cx2 = c * 0.63, cy = c * 0.46;
  const eyeR = c * 0.095;
  const pupilR = c * 0.05;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // eyebrows
  ctx.strokeStyle = INK;
  ctx.lineWidth = 7;
  ctx.beginPath();
  if (emotion === "surprised") {
    ctx.moveTo(cx1 - eyeR * 1.1, cy - eyeR * 1.9);
    ctx.quadraticCurveTo(cx1, cy - eyeR * 2.6, cx1 + eyeR * 1.1, cy - eyeR * 1.9);
    ctx.moveTo(cx2 - eyeR * 1.1, cy - eyeR * 1.9);
    ctx.quadraticCurveTo(cx2, cy - eyeR * 2.6, cx2 + eyeR * 1.1, cy - eyeR * 1.9);
  } else if (emotion === "sad") {
    ctx.moveTo(cx1 - eyeR * 1.1, cy - eyeR * 1.3);
    ctx.quadraticCurveTo(cx1 + eyeR * 0.3, cy - eyeR * 1.9, cx1 + eyeR * 1.2, cy - eyeR * 1.2);
    ctx.moveTo(cx2 + eyeR * 1.1, cy - eyeR * 1.3);
    ctx.quadraticCurveTo(cx2 - eyeR * 0.3, cy - eyeR * 1.9, cx2 - eyeR * 1.2, cy - eyeR * 1.2);
  } else if (emotion === "wink") {
    ctx.moveTo(cx1 - eyeR * 1.1, cy - eyeR * 1.7);
    ctx.quadraticCurveTo(cx1, cy - eyeR * 2.3, cx1 + eyeR * 1.1, cy - eyeR * 1.7);
    ctx.moveTo(cx2 - eyeR * 1.2, cy - eyeR * 2.1);
    ctx.quadraticCurveTo(cx2, cy - eyeR * 2.5, cx2 + eyeR * 1.2, cy - eyeR * 2.0);
  } else {
    ctx.moveTo(cx1 - eyeR * 1.1, cy - eyeR * 1.7);
    ctx.quadraticCurveTo(cx1, cy - eyeR * 2.25, cx1 + eyeR * 1.1, cy - eyeR * 1.75);
    ctx.moveTo(cx2 - eyeR * 1.1, cy - eyeR * 1.75);
    ctx.quadraticCurveTo(cx2, cy - eyeR * 2.3, cx2 + eyeR * 1.1, cy - eyeR * 1.7);
  }
  ctx.stroke();

  // eyes
  const bothClosed = blink && emotion !== "wink";
  if (emotion === "love") {
    drawHeart(ctx, cx1, cy - eyeR * 0.1, eyeR / 16, "#e8537c");
    drawHeart(ctx, cx2, cy - eyeR * 0.1, eyeR / 16, "#e8537c");
  } else if (bothClosed) {
    drawClosedEye(ctx, cx1, cy, eyeR * 0.9, false);
    drawClosedEye(ctx, cx2, cy, eyeR * 0.9, false);
  } else if (emotion === "wink") {
    drawRoundEye(ctx, cx1, cy, eyeR, pupilR, 1, 0, 0);
    drawClosedEye(ctx, cx2, cy, eyeR * 0.9, true);
  } else if (emotion === "surprised") {
    drawRoundEye(ctx, cx1, cy, eyeR * 1.25, pupilR * 1.05, 1, 0, 0);
    drawRoundEye(ctx, cx2, cy, eyeR * 1.25, pupilR * 1.05, 1, 0, 0);
  } else if (emotion === "sad") {
    drawRoundEye(ctx, cx1, cy, eyeR, pupilR * 0.95, 0.8, 0, 0.3);
    drawRoundEye(ctx, cx2, cy, eyeR, pupilR * 0.95, 0.8, 0, 0.3);
  } else {
    drawRoundEye(ctx, cx1, cy, eyeR, pupilR, 1, 0, 0);
    drawRoundEye(ctx, cx2, cy, eyeR, pupilR, 1, 0, 0);
  }

  // under-eye marks (signature detail)
  ctx.strokeStyle = "rgba(90, 150, 170, 0.55)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx1 - eyeR * 0.6, cy + eyeR * 1.15);
  ctx.lineTo(cx1 + eyeR * 0.35, cy + eyeR * 1.15);
  ctx.moveTo(cx2 - eyeR * 0.35, cy + eyeR * 1.15);
  ctx.lineTo(cx2 + eyeR * 0.6, cy + eyeR * 1.15);
  ctx.stroke();

  // nose
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(c * 0.5 - 4, cy + eyeR * 1.4);
  ctx.quadraticCurveTo(c * 0.5 + 6, cy + eyeR * 1.75, c * 0.5, cy + eyeR * 1.95);
  ctx.stroke();

  // mouth
  const my = cy + eyeR * 3.1;
  ctx.beginPath();
  ctx.lineWidth = 7;
  if (emotion === "surprised") {
    ctx.ellipse(c * 0.5, my + 6, eyeR * 0.5, eyeR * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#7a3b2e";
    ctx.fill();
    ctx.stroke();
  } else if (emotion === "sad") {
    ctx.moveTo(c * 0.5 - eyeR * 1.1, my + eyeR * 0.5);
    ctx.quadraticCurveTo(c * 0.5, my - eyeR * 0.35, c * 0.5 + eyeR * 1.1, my + eyeR * 0.5);
    ctx.stroke();
  } else if (emotion === "love" || emotion === "wink") {
    ctx.moveTo(c * 0.5 - eyeR * 1.2, my - eyeR * 0.1);
    ctx.quadraticCurveTo(c * 0.5, my + eyeR * 1.0, c * 0.5 + eyeR * 1.2, my - eyeR * 0.1);
    ctx.stroke();
  } else {
    ctx.moveTo(c * 0.5 - eyeR * 1.0, my - eyeR * 0.05);
    ctx.quadraticCurveTo(c * 0.5, my + eyeR * 0.75, c * 0.5 + eyeR * 1.0, my - eyeR * 0.05);
    ctx.stroke();
  }

  // blush for love
  if (emotion === "love") {
    ctx.fillStyle = "rgba(232, 83, 124, 0.35)";
    ctx.beginPath();
    ctx.ellipse(cx1 - eyeR * 0.3, cy + eyeR * 1.9, eyeR * 0.55, eyeR * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx2 + eyeR * 0.3, cy + eyeR * 1.9, eyeR * 0.55, eyeR * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHairStrand(ctx, x0, y0, cx1, cy1, cx2, cy2, x1, y1, width, debugColor) {
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.strokeStyle = debugColor || HAIR_HEX;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x1, y1);
  ctx.stroke();
}

function buildHair(group, headRadius) {
  // Drawn as a flat ink-stroke sprite (like the reference sketch) rather than 3D
  // tubes: a billboard gives exact control over 3 clearly separated curved strands,
  // which a tube glued to the sphere's curvature kept compressing into one blob.
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.lineJoin = "round";

  // three curved strokes fanning from one tuft, each bowing a DIFFERENT direction
  // so they stay visually distinct instead of running parallel and merging
  drawHairStrand(ctx, 128, 294, 78, 266, 68, 220, 88, 184, 12); // left: bows further left
  drawHairStrand(ctx, 160, 296, 150, 230, 158, 160, 168, 104, 13); // middle: stays near-vertical
  drawHairStrand(ctx, 195, 294, 232, 244, 246, 180, 224, 120, 13); // right: bows further right

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  // Sized/positioned so the strand bases (near the canvas bottom) land at the hairline,
  // well above the eyebrows — the plane was previously oversized and dipped low enough
  // that the sphere's own forward bulge poked in front of it and hid the left strand.
  const worldSize = headRadius * 0.87;
  const geo = new THREE.PlaneGeometry(worldSize, worldSize);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(-headRadius * 0.02, headRadius * 1.24, headRadius * 0.42);
  mesh.renderOrder = 1;
  group.add(mesh);
}

export function createCharacter() {
  const root = new THREE.Group();
  const bob = new THREE.Group();
  root.add(bob);

  // --- body (bust, cropped at bottom like the reference art) ---
  // flat two-tone fill: a narrow indigo fold-shadow on the left, solid blue elsewhere,
  // plus a faint knit-fabric grain so it reads as cloth rather than flat plastic.
  // CylinderGeometry's u=0 seam sits at front-center (facing the camera), so the band
  // is drawn away from both texture edges (centered at u≈0.75, the character's left)
  // and the strip's own edges are left as plain base color so the seam stays invisible.
  const BODY_HEIGHT = 1.15;
  const bodyGeo = new THREE.CylinderGeometry(0.62, 0.78, BODY_HEIGHT, 48, 12, true);
  const bodyCanvas = document.createElement("canvas");
  bodyCanvas.width = 256;
  bodyCanvas.height = 256;
  const bctx = bodyCanvas.getContext("2d");
  const baseHex = "#" + BODY_COLOR.toString(16).padStart(6, "0");
  const shadowHex = "#" + BODY_SHADOW.toString(16).padStart(6, "0");
  bctx.fillStyle = baseHex;
  bctx.fillRect(0, 0, 256, 256);
  const bandCenter = 256 * 0.865;
  const bandHalf = 22;
  const grad = bctx.createLinearGradient(bandCenter - bandHalf, 0, bandCenter + bandHalf, 0);
  grad.addColorStop(0, baseHex);
  grad.addColorStop(0.3, shadowHex);
  grad.addColorStop(0.7, shadowHex);
  grad.addColorStop(1, baseHex);
  bctx.fillStyle = grad;
  bctx.fillRect(bandCenter - bandHalf, 0, bandHalf * 2, 256);
  // faint cloth grain (very low-frequency, very low-contrast so it reads as fabric
  // sheen rather than a printed pattern)
  bctx.globalAlpha = 0.035;
  for (let y = 0; y < 256; y += 32) {
    bctx.fillStyle = "#ffffff";
    bctx.fillRect(0, y, 256, 10);
  }
  bctx.globalAlpha = 1;
  const bodyTex = new THREE.CanvasTexture(bodyCanvas);
  bodyTex.anisotropy = 4;
  bodyTex.wrapS = THREE.RepeatWrapping;
  bodyTex.colorSpace = THREE.SRGBColorSpace;
  const bodyMat = new THREE.MeshBasicMaterial({ map: bodyTex, side: THREE.DoubleSide });

  // the cloth hangs from a pivot at the shoulder line so it can swing/sag like real
  // fabric (gravity + drag inertia) instead of moving as a rigid block with the body.
  const clothPivot = new THREE.Group();
  clothPivot.position.y = -0.95 + BODY_HEIGHT / 2;
  bob.add(clothPivot);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = -BODY_HEIGHT / 2;
  clothPivot.add(body);

  // --- neck ---
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.3, 0.3, 24),
    new THREE.MeshBasicMaterial({ color: NECK_COLOR })
  );
  neck.position.y = -0.32;
  bob.add(neck);

  // --- head ---
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.35;
  bob.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.72, 48, 48);
  const headMat = new THREE.MeshBasicMaterial({ color: HEAD_COLOR });
  const head = new THREE.Mesh(headGeo, headMat);
  headGroup.add(head);

  // flat shadow band on the character's left, matching the reference art's two-tone cel shading
  const shadeGeo = new THREE.SphereGeometry(0.724, 32, 32, 0, Math.PI * 0.34, 0, Math.PI);
  const shadeMat = new THREE.MeshBasicMaterial({ color: HEAD_SHADOW });
  const shade = new THREE.Mesh(shadeGeo, shadeMat);
  headGroup.add(shade);

  // face canvas patch (front cap of the head sphere)
  const faceCanvas = document.createElement("canvas");
  faceCanvas.width = FACE_SIZE;
  faceCanvas.height = FACE_SIZE;
  const fctx = faceCanvas.getContext("2d");
  drawFace(fctx, "happy", false);
  const faceTex = new THREE.CanvasTexture(faceCanvas);
  faceTex.colorSpace = THREE.SRGBColorSpace;

  const phiLength = Math.PI * 0.62;
  const thetaLength = Math.PI * 0.62;
  const facePatchGeo = new THREE.SphereGeometry(
    0.726, 48, 48,
    Math.PI / 2 - phiLength / 2, phiLength,
    Math.PI / 2 - thetaLength / 2, thetaLength
  );
  const faceMat = new THREE.MeshBasicMaterial({ map: faceTex, transparent: true });
  const facePatch = new THREE.Mesh(facePatchGeo, faceMat);
  headGroup.add(facePatch);

  buildHair(headGroup, 0.72);

  root.userData.parts = { body, neck, head, headGroup, bob, clothPivot };
  root.userData.faceCtx = fctx;
  root.userData.faceTex = faceTex;
  root.userData.emotion = "happy";
  root.userData.blinking = false;

  let blinkTimer = THREE.MathUtils.randFloat(2, 5);
  let waveTime = 0;
  let isWaving = false;
  let elapsed = 0;

  // --- cloth physics: a small pendulum spring driven by the character's own motion,
  // so the shirt swings/sags behind like real fabric under gravity + inertia ---
  let prevX = root.position.x;
  let prevY = root.position.y;
  let clothVelZ = 0, clothVelX = 0;
  const CLOTH_STIFFNESS = 55;
  const CLOTH_DAMPING = 9;
  const CLOTH_DRIVE = 2.2;
  const CLOTH_MAX = 0.5;

  function redraw() {
    drawFace(fctx, root.userData.emotion, root.userData.blinking);
    faceTex.needsUpdate = true;
  }

  function setEmotion(name) {
    root.userData.emotion = name;
    redraw();
  }

  function wave() {
    isWaving = true;
    waveTime = 0;
    const prev = root.userData.emotion;
    setEmotion("happy");
    setTimeout(() => {
      if (root.userData.emotion === "happy") setEmotion(prev === "happy" ? "happy" : prev);
    }, 1600);
  }

  function update(dt) {
    elapsed += dt;
    bob.position.y = Math.sin(elapsed * 1.6) * 0.045;
    headGroup.rotation.z = Math.sin(elapsed * 1.6) * 0.02;

    // cloth sway: estimate the character's own velocity and let the shirt lag behind
    // it (inertia) while gravity/spring pulls it back to hanging straight.
    if (dt > 1e-4) {
      const vx = (root.position.x - prevX) / dt;
      const vy = (root.position.y - prevY) / dt;
      prevX = root.position.x;
      prevY = root.position.y;

      clothVelZ += (-CLOTH_STIFFNESS * clothPivot.rotation.z - CLOTH_DAMPING * clothVelZ - CLOTH_DRIVE * vx) * dt;
      clothPivot.rotation.z = THREE.MathUtils.clamp(clothPivot.rotation.z + clothVelZ * dt, -CLOTH_MAX, CLOTH_MAX);

      clothVelX += (-CLOTH_STIFFNESS * clothPivot.rotation.x - CLOTH_DAMPING * clothVelX + CLOTH_DRIVE * 0.8 * vy) * dt;
      clothPivot.rotation.x = THREE.MathUtils.clamp(clothPivot.rotation.x + clothVelX * dt, -CLOTH_MAX, CLOTH_MAX);
    }
    // gentle idle breathing sway so the fabric never looks perfectly frozen
    clothPivot.rotation.z += Math.sin(elapsed * 1.1) * 0.0015;

    blinkTimer -= dt;
    if (blinkTimer <= 0 && !isWaving) {
      root.userData.blinking = true;
      redraw();
      setTimeout(() => {
        root.userData.blinking = false;
        redraw();
      }, 120);
      blinkTimer = THREE.MathUtils.randFloat(2.5, 6);
    }

    if (isWaving) {
      waveTime += dt;
      headGroup.rotation.z = Math.sin(waveTime * 10) * 0.08;
      bob.position.y += Math.abs(Math.sin(waveTime * 6)) * 0.03;
      bob.scale.setScalar(1 + Math.sin(waveTime * 12) * 0.015);
      if (waveTime > 1.4) {
        isWaving = false;
        bob.scale.setScalar(1);
      }
    }
  }

  function squash(amount) {
    bob.scale.set(1 + amount * 0.5, 1 - amount, 1 + amount * 0.5);
  }

  return { group: root, setEmotion, wave, update, squash, headGroup };
}

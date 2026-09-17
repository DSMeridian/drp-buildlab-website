/* ─────────────────────────────────────────────
   HERO — the lattice

   A volumetric wireframe that turns behind the home headline: 7x7x7 nodes on
   a cube grid, edges between neighbours, breathing on a sine and leaning
   toward the pointer. On the near-black hero it reads as structure being
   assembled, which is the one thing a studio called BuildLab should have
   moving on its front page.

   Written against raw WebGL rather than a library on purpose. three.js is
   ~160KB over a third-party origin on the page that owns the LCP, for a
   scene that is 343 points and 882 lines; this file is a few KB, ships from
   assets/ with everything else, and adds no origin to a site published in
   thirty-four markets.

   The geometry never leaves the GPU. The grid is uploaded once as lattice
   coordinates and the breathing is computed in the vertex shader from a
   clock uniform, so a frame costs two draw calls and four uniform writes --
   no per-frame buffer traffic, nothing for the garbage collector.

   It stops when it is not being looked at: off-screen (IntersectionObserver),
   on a hidden tab (visibilitychange), and it never starts under
   prefers-reduced-motion, where it draws one still frame instead. Without a
   WebGL context it draws nothing at all and the hero is exactly the hero it
   was before this file existed -- the canvas is decorative and carries no
   text, so there is nothing to fall back to.
───────────────────────────────────────────── */
(function () {
  'use strict';

  var canvas = document.getElementById('hero3d');
  if (!canvas) return;

  var gl = null;
  try {
    var opts = {
      alpha: true, antialias: true, depth: false, premultipliedAlpha: true,
      powerPreference: 'low-power'
    };
    gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
  } catch (e) { gl = null; }
  if (!gl) return;

  var still = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ── the lattice ───────────────────────────────────────────────────────
     N per side. 7 is the largest that still reads as a countable structure
     rather than a haze once the depth fade is on it; 9 looked like static. */
  var N = 7;
  var span = N - 1;

  var coords = [];                 // one xyz per node, in -1..1
  for (var z = 0; z < N; z++) {
    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        coords.push(x / span * 2 - 1, y / span * 2 - 1, z / span * 2 - 1);
      }
    }
  }

  function at(x, y, z) { return (z * N + y) * N + x; }

  /* Edges along the three axes only -- no diagonals. The cube stays legible
     because its lines agree with each other. */
  var edges = [];
  for (var ez = 0; ez < N; ez++) {
    for (var ey = 0; ey < N; ey++) {
      for (var ex = 0; ex < N; ex++) {
        if (ex + 1 < N) edges.push(at(ex, ey, ez), at(ex + 1, ey, ez));
        if (ey + 1 < N) edges.push(at(ex, ey, ez), at(ex, ey + 1, ez));
        if (ez + 1 < N) edges.push(at(ex, ey, ez), at(ex, ey, ez + 1));
      }
    }
  }

  /* ── shaders ───────────────────────────────────────────────────────────
     The displacement is three sines crossed against each other -- cheap,
     seamless, and with no visible repeat inside the time the three periods
     take to line up again. It runs identically for the lines and the points,
     so the nodes stay welded to the ends of their own edges. */
  var VERT = [
    'precision mediump float;',
    'attribute vec3 aPos;',
    'uniform mat4 uProj;',
    'uniform mat4 uView;',
    'uniform float uTime;',
    'uniform float uPoint;',
    'varying float vDepth;',
    'void main(){',
    '  vec3 p = aPos;',
    '  float w = 0.13;',
    '  p.x += w * sin(uTime * 0.70 + aPos.y * 2.3 + aPos.z * 1.7);',
    '  p.y += w * sin(uTime * 0.55 + aPos.z * 2.1 + aPos.x * 1.9);',
    '  p.z += w * sin(uTime * 0.62 + aPos.x * 2.5 + aPos.y * 1.5);',
    '  vec4 eye = uView * vec4(p, 1.0);',
    /* 0 at the front of the cube, 1 at the back. Everything that fades --
       colour, alpha, point size -- reads off this one value. */
    '  vDepth = clamp((-eye.z - 2.6) / 3.4, 0.0, 1.0);',
    '  gl_Position = uProj * eye;',
    '  gl_PointSize = uPoint * (1.6 - vDepth) * 2.0;',
    '}'
  ].join('\n');

  var FRAG = [
    'precision mediump float;',
    'uniform float uAlpha;',
    'uniform float uRound;',
    'varying float vDepth;',
    'void main(){',
    /* Round the nodes off; the lines pass uRound = 0 and keep every fragment. */
    '  if (uRound > 0.5) {',
    '    vec2 d = gl_PointCoord - vec2(0.5);',
    '    if (dot(d, d) > 0.25) discard;',
    '  }',
    /* Near nodes take the light blue the dark sections use for accents, far
       ones sink toward the deep blue of the aurora rather than to black, so
       the cube dissolves into the ground instead of sitting in a hole. */
    '  vec3 near = vec3(0.643, 0.792, 0.953);',
    '  vec3 far  = vec3(0.184, 0.365, 0.612);',
    '  vec3 col = mix(near, far, vDepth);',
    '  float a = uAlpha * (1.0 - vDepth * 0.78);',
    '  gl_FragColor = vec4(col * a, a);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

  var idxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(edges), gl.STATIC_DRAW);

  var uProj  = gl.getUniformLocation(prog, 'uProj');
  var uView  = gl.getUniformLocation(prog, 'uView');
  var uTime  = gl.getUniformLocation(prog, 'uTime');
  var uAlpha = gl.getUniformLocation(prog, 'uAlpha');
  var uRound = gl.getUniformLocation(prog, 'uRound');
  var uPoint = gl.getUniformLocation(prog, 'uPoint');

  /* Premultiplied source over transparent black: the crossings brighten
     where lines stack instead of punching a flat shape out of the aurora
     behind them. There is no depth buffer, and with 882 translucent lines
     that is the right answer rather than a shortcut -- sorting them would
     cost more than it buys, and the order-independent sum looks better. */
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  /* ── matrices ──────────────────────────────────────────────────────────
     Column-major, the order WebGL wants them, written out rather than pulled
     from a matrix library for the same reason as the rest of the file. */
  function perspective(out, fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    out[0]  = f / aspect; out[1]  = 0; out[2]  = 0;                   out[3]  = 0;
    out[4]  = 0;          out[5]  = f; out[6]  = 0;                   out[7]  = 0;
    out[8]  = 0;          out[9]  = 0; out[10] = (far + near) * nf;   out[11] = -1;
    out[12] = 0;          out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
  }

  /* translate(0,0,-dist) * rotateX(rx) * rotateY(ry), multiplied out. */
  function view(out, rx, ry, dist) {
    var cx = Math.cos(rx), sx = Math.sin(rx),
        cy = Math.cos(ry), sy = Math.sin(ry);
    out[0]  = cy; out[1]  = sx * sy;  out[2]  = -cx * sy; out[3]  = 0;
    out[4]  = 0;  out[5]  = cx;       out[6]  = sx;       out[7]  = 0;
    out[8]  = sy; out[9]  = -sx * cy; out[10] = cx * cy;  out[11] = 0;
    out[12] = 0;  out[13] = 0;        out[14] = -dist;    out[15] = 1;
  }

  var proj = new Float32Array(16);
  var mv   = new Float32Array(16);

  /* ── size ──────────────────────────────────────────────────────────────
     Capped at 2x: past that the extra pixels are invisible on a wireframe
     and the fill cost is not. */
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width  * dpr));
    var h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    perspective(proj, 0.95, w / h, 0.1, 100);
    gl.uniformMatrix4fv(uProj, false, proj);
    /* A narrow screen sees the cube smaller in CSS pixels, so the nodes come
       down with it or they read as a field of dots with no lines between. */
    gl.uniform1f(uPoint, (r.width < 700 ? 1.0 : 1.5) * dpr);
  }

  /* ── pointer lean ──────────────────────────────────────────────────────
     A shallow tilt toward the cursor, eased rather than tracked, so the cube
     answers the pointer without following it. Touch never sets it: there is
     no hover on a phone, and a tap should not swing the hero. */
  var tiltX = 0, tiltY = 0, aimX = 0, aimY = 0;

  /* ── the loop ──────────────────────────────────────────────────────────
     One rAF, started and stopped rather than left running behind a flag, so
     an off-screen hero costs nothing at all. */
  var spin = 0, last = 0, clock = 0, raf = 0, onScreen = true;

  function draw() {
    view(mv, -0.42 + tiltX, spin + tiltY, 4.3);
    gl.uniformMatrix4fv(uView, false, mv);
    gl.uniform1f(uTime, clock);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(uRound, 0.0);
    gl.uniform1f(uAlpha, 0.38);
    gl.drawElements(gl.LINES, edges.length, gl.UNSIGNED_SHORT, 0);

    gl.uniform1f(uRound, 1.0);
    gl.uniform1f(uAlpha, 0.85);
    gl.drawArrays(gl.POINTS, 0, coords.length / 3);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    clock += dt;
    spin  += dt * 0.16;              // a full turn every ~39 seconds
    tiltX += (aimX - tiltX) * 0.045;
    tiltY += (aimY - tiltY) * 0.045;
    draw();
  }

  function start() {
    if (raf || still || !onScreen || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  resize();

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); if (!raf) draw(); }, 120);
  }, { passive: true });

  if (still) {
    /* One frame, off the clock's zero and turned far enough that the cube is
       read as a solid rather than as a square seen face on. */
    clock = 2.4;
    spin = 0.6;
    draw();
    canvas.classList.add('on');
    return;
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    aimY = (e.clientX / window.innerWidth  - 0.5) * 0.55;
    aimX = (e.clientY / window.innerHeight - 0.5) * 0.35;
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start(); else stop();
    }, { threshold: 0 }).observe(canvas);
  }

  start();
  canvas.classList.add('on');
})();

/* ─────────────────────────────────────────────
   HERO — the globe

   A dark sphere turning behind the headline: a graticule of latitude rings
   and meridians picked out in blue, lit nodes scattered over it, orbital
   rings sweeping past, and the atmosphere catching the light along the limb.
   It replaces the wireframe cube, and it is drawn rather than photographed --
   a globe, not a map. There are no coastlines, so there is no country it
   flatters or leaves out, which matters on a site published in thirty-four
   markets.

   Still raw WebGL, and for the same reason as before: three.js is ~160KB from
   a third-party origin on the page that owns the LCP, and this is 1,200
   triangles and a few thousand line vertices. Everything is uploaded once at
   start-up; a frame is five draw calls and a handful of uniform writes.

   ── The one real piece of machinery: depth ──
   The cube could be drawn back-to-front and summed, because a wireframe box
   reads fine inside out. A globe does not -- without occlusion you see the
   graticule of the far hemisphere through the near one and it stops being a
   solid object. So the body is drawn first, opaque, into the depth buffer,
   and everything after it is depth-tested. That is what hides the back half
   of the grid and what makes the orbital rings pass behind the planet and
   come out the other side.

   It stops when it is not being looked at: off-screen (IntersectionObserver),
   on a hidden tab (visibilitychange), and it never starts under
   prefers-reduced-motion, where it draws one still frame instead. Without a
   WebGL context it draws nothing and the hero is exactly the hero it was --
   the canvas is decorative and carries no text, so there is nothing to fall
   back to.
───────────────────────────────────────────── */
(function () {
  'use strict';

  var canvas = document.getElementById('hero3d');
  if (!canvas) return;

  var gl = null;
  try {
    var opts = {
      alpha: true, antialias: true, depth: true, premultipliedAlpha: true,
      powerPreference: 'low-power'
    };
    gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
  } catch (e) { gl = null; }
  if (!gl) return;

  var still = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var PI = Math.PI, TAU = PI * 2;
  var DIST = 3.05;          // camera distance, in sphere radii

  /* A seeded generator, not Math.random. The node scatter and the ring
     inclinations are part of the composition: they want to be the same
     arrangement on every load, on every market, and in every screenshot
     somebody takes of this page. */
  var seed = 20260917;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  function onSphere(lat, lon, r) {
    var cl = Math.cos(lat);
    return [r * cl * Math.cos(lon), r * Math.sin(lat), r * cl * Math.sin(lon)];
  }

  /* ── The body ──────────────────────────────────────────────────────────
     A unit sphere, so position doubles as normal and the fragment shader
     needs no second attribute. */
  var SEG_LON = 48, SEG_LAT = 28;
  var bodyPos = [], bodyIdx = [];
  for (var iy = 0; iy <= SEG_LAT; iy++) {
    var lat = -PI / 2 + PI * iy / SEG_LAT;
    for (var ix = 0; ix <= SEG_LON; ix++) {
      var p = onSphere(lat, TAU * ix / SEG_LON, 1);
      bodyPos.push(p[0], p[1], p[2]);
    }
  }
  for (var ry = 0; ry < SEG_LAT; ry++) {
    for (var rx = 0; rx < SEG_LON; rx++) {
      var a = ry * (SEG_LON + 1) + rx, b = a + SEG_LON + 1;
      bodyIdx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }

  /* ── The graticule ─────────────────────────────────────────────────────
     Rings every 15 degrees of latitude and meridians every 15 of longitude,
     a hair above the surface so they are not in a depth fight with it.
     Drawn as separate segments rather than strips: one buffer, one draw. */
  var SKIN = 1.004;
  var gratPos = [], gratIdx = [];
  function pushLine(ax, ay, az, bx, by, bz) {
    var n = gratPos.length / 3;
    gratPos.push(ax, ay, az, bx, by, bz);
    gratIdx.push(n, n + 1);
  }
  for (var la = -75; la <= 75; la += 15) {
    var rad = la * PI / 180;
    for (var s = 0; s < 96; s++) {
      var p1 = onSphere(rad, TAU * s / 96, SKIN);
      var p2 = onSphere(rad, TAU * (s + 1) / 96, SKIN);
      pushLine(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
    }
  }
  for (var lo = 0; lo < 360; lo += 15) {
    var lrad = lo * PI / 180;
    for (var t = 0; t < 64; t++) {
      var q1 = onSphere(-PI / 2 + PI * t / 64, lrad, SKIN);
      var q2 = onSphere(-PI / 2 + PI * (t + 1) / 64, lrad, SKIN);
      pushLine(q1[0], q1[1], q1[2], q2[0], q2[1], q2[2]);
    }
  }

  /* ── The lit nodes ─────────────────────────────────────────────────────
     Scattered on the surface, biased away from the poles -- asin of a
     uniform gives an even scatter by area, which puts far too many of them
     on the ice caps for something meant to read as places people are. */
  var nodePos = [];
  for (var n = 0; n < 78; n++) {
    var nlat = (rnd() - 0.5) * 1.72;          // about -49..49 degrees
    var nlon = rnd() * TAU;
    var np = onSphere(nlat, nlon, SKIN + 0.004);
    nodePos.push(np[0], np[1], np[2]);
  }

  /* ── The orbital rings ─────────────────────────────────────────────────
     Circles larger than the planet, each tilted and spun into its own
     plane, so they cross the disc at different angles and pass behind it.
     Built at their final orientation once: they turn with the globe, and a
     ring that drifted independently would read as a bug rather than an
     orbit. */
  var ringPos = [], ringIdx = [];
  var RINGS = 6;
  for (var r0 = 0; r0 < RINGS; r0++) {
    var radius = 1.14 + rnd() * 0.30;
    var tilt = (rnd() - 0.5) * 1.9;       // inclination
    var spin = rnd() * TAU;               // longitude of the ascending node
    var ct = Math.cos(tilt), st = Math.sin(tilt);
    var cs = Math.cos(spin), ss = Math.sin(spin);
    var SEGS = 160, first = ringPos.length / 3;
    for (var k = 0; k < SEGS; k++) {
      var ang = TAU * k / SEGS;
      var x = radius * Math.cos(ang), z = radius * Math.sin(ang), y = 0;
      // rotate about X (tilt), then about Y (spin)
      var y1 = y * ct - z * st, z1 = y * st + z * ct;
      var x2 = x * cs + z1 * ss, z2 = -x * ss + z1 * cs;
      ringPos.push(x2, y1, z2);
      ringIdx.push(first + k, first + (k + 1) % SEGS);
    }
  }

  /* ── Shaders ───────────────────────────────────────────────────────────
     Two programs. The body needs a normal and a view vector for the limb;
     the lines and points need neither, and giving them a shared program
     would mean a fresnel term computed for several thousand vertices that
     never use it. */
  var BODY_VS = [
    'precision mediump float;',
    'attribute vec3 aPos;',
    'uniform mat4 uProj,uView;',
    'varying vec3 vN,vE;',
    'void main(){',
    '  vec4 eye = uView * vec4(aPos,1.0);',
    /* Position is the normal on a unit sphere, so the normal matrix is just
       the rotation part of the view. */
    '  vN = mat3(uView) * aPos;',
    '  vE = -eye.xyz;',
    '  gl_Position = uProj * eye;',
    '}'
  ].join('\n');

  var BODY_FS = [
    'precision mediump float;',
    'varying vec3 vN,vE;',
    'void main(){',
    '  vec3 n = normalize(vN), e = normalize(vE);',
    /* 0 facing the camera, 1 at the silhouette. The atmosphere is the same
       term raised twice: a wide, faint haze over the whole disc and a tight
       bright line on the limb itself. */
    '  float f = 1.0 - max(dot(n,e),0.0);',
    '  float haze = pow(f,2.0) * 0.30;',
    '  float limb = pow(f,7.0) * 2.60;',
    /* Not black: a planet the exact colour of the page behind it is a hole
       in the page, and the hero has an aurora drifting behind this. */
    '  vec3 deep = vec3(0.008,0.020,0.052);',
    '  vec3 lit  = vec3(0.200,0.520,0.920);',
    '  vec3 col = deep + lit * (haze + limb);',
    '  gl_FragColor = vec4(col,1.0);',
    '}'
  ].join('\n');

  var LINE_VS = [
    'precision mediump float;',
    'attribute vec3 aPos;',
    'uniform mat4 uProj,uView;',
    'uniform float uPoint,uDist;',
    'varying float vDepth;',
    'void main(){',
    '  vec4 eye = uView * vec4(aPos,1.0);',
    /* 0 at the nearest point of the scene, 1 at the far side of the rings. */
    '  vDepth = clamp((-eye.z - (uDist - 1.45)) / 2.9, 0.0, 1.0);',
    '  gl_Position = uProj * eye;',
    '  gl_PointSize = uPoint * (1.35 - vDepth * 0.55);',
    '}'
  ].join('\n');

  var LINE_FS = [
    'precision mediump float;',
    'uniform vec3 uNear,uFar;',
    'uniform float uAlpha,uRound;',
    'varying float vDepth;',
    'void main(){',
    '  if (uRound > 0.5) {',
    '    vec2 d = gl_PointCoord - vec2(0.5);',
    '    float r2 = dot(d,d);',
    '    if (r2 > 0.25) discard;',
    /* A soft edge rather than a hard disc: at these sizes an aliased circle
       reads as a square. */
    '    float soft = 1.0 - smoothstep(0.06, 0.25, r2);',
    '    vec3 c = mix(uNear,uFar,vDepth);',
    '    float a = uAlpha * soft * (1.0 - vDepth * 0.55);',
    '    gl_FragColor = vec4(c * a, a);',
    '    return;',
    '  }',
    '  vec3 col = mix(uNear,uFar,vDepth);',
    '  float a = uAlpha * (1.0 - vDepth * 0.72);',
    '  gl_FragColor = vec4(col * a, a);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }

  function program(vsSrc, fsSrc) {
    var vs = compile(gl.VERTEX_SHADER, vsSrc), fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }

  var bodyProg = program(BODY_VS, BODY_FS);
  var lineProg = program(LINE_VS, LINE_FS);
  if (!bodyProg || !lineProg) return;

  function buffer(target, data, Type) {
    var b = gl.createBuffer();
    gl.bindBuffer(target, b);
    gl.bufferData(target, new Type(data), gl.STATIC_DRAW);
    return b;
  }

  var AB = gl.ARRAY_BUFFER, EB = gl.ELEMENT_ARRAY_BUFFER;
  var bodyVB = buffer(AB, bodyPos, Float32Array);
  var bodyIB = buffer(EB, bodyIdx, Uint16Array);
  var gratVB = buffer(AB, gratPos, Float32Array);
  var gratIB = buffer(EB, gratIdx, Uint16Array);
  var ringVB = buffer(AB, ringPos, Float32Array);
  var ringIB = buffer(EB, ringIdx, Uint16Array);
  var nodeVB = buffer(AB, nodePos, Float32Array);

  var U = {
    body: {
      pos: gl.getAttribLocation(bodyProg, 'aPos'),
      proj: gl.getUniformLocation(bodyProg, 'uProj'),
      view: gl.getUniformLocation(bodyProg, 'uView'),
    },
    line: {
      pos: gl.getAttribLocation(lineProg, 'aPos'),
      proj: gl.getUniformLocation(lineProg, 'uProj'),
      view: gl.getUniformLocation(lineProg, 'uView'),
      point: gl.getUniformLocation(lineProg, 'uPoint'),
      dist: gl.getUniformLocation(lineProg, 'uDist'),
      near: gl.getUniformLocation(lineProg, 'uNear'),
      far: gl.getUniformLocation(lineProg, 'uFar'),
      alpha: gl.getUniformLocation(lineProg, 'uAlpha'),
      round: gl.getUniformLocation(lineProg, 'uRound'),
    }
  };

  /* Premultiplied source-over. The body is opaque and writes depth; the
     lines blend against it and do not, so the order among them never
     matters and nothing has to be sorted. */
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 0);

  /* ── Matrices ──────────────────────────────────────────────────────────
     Column-major, written out rather than pulled from a library for the
     same reason as the rest of the file. */
  function perspective(out, fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
    out[12] = 0; out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
  }

  /* translate(0,0,-dist) * rotateX(rx) * rotateY(ry), multiplied out. */
  function view(out, rx, ry, dist) {
    var cx = Math.cos(rx), sx = Math.sin(rx),
        cy = Math.cos(ry), sy = Math.sin(ry);
    out[0] = cy;  out[1] = sx * sy;  out[2] = -cx * sy; out[3] = 0;
    out[4] = 0;   out[5] = cx;       out[6] = sx;       out[7] = 0;
    out[8] = sy;  out[9] = -sx * cy; out[10] = cx * cy; out[11] = 0;
    out[12] = 0;  out[13] = 0;       out[14] = -dist;   out[15] = 1;
  }

  var proj = new Float32Array(16), mv = new Float32Array(16);
  var pointScale = 1;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width * dpr));
    var h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    perspective(proj, 0.86, w / h, 0.1, 100);
    pointScale = (r.width < 700 ? 1.5 : 2.3) * dpr;
  }

  /* A shallow lean toward the cursor, eased rather than tracked, so the
     globe answers the pointer without following it. Touch never sets it:
     there is no hover on a phone and a tap should not swing the hero. */
  var tiltX = 0, tiltY = 0, aimX = 0, aimY = 0;
  var spin = 0, last = 0, raf = 0, onScreen = true;

  function drawLines(buf, idx, count, mode, near, far, alpha, round) {
    gl.bindBuffer(AB, buf);
    gl.enableVertexAttribArray(U.line.pos);
    gl.vertexAttribPointer(U.line.pos, 3, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(U.line.near, near);
    gl.uniform3fv(U.line.far, far);
    gl.uniform1f(U.line.alpha, alpha);
    gl.uniform1f(U.line.round, round);
    if (idx) {
      gl.bindBuffer(EB, idx);
      gl.drawElements(mode, count, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(mode, 0, count);
    }
  }

  var NEAR_BLUE = [0.643, 0.792, 0.953];
  var FAR_BLUE  = [0.157, 0.337, 0.596];
  var RING_NEAR = [0.560, 0.760, 0.980];
  var RING_FAR  = [0.133, 0.290, 0.541];

  function draw() {
    view(mv, -0.34 + tiltX, spin + tiltY, DIST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 1. the body, opaque, into the depth buffer
    gl.useProgram(bodyProg);
    gl.uniformMatrix4fv(U.body.proj, false, proj);
    gl.uniformMatrix4fv(U.body.view, false, mv);
    gl.bindBuffer(AB, bodyVB);
    gl.enableVertexAttribArray(U.body.pos);
    gl.vertexAttribPointer(U.body.pos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(EB, bodyIB);
    gl.depthMask(true);
    gl.drawElements(gl.TRIANGLES, bodyIdx.length, gl.UNSIGNED_SHORT, 0);

    // 2. everything else, depth-tested against it but not writing depth
    gl.useProgram(lineProg);
    gl.uniformMatrix4fv(U.line.proj, false, proj);
    gl.uniformMatrix4fv(U.line.view, false, mv);
    gl.uniform1f(U.line.dist, DIST);
    gl.uniform1f(U.line.point, pointScale);
    gl.depthMask(false);

    drawLines(ringVB, ringIB, ringIdx.length, gl.LINES, RING_NEAR, RING_FAR, 0.34, 0);
    drawLines(gratVB, gratIB, gratIdx.length, gl.LINES, NEAR_BLUE, FAR_BLUE, 0.30, 0);
    drawLines(nodeVB, null, nodePos.length / 3, gl.POINTS, NEAR_BLUE, FAR_BLUE, 0.95, 1);

    gl.depthMask(true);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    spin += dt * 0.085;              // a full turn every ~74 seconds
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
    /* One frame, turned far enough that the graticule reads as a sphere
       rather than as a set of concentric circles. */
    spin = 0.9;
    draw();
    canvas.classList.add('on');
    return;
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    aimY = (e.clientX / window.innerWidth - 0.5) * 0.45;
    aimX = (e.clientY / window.innerHeight - 0.5) * 0.28;
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

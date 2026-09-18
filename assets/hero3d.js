/* ─────────────────────────────────────────────
   HERO — the globe

   A night Earth turning behind the headline: continents drawn as a field of
   lit points, coastlines picked out brighter, a lit atmosphere on the limb
   and thin arcs sweeping around it.

   The first version of this was a graticule — latitude rings and meridians
   over an empty sphere — and the client's word for it was "hollow", which
   was exactly right. A wireframe globe is a drawing of a globe's coordinate
   system; what reads as a planet is the land. So the land is here.

   ── Where the coastlines come from ──
   Natural Earth's 110m land polygons, rasterised offline into a 384x192
   one-bit equirectangular mask and embedded below as base64. Natural Earth
   is public domain -- "no permission needed", their terms are explicit about
   commercial use -- which is why it is this and not one of the prettier
   basemaps that are CC-BY-SA and would put an attribution requirement on a
   client's home page.

   It costs 12KB in the file and about 2KB on the wire, because a land mask
   is mostly long runs of ocean and gzips to nothing. That is cheaper than
   the smallest respectable JPEG of a globe, and it turns.

   ── Why still no library ──
   three.js is ~160KB from a third-party origin on the page that owns the
   LCP. This is a sphere, ten thousand points and a few hundred line
   segments: five draw calls, all of it uploaded once at start-up.

   ── The one real piece of machinery: depth ──
   Without occlusion you see the far side's lights through the near side and
   it stops being a solid object. The body is drawn opaque into the depth
   buffer first and everything after it is depth-tested, which is what hides
   the far hemisphere and lets the arcs pass behind the planet and come out
   the other side.

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
  var DIST = 3.05;

  /* Seeded, not Math.random: the scatter and the arcs are part of the
     composition and should be the same arrangement on every load, in every
     market, and in any screenshot somebody takes of this page. */
  var seed = 20260917;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  function onSphere(lat, lon, r) {
    var cl = Math.cos(lat);
    return [r * cl * Math.cos(lon), r * Math.sin(lat), r * cl * Math.sin(lon)];
  }

  /* ── The land mask ─────────────────────────────────────────────────────
     Natural Earth 110m land, 384x192, one bit per cell, row-major from
     180W/90N. Public domain. */
  var MW = 384, MH = 192;
  var LAND_B64 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//8AAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////8P7/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAc////n////////8AAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//n/4////////+AAAAAA/+AAAOAAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAAAAOAP9/wA////////8AAAAA/+AAAAAAAAAAAAD+wAAAAAAAAAAAAAAAAAAAAAAAAAwPnHv/4/////////4AAAAAfzgAAAAAAAAAAAAB8AAAAAAAAAAAAAAAAAAAAAAADwAAAgP/AP////////4AAAAAHgAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAPAMD5+L/AD////////wAAAAAAAAAAAAAAHgAAAAD//AAAAAAAAAAAAAAAAAAAAAAAf/gcn/8AAAH//////4AAAAAAAAAAAAAfgAAAB////gAAAP+AAAAAAAAAAAAAAAAABAAAA/4AAAB//////4AAAAAAAAAAAAA4AAAAP///8AAAAAAAAAAAAAAAAAAAAAA/wAw8+MbgAAA//////wAAAAAAAAAAAADgAAAP/////vA4AA4AAAAAAAAAAAAAAAD//tx+499wAAAf/////AAAAAAAAAAAAAOAAOAP///////+AB4AAAAAAAAAAAAAAAD9//wew//+AAAf/////AAAAAAAAAAAAAeAAef/////////EB/8AAAAAAAAB+AAAAAA//8B8///4AAP////7AAAAAAAAPwAAAHgB+f//////////////gAAAAAA///8AD4Af/+E8B2//AAP////8AAAAAAAH/4AAAAAA/f//////////////4APgAAH////////7+mLfx4P/AAB////wAAAAAAA///8AAAB8ff////////////////P/4AD////////8D+G/z4M/gAH///wAAAAAAAD////hg////P//////////////////+AB//////////////4A/8AH///AAAAAAAAH////xn///+f///////////////////+P/////////////8AB+fAH//4ADnwAAAAP///gP////////////////////////DwP/////////////7gf/kAD/+AAA/8AAAA/+H/gf////////////////////////AwAP////////////z4A/wAD/+AAA/gAAAB/8f/3////////////////////////8ADA////////////+DEAf4AB/8AAAAAAAAP/x///////////////////////////+AAD////////////4AQYDgAAf4AAAAAAAA//h/////////////////////////f/wAAH////////////wAAfwAAAPwAAAAAAAB//B///////////////////////+Of+AAAD//8/////////gAAf8AAABwAAAAAAAA//g///////////////////////8B/4AAAAf8wAf///////gAAf8MAAAAAAAAAAAA//wH/////////////////////54HAAAAAAC8AAH///////4AAf+eAAAAAAAAAAYA4/Af////////////////////gAAOAAAAAAA3AAAf//////4AAP//AAAAAAAAAA4AA/AP///////////////////+AAB/AAAAAADAAAAP///////wAP//AAAAAAAAAB8AGeB////////////////////4AAD/AAAAAAMAAAAH///////8AP//gAAAAAAAAA8AG4B////////////////////wAAD+AAAAABAAAAAB////////w///8AAAAAAAAGeAGAH////////////////////gAAD8AAAAAAAAAAAI////////w///+AAAAAAAAPHAH//////////////////////7AAD4AAAAAAAAAAAI////////4////gAAAAAAAOfh////////////////////////4ADgAAAAAAAAAAAAf///////4////AAAAAAAAc/z////////////////////////4ABgAAAAAAAAAAAAP///////////5AAAAAAAAAPn////////////////////////IAAAAAAAAAAAAAAAf//////////gzAAAAAAAAAgf////////////////////////MAAAAAAAAAAAAAAAD//////////RD4AAAAAAAAD/////////////////////////cAAAAAAAAAAAAAAABf////////94H4AAAAAAAAf////////////////////////+QAAAAAAAAAAAAAAAB/////////74A8AAAAAAAAH////////////////////////8YAAAAAAAAAAAAAAAA///////////QAAAAAAAAAD/////7x/+H//////////////4YAAAAAAAAAAAAAAAA///////////gAAAAAAAAAB//v//xz/4P//////////////wQAAAAAAAAAAAAAAAA//////////MAAAAAAAAAAB//j//gh/w///////////////gYAAAAAAAAAAAAAAAA/////////4AAAAAAAAAAHD/xx//AA/4f//////////////AeAAAAAAAAAAAAAAAB/////////wAAAAAAAAAAP/4E4f/AAP4P/////////////wB4AAAAAAAAAAAAAAAA/////////4AAAAAAAAAAP/4EeH/BwP8D/////////////gBgAAAAAAAAAAAAAAAB/////////AAAAAAAAAAAH/gEHn2f//+D///////////7/ABgAAAAAAAAAAAAAAAA////////+AAAAAAAAAAAP/AEBHD///+H///////////z8ABgAAAAAAAAAAAAAAAA////////8AAAAAAAAAAAP/AEBDj///8H///////////AOABgAAAAAAAAAAAAAAAAf///////8AAAAAAAAAAAH+AAcBj///8H///////////AeADAAAAAAAAAAAAAAAAAP///////4AAAAAAAAAAAH8AGEBB////H///////////8HAHAAAAAAAAAAAAAAAAAP///////4AAAAAAAAAAAAg/+AAAAP//////////////4HAfAAAAAAAAAAAAAAAAAH///////4AAAAAAAAAAAB///AAEDP//////////////gHH/AAAAAAAAAAAAAAAAAB///////gAAAAAAAAAAAB//+AAAAP//////////////wAPwAAAAAAAAAAAAAAAAAAf//////AAAAAAAAAAAAH///AAAAP//////////////4A8AAAAAAAAAAAAAAAAAAAf/////8AAAAAAAAAAAAP///8DgAf//////////////4AQAAAAAAAAAAAAAAAAAAAN/////4AAAAAAAAAAAAP///+H+Mf//////////////8AQAAAAAAAAAAAAAAAAAAAN/////4AAAAAAAAAAAAP////3/////////////////8AAAAAAAAAAAAAAAAAAAAAE///jgYAAAAAAAAAAAAf/////////4////////////8AAAAAAAAAAAAAAAAAAAAACf/+AAMAAAAAAAAAAAA//////////8////////////8AAAAAAAAAAAAAAAAAAAAADP/8AAMAAAAAAAAAAAD////////P/8P///////////4AAAAAAAAAAAAAAAAAAAAABn/8AAOgAAAAAAAAAAH////////P/+Gf//////////wAAAAAAAAAAAAAAAAAAAAAAn/8AAEAAAAAAAAAAAP////////n//hP//////////wAAAAAAAAAAAAAAAAAAAAAAx/8AAAgAAAAAAAAAAP////////j//jAB/////////kAAAAAAAAAAAAAAAAAAAAAAI/8AAAAAAAAAAAAAAf////////x///gA////////+MAAAAAAAAAAAAAAAAAAAAAAAf8AA+AAAAAAAAAAAf////////x///4AP///////8IAAAAAAAAAAAAAAAAAAAAAAAf8ABjgAAAAAAAAAA/////////4///8AP///P///gAAAAAAAAAAAAAAAgAAAAAAAAP8A4A4AAAAAAAAAA/////////8///4AH//4P//kAAAAAAAAAAAAAAAAAAAAAAAAAf+B4AeAAAAAAAAAAf////////8f//wAA//wH/+EAAAAAAAAAAAAAAAAIAAAAAAAAP+B4AA+AAAAAAAAAf////////8P//gAA//gD/+MAAAAAAAAAAAAAAAAAAAAAAAAAD/vwAT2wAAAAAAAAf////////8P//AAA//AB/+AAEAAAAAAAAAAAAAAAAAAAAAAAA//wAAAAAAAAAAAAf////////+H/+AAA/8AB//AAOAAAAAAAAAAAAAAAAAAAAAAAAH/wAAAAAAAAAAAA//////////D/wAAA/4ABv/gAOAAAAAAAAAAAAAAAAAAAAAAAAAH/gAAAAAAAAAAA//////////D/gAAAfgAAP/wAMAAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAA//////////z+AAAAfgAAP/wAOAAAAAAAAAAAAAAAAAAAAAAAAAA/gAAAAAAAAAAA//////////7wAAAAPwAAH/4AHAAAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAA//////////9AAAAAPgAAG/4AEgAAAAAAAAAAAAAAAAAAAAAAAAADgAUAAAAAAAAAf/////////8AAAAAPgAAEPwAAQAAAAAAAAAAAAAAAAAAAAAAAAADgD+AAAAAAAAAP/////////+fAAAAHgAAEPgATQAAAAAAAAAAAAAAAAAAAAAAAAABwHv/AAAAAAAAH///////////AAAAHAAAEDAAhAAAAAAAAAAAAAAAAAAAAAAAAAAAbv//gAAAAAAAD///////////AAAADQAAGAABAYAAAAAAAAAAAAAAAAAAAAAAAAAAE///4AAAAAAAD//////////+AAAAAYAACAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAf//8AAAAAAAB//////////+AAAAAYAADAACA4AAAAAAAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAf/x///////8AAAAAAAABgADAwAAAAAAAAAAAAAAAAAAAAAAAAAAAf///8AAAAAAAP+A///////8AAAAAAAAxwAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///+AAAAAAAAAAH//////4AAAAAAAA5wAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf////AAAAAAAAAAD//////wAAAAAAAAMwAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////AAAAAAAAAAD//////gAAAAAAAAOYB/AAAAAAAAAAAAAAAAAAAAAAAAAAAAA/////gAAAAAAAAAD//////AAAAAAAAAHoP/ACAAAAAAAAAAAAAAAAAAAAAAAAAAB/////AAAAAAAAAAD/////8AAAAAAAAADwP/PiAAAAAAAAAAAAAAAAAAAAAAAAAAD/////wAAAAAAAAAD/////4AAAAAAAAABwP+CAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////AAAAAAAAAD/////4AAAAAAAAAB4H8eAOAAAAAAAAAAAAAAAAAAAAAAAAAD//////gAAAAAAAAD/////gAAAAAAAAAA8H8cACeAAAAAAAAAAAAAAAAAAAAAAAAD///////AAAAAAAAB/////gAAAAAAAAAAeBcWPnfwBgAAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAAA/////AAAAAAAAAAAeAIKAA/+AwAAAAAAAAAAAAAAAAAAAAAH///////8AAAAAAAAf////AAAAAAAAAAAGAAaAAP/BAAAAAAAAAAAAAAAAAAAAAAD///////+AAAAAAAAf///+AAAAAAAAAAABgAAABD/mEAAAAAAAAAAAAAAAAAAAAAB///////+AAAAAAAAP////AAAAAAAAAAAB/AAAAD/gBAAAAAAAAAAAAAAAAAAAAAB///////+AAAAAAAAP////AAAAAAAAAAAAH4AAAH8wAAAAAAAAAAAAAAAAAAAAAAA///////8AAAAAAAAP////AAAAAAAAAAAAABAcAA44AAAAAAAAAAAAAAAAAAAAAAA///////8AAAAAAAAP////gAAAAAAAAAAAAAYgAAAcAEAAAAAAAAAAAAAAAAAAAAAf//////4AAAAAAAAH////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//////wAAAAAAAAH////gAAAAAAAAAAAAAAAGAQAAAAAAAAAAAAAAAAAAAAAAAAP//////gAAAAAAAAP////gCAAAAAAAAAAAAAAfwYAAAAAAAAAAAAAAAAAAAAAAAAH//////gAAAAAAAAf////gDAAAAAAAAAAAAAAfgYAAAAAAAAAAAAAAAAAAAAAAAAH//////AAAAAAAAAf////gHAAAAAAAAAAAAAO/geAAAAAAAAAAAAAAAAAAAAAAAAD//////AAAAAAAAAf////gPAAAAAAAAAAAAAf/geAAAAAAAAAAAAAAAAAAAAAAAAA//////AAAAAAAAA/////B+AAAAAAAAAAAAA//4eAAAAABAAAAAAAAAAAAAAAAAAAP/////AAAAAAAAAf///+B+AAAAAAAAAAAAB//+/AAAAAGAAAAAAAAAAAAAAAAAAAH/////AAAAAAAAAf///4B+AAAAAAAAAAAAD////AAAAAAAAAAAAAAAAAAAAAAAAAH/////AAAAAAAAAP///wB8AAAAAAAAAAAAH////gAAAAAAAAAAAAAAAAAAAAAAAAH////+AAAAAAAAAP///gB8AAAAAAAAAAAAf////wAAQAAAAAAAAAAAAAAAAAAAAAH////8AAAAAAAAAP///gB8AAAAAAAAAAAD/////4AAIAAAAAAAAAAAAAAAAAAAAAH////8AAAAAAAAAH///wD4AAAAAAAAAAAP/////8AAEAAAAAAAAAAAAAAAAAAAAAH////4AAAAAAAAAH///wD4AAAAAAAAAAAf/////+AAAAAAAAAAAAAAAAAAAAAAAAH///+AAAAAAAAAAH///wB4AAAAAAAAAAAf/////+AAAAAAAAAAAAAAAAAAAAAAAAH///4AAAAAAAAAAD///ABwAAAAAAAAAAAf//////gAAAAAAAAAAAAAAAAAAAAAAAH///wAAAAAAAAAAD//+AAAAAAAAAAAAAAP//////gAAAAAAAAAAAAAAAAAAAAAAAP///wAAAAAAAAAAD//+AAAAAAAAAAAAAAf//////gAAAAAAAAAAAAAAAAAAAAAAAP///wAAAAAAAAAAB//+AAAAAAAAAAAAAAP//////wAAAAAAAAAAAAAAAAAAAAAAAP///wAAAAAAAAAAB//8AAAAAAAAAAAAAAP//////wAAAAAAAAAAAAAAAAAAAAAAAP///gAAAAAAAAAAA//4AAAAAAAAAAAAAAH//////wAAAAAAAAAAAAAAAAAAAAAAAP///AAAAAAAAAAAAf/4AAAAAAAAAAAAAAH//////gAAAAAAAAAAAAAAAAAAAAAAAP//+AAAAAAAAAAAAf/wAAAAAAAAAAAAAAH//////gAAAAAAAAAAAAAAAAAAAAAAAP//8AAAAAAAAAAAAf/gAAAAAAAAAAAAAAH/wB///gAAAAAAAAAAAAAAAAAAAAAAAP//8AAAAAAAAAAAAf+AAAAAAAAAAAAAAAH/AA///AAAAAAAAAAAAAAAAAAAAAAAAf//4AAAAAAAAAAAAOAAAAAAAAAAAAAAAAHwAAn/+AAAAAAAAAAAAAAAAAAAAAAAAf/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+AAABAAAAAAAAAAAAAAAAAAAA//+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/8AAABAAAAAAAAAAAAAAAAAAAA//+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/8AAAAwAAAAAAAAAAAAAAAAAAA//+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAcAAAAAAAAAAAAAAAAAAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAB/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAAQAAAAAAAAAAAAAAAAAAB/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAHAAAAAAAAAAAAAAAAAAAB/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAOAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAB/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+AYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAPgAAAAAAAcAwAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAB/wAAAAGAB//+H///+AAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAA////gAP///////////gAAAAAAAAAAAAAAAAAAAAAAAAB8AAAAAAAAAAAAAAAAAwP////wA/////////////8AAAAAAAAAAAAAAAAAAAAAAAd+AAAAAAAAAAAAAAwAP//////gf//////////////wAAAAAAAAAAAAAAAAAAAAAAe/AAAAAAAAAAAD///////////g////////////////8AAAAAAAAAAAAAAAAAAAAD+/gAAAAAAAA//////////////j/////////////////wAAAAAAAAAAAAAABwAAAAA/gAAAAAAAD////////////////////////////////wAAAAAAAAAAGcAAD///zx//gAAAAAAAf////////////////////////////////AAAAAAAAAD////AAf//////AAAAAAAAf///////////////////////////////4AAAAAAAA//////////////4AAAAAAAD////////////////////////////////gAAAAAAAA/////////////4AAAAAAAf/////////////////////////////////AAAAAAB8f////////////8AAAAAAAH//////////////////////////////////gAAAAAw//////////////gAAAAPAD///////////////////////////////////4AAAAAcB/////////////gAAAA/wD///////////////////////////////////AAAAAAAAB////////////8AE4H/gAB/////////////////////////////////4AAAAAAAGH/////////////4AAAAAH//////////////////////////////////4AAAAAAAB////////////////AB/////////////////////////////////////+AAAAAAAB////////////////9///////////////////////////////////////8AAAAAAAf////////////////////////////////////////////////////////gA//+AAAH/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////';

  var maskBytes;
  try {
    var bin = atob(LAND_B64);
    maskBytes = new Uint8Array(bin.length);
    for (var bi = 0; bi < bin.length; bi++) maskBytes[bi] = bin.charCodeAt(bi);
  } catch (e) { return; }

  function isLand(x, y) {
    if (y < 0 || y >= MH) return false;
    x = ((x % MW) + MW) % MW;               // longitude wraps
    var i = y * MW + x;
    return (maskBytes[i >> 3] & (128 >> (i & 7))) !== 0;
  }

  /* ── The lights ────────────────────────────────────────────────────────
     One candidate per land cell, thinned by cos(latitude).

     Equirectangular cells are all the same size in degrees and nothing like
     the same size on a sphere: without the thinning, Siberia and Antarctica
     come out as dense as the equator and the globe looks like it is wearing
     a hat. cos(lat) is the ratio of the cell's real area to an equatorial
     one, so using it as a keep-probability makes the scatter even.

     Coastal cells -- any of the four neighbours is ocean -- are kept
     regardless and set brighter. That is what draws the outline: it is the
     edges of the continents you read a globe by, not their middles. */
  var pos = [], bright = [];
  for (var my = 0; my < MH; my++) {
    var lat = (90 - (my + 0.5) * 180 / MH) * PI / 180;
    var keep = Math.cos(lat);
    for (var mx = 0; mx < MW; mx++) {
      if (!isLand(mx, my)) continue;
      var coast = !isLand(mx - 1, my) || !isLand(mx + 1, my) ||
                  !isLand(mx, my - 1) || !isLand(mx, my + 1);
      var r1 = rnd(), r2 = rnd(), r3 = rnd();
      if (coast) { if (r1 > 0.30 + keep * 0.70) continue; }
      else if (r1 > keep * 0.92) continue;
      /* Jittered inside the cell, or the grid it came from shows up as
         moire the moment the globe turns. */
      var jlat = (90 - (my + r2) * 180 / MH) * PI / 180;
      var jlon = (-180 + (mx + r3) * 360 / MW) * PI / 180;
      var p = onSphere(jlat, jlon, 1.006);
      pos.push(p[0], p[1], p[2]);
      /* A long tail rather than a flat value, so the field has texture and a
         scattering of points read as cities rather than as pixels. */
      bright.push(coast ? 0.85 + r1 * 0.55 : 0.30 + r1 * r1 * 0.75);
    }
  }
  var LIGHTS = pos.length / 3;

  /* ── The body ──────────────────────────────────────────────────────────
     A unit sphere, so position doubles as normal. */
  var SEG_LON = 64, SEG_LAT = 36;
  var bodyPos = [], bodyIdx = [];
  for (var iy = 0; iy <= SEG_LAT; iy++) {
    var blat = -PI / 2 + PI * iy / SEG_LAT;
    for (var ix = 0; ix <= SEG_LON; ix++) {
      var bp = onSphere(blat, TAU * ix / SEG_LON, 1);
      bodyPos.push(bp[0], bp[1], bp[2]);
    }
  }
  for (var ry = 0; ry < SEG_LAT; ry++) {
    for (var rx = 0; rx < SEG_LON; rx++) {
      var a = ry * (SEG_LON + 1) + rx, b = a + SEG_LON + 1;
      bodyIdx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }

  /* ── The arcs ──────────────────────────────────────────────────────────
     Great circles at a little above the surface, each tilted into its own
     plane. Close to the skin rather than in a wide orbit: in the reference
     they graze the planet and cross its face, which reads as routes over it
     rather than as rings around it. */
  var arcPos = [], arcIdx = [], hubPos = [];
  for (var k0 = 0; k0 < 7; k0++) {
    var radius = 1.015 + rnd() * 0.20;
    var tilt = (rnd() - 0.5) * 2.2;
    var spin = rnd() * TAU;
    var ct = Math.cos(tilt), st = Math.sin(tilt);
    var cs = Math.cos(spin), ss = Math.sin(spin);
    var SEGS = 220, first = arcPos.length / 3;
    for (var k = 0; k < SEGS; k++) {
      var ang = TAU * k / SEGS;
      var x = radius * Math.cos(ang), z = radius * Math.sin(ang);
      var y1 = -z * st, z1 = z * ct;
      var x2 = x * cs + z1 * ss, z2 = -x * ss + z1 * cs;
      arcPos.push(x2, y1, z2);
      arcIdx.push(first + k, first + (k + 1) % SEGS);
      /* Two lit waypoints per arc, the bright pinpricks the reference hangs
         on its lines. */
      if (k === 40 || k === 150) hubPos.push(x2, y1, z2);
    }
  }

  /* ── Shaders ───────────────────────────────────────────────────────────
     The light is fixed in view space, upper-left, and every pass reads the
     same direction, so the atmosphere, the land and the arcs agree about
     where the sun is. */
  var LIGHT = 'const vec3 L = normalize(vec3(-0.50,0.48,0.62));';

  var HALO_VS = [
    'precision mediump float;',
    'attribute vec3 aPos;',
    'uniform mat4 uProj,uView;uniform float uR;',
    'varying vec3 vN,vE;',
    'void main(){',
    '  vec4 eye = uView * vec4(aPos * uR,1.0);',
    '  vN = mat3(uView) * aPos;',
    '  vE = -eye.xyz;',
    '  gl_Position = uProj * eye;',
    '}'
  ].join('\n');

  /* The shell is larger than the planet and the planet is drawn over it, so
     the only part that survives is the ring outside the limb. Brightness has
     to fall off *outward* across that ring: the fresnel term runs 0.61 at the
     planet's edge to 1.0 at the shell's, so it is inverted and remapped onto
     that span rather than used directly. */
  var HALO_FS = [
    'precision mediump float;',
    'varying vec3 vN,vE;',
    LIGHT,
    'void main(){',
    '  vec3 n = normalize(vN), e = normalize(vE);',
    '  float f = 1.0 - max(dot(n,e),0.0);',
    '  float t = clamp((1.0 - f) / 0.35, 0.0, 1.0);',
    '  float glow = pow(t,3.1);',
    /* Lit from one side, so it is an atmosphere catching the sun rather than
       a sticker glowing evenly all the way round. */
    '  float lam = smoothstep(-0.55,0.85,dot(n,L));',
    '  float a = glow * (0.10 + lam * 0.92) * 0.95;',
    '  vec3 col = mix(vec3(0.07,0.26,0.70), vec3(0.42,0.76,1.0), lam);',
    '  gl_FragColor = vec4(col * a, a);',
    '}'
  ].join('\n');

  var BODY_VS = HALO_VS;

  var BODY_FS = [
    'precision mediump float;',
    'varying vec3 vN,vE;',
    LIGHT,
    'void main(){',
    '  vec3 n = normalize(vN), e = normalize(vE);',
    '  float f = 1.0 - max(dot(n,e),0.0);',
    '  float lam = smoothstep(-0.5,0.9,dot(n,L));',
    /* A tight line on the limb and a wide haze behind it, both only on the
       lit side. Opaque: this is what occludes the far hemisphere. */
    '  float limb = pow(f,9.0) * 2.2 * lam;',
    '  float haze = pow(f,3.2) * 0.13 * lam;',
    '  vec3 deep = vec3(0.004,0.011,0.030);',
    '  vec3 sky  = vec3(0.22,0.55,0.95);',
    '  gl_FragColor = vec4(deep + sky * (limb + haze), 1.0);',
    '}'
  ].join('\n');

  var LAND_VS = [
    'precision mediump float;',
    'attribute vec3 aPos;attribute float aB;',
    'uniform mat4 uProj,uView;uniform float uPoint;',
    'varying float vB;varying float vFace;',
    'void main(){',
    '  vec4 eye = uView * vec4(aPos,1.0);',
    '  vec3 n = normalize(mat3(uView) * aPos);',
    /* Dim toward the limb: at a grazing angle a light is seen through more
       of the atmosphere and across more of the pixel it lands in. */
    '  vFace = max(dot(n,normalize(-eye.xyz)),0.0);',
    '  vB = aB;',
    '  gl_Position = uProj * eye;',
    '  gl_PointSize = uPoint * (0.75 + aB * 0.55);',
    '}'
  ].join('\n');

  var LAND_FS = [
    'precision mediump float;',
    'varying float vB;varying float vFace;',
    'uniform float uAlpha;',
    'void main(){',
    '  vec2 d = gl_PointCoord - vec2(0.5);',
    '  float r2 = dot(d,d);',
    '  if (r2 > 0.25) discard;',
    '  float soft = 1.0 - smoothstep(0.02,0.25,r2);',
    '  float a = uAlpha * vB * soft * (0.30 + pow(vFace,0.65) * 0.85);',
    /* Warmer-white in the brightest lights, deep blue in the faintest, which
       is how a night side actually reads. */
    '  vec3 col = mix(vec3(0.24,0.50,0.88), vec3(0.80,0.92,1.0), clamp(vB-0.45,0.0,1.0));',
    '  gl_FragColor = vec4(col * a, a);',
    '}'
  ].join('\n');

  var ARC_VS = [
    'precision mediump float;',
    'attribute vec3 aPos;',
    'uniform mat4 uProj,uView;uniform float uPoint;',
    'varying float vFace;',
    'void main(){',
    '  vec4 eye = uView * vec4(aPos,1.0);',
    '  vFace = clamp((-eye.z - (3.05 - 1.35)) / 2.7, 0.0, 1.0);',
    '  gl_Position = uProj * eye;',
    '  gl_PointSize = uPoint;',
    '}'
  ].join('\n');

  var ARC_FS = [
    'precision mediump float;',
    'varying float vFace;',
    'uniform float uAlpha,uRound;uniform vec3 uCol;',
    'void main(){',
    '  float a = uAlpha * (1.0 - vFace * 0.75);',
    '  if (uRound > 0.5) {',
    '    vec2 d = gl_PointCoord - vec2(0.5);',
    '    float r2 = dot(d,d);',
    '    if (r2 > 0.25) discard;',
    '    a *= 1.0 - smoothstep(0.01,0.25,r2);',
    '  }',
    '  gl_FragColor = vec4(uCol * a, a);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  function program(v, f) {
    var vs = compile(gl.VERTEX_SHADER, v), fs = compile(gl.FRAGMENT_SHADER, f);
    if (!vs || !fs) return null;
    var p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }

  var haloProg = program(HALO_VS, HALO_FS);
  var bodyProg = program(BODY_VS, BODY_FS);
  var landProg = program(LAND_VS, LAND_FS);
  var arcProg  = program(ARC_VS, ARC_FS);
  if (!haloProg || !bodyProg || !landProg || !arcProg) return;

  var AB = gl.ARRAY_BUFFER, EB = gl.ELEMENT_ARRAY_BUFFER;
  function buffer(target, data, Type) {
    var b = gl.createBuffer();
    gl.bindBuffer(target, b);
    gl.bufferData(target, new Type(data), gl.STATIC_DRAW);
    return b;
  }
  var bodyVB = buffer(AB, bodyPos, Float32Array);
  var bodyIB = buffer(EB, bodyIdx, Uint16Array);
  var landVB = buffer(AB, pos, Float32Array);
  var landBB = buffer(AB, bright, Float32Array);
  var arcVB  = buffer(AB, arcPos, Float32Array);
  var arcIB  = buffer(EB, arcIdx, Uint16Array);
  var hubVB  = buffer(AB, hubPos, Float32Array);

  function loc(p, names) {
    var o = {};
    names.forEach(function (n) {
      o[n] = n.charAt(0) === 'a' ? gl.getAttribLocation(p, n) : gl.getUniformLocation(p, n);
    });
    return o;
  }
  var H = loc(haloProg, ['aPos', 'uProj', 'uView', 'uR']);
  var B = loc(bodyProg, ['aPos', 'uProj', 'uView', 'uR']);
  var L = loc(landProg, ['aPos', 'aB', 'uProj', 'uView', 'uPoint', 'uAlpha']);
  var A = loc(arcProg,  ['aPos', 'uProj', 'uView', 'uPoint', 'uAlpha', 'uRound', 'uCol']);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 0);

  function perspective(out, fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
    out[12] = 0; out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
  }
  function view(out, rx, ry, dist) {
    var cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
    out[0] = cy;  out[1] = sx * sy;  out[2] = -cx * sy; out[3] = 0;
    out[4] = 0;   out[5] = cx;       out[6] = sx;       out[7] = 0;
    out[8] = sy;  out[9] = -sx * cy; out[10] = cx * cy; out[11] = 0;
    out[12] = 0;  out[13] = 0;       out[14] = -dist;   out[15] = 1;
  }

  var proj = new Float32Array(16), mv = new Float32Array(16);
  var dotScale = 1;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width * dpr));
    var h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    perspective(proj, 0.86, w / h, 0.1, 100);
    /* The lights are a field, not a set of objects: their size follows the
       globe's size on screen so the coastlines stay readable on a phone and
       do not turn into a solid mass on a large display. */
    dotScale = Math.max(1.05, r.width / 340) * dpr;
  }

  function attrib(prog, buf, where, size) {
    gl.bindBuffer(AB, buf);
    gl.enableVertexAttribArray(where);
    gl.vertexAttribPointer(where, size, gl.FLOAT, false, 0, 0);
  }

  var tiltX = 0, tiltY = 0, aimX = 0, aimY = 0;
  /* -80 degrees. The longitude facing the camera is spin + 90 (from the view
     matrix: for a point on the equator eye.z peaks at lon = ry + 90), and the
     canvas is cropped on the right, so the visible arc runs from roughly 90
     west of centre to 20 east of it. Centred on 10E that is the Americas, the
     Atlantic and Africa -- the face the reference shows, and the one where the
     land is worth looking at. At 0 it opened on the Pacific. */
  var spin = -1.40, last = 0, raf = 0, onScreen = true;

  function draw() {
    view(mv, -0.30 + tiltX, spin + tiltY, DIST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 1. the atmosphere, outside the planet, before anything covers it
    gl.useProgram(haloProg);
    gl.uniformMatrix4fv(H.uProj, false, proj);
    gl.uniformMatrix4fv(H.uView, false, mv);
    gl.uniform1f(H.uR, 1.068);
    attrib(haloProg, bodyVB, H.aPos, 3);
    gl.bindBuffer(EB, bodyIB);
    gl.depthMask(false);
    gl.drawElements(gl.TRIANGLES, bodyIdx.length, gl.UNSIGNED_SHORT, 0);

    // 2. the body, opaque, into the depth buffer
    gl.useProgram(bodyProg);
    gl.uniformMatrix4fv(B.uProj, false, proj);
    gl.uniformMatrix4fv(B.uView, false, mv);
    gl.uniform1f(B.uR, 1.0);
    attrib(bodyProg, bodyVB, B.aPos, 3);
    gl.bindBuffer(EB, bodyIB);
    gl.depthMask(true);
    gl.drawElements(gl.TRIANGLES, bodyIdx.length, gl.UNSIGNED_SHORT, 0);

    gl.depthMask(false);

    // 3. the arcs, behind and in front of it
    gl.useProgram(arcProg);
    gl.uniformMatrix4fv(A.uProj, false, proj);
    gl.uniformMatrix4fv(A.uView, false, mv);
    gl.uniform1f(A.uRound, 0);
    gl.uniform1f(A.uAlpha, 0.46);
    gl.uniform3f(A.uCol, 0.68, 0.86, 1.0);
    attrib(arcProg, arcVB, A.aPos, 3);
    gl.bindBuffer(EB, arcIB);
    gl.drawElements(gl.LINES, arcIdx.length, gl.UNSIGNED_SHORT, 0);

    // 4. the land
    gl.useProgram(landProg);
    gl.uniformMatrix4fv(L.uProj, false, proj);
    gl.uniformMatrix4fv(L.uView, false, mv);
    gl.uniform1f(L.uPoint, dotScale);
    gl.uniform1f(L.uAlpha, 0.95);
    attrib(landProg, landVB, L.aPos, 3);
    attrib(landProg, landBB, L.aB, 1);
    gl.drawArrays(gl.POINTS, 0, LIGHTS);

    // 5. the waypoints on the arcs
    gl.useProgram(arcProg);
    gl.uniform1f(A.uPoint, dotScale * 2.1);
    gl.uniform1f(A.uRound, 1);
    gl.uniform1f(A.uAlpha, 0.95);
    gl.uniform3f(A.uCol, 0.80, 0.93, 1.0);
    attrib(arcProg, hubVB, A.aPos, 3);
    gl.drawArrays(gl.POINTS, 0, hubPos.length / 3);

    gl.depthMask(true);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    spin += dt * 0.055;              // a full turn every ~114 seconds
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
    /* The same face as the animated start: a still frame should be the one
       that most looks like a planet, not whichever ocean it opened on. */
    draw();
    canvas.classList.add('on');
    return;
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    aimY = (e.clientX / window.innerWidth - 0.5) * 0.40;
    aimX = (e.clientY / window.innerHeight - 0.5) * 0.24;
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

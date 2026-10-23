/* 테라러닝 공용 앰블럼 — 육각형 틀 + 상징 도형 + 표(기호 띠). 2026-10-23
   TEMB.svg({상징, 표, 색, 단계, 크기, 큰}) → SVG 문자열
     단계 0 잠김(회색 실루엣) · 1 동(해금) · 2 은(칭호 획득 = 강점 확인) · 3 금(전설)
     큰: true 면 큰 줄기용(테두리 두 겹·날개 장식)
   상징 키 목록은 상징목록.md 와 같다. 모르는 키면 star. */
(function () {
  var W = 'stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  var F = 'fill="#fff"';
  function hexPts(cx, cy, r) {
    var p = [];
    for (var i = 0; i < 6; i++) { var a = Math.PI / 180 * (60 * i - 90); p.push((cx + r * Math.cos(a)).toFixed(2) + "," + (cy + r * Math.sin(a)).toFixed(2)); }
    return p.join(" ");
  }
  function poly(pts, a) { return '<polygon points="' + pts + '" ' + (a || W) + '/>'; }
  function pl(pts, a) { return '<polyline points="' + pts + '" ' + (a || W) + '/>'; }
  function P(d, a) { return '<path d="' + d + '" ' + (a || W) + '/>'; }
  function C(x, y, r, a) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" ' + (a || W) + '/>'; }
  function R(x, y, w, h, a, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (rx ? ' rx="' + rx + '"' : '') + ' ' + (a || W) + '/>'; }
  function L(x1, y1, x2, y2, a) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" ' + (a || W) + '/>'; }
  var THIN = 'stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"';

  /* 상징 — 중심 (50,46), 대략 30~70 상자 */
  var G = {
    eye: function () { return P("M28 46 Q50 26 72 46 Q50 66 28 46Z") + C(50, 46, 8, F) + C(52.5, 43.5, 2.6, 'fill="rgba(0,0,0,.35)"'); },
    eyetri: function () { return poly("50,24 74,64 26,64") + P("M36 52 Q50 40 64 52 Q50 62 36 52Z", THIN) + C(50, 52, 4.2, F) + L(50, 18, 50, 13, THIN) + L(36, 22, 33, 18, THIN) + L(64, 22, 67, 18, THIN); },
    mirror: function () { return L(50, 24, 50, 70, 'stroke="#fff" stroke-width="2.4" stroke-dasharray="4 4" stroke-linecap="round"') + P("M46 30 Q30 26 28 40 Q30 52 46 50Z", F) + P("M54 30 Q70 26 72 40 Q70 52 54 50Z", F) + P("M46 52 Q34 54 34 64 Q42 68 46 60Z", F) + P("M54 52 Q66 54 66 64 Q58 68 54 60Z", F); },
    bolt: function () { return poly("55,22 34,50 48,50 43,72 66,40 52,40 58,22", 'fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"'); },
    crown: function () { return poly("28,62 30,34 40,48 50,28 60,48 70,34 72,62", 'fill="#fff" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"') + R(28, 64, 44, 6, F, 2) + C(50, 28, 3.4, F) + C(30, 33, 3, F) + C(70, 33, 3, F); },
    sword: function () { return P("M50 20 L55 28 L55 56 L45 56 L45 28Z", F) + L(36, 58, 64, 58) + L(50, 60, 50, 70) + C(50, 72, 3, F); },
    shield: function () { return P("M50 22 L70 30 Q70 56 50 70 Q30 56 30 30Z") + P("M50 30 L62 35 Q62 52 50 61Z", F); },
    flame: function () { return P("M50 20 Q66 38 64 54 Q62 70 50 70 Q38 70 36 56 Q35 46 44 38 Q44 48 50 50 Q46 36 50 20Z", F) + P("M50 70 Q43 70 43 62 Q44 56 50 52 Q56 58 56 63 Q56 70 50 70Z", 'fill="rgba(0,0,0,.28)"'); },
    star: function () { var p = []; for (var i = 0; i < 10; i++) { var r = i % 2 ? 9 : 22, a = Math.PI / 5 * i - Math.PI / 2; p.push((50 + r * Math.cos(a)).toFixed(1) + "," + (47 + r * Math.sin(a)).toFixed(1)); } return poly(p.join(" "), 'fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"'); },
    infinity: function () { return P("M50 46 C42 34 28 34 28 46 C28 58 42 58 50 46 C58 34 72 34 72 46 C72 58 58 58 50 46Z", 'stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"'); },
    spiral: function () { return P("M50 46 m0 0 a3 3 0 0 1 6 0 a6 6 0 0 1 -12 0 a10 10 0 0 1 20 0 a14 14 0 0 1 -28 0 a18 18 0 0 1 36 0"); },
    compass: function () { return C(50, 26, 4, F) + L(50, 29, 36, 68) + L(50, 29, 64, 68) + P("M38 56 Q50 64 62 56", THIN) + L(64, 68, 66, 72, THIN); },
    setsquare: function () { return poly("30,68 30,26 70,68") + poly("37,61 37,43 54,61", THIN) + L(30, 34, 34, 34, THIN) + L(30, 42, 34, 42, THIN) + L(30, 50, 34, 50, THIN); },
    ruler: function () { return R(24, 38, 52, 16, null, 2) + L(31, 38, 31, 45, THIN) + L(38, 38, 38, 48, THIN) + L(45, 38, 45, 45, THIN) + L(52, 38, 52, 48, THIN) + L(59, 38, 59, 45, THIN) + L(66, 38, 66, 48, THIN) + pl("24,64 76,64", THIN) + pl("28,60 24,64 28,68", THIN) + pl("72,60 76,64 72,68", THIN); },
    gear: function () { var s = ""; for (var i = 0; i < 8; i++) { var a = Math.PI / 4 * i; s += L((50 + 15 * Math.cos(a)).toFixed(1), (46 + 15 * Math.sin(a)).toFixed(1), (50 + 23 * Math.cos(a)).toFixed(1), (46 + 23 * Math.sin(a)).toFixed(1), 'stroke="#fff" stroke-width="7" stroke-linecap="butt"'); } return s + C(50, 46, 15, 'fill="#fff"') + C(50, 46, 6, 'fill="rgba(0,0,0,.35)"'); },
    hammer: function () { return R(32, 26, 30, 12, F, 2) + R(62, 29, 6, 6, F) + L(46, 38, 46, 72, 'stroke="#fff" stroke-width="6" stroke-linecap="round"'); },
    brick: function () { return R(26, 28, 48, 38, null, 1) + L(26, 40.7, 74, 40.7, THIN) + L(26, 53.3, 74, 53.3, THIN) + L(42, 28, 42, 40.7, THIN) + L(58, 28, 58, 40.7, THIN) + L(34, 40.7, 34, 53.3, THIN) + L(50, 40.7, 50, 53.3, THIN) + L(66, 40.7, 66, 53.3, THIN) + L(42, 53.3, 42, 66, THIN) + L(58, 53.3, 58, 66, THIN); },
    building: function () { var s = R(34, 22, 22, 48) + R(56, 38, 12, 32); for (var y = 28; y < 64; y += 8) { s += L(39, y, 42, y, THIN) + L(48, y, 51, y, THIN); } return s + L(26, 70, 74, 70); },
    column: function () { return R(32, 24, 36, 6, F, 1) + R(32, 64, 36, 6, F, 1) + L(39, 31, 39, 63, THIN) + L(46, 31, 46, 63, THIN) + L(54, 31, 54, 63, THIN) + L(61, 31, 61, 63, THIN) + P("M30 24 L50 16 L70 24", THIN); },
    arch: function () { return P("M26 68 L26 46 A24 24 0 0 1 74 46 L74 68") + P("M36 68 L36 48 A14 14 0 0 1 64 48 L64 68") + poly("46,24 54,24 52,32 48,32", F); },
    ibeam: function () { return P("M30 26 L70 26 L70 33 L54 33 L54 59 L70 59 L70 66 L30 66 L30 59 L46 59 L46 33 L30 33Z", F); },
    crane: function () { return L(40, 70, 40, 24) + L(24, 28, 74, 28) + L(40, 22, 30, 28, THIN) + L(40, 22, 66, 28, THIN) + L(64, 28, 64, 46, THIN) + R(59, 46, 10, 7, F) + R(26, 28, 8, 8, F) + L(32, 70, 48, 70); },
    wave: function () { return P("M24 40 Q31 30 37 40 T50 40 T63 40 T76 40") + P("M24 54 Q31 44 37 54 T50 54 T63 54 T76 54", THIN); },
    drop: function () { return P("M50 22 Q68 46 66 56 Q64 70 50 70 Q36 70 34 56 Q32 46 50 22Z", F) + P("M42 56 Q43 63 49 64", 'stroke="rgba(0,0,0,.3)" stroke-width="3" fill="none" stroke-linecap="round"'); },
    bulb: function () { return P("M50 22 Q66 22 66 40 Q66 48 58 54 L58 60 L42 60 L42 54 Q34 48 34 40 Q34 22 50 22Z") + L(43, 65, 57, 65) + L(45, 70, 55, 70) + pl("45,44 50,38 55,44 50,50", THIN); },
    plug: function () { return R(36, 34, 28, 22, F, 4) + L(43, 22, 43, 34, 'stroke="#fff" stroke-width="5"') + L(57, 22, 57, 34, 'stroke="#fff" stroke-width="5"') + P("M50 56 Q50 66 40 70"); },
    extinguisher: function () { return R(40, 34, 20, 36, F, 6) + R(44, 26, 12, 8, F, 2) + P("M56 28 L68 24 L68 30", THIN) + P("M44 30 Q30 30 30 46", THIN) + R(43, 46, 14, 6, 'fill="rgba(0,0,0,.3)"'); },
    magnifier: function () { return C(45, 42, 14) + L(55, 52, 70, 67, 'stroke="#fff" stroke-width="7" stroke-linecap="round"') + P("M38 38 Q41 33 46 33", THIN); },
    scroll: function () { return R(32, 26, 36, 40) + C(32, 30, 4) + C(68, 62, 4) + L(39, 36, 61, 36, THIN) + L(39, 44, 61, 44, THIN) + L(39, 52, 55, 52, THIN); },
    scales: function () { return L(50, 22, 50, 68) + L(30, 30, 70, 30) + L(38, 70, 62, 70) + P("M22 50 L30 32 L38 50Z", THIN) + P("M22 50 Q30 58 38 50", THIN) + P("M62 50 L70 32 L78 50Z", THIN) + P("M62 50 Q70 58 78 50", THIN); },
    hourglass: function () { return L(32, 24, 68, 24) + L(32, 68, 68, 68) + P("M36 24 Q36 40 50 46 Q64 40 64 24") + P("M36 68 Q36 52 50 46 Q64 52 64 68") + P("M40 68 Q50 56 60 68Z", F); },
    clock: function () { return C(50, 46, 22) + pl("50,32 50,46 60,52") + C(50, 46, 2.5, F); },
    chart: function () { return R(28, 54, 8, 14, F) + R(40, 46, 8, 22, F) + R(52, 38, 8, 30, F) + R(64, 28, 8, 40, F) + pl("26,44 40,34 52,38 70,22", THIN) + pl("63,22 70,22 70,29", THIN); },
    dice: function () { return R(30, 26, 40, 40, null, 7) + C(40, 36, 3.6, F) + C(60, 36, 3.6, F) + C(50, 46, 3.6, F) + C(40, 56, 3.6, F) + C(60, 56, 3.6, F); },
    target: function () { return C(50, 46, 22) + C(50, 46, 13) + C(50, 46, 4.5, F) + L(50, 46, 72, 24, THIN) + pl("66,24 72,24 72,30", THIN); },
    key: function () { return C(38, 46, 10) + L(48, 46, 72, 46) + L(64, 46, 64, 54) + L(70, 46, 70, 52); },
    lock: function () { return R(32, 42, 36, 28, F, 4) + P("M38 42 L38 34 Q38 22 50 22 Q62 22 62 34 L62 42") + C(50, 54, 4, 'fill="rgba(0,0,0,.35)"') + R(48, 54, 4, 8, 'fill="rgba(0,0,0,.35)"'); },
    puzzle: function () { return P("M30 32 L44 32 Q42 24 50 24 Q58 24 56 32 L70 32 L70 46 Q78 44 78 52 Q78 60 70 58 L70 70 L30 70 L30 58 Q38 60 38 52 Q38 44 30 46Z", F); },
    atom: function () { return '<ellipse cx="50" cy="46" rx="24" ry="9" ' + W + '/>' + '<ellipse cx="50" cy="46" rx="24" ry="9" transform="rotate(60 50 46)" ' + W + '/>' + '<ellipse cx="50" cy="46" rx="24" ry="9" transform="rotate(-60 50 46)" ' + W + '/>' + C(50, 46, 4.5, F); },
    leaf: function () { return P("M30 66 Q28 30 70 24 Q72 64 30 66Z", F) + P("M32 64 Q46 46 62 32", 'stroke="rgba(0,0,0,.3)" stroke-width="3" fill="none" stroke-linecap="round"'); },
    mountain: function () { return poly("24,68 42,34 52,50 58,42 76,68", 'fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"') + poly("42,34 37,44 42,41 47,44", 'fill="rgba(0,0,0,.25)"') + C(66, 28, 4, F); },
    rocket: function () { return P("M50 20 Q62 32 60 54 L40 54 Q38 32 50 20Z", F) + C(50, 38, 4, 'fill="rgba(0,0,0,.35)"') + poly("40,46 32,58 40,56", F) + poly("60,46 68,58 60,56", F) + P("M44 58 Q50 72 56 58", THIN); },
    rook: function () { return P("M34 26 L40 26 L40 31 L47 31 L47 26 L53 26 L53 31 L60 31 L60 26 L66 26 L66 38 L60 42 L60 60 L66 64 L66 70 L34 70 L34 64 L40 60 L40 42 L34 38Z", F); },
    parabola: function () { return L(26, 64, 74, 64, THIN) + L(50, 22, 50, 70, THIN) + P("M30 28 Q50 92 70 28") + C(50, 60, 3.5, F); },
    axes: function () { return L(28, 68, 28, 22, THIN) + L(24, 64, 74, 64, THIN) + pl("25,26 28,22 31,26", THIN) + pl("70,61 74,64 70,67", THIN) + L(32, 60, 70, 28) + C(46, 48, 3.5, F) + C(62, 35, 3.5, F); },
    sun: function () { var s = C(50, 46, 11, F); for (var i = 0; i < 8; i++) { var a = Math.PI / 4 * i; s += L((50 + 16 * Math.cos(a)).toFixed(1), (46 + 16 * Math.sin(a)).toFixed(1), (50 + 23 * Math.cos(a)).toFixed(1), (46 + 23 * Math.sin(a)).toFixed(1)); } return s; },
    moon: function () { return P("M58 24 A22 22 0 1 0 70 56 A17 17 0 1 1 58 24Z", F) + C(66, 30, 2, F) + C(72, 40, 1.5, F); },
    wind: function () { return P("M24 38 L58 38 Q66 38 66 31 Q66 25 60 25 Q55 25 55 30") + P("M24 48 L68 48 Q76 48 76 55 Q76 62 69 62 Q63 62 63 57") + P("M24 58 L46 58", THIN); },
    snow: function () { var s = ""; for (var i = 0; i < 3; i++) { var a = Math.PI / 3 * i, c = Math.cos(a) * 22, d = Math.sin(a) * 22; s += L((50 - c).toFixed(1), (46 - d).toFixed(1), (50 + c).toFixed(1), (46 + d).toFixed(1)); } return s + C(50, 46, 5, F); },
    thermo: function () { return P("M44 56 L44 26 Q44 20 50 20 Q56 20 56 26 L56 56") + C(50, 62, 9, F) + L(50, 34, 50, 58, 'stroke="#fff" stroke-width="5" stroke-linecap="round"') + L(60, 30, 66, 30, THIN) + L(60, 40, 66, 40, THIN); },
    pipe: function () { return P("M26 34 L50 34 Q60 34 60 44 L60 70", 'stroke="#fff" stroke-width="9" fill="none" stroke-linejoin="round"') + R(22, 28, 6, 12, F) + R(54, 66, 12, 6, F) + C(60, 34, 4, 'fill="rgba(0,0,0,.25)"'); },
    faucet: function () { return R(30, 30, 30, 10, F, 3) + R(40, 24, 10, 6, F) + P("M60 35 L68 35 Q72 35 72 40 L72 46", 'stroke="#fff" stroke-width="7" fill="none" stroke-linejoin="round"') + P("M72 52 Q76 58 72 62 Q68 58 72 52Z", F); },
    ladder: function () { return L(38, 22, 38, 70) + L(62, 22, 62, 70) + L(38, 30, 62, 30, THIN) + L(38, 40, 62, 40, THIN) + L(38, 50, 62, 50, THIN) + L(38, 60, 62, 60, THIN); },
    helmet: function () { return P("M28 56 Q28 28 50 28 Q72 28 72 56Z", F) + R(22, 56, 56, 7, F, 3) + L(50, 28, 50, 52, 'stroke="rgba(0,0,0,.28)" stroke-width="4"') + P("M38 34 Q36 44 36 56", 'stroke="rgba(0,0,0,.2)" stroke-width="3" fill="none"'); },
    blueprint: function () { return R(26, 24, 48, 44, null, 2) + L(26, 36, 74, 36, THIN) + L(26, 48, 74, 48, THIN) + L(26, 60, 74, 60, THIN) + L(38, 24, 38, 68, THIN) + L(50, 24, 50, 68, THIN) + L(62, 24, 62, 68, THIN) + R(38, 36, 24, 24, 'stroke="#fff" stroke-width="4.2" fill="rgba(255,255,255,.25)"'); },
    wing: function () { return P("M24 60 Q30 28 74 26 Q66 34 70 36 Q60 40 64 44 Q54 48 58 52 Q44 56 24 60Z", F); },
    anchor: function () { return C(50, 26, 4.5) + L(50, 31, 50, 68) + L(40, 38, 60, 38) + P("M28 52 Q30 68 50 68 Q70 68 72 52") + pl("24,56 28,50 33,55", THIN) + pl("67,55 72,50 76,56", THIN); },
    book: function () { return P("M50 30 Q38 24 26 28 L26 66 Q38 62 50 68 Q62 62 74 66 L74 28 Q62 24 50 30Z") + L(50, 30, 50, 68, THIN) + L(32, 38, 44, 38, THIN) + L(56, 38, 68, 38, THIN) + L(32, 48, 44, 48, THIN) + L(56, 48, 68, 48, THIN); },
    pen: function () { return P("M62 22 L72 32 L42 62 L30 66 L34 54Z", F) + L(56, 28, 66, 38, 'stroke="rgba(0,0,0,.3)" stroke-width="3"') + L(26, 72, 46, 72, THIN); },
    cards: function () { return R(28, 30, 24, 34, 'fill="rgba(255,255,255,.55)" stroke="#fff" stroke-width="3"', 4) + '<g transform="rotate(14 54 46)">' + R(44, 26, 24, 34, F, 4) + '</g>' + P("M58 38 Q54 33 51 38 Q48 44 58 50 Q68 44 65 38 Q62 33 58 38Z", 'fill="rgba(0,0,0,.35)"'); },
    chain: function () { return R(24, 38, 24, 14, null, 7) + R(38, 38, 24, 14, null, 7) + R(52, 38, 24, 14, null, 7); },
    bridge: function () { return L(22, 58, 78, 58) + L(34, 28, 34, 66) + L(66, 28, 66, 66) + P("M22 50 Q34 22 34 28 Q50 52 66 28 Q66 22 78 50", THIN) + L(42, 41, 42, 58, THIN) + L(50, 46, 50, 58, THIN) + L(58, 41, 58, 58, THIN); },
    house: function () { return pl("24,48 50,24 76,48") + R(32, 44, 36, 26) + R(45, 54, 10, 16, F) + R(58, 26, 6, 12, F); },
    tree: function () { return C(50, 36, 14, F) + C(38, 44, 10, F) + C(62, 44, 10, F) + L(50, 46, 50, 70, 'stroke="#fff" stroke-width="6" stroke-linecap="round"') + L(50, 58, 58, 52, THIN); },
    scissors: function () { return C(36, 60, 7) + C(64, 60, 7) + L(41, 55, 62, 24) + L(59, 55, 38, 24); },
    stack: function () { return R(30, 54, 40, 14, F, 2) + R(34, 39, 32, 13, F, 2) + R(39, 25, 22, 12, F, 2); },
    fan: function () { var s = ""; for (var i = 0; i < 3; i++) { s += '<path d="M50 46 Q44 30 50 22 Q62 26 56 42Z" fill="#fff" transform="rotate(' + (i * 120) + ' 50 46)"/>'; } return C(50, 46, 24, THIN) + s + C(50, 46, 4, 'fill="rgba(0,0,0,.35)"'); },
    speaker: function () { return poly("28,38 38,38 50,28 50,64 38,54 28,54", 'fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"') + P("M58 38 Q64 46 58 54") + P("M64 30 Q76 46 64 62"); },
    ear: function () { return P("M40 34 Q40 22 52 22 Q66 22 66 38 Q66 48 58 54 Q54 58 54 64 Q54 72 46 72 Q40 72 38 66") + P("M48 36 Q50 30 55 32 Q60 36 54 44", THIN); },
    brain: function () { return P("M50 26 Q42 20 36 26 Q28 26 28 36 Q22 42 28 50 Q26 60 36 62 Q40 70 50 66 Q60 70 64 62 Q74 60 72 50 Q78 42 72 36 Q72 26 64 26 Q58 20 50 26Z") + L(50, 26, 50, 66, THIN) + P("M36 38 Q42 40 40 46 M64 38 Q58 40 60 46 M36 54 Q42 52 44 56 M64 54 Q58 52 56 56", THIN); },
    fist: function () { return R(32, 34, 36, 26, F, 7) + L(41, 34, 41, 46, 'stroke="rgba(0,0,0,.3)" stroke-width="2.5"') + L(50, 34, 50, 46, 'stroke="rgba(0,0,0,.3)" stroke-width="2.5"') + L(59, 34, 59, 46, 'stroke="rgba(0,0,0,.3)" stroke-width="2.5"') + R(38, 60, 24, 10, F, 2) + P("M28 46 Q24 54 34 56", THIN); },
    gem: function () { return poly("36,30 64,30 74,42 50,70 26,42", 'fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"') + pl("26,42 74,42", 'stroke="rgba(0,0,0,.28)" stroke-width="2" fill="none"') + pl("36,30 44,42 50,70 56,42 64,30", 'stroke="rgba(0,0,0,.28)" stroke-width="2" fill="none"') + pl("44,42 50,30 56,42", 'stroke="rgba(0,0,0,.28)" stroke-width="2" fill="none"'); },
    paw: function () { return P("M50 50 Q62 50 64 60 Q64 68 56 66 Q50 64 44 66 Q36 68 36 60 Q38 50 50 50Z", F) + '<ellipse cx="36" cy="42" rx="5" ry="7" fill="#fff"/><ellipse cx="46" cy="32" rx="5" ry="7" fill="#fff"/><ellipse cx="56" cy="32" rx="5" ry="7" fill="#fff"/><ellipse cx="65" cy="42" rx="5" ry="7" fill="#fff"/>'; },
  };

  var 단계색 = [
    { a: "#5b6170", b: "#3a3f4a", 이름: "잠김" },
    { a: "#e3a26f", b: "#8a4b22", 이름: "동" },
    { a: "#f4f7fb", b: "#8b97a8", 이름: "은" },
    { a: "#fff1a6", b: "#c58a0a", 이름: "금" },
  ];
  var uid = 0;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shade(hex, k) {                 // k<0 어둡게, k>0 밝게
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ""); if (!m) return hex;
    var n = parseInt(m[1], 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function f(x) { return Math.round(k < 0 ? x * (1 + k) : x + (255 - x) * k); }
    return "#" + [f(r), f(g), f(b)].map(function (x) { return ("0" + Math.max(0, Math.min(255, x)).toString(16)).slice(-2); }).join("");
  }

  function svg(o) {
    o = o || {};
    var lv = Math.max(0, Math.min(3, o.단계 == null ? 2 : o.단계)), id = "te" + (++uid), sz = o.크기 || 96;
    var col = lv === 0 ? "#4a505c" : (o.색 || "#3b6fd8"), 틀 = o.틀색 && lv > 0 ? { a: o.틀색[0], b: o.틀색[1] } : 단계색[lv];
    var glyph = o.상징 === "글자" ? null : (G[o.상징] || G.star);
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="' + sz + '" height="' + sz + (o.x != null ? '" x="' + o.x + '" y="' + o.y : '') + '" class="temb temb-l' + lv + '" role="img" aria-label="' + esc(o.칭호 || "") + '">';
    s += '<defs><linearGradient id="' + id + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + 틀.a + '"/><stop offset="1" stop-color="' + 틀.b + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'b" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="' + shade(col, .28) + '"/><stop offset=".6" stop-color="' + col + '"/><stop offset="1" stop-color="' + shade(col, -.45) + '"/></radialGradient>' +
      '<clipPath id="' + id + 'c"><polygon points="' + hexPts(50, 48, 37) + '"/></clipPath></defs>';
    /* 금: 뒤에서 퍼지는 빛살 · 큰 줄기: 날개 */
    if (lv === 3) {
      var rays = "";
      for (var i = 0; i < 16; i++) { var a0 = Math.PI / 8 * i + Math.PI / 16, d = .045; rays += '<polygon points="50,48 ' + (50 + 50 * Math.cos(a0 - d)).toFixed(1) + ',' + (48 + 50 * Math.sin(a0 - d)).toFixed(1) + ' ' + (50 + 50 * Math.cos(a0 + d)).toFixed(1) + ',' + (48 + 50 * Math.sin(a0 + d)).toFixed(1) + '"/>'; }
      s += '<radialGradient id="' + id + 'r" cx=".5" cy=".48" r=".5"><stop offset=".55" stop-color="#ffe27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient>';
      s += '<g class="temb-rays" fill="url(#' + id + 'r)">' + rays + '</g>';
    }
    if (o.큰 && lv > 0) {   // 큰 줄기: 양옆 날개 — 본체는 줄여서 날개 자리를 낸다
      var wg = function (sx) { return '<g transform="translate(50 0) scale(' + sx + ' 1) translate(-50 0)"><path d="M18 30 Q2 44 6 66 Q12 60 16 62 Q8 52 14 44 Q12 54 20 56 Q14 46 22 38Z" fill="url(#' + id + 'f)" stroke="rgba(0,0,0,.3)" stroke-width=".7"/></g>'; };
      s += wg(1) + wg(-1);
      s += '<g transform="translate(50 48) scale(.8) translate(-50 -48)">';
    }
    s += '<polygon points="' + hexPts(50, 48, 46) + '" fill="url(#' + id + 'f)"/>';
    s += '<polygon points="' + hexPts(50, 48, 46) + '" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1"/>';
    if (o.큰) s += '<polygon points="' + hexPts(50, 48, 41.5) + '" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/>';
    s += '<polygon points="' + hexPts(50, 48, 38.5) + '" fill="' + shade(틀.b, -.3) + '"/>';
    s += '<polygon points="' + hexPts(50, 48, 37) + '" fill="url(#' + id + 'b)"/>';
    /* 바탕 무늬: 은 이상은 잔 벌집 */
    if (lv >= 2) { var hx = ""; for (var yy = 14; yy < 90; yy += 10) for (var xx = 10; xx < 95; xx += 11.5) hx += '<polygon points="' + hexPts(xx + ((yy / 10) % 2 ? 5.75 : 0), yy, 5) + '"/>'; s += '<g clip-path="url(#' + id + 'c)" fill="none" stroke="#fff" stroke-opacity=".09" stroke-width=".8">' + hx + '</g>'; }
    s += '<path d="M' + hexPts(50, 48, 37).split(" ").slice(5).concat(hexPts(50, 48, 37).split(" ").slice(0, 2)).join(" L") + '" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>';
    /* 상징 */
    var 표 = o.표 ? String(o.표).slice(0, 6) : "";
    s += '<g clip-path="url(#' + id + 'c)"><g transform="translate(0,' + (표 && glyph ? -2 : 1) + ')"' + (lv === 0 ? ' opacity=".45"' : '') + ' filter="drop-shadow(0 1.5px 0 rgba(0,0,0,.35))">';
    if (glyph) s += '<g transform="translate(50 46) scale(.86) translate(-50 -46)">' + glyph() + '</g>';
    else s += '<text x="50" y="58" text-anchor="middle" font-family="Pretendard Variable,Pretendard,Noto Sans KR,sans-serif" font-weight="900" font-size="' + (표.length > 2 ? 22 : 32) + '" fill="#fff">' + esc(표 || "?") + '</text>';
    s += '</g></g>';
    if (lv === 0) s += '<text x="50" y="57" text-anchor="middle" font-family="Pretendard Variable,sans-serif" font-weight="900" font-size="26" fill="#c9ced8" opacity=".9">?</text>';
    /* 표 띠 */
    if (표 && glyph && lv > 0) {
      s += '<path d="M24 70 L76 70 L72 80 L28 80Z" fill="url(#' + id + 'f)" stroke="rgba(0,0,0,.35)" stroke-width=".8"/>' +
        '<text x="50" y="78" text-anchor="middle" font-family="Pretendard Variable,Pretendard,Noto Sans KR,sans-serif" font-weight="900" font-size="' + (표.length > 4 ? 7 : 8.5) + '" fill="' + (lv === 2 ? "#3a4250" : "#3a2200") + '">' + esc(표) + '</text>';
    }
    if (o.큰 && lv > 0) s += '</g>';
    s += '</svg>';
    return s;
  }
  function starPts(cx, cy, r) { var p = []; for (var i = 0; i < 10; i++) { var rr = i % 2 ? r * .45 : r, a = Math.PI / 5 * i - Math.PI / 2; p.push((cx + rr * Math.cos(a)).toFixed(2) + "," + (cy + rr * Math.sin(a)).toFixed(2)); } return p.join(" "); }

  window.TEMB = { svg: svg, 상징: Object.keys(G).concat(["글자"]), 단계이름: ["잠김", "동", "은", "금"], hexPts: hexPts, shade: shade, esc: esc };
})();

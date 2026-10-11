/* 화학식 표시·반응식 채점 (1011 위험물산업기사 실기)
   - HWA.표시(글)      : H2O → H₂O, (C2H5)3Al → (C₂H₅)₃Al, 150m2 → 150m². 앞 계수(2H2O 의 2)는 그대로 둔다.
   - HWA.붙이기(뿌리)   : 그 요소 안의 글자를 지금·앞으로 계속 위처럼 바꿔 보여 준다(입력칸·코드는 건드리지 않음).
   - HWA.채점(학생, 정답): 반응식 두 개를 물질·계수로 비교. 쓰는 순서·띄어쓰기·시성식 모양(C2H5OC2H5 = (C2H5)2O)은 보지 않는다. */
(function () {
  "use strict";
  var 아래 = "₀₁₂₃₄₅₆₇₈₉", 위 = {"2": "²", "3": "³"};
  function 숫자아래(s) { return s.replace(/\d/g, function (d) { return 아래[+d]; }); }
  function 원래숫자(s) { return String(s || "").replace(/[₀-₉]/g, function (c) { return String(아래.indexOf(c)); }); }

  /* 영문·숫자·괄호 덩어리 하나를 본다. 대문자가 있어야 화학식으로 친다(제4류·IG-541·kPa 는 그대로). */
  function 덩어리(t) {
    var m = /^(\d*\.?\d*)(.*)$/.exec(t), 앞 = m[1], 몸 = m[2];
    if (!몸) return t;
    if (/^(c|k)?m[23]$/.test(몸)) return 앞 + 몸.slice(0, -1) + 위[몸.slice(-1)];
    if (!/[A-Z]/.test(몸) || /^[A-Z]{4,}\d/.test(몸)) return t;     /* NFTC202 같은 기준 번호는 그대로 */
    return 앞 + 몸.replace(/([A-Za-z)])(\d+)/g, function (_, a, d) { return a + 숫자아래(d); });
  }
  function 표시(s) { return String(s == null ? "" : s).replace(/[A-Za-z0-9().]+/g, 덩어리); }

  var 건너뜀 = {TEXTAREA: 1, INPUT: 1, PRE: 1, CODE: 1, SCRIPT: 1, STYLE: 1};
  function 바꾸기(뿌리) {
    var w = document.createTreeWalker(뿌리, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        for (var p = n.parentNode; p && p !== 뿌리; p = p.parentNode) if (건너뜀[p.nodeName] || (p.classList && p.classList.contains("no-hwa"))) return NodeFilter.FILTER_REJECT;
        return /[A-Za-z)]\d|m[23]/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    }), 모 = [], n;
    while ((n = w.nextNode())) 모.push(n);
    모.forEach(function (n) { var v = 표시(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; });
  }
  function 붙이기(뿌리) {
    if (!뿌리) return;
    바꾸기(뿌리);
    new MutationObserver(function () { 바꾸기(뿌리); }).observe(뿌리, {childList: true, subtree: true});
  }

  /* ── 반응식 읽기 ── */
  function 원소(식) {                       /* 'Al(OH)3' → {Al:1,O:3,H:3}. 괄호 여러 겹·수화물(·5H2O) */
    var c = {};
    식.split(/[·.*]/).forEach(function (조각) {
      var m = /^(\d*)(.*)$/.exec(조각.trim()), 배 = m[1] ? +m[1] : 1, s = m[2], 쌓 = [{}], i = 0;
      while (i < s.length) {
        var ch = s[i];
        if (ch === "(" || ch === "[") { 쌓.push({}); i++; continue; }
        if (ch === ")" || ch === "]") {
          i++; var d = /^\d*/.exec(s.slice(i))[0]; i += d.length;
          var 안 = 쌓.pop(), 밖 = 쌓[쌓.length - 1], k = d ? +d : 1;
          for (var e in 안) 밖[e] = (밖[e] || 0) + 안[e] * k;
          continue;
        }
        var g = /^([A-Z][a-z]?)(\d*)/.exec(s.slice(i));
        if (!g) throw new Error("화학식을 읽을 수 없어요: " + 식);
        var 위층 = 쌓[쌓.length - 1]; 위층[g[1]] = (위층[g[1]] || 0) + (g[2] ? +g[2] : 1); i += g[0].length;
      }
      if (쌓.length !== 1) throw new Error("괄호 짝이 안 맞아요: " + 식);
      for (var e2 in 쌓[0]) c[e2] = (c[e2] || 0) + 쌓[0][e2] * 배;
    });
    return c;
  }
  function 열쇠(c) { return Object.keys(c).sort().map(function (k) { return k + c[k]; }).join(""); }
  function 한쪽(s) {
    return s.split(/\s\+\s|\+/).map(function (t) { return t.replace(/[↑↓]/g, "").replace(/\s+/g, "").trim(); }).filter(Boolean).map(function (t) {
      var m = /^(\d+)(?=[A-Z(\[])/.exec(t), 계 = m ? +m[1] : 1, f = m ? t.slice(m[1].length) : t;
      return {계: 계, 식: f, 원: 원소(f)};
    });
  }
  function 읽기(식) {
    var s = 원래숫자(식).replace(/-+\([^)]*\)-*>?/g, "→").replace(/⟶|->|=>|=|—>/g, "→");
    var 쪽 = s.split("→");
    if (쪽.length !== 2) throw new Error("화살표(→)를 한 번 넣어 주세요");
    return {좌: 한쪽(쪽[0]), 우: 한쪽(쪽[1])};
  }
  function 원소합(항들) { var t = {}; 항들.forEach(function (h) { for (var e in h.원) t[e] = (t[e] || 0) + h.원[e] * h.계; }); return t; }
  function 균형(r) {                       /* 어긋난 원소 [[원소, 왼, 오]] */
    var a = 원소합(r.좌), b = 원소합(r.우), 차 = [];
    Object.keys(a).concat(Object.keys(b)).forEach(function (e) { if ((a[e] || 0) !== (b[e] || 0) && !차.some(function (x) { return x[0] === e; })) 차.push([e, a[e] || 0, b[e] || 0]); });
    return 차;
  }
  function 표(항들) { var t = {}; 항들.forEach(function (h) { var k = 열쇠(h.원); t[k] = (t[k] || 0) + h.계; }); return t; }
  function 채점(학생, 정답) {
    var 학, 정;
    try { 학 = 읽기(학생); } catch (er) { return {ok: false, 이유: er.message}; }
    정 = 읽기(정답);
    var a1 = 표(학.좌), a2 = 표(학.우), b1 = 표(정.좌), b2 = 표(정.우);
    function 같은물질(x, y) { var kx = Object.keys(x).sort().join("|"), ky = Object.keys(y).sort().join("|"); return kx === ky; }
    if (!같은물질(a1, b1) || !같은물질(a2, b2)) {
      var 빠진 = Object.keys(b2).filter(function (k) { return !(k in a2); }).length + Object.keys(b1).filter(function (k) { return !(k in a1); }).length;
      return {ok: false, 이유: 빠진 ? "물질이 달라요. 생성물을 다시 떠올려 보세요." : "필요 없는 물질이 들어 있어요."};
    }
    var 비들 = [];
    [[a1, b1], [a2, b2]].forEach(function (p) { for (var k in p[1]) 비들.push(p[0][k] / p[1][k]); });
    var 같음 = 비들.every(function (r) { return r === 1; });
    var 배수 = 비들.every(function (r) { return Math.abs(r - 비들[0]) < 1e-9; });
    if (같음) return {ok: true, 이유: ""};
    var 차 = 균형(학);
    if (차.length) return {ok: false, 이유: "원소 수가 안 맞아요: " + 차.map(function (x) { return x[0] + " 왼쪽 " + x[1] + " / 오른쪽 " + x[2]; }).join(", ")};
    return {ok: false, 이유: 배수 ? "원소 수는 맞아요. 계수를 가장 작은 정수로 줄여 보세요." : "원소 수는 맞지만 계수가 달라요."};
  }

  window.HWA = {표시: 표시, 붙이기: 붙이기, 원소: 원소, 읽기: 읽기, 균형: 균형, 채점: 채점, 원래숫자: 원래숫자};
})();

/* 정답 연출 — 모두의 통사 (2026-10-04 대표님 「정답을 게임처럼 도파민 터지게」)
 *
 *  CHEER.ok(el, {combo, kind})   정답 순간. el = 누른 선지(없으면 화면 가운데)
 *  CHEER.miss(el)                오답 — 가벼운 흔들림만(실패가 아니라 재도전)
 *  CHEER.kind([a|b|c])  안 고르기   CHEER.sound([true|false])  소리   CHEER.reset()  연속 끊기
 *
 *  3안  a 버스트(색 파티클·통통·체크)  b 콤보(연속 카운터·XP·불꽃)  c 도장(쾅·플래시)
 *  기본 b. 바꾸는 법: ?cheer=a|b|c (localStorage terra.cheer.kind 에 저장) 또는 설정 화면.
 *  소리: localStorage terra.cheer.sound ("0" 이면 끔, 기본 켬). 연속·XP: sessionStorage.
 *
 *  자동 감시: 화면들이 정답 판정 때 누른 단추에 data-s="ok"/"no" 를 다는 것을 지켜보다가
 *    방금 누른 단추가 ok 면 ok(), no 면 miss() 를 부른다. 화면마다 호출을 박지 않아도 된다.
 *    (개념어 주관식 kwask.js 는 단추가 없어 직접 호출)
 */
(function () {
  "use strict";
  if (window.CHEER) return;
  var D = document, R = D.documentElement;
  var RM = false;
  try { RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { }

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { } return null; }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { } return null; }

  /* ── 설정 ── */
  var KINDS = ["a", "b", "c"];
  function kind(k) {
    if (k) { if (KINDS.indexOf(k) >= 0) { ls("terra.cheer.kind", k); R.dataset.cheer = k; } return R.dataset.cheer; }
    return R.dataset.cheer || "b";
  }
  (function init() {
    var q = ""; try { q = (new URLSearchParams(location.search)).get("cheer") || ""; } catch (e) { }
    q = q.toLowerCase();
    if (KINDS.indexOf(q) >= 0) ls("terra.cheer.kind", q);
    var k = ls("terra.cheer.kind");
    R.dataset.cheer = KINDS.indexOf(k) >= 0 ? k : "b";
  })();
  function sound(on) {
    if (on === undefined) return ls("terra.cheer.sound") !== "0";
    ls("terra.cheer.sound", on ? "1" : "0"); return !!on;
  }

  /* ── 연속·XP (세션 안에서 이 모듈이 센다) ── */
  function num(k) { return parseInt(ss(k) || "0", 10) || 0; }
  var XP_PER = 10, XP_LV = 100;
  function reset() { ss("terra.cheer.combo", "0"); }

  /* ── 소리: 합성 상승음 ── */
  var AC = null;
  function ctx() {
    var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    if (!AC) AC = new C();
    if (AC.state === "suspended") AC.resume();
    return AC;
  }
  function beep(combo) {
    if (!sound()) return;
    try {
      var A = ctx(); if (!A) return;
      var t0 = A.currentTime, base = 523.25 * Math.pow(2, Math.min(combo - 1, 7) / 12);   /* 연속일수록 반음씩 올라간다 */
      [[1, 0], [1.25, .08], [1.5, .16], [2, .24]].forEach(function (n, i) {
        var o = A.createOscillator(), g = A.createGain();
        o.type = i === 3 ? "triangle" : "sine"; o.frequency.value = base * n[0];
        var s = t0 + n[1];
        g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(i === 3 ? .16 : .1, s + .015);
        g.gain.exponentialRampToValueAtTime(0.0001, s + (i === 3 ? .34 : .16));
        o.connect(g); g.connect(A.destination); o.start(s); o.stop(s + .4);
      });
    } catch (e) { }
  }
  function beepMiss() {
    if (!sound()) return;
    try {
      var A = ctx(); if (!A) return;
      var t = A.currentTime, o = A.createOscillator(), g = A.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(330, t); o.frequency.exponentialRampToValueAtTime(262, t + .14);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .18);
      o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + .22);
    } catch (e) { }
  }
  function buzz(p) { try { if (!RM && navigator.vibrate) navigator.vibrate(p); } catch (e) { } }

  /* ── 효과 층 ── */
  var FX = null, HOST = null;   /* HOST: 시안 페이지처럼 폰 틀 안에서만 터뜨릴 때 [data-cheer-host] */
  function layer() {
    if (HOST) {
      if (!HOST._fx || !HOST._fx.isConnected) { HOST._fx = D.createElement("div"); HOST._fx.className = "cheer-fx-host"; HOST._fx.setAttribute("aria-hidden", "true"); HOST.appendChild(HOST._fx); }
      return HOST._fx;
    }
    if (FX && FX.isConnected) return FX;
    FX = D.createElement("div"); FX.id = "cheer-fx"; FX.setAttribute("aria-hidden", "true");
    (D.body || R).appendChild(FX); return FX;
  }
  function vw() { return HOST ? HOST.clientWidth : window.innerWidth; }
  function vh() { return HOST ? HOST.clientHeight : window.innerHeight; }
  function add(c, css, html, life) {
    var n = D.createElement("div"); n.className = c;
    if (css) n.style.cssText = css;
    if (html) n.innerHTML = html;
    layer().appendChild(n);
    setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, life || 1200);
    return n;
  }
  function rectOf(el) {
    try {
      if (el && el.getBoundingClientRect) {
        var r = el.getBoundingClientRect();
        if (r.width || r.height) {
          if (HOST) { var h = HOST.getBoundingClientRect(), L = r.left - h.left, T = r.top - h.top;
            return { left: L, top: T, width: r.width, height: r.height, right: L + r.width, bottom: T + r.height }; }
          return r;
        }
      }
    } catch (e) { }
    var w = vw(), hh = vh();
    return { left: w / 2 - 60, top: hh * .45, width: 120, height: 48, right: w / 2 + 60, bottom: hh * .45 + 48 };
  }
  /* 선지에 직접 거는 동작은 Web Animations 로 — 화면 코드가 class 를 갈아엎어도(coach.js 등) 끊기지 않는다 */
  var MOVES = {
    bounce: [[{ transform: "scale(.94)" }, { transform: "scale(1.07)", offset: .3 }, { transform: "scale(.98)", offset: .55 }, { transform: "scale(1.025)", offset: .78 }, { transform: "scale(1)" }], { duration: 560, easing: "cubic-bezier(.2,.9,.3,1.2)" }],
    bounceS: [[{ transform: "scale(.96)" }, { transform: "scale(1.045)", offset: .4 }, { transform: "scale(1)" }], { duration: 480, easing: "cubic-bezier(.2,.9,.3,1.2)" }],
    shake: [[{ transform: "translateX(0)" }, { transform: "translateX(-5px)", offset: .2 }, { transform: "translateX(4px)", offset: .45 }, { transform: "translateX(-2px)", offset: .7 }, { transform: "translateX(0)" }], { duration: 360, easing: "ease-in-out" }],
    fire: [[{ boxShadow: "0 0 0 3px var(--amber), 0 0 12px 2px var(--accent), 0 0 26px 4px var(--amber)" }, { boxShadow: "0 0 0 3px var(--accent), 0 0 20px 5px var(--amber), 0 0 38px 9px var(--accent)" }, { boxShadow: "0 0 0 3px var(--amber), 0 0 12px 2px var(--accent), 0 0 26px 4px var(--amber)" }], { duration: 380, iterations: 3 }]
  };
  function cls(el, name) {
    if (!el || !el.animate) return;
    try { el.animate(MOVES[name][0], MOVES[name][1]); } catch (e) { }
  }
  var COLORS = ["--cheer-ok", "--mint", "--amber", "--accent", "--fam-geo", "--fam-eth", "--fam-soc"];

  /* ── A 버스트 ── */
  function burst(el, n, power) {
    var r = rectOf(el), cx = r.left + r.width * .5, cy = r.top + r.height * .5;
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2, d = (power || 1) * (46 + Math.random() * 84);
      var sz = 5 + Math.random() * 7, shape = i % 3;
      add("cheer-p cheer-p" + shape,
        "left:" + cx + "px;top:" + cy + "px;width:" + sz + "px;height:" + (shape === 1 ? sz * 2 : sz) + "px;" +
        "background:var(" + COLORS[i % COLORS.length] + ");" +
        "--dx:" + Math.cos(ang) * d * (1 + r.width / 520) + "px;--dy:" + (Math.sin(ang) * d - 18) + "px;--rot:" + (Math.random() * 540 - 270) + "deg;" +
        "animation-delay:" + (Math.random() * 60) + "ms", "", 1000);
    }
    add("cheer-ring", "left:" + cx + "px;top:" + cy + "px;width:" + Math.min(r.width, 260) + "px;height:" + Math.min(r.height, 120) + "px", "", 800);
  }
  function check(el) {
    var r = rectOf(el), s = Math.max(26, Math.min(38, r.height * .6));
    var x = Math.min(r.right - s - 8, vw() - s - 10), y = r.height > 100 ? r.top + 12 : r.top + (r.height - s) / 2;   /* 키 큰 칸(개념어 판정 상자)은 오른쪽 위에 */
    add("cheer-check", "left:" + x + "px;top:" + y + "px;width:" + s + "px;height:" + s + "px",
      '<svg viewBox="0 0 40 40"><circle class="c1" cx="20" cy="20" r="17"/><path class="c2" d="M11.5 20.5 L17.5 26.5 L29 14"/></svg>', 1500);
  }

  /* ── B 콤보 ── */
  function xpBar(prev, now) {
    var lvP = Math.floor(prev / XP_LV), lvN = Math.floor(now / XP_LV);
    var from = (prev % XP_LV) / XP_LV * 100, to = lvN > lvP ? 100 : (now % XP_LV) / XP_LV * 100;
    var n = add("cheer-xp", "", '<b class="lv">LV ' + (lvP + 1) + '</b><span class="tr"><i style="width:' + from + '%"></i></span><b class="pt">' + (now % XP_LV) + '</b>', 1500);
    var fill = n.querySelector("i"), lv = n.querySelector(".lv"), pt = n.querySelector(".pt");
    setTimeout(function () { fill.style.width = to + "%"; }, 40);
    if (lvN > lvP) setTimeout(function () {
      lv.textContent = "LV " + (lvN + 1); pt.textContent = (now % XP_LV); n.classList.add("up");
      fill.style.transition = "none"; fill.style.width = "0%"; void fill.offsetWidth;
      fill.style.transition = ""; fill.style.width = ((now % XP_LV) / XP_LV * 100) + "%";
    }, 520);
  }
  function floatXp(el) {
    var r = rectOf(el);
    add("cheer-float", "left:" + (r.left + r.width * .5) + "px;top:" + (r.top + 4) + "px", "+" + XP_PER + " XP", 1100);
  }
  function comboBadge(c) {
    var tier = c >= 10 ? 3 : c >= 5 ? 2 : c >= 3 ? 1 : 0;
    add("cheer-combo t" + tier, "", '<b>' + c + '</b><span>연속 정답</span>', 1250);
  }
  function flames(el, n) {
    var r = rectOf(el);
    for (var i = 0; i < n; i++) {
      var x = r.left + 10 + Math.random() * Math.max(10, r.width - 20), s = 10 + Math.random() * 14;
      add("cheer-flame", "left:" + x + "px;top:" + (r.top + 6) + "px;width:" + s + "px;height:" + s * 1.5 + "px;" +
        "--fy:" + (-(34 + Math.random() * 50)) + "px;--fx:" + (Math.random() * 24 - 12) + "px;" +
        "background:var(" + (i % 2 ? "--amber" : "--accent") + ");animation-delay:" + (Math.random() * 280) + "ms", "", 1100);
    }
  }

  /* ── C 도장 ── */
  function stamp() {
    add("cheer-flash", "", "", 520);
    add("cheer-stamp", "", '<span>정답</span>', 1250);
  }

  /* ── 공용 입구 ── */
  var lastOk = 0, lastEl = null;
  function ok(el, o) {
    o = o || {};
    HOST = (el && el.closest && el.closest("[data-cheer-host]")) || null;
    var now = Date.now(); if (now - lastOk < 250 && (!el || el === lastEl)) return; lastOk = now; lastEl = el;     /* 한 판정에 두 번 울리지 않게 */
    var k = KINDS.indexOf(o.kind) >= 0 ? o.kind : kind();
    var combo = typeof o.combo === "number" ? o.combo : num("terra.cheer.combo") + 1;
    ss("terra.cheer.combo", String(combo));
    var prevXp = num("terra.cheer.xp"), xp = prevXp + XP_PER; ss("terra.cheer.xp", String(xp));
    if (RM) {            /* 움직임 줄이기 — 체크 하나와 아주 짧은 소리만 */
      check(el); if (k === "b") floatXp(el); beep(combo); return;
    }
    buzz(combo >= 5 ? [16, 40, 16] : 18);
    beep(combo);
    if (k === "a") {
      cls(el, "bounce"); burst(el, 26, 1); check(el);
    } else if (k === "c") {
      stamp(); cls(el, "bounce"); check(el);
    } else {
      cls(el, "bounceS"); check(el); floatXp(el); xpBar(prevXp, xp);
      if (combo >= 2) comboBadge(combo);
      if (combo >= 5) { cls(el, "fire"); flames(el, combo >= 10 ? 16 : 9); }
      if (combo === 3 || combo === 5 || combo % 10 === 0) burst(el, 14, .8);
    }
  }
  function miss(el) {
    HOST = (el && el.closest && el.closest("[data-cheer-host]")) || null;
    var now = Date.now(); if (now - lastOk < 250 && el && el === lastEl) return; lastOk = now; lastEl = el;
    reset();
    if (RM) return;
    cls(el, "shake"); buzz(10); beepMiss();
  }

  /* ── 자동 감시: 방금 누른 단추에 data-s 가 달리는 것을 본다 ── */
  var lastClick = null, lastClickAt = 0;
  D.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("button,.opt,[data-v]") : null;
    if (b) { lastClick = b; lastClickAt = Date.now(); }
  }, true);
  function mine(t) {
    return !!lastClick && Date.now() - lastClickAt < 1500 && (t === lastClick || (t.contains && t.contains(lastClick)));
  }
  var picked = window.WeakSet ? new WeakSet() : { add: function () { }, has: function () { return false; }, delete: function () { } };
  function watch() {
    if (!window.MutationObserver) return;
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        var t = m.target, v = t.getAttribute && t.getAttribute("data-s");
        if (v === "pick") { picked.add(t); return; }     /* start.html 은 고른 뒤 「다음」 으로 확정한다 */
        if (!v) { picked.delete(t); return; }
        if (!(mine(t) || picked.has(t))) return;
        picked.delete(t);
        if (v === "ok") { lastClick = null; ok(t); }
        else if (v === "no") { lastClick = null; miss(t); }
      });
    }).observe(D.documentElement, { attributes: true, attributeFilter: ["data-s"], subtree: true });
  }
  watch();

  window.CHEER = { ok: ok, miss: miss, kind: kind, sound: sound, reset: reset, KINDS: KINDS,
    xp: function () { return num("terra.cheer.xp"); }, combo: function () { return num("terra.cheer.combo"); } };
})();

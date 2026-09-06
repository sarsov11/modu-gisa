/* 모두의 기사 — 공용 로직 (테라러닝)
 *
 * 종목이 달라도 이 파일은 같다. 바뀌는 것은 data.js(window.G) 뿐이다.
 * 기록은 종목별로 따로 쌓인다 — 키에 종목을 넣는다.
 *
 * 하루 루틴이 이 사이트의 뼈대다.
 *   · 오늘 몫은 '문항 수'로 말한다(분이 아니라). 몇 개 남았는지가 눈에 보여야 한다.
 *   · 틀린 문항은 사라지지 않는다. 간격을 두고 다시 나온다.
 *   · 오답은 실패가 아니라 재도전이다. 문구를 그렇게 쓴다.
 */
(function () {
  "use strict";
  var G = window.G || {};
  var KEY = "terra.gisa." + (G.종목 || "x") + ".v1";

  var 기본 = {
    설정: { 시험일: G.시험일 || "2027-03-07", 하루목표: 20, 알림시각: "20:00", 알림: 0, 스킨: "" },
    푼것: {},     // id → {o:맞음1/틀림0, t:날짜, n:푼횟수}
    날: {},       // "2026-09-01" → {n:푼수, o:맞은수}
    카드: {}      // 테마코드 → {본:본횟수, 맞:맞힌수, t:마지막날}
  };

  function 읽기() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(기본));
      var d = JSON.parse(raw);
      d.설정 = Object.assign({}, 기본.설정, d.설정 || {});
      d.푼것 = d.푼것 || {}; d.날 = d.날 || {}; d.카드 = d.카드 || {};
      return d;
    } catch (e) { return JSON.parse(JSON.stringify(기본)); }
  }
  function 쓰기(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }

  var S = 읽기();

  function 오늘() {
    var d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  }
  function 날짜차(a, b) { return Math.round((new Date(b) - new Date(a)) / 864e5); }

  /* ── 색인 ───────────────────────────────────────── */
  var 문항맵 = {}, 과목맵 = {}, 트리맵 = {}, 코드별문항 = {}, 과목별문항 = {};
  (G.문항 || []).forEach(function (q) {
    문항맵[q.i] = q;
    (과목별문항[q.s] = 과목별문항[q.s] || []).push(q);
    if (q.k) {
      (코드별문항[q.k] = 코드별문항[q.k] || []).push(q);
      var 갈 = q.k.split('.').slice(0, 2).join('.');   // S1.2.3 → S1.2
      (코드별문항[갈] = 코드별문항[갈] || []).push(q);
    } else if (q.km) {
      // 세부항목은 못 믿지만 갈래는 아는 문항. 갈래로 풀 때는 같이 나온다.
      (코드별문항[q.km] = 코드별문항[q.km] || []).push(q);
    }
  });
  (G.과목 || []).forEach(function (s) { 과목맵[s.n] = s; });
  (G.트리 || []).forEach(function (n) { 트리맵[n.k] = n; });

  /* ── 난이도 — 정답률이 실측이다 ────────────────────
   * 정답률 45% 밑을 '킬러'로 본다. 통합과학에서 쓴 기준(오답률 45% 이상)과 같다. */
  function 난이도(q) {
    if (q.r == null) return "보통";
    if (q.r < 45) return "킬러";
    if (q.r < 65) return "어려움";
    if (q.r < 85) return "보통";
    return "쉬움";
  }

  /* ── 복습 간격 — 틀린 문항은 다시 온다 ─────────────
   * 1일 → 3일 → 7일 → 21일. 맞을 때마다 한 칸 올라간다. */
  var 간격 = [1, 3, 7, 21, 60];
  function 다시올때(rec) {
    if (!rec) return 0;
    var 칸 = Math.min(간격.length - 1, Math.max(0, (rec.s || 0)));
    return 날짜차(rec.t, 오늘()) >= 간격[칸] ? 0 : 간격[칸] - 날짜차(rec.t, 오늘());
  }

  /* ── 오늘 낼 문항 고르기 ───────────────────────────
   * ① 오늘 다시 볼 때가 된 오답  ② 아직 안 푼 것 중 약한 과목 우선
   * 약한 과목 = 정답률이 낮은 과목. 없으면 문항 수가 많은 과목. */
  function 과목성적() {
    var out = {};
    (G.과목 || []).forEach(function (s) {
      var 푼 = 0, 맞 = 0;
      (과목별문항[s.n] || []).forEach(function (q) {
        var r = S.푼것[q.i]; if (r) { 푼++; if (r.o) 맞++; }
      });
      out[s.n] = { 푼: 푼, 맞: 맞, 전체: (과목별문항[s.n] || []).length,
                   율: 푼 ? Math.round(맞 * 100 / 푼) : null };
    });
    return out;
  }

  function 오늘문항(수) {
    수 = 수 || S.설정.하루목표;
    var 성적 = 과목성적(), 뽑음 = [], 본 = {};
    var 복습 = [];
    Object.keys(S.푼것).forEach(function (id) {
      var r = S.푼것[id];
      if (!문항맵[id]) return;
      if (!r.o || (r.s || 0) < 2) { if (다시올때(r) === 0) 복습.push(문항맵[id]); }
    });
    복습.sort(function (a, b) { return (S.푼것[a.i].o || 0) - (S.푼것[b.i].o || 0); });
    복습.slice(0, Math.ceil(수 * 0.4)).forEach(function (q) { if (!본[q.i]) { 본[q.i] = 1; 뽑음.push(q); } });

    var 과목순 = (G.과목 || []).slice().sort(function (a, b) {
      var ra = 성적[a.n].율, rb = 성적[b.n].율;
      if (ra == null && rb == null) return 0;
      if (ra == null) return -1;
      if (rb == null) return 1;
      return ra - rb;
    });
    var i = 0;
    while (뽑음.length < 수 && i < 400) {
      var s = 과목순[i % 과목순.length];
      var 후보 = (과목별문항[s.n] || []).filter(function (q) { return !S.푼것[q.i] && !본[q.i]; });
      if (후보.length) {
        var q = 후보[Math.floor(Math.random() * 후보.length)];
        본[q.i] = 1; 뽑음.push(q);
      }
      i++;
    }
    return 뽑음.slice(0, 수);
  }

  function 채점(id, 고른것) {
    var q = 문항맵[id]; if (!q) return null;
    var 맞음 = (고른것 === q.a) ? 1 : 0;
    var 전 = S.푼것[id];
    S.푼것[id] = { o: 맞음, t: 오늘(), n: ((전 && 전.n) || 0) + 1,
                  s: 맞음 ? Math.min(4, ((전 && 전.s) || 0) + 1) : 0 };
    var d = S.날[오늘()] = S.날[오늘()] || { n: 0, o: 0 };
    d.n++; if (맞음) d.o++;
    쓰기(S);
    return 맞음;
  }

  function 루틴() {
    var d = S.날[오늘()] || { n: 0, o: 0 };
    var 목표 = S.설정.하루목표;
    return { 푼수: d.n, 맞은수: d.o, 목표: 목표,
             남은: Math.max(0, 목표 - d.n), 끝: d.n >= 목표,
             연속: 연속일() };
  }
  function 연속일() {
    var n = 0, d = new Date();
    for (var i = 0; i < 400; i++) {
      var k = new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
      if (S.날[k] && S.날[k].n > 0) n++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  function 디데이() {
    var n = 날짜차(오늘(), S.설정.시험일);
    return n;
  }

  /* 알림 문구 — 매일 같은 말이면 무시하게 된다 */
  function 알림문구() {
    var r = 루틴();
    if (r.끝) return { t: "오늘 몫 끝냈어요", b: "연속 " + r.연속 + "일. 내일도 이 시간에." };
    if (r.푼수 > 0) return { t: r.남은 + "문제만 더", b: "오늘 " + r.푼수 + "개 했어요. 금방 끝나요." };
    return { t: "오늘 " + r.목표 + "문제", b: "10분이면 됩니다. 지금 시작할까요?" };
  }

  window.T = {
    G: G, S: S, 저장: function () { 쓰기(S); }, 오늘: 오늘,
    문항맵: 문항맵, 과목맵: 과목맵, 트리맵: 트리맵,
    과목별문항: 과목별문항, 코드별문항: 코드별문항,
    난이도: 난이도, 과목성적: 과목성적, 오늘문항: 오늘문항, 티어단계: 티어단계,
    채점: 채점, 루틴: 루틴, 디데이: 디데이, 알림문구: 알림문구,
    티어: 티어, 오늘갈래: 오늘갈래,
    카드본것: 카드본것, 카드기록: 카드기록, 오늘카드: 오늘카드,
    routine: function () {   /* notify.js 가 부르는 이름 */
      var r = 루틴(), m = 알림문구();
      return { done: r.끝, goal: r.목표, spent: r.푼수,
               items: [{ title: m.t, say: m.b }] };
    }
  };

  /* ── 개념 카드 ──────────────────────────────────────────
   * 카드는 **이해도를 안 움직인다.** 읽은 것과 푼 것을 같이 세면
   * 넘기기만 해도 실력이 오른 것처럼 보인다(통사에서 이미 정한 원칙).
   * 카드는 "봤다/안 봤다"와 확인 정답만 남기고, 티어·성적은 문항으로만 찬다.
   */
  function 카드본것() { return S.카드 || {}; }

  function 카드기록(코드, 맞았나) {
    if (!코드) return null;
    var c = S.카드[코드] || { 본: 0, 맞: 0, t: "" };
    c.본 += 1;
    if (맞았나) c.맞 += 1;
    c.t = 오늘();
    S.카드[코드] = c;
    쓰기(S);
    return c;
  }

  /* 오늘 볼 카드 한 묶음 — 학생에게 고르게 하지 않는다.
     등급이 높고 아직 안 본 테마부터 하나. 다 봤으면 가장 오래된 것. */
  function 오늘카드() {
    var C = window.CARDS || {}, 순 = { S: 0, A: 1, B: 2, C: 3 };
    var 키 = Object.keys(C);
    if (!키.length) return null;
    // 그림이 한 장도 없는 테마는 홈에 안 건다 — "카드 보기" 단추만 덩그러니 남아
    // 눌러 볼 마음이 안 든다. 그림이 다 차면 이 걸러내기는 아무 일도 안 한다.
    function 그림있나(k) {
      return (C[k].카드 || []).some(function (c) { return c.그림파일; });
    }
    var 그림찬것 = 키.filter(그림있나);
    if (그림찬것.length) 키 = 그림찬것;
    var 안본 = 키.filter(function (k) { return !(S.카드 || {})[k]; });
    var 고름;
    if (안본.length) {
      안본.sort(function (a, b) { return (순[C[a].등급] || 9) - (순[C[b].등급] || 9); });
      고름 = 안본[0];
    } else {
      키.sort(function (a, b) {
        return String((S.카드[a] || {}).t || "").localeCompare(String((S.카드[b] || {}).t || ""));
      });
      고름 = 키[0];
    }
    return { 코드: 고름, 이름: C[고름].이름, 등급: C[고름].등급,
             과목: C[고름].과목, 장수: (C[고름].카드 || []).length,
             본적: !!(S.카드 || {})[고름] };
  }

  /* 스킨 */
  if (S.설정.스킨) document.documentElement.setAttribute("data-skin", S.설정.스킨);

  /* ── 티어 ────────────────────────────────────────────────
   * 푼 양만으로 올리면 아무 생각 없이 넘겨도 오르고, 정답률만 보면 조금 풀고 멈춘다.
   * 둘을 곱해 '제대로 푼 문항 수'로 센다. 실점(강등)은 없다 — 재도전으로만 프레임한다.
   */
  var 티어표 = [
    { 이름: "브론즈", 배지: "배지_브론즈.webp", 점수: 0 },
    { 이름: "실버", 배지: "배지_실버.webp", 점수: 150 },
    { 이름: "골드", 배지: "배지_골드.webp", 점수: 450 },
    { 이름: "플래티넘", 배지: "배지_플래티넘.webp", 점수: 1000 },
    { 이름: "다이아", 배지: "배지_다이아.webp", 점수: 2000 }
  ];

  function 티어단계() { return 티어표; }

  function 티어() {
    var 푼 = 0, 맞 = 0;
    for (var k in S.푼것) { 푼++; if (S.푼것[k].o) 맞++; }
    var 율 = 푼 ? 맞 / 푼 : 0;
    var 점 = Math.round(맞 * (0.5 + 율 / 2));      // 맞힌 수 × 정확도 보정
    var i = 0;
    for (var j = 0; j < 티어표.length; j++) if (점 >= 티어표[j].점수) i = j;
    var 다음 = 티어표[i + 1] || null;
    return {
      이름: 티어표[i].이름, 배지: 티어표[i].배지, 점수: 점, 단계: i,
      다음이름: 다음 ? 다음.이름 : null,
      남은점수: 다음 ? 다음.점수 - 점 : 0,
      진행: 다음 ? Math.min(100, Math.round((점 - 티어표[i].점수) * 100 /
             (다음.점수 - 티어표[i].점수))) : 100,
      푼: 푼, 맞: 맞, 율: 푼 ? Math.round(율 * 100) : null
    };
  }

  /* 오늘 팔 갈래 하나 — 홈에 그림을 걸기 위한 것.
     오늘 낼 문항이 가장 많이 걸린 갈래를 고른다(없으면 첫 갈래). */
  function 오늘갈래() {
    var qs = 오늘문항(20), c = {};
    qs.forEach(function (q) {
      if (!q.k) return;
      var g = q.k.split(".").slice(0, 2).join(".");
      c[g] = (c[g] || 0) + 1;
    });
    var 최고 = null;
    for (var g in c) if (!최고 || c[g] > c[최고]) 최고 = g;
    if (!최고 && (G.트리 || []).length) 최고 = G.트리[0].k.split(".").slice(0, 2).join(".");
    if (!최고) return null;
    var 노드 = (G.트리 || []).filter(function (n) { return n.k.indexOf(최고 + ".") === 0; });
    return {
      코드: 최고, 갈래: 노드.length ? 노드[0].m : "",
      과목: 노드.length ? (G.과목[(노드[0].s || 1) - 1] || {}).name : "",
      그림: (G.삽화 || {})[최고] || null,
      문항수: c[최고] || 0, 세부: 노드.map(function (n) { return n.d; })
    };
  }
})();

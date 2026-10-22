/* 모두의기사 2판 — 기록 · 복습 간격 · 오늘 루틴 · 과목 성적 · 내비
 *
 * 모두의 통사 store.js 의 **원칙만** 옮겼다(2천 줄을 통째로 가져오지 않는다).
 *
 *   · 학생에게 고르게 하지 않는다 — 홈은 오늘 루틴(O·X → 개념 → 문제풀이 → 복습)을 정해 준다
 *   · 틀린 문장은 사라지지 않는다 — 1·3·7·21일 간격으로 다시 온다
 *   · 확신하고 맞힌 것만 칸을 올린다 — 확신을 안 고르면 「확실」 아님으로 쓴다
 *   · 한 세션에 같은 기출의 다른 선지를 두 번 내지 않는다([[exam-cross-item-answer-leak]])
 *   · 과락(40점)은 기사·산업기사만. 기능사는 단일 60점이라 과락 없음
 *
 * 1005 UX: 첫 설정·진단(start.html), 오늘 루틴(GS.루틴), 합격 가늠(GS.가늠), 전략·방어 가중.
 */
(function () {
  "use strict";
  var D = window.GD || { 테마: [], ox: [], qs: {}, cards: {} };
  var KEY = "modugisa2." + (D.종목 || "x");
  var 간격 = [0, 1, 3, 7, 21, 60];          // 칸별로 다시 오기까지 날 수
  var 이름 = D.종목 || "";
  var 갈래 = (/기능사/.test(이름) || /^(미용사|이용사)/.test(이름)) ? "기능사" : (/산업기사/.test(이름) ? "산업기사" : "기사");
  var 과락있음 = 갈래 !== "기능사";
  /* 1021 하루 목표 — 기사 시험은 하루 몇 시간 단위로 공부한다(수험가 영상 실측: 전기기사·정보처리기사 평일 1.5~4시간,
     전기기사 합격수기 300건 필기 준비 50~70일). 예전 5·10·15·20·30분 선택은 쓰지 않는다. */
  var 분선택 = 갈래 === "기능사" ? [30, 60, 90, 120] : [60, 90, 120, 180, 240];
  var 기본분 = 갈래 === "기능사" ? 60 : (갈래 === "산업기사" ? 90 : 120);
  function 분글(m) { return m < 60 ? m + "분" : (m % 60 ? Math.floor(m / 60) + "시간 " + (m % 60) + "분" : (m / 60) + "시간"); }
  var 화면 = D.화면 || [];                    // 앱생성이 앱공용에 있는 quiz.html·exam.html 을 적어 준다
  var 표본 = 8;                               // 과목 정답률을 믿기 시작하는 푼 문장 수

  function 오늘() {
    var d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  }
  function 날더하기(날, n) {
    var d = new Date(날 + "T00:00:00"); d.setDate(d.getDate() + n);
    return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  }
  function 읽기() {
    var s = {};
    try { s = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { s = {}; }
    s.ox = s.ox || {}; s.테마 = s.테마 || {}; s.날 = s.날 || {}; s.카드 = s.카드 || {};
    if (s.시험일 === undefined) s.시험일 = D.시험일 || "";
    // 1013: 예전에 기본값으로 들어간 2027-03-07 은 근거 없는 날짜였다 → 새 예상일로 바꾼다
    if (s.시험일 === "2027-03-07" && D.시험일 && D.시험일 !== "2027-03-07") s.시험일 = D.시험일;
    // 1021: 5~30분 시절에 고른 값은 한 번만 시험별 기본값으로 올린다
    if (!s.목표판 || s.목표판 < 1021) { if (!s.목표분 || s.목표분 < 30) s.목표분 = 기본분; s.목표판 = 1021; }
    s.목표분 = s.목표분 || 기본분;
    if (!s.시작 && Object.keys(s.ox).length) s.시작 = "기존";     // 이미 쓰던 사람은 첫 설정을 다시 안 거친다
    return s;
  }
  var S = 읽기();
  function 쓰기() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  /* ── 색인 ── */
  var 테마맵 = {}, 테마별 = {}, oxMap = {};
  D.테마.forEach(function (t) { 테마맵[t.k] = t; 테마별[t.k] = []; });
  D.ox.forEach(function (o) { oxMap[o.i] = o; if (테마별[o.k]) 테마별[o.k].push(o); });
  var 순 = { S: 0, A: 1, B: 2, C: 3 };

  function 깨끗(s) {                           // 문장 앞 원 선지 번호(①③…) 떼기
    return String(s == null ? "" : s).replace(/^\s*[①-⑳❶-❿⓫-⓴]\s*/, "");
  }
  function 있다(f) { return 화면.indexOf(f) >= 0; }

  /* ── 숙련도 — 그 테마 최근 10번의 정답률. 4번 안 됐으면 null ── */
  function 숙련(k) {
    var r = (S.테마[k] || {}).r || [];
    if (r.length < 4) return null;
    var 뒤 = r.slice(-10), 맞 = 0;
    뒤.forEach(function (x) { if (x) 맞++; });
    return 맞 / 뒤.length;
  }
  function 연속오답(k) {
    var r = (S.테마[k] || {}).r || [], n = 0;
    for (var i = r.length - 1; i >= 0 && !r[i]; i--) n++;
    return n;
  }
  function 다시볼것(k) {
    var 날 = 오늘();
    return (k ? 테마별[k] || [] : D.ox).filter(function (o) {
      var x = S.ox[o.i]; return x && x.다음 && x.다음 <= 날;
    });
  }
  function 옥수(k) { return (테마별[k] || []).length; }
  /* 1013: 개념 화면은 손 카드나 O·X 문장이 있어야 열린다. 문제풀이만 있는 테마에 개념 링크를 걸면 빈 화면이 나왔다 */
  function 개념있음(k) { return ((D.cards || {})[k] || []).length > 0 || 옥수(k) > 0; }
  function 모의필요() {                                          // 모의고사 화면이 있고 최근 7일 응시 기록이 없으면 칩을 띄운다
    if (!있다("exam.html")) return false;
    var 모 = S.모의 || [], 끝 = 모.length ? 모[모.length - 1].ts : 0;
    return !끝 || Date.now() - 끝 > 7 * 864e5;
  }
  function 본적있나(k) { return !!(S.테마[k] && (S.테마[k].r || []).length); }
  function 푼수(k) { return ((S.테마[k] || {}).r || []).length; }

  /* ── 과목 성적 · 전략/방어 · 합격 가늠 ───────────────
     과목 = 테마의 s(기출 과목). 전략·방어는 출제기준 과목(D.기준)에 앱생성이 단 표시를
     그 과목에 속한 테마들의 과목 이름(다수결)으로 옮겨 온다. 과목이 2개 이상일 때만(기능사는 중단원에 달려 있어 안 옮긴다).
     O·X 정답률 p → 시험 점수 환산: 찍기(p=.5)가 4지선다 찍기(.25)에 닿게 0.25+0.75·(2p−1). */
  var 캐시 = null, 역할캐시 = null;
  function 통계() {
    if (캐시) return 캐시;
    var 합 = {};
    D.테마.forEach(function (t) {
      var a = 합[t.s] = 합[t.s] || { 푼: 0, 맞: 0, w: 0 };
      a.w += t.c || 0;
      ((S.테마[t.k] || {}).r || []).forEach(function (x) { a.푼++; if (x) a.맞++; });
    });
    return (캐시 = 합);
  }
  function 환산(p) { return 0.25 + 0.75 * Math.max(0, 2 * p - 1); }
  function 과목추정(s) { var a = 통계()[s]; return a && a.푼 >= 표본 ? 환산(a.맞 / a.푼) : null; }
  function 역할() {
    if (역할캐시) return 역할캐시;
    var 맵 = {}, 기준 = (D.기준 || []).filter(function (sj) { return !sj.밖; });
    if (기준.length >= 2) {
      기준.forEach(function (sj) {
        if (!sj.역할) return;
        var 수 = {}, 최다 = null;
        sj.m.forEach(function (m) { m.s.forEach(function (x) { x.t.forEach(function (c) {
          var t = 테마맵[c]; if (t) 수[t.s] = (수[t.s] || 0) + 1; }); }); });
        Object.keys(수).forEach(function (s) { if (!최다 || 수[s] > 수[최다]) 최다 = s; });
        if (최다 && !맵[최다]) 맵[최다] = { 역할: sj.역할, 률: sj.률, 이름: sj.n };
      });
    }
    return (역할캐시 = 맵);
  }
  function 진단약함(s) { return !!(S.진단 && S.진단.약 && S.진단.약.indexOf(s) >= 0); }
  function 과목표() {
    var 통 = 통계(), 맵 = 역할();
    return Object.keys(통).sort(function (a, b) { return 통[b].w - 통[a].w; }).map(function (s) {
      var a = 통[s], e = 과목추정(s), r = 맵[s];
      return { s: s, 푼: a.푼, p: a.푼 >= 표본 ? Math.round(a.맞 * 100 / a.푼) : null,
               역할: r ? r.역할 : "", 률: r ? r.률 : null, 과락위험: false };
    });
  }
  /* 합격 가늠 — 실제 시험 형식의 기록만 쓴다(O·X 환산은 쓰지 않는다).
     ① S.모의(최근 3회 평균, 과목별 점수)  ② 없으면 S.기출(문제풀이 4지선다, 과목별 8문 이상)
     둘 다 모자라면 null — 가늠·과락 마크를 숨긴다. 과목 이름은 문제풀이 쪽(GQ.S) 기준. */
  var 과목맵캐시 = null;
  function 기출과목() {
    if (과목맵캐시) return 과목맵캐시;
    if (!window.GQ || !GQ.Q) return null;
    var m = {}; GQ.Q.forEach(function (r) { m[r[0]] = GQ.S[r[1]]; });
    return (과목맵캐시 = m);
  }
  function 시험성적() {
    /* 답한 문항이 절반 미만인 모의(중도 제출)는 실력 추정에서 뺀다(2026-10-11 외부 검수 부가) */
    var 모 = (S.모의 || []).filter(function (r) { return r.답 == null || r.답 * 2 >= r.총문; }).slice(-3), 합 = {}, i;
    if (모.length) {
      모.forEach(function (r) { (r.과목 || []).forEach(function (g) {
        var a = 합[g.n] = 합[g.n] || { 점: 0, n: 0 }; a.점 += g.점; a.n++; }); });
      var 결 = {}; Object.keys(합).forEach(function (n) { 결[n] = Math.round(합[n].점 / 합[n].n); });
      return { 출처: "모의", 회: 모.length, 과목: 결, 총과목: Object.keys(결).length };
    }
    var 기 = S.기출 || {}, 키 = Object.keys(기), 맵 = 키.length ? 기출과목() : null;
    if (!맵) return null;
    var 집 = {};
    키.forEach(function (id) { var sj = 맵[id]; if (!sj) return; var a = 집[sj] = 집[sj] || { 푼: 0, 맞: 0 }; a.푼++; if (기[id].맞) a.맞++; });
    var 결2 = {}, 총 = (GQ.S || []).length || Object.keys(집).length;
    Object.keys(집).forEach(function (n) { if (집[n].푼 >= 표본) 결2[n] = Math.round(집[n].맞 * 100 / 집[n].푼); });
    return { 출처: "기출", 과목: 결2, 총과목: 총 };
  }
  function 가늠() {
    var r = 시험성적(); if (!r) return null;
    var 키 = Object.keys(r.과목); if (!키.length || 키.length < r.총과목 * 0.6) return null;   // 표본 부족 — 숨김
    var 합 = 0, 위험 = [];
    키.forEach(function (n) { 합 += r.과목[n]; if (과락있음 && r.과목[n] < 40) 위험.push(n); });
    return { 점: Math.round(합 / 키.length), 선: 60, 과락: 위험, 과락있음: 과락있음, 출처: r.출처, 과목: r.과목,
             측정: 키.length, 총과목: r.총과목, 일부: 키.length < r.총과목 };   // 일부 = 측정 안 된 과목이 있다 — 전체 시험 가늠으로 읽히지 않게 표시
  }
  function 가중(t) {                                             // 작을수록 먼저
    var e = 과목추정(t.s), r = 역할()[t.s], adj = 0;
    if (과락있음 && e != null && e < 0.4) adj -= 3;               // 과락 위험 과목 — 최우선
    else if (과락있음 && r && r.역할 === "방어" && (e == null || e < 0.5)) adj -= 2;   // 방어 과목 — 과락선 넘을 때까지
    else if (r && r.역할 === "전략") adj -= 1;                    // 전략 과목 — 고득점
    if (진단약함(t.s)) adj -= 3;                                  // 진단에서 가장 약했던 과목 — 첫 할 일
    return 순[t.g] + adj;
  }

  /* ── 오늘 할 테마 ───────────────────────────────
     ① 시작했는데 아직 70% 가 안 되는 테마  ② 아직 4번 안 푼 테마. 둘 다 가중(과락·방어·전략·진단) 순. */
  /* 테마에서 실제로 낼 수 있는 고유 기출 수 — 세션은 같은 기출을 한 번만 낸다(o.q).
     O·X 문장 수로 후보를 고르면 고유 기출 2개짜리 테마가 추천됐다(2026-10-11 외부 검수 C) */
  var 고유캐시 = {};
  function 고유기출(k) {
    if (고유캐시[k] != null) return 고유캐시[k];
    var m = {}; (테마별[k] || []).forEach(function (o) { if (!o.x) m[o.q] = 1; });
    return (고유캐시[k] = Object.keys(m).length);
  }
  function 테마고르기(제외) {
    제외 = 제외 || [];
    var 후보 = D.테마.filter(function (t) { return !t.x && 고유기출(t.k) >= 4 && 제외.indexOf(t.k) < 0; });
    var 약한 = 후보.filter(function (t) {
      var m = 숙련(t.k); return 본적있나(t.k) && m != null && m < 0.7;
    }).sort(function (a, b) { return (가중(a) - 가중(b)) || (숙련(a.k) - 숙련(b.k)); });
    if (약한.length) return { 종류: "약점", k: 약한[0].k, 이름: 약한[0].n, t: 약한[0] };
    var 새 = 후보.filter(function (t) { return 푼수(t.k) < 4; })
      .sort(function (a, b) { return (가중(a) - 가중(b)) || (b.c - a.c); });
    if (새.length) return { 종류: "새", k: 새[0].k, 이름: 새[0].n, t: 새[0] };
    var 아무 = 후보.sort(function (a, b) { return (숙련(a.k) || 0) - (숙련(b.k) || 0); })[0];
    return 아무 ? { 종류: "약점", k: 아무.k, 이름: 아무.n, t: 아무 } : null;
  }
  function 오늘할것() {
    var 복습 = 다시볼것();
    if (복습.length >= 8) return { 종류: "복습", n: 복습.length, 이름: "다시 볼 문장", k: null };
    var 할 = 테마고르기();
    if (할) return 할;
    return 복습.length ? { 종류: "복습", n: 복습.length, 이름: "다시 볼 문장", k: null } : null;
  }

  /* ── 오늘 루틴 ──────────────────────────────────
     O·X 세트 → 개념 → (문제풀이) → 복습. 하루 목표 분만큼 앞에서부터 채운다.
     문제풀이(quiz.html)는 앱에 있을 때만 들어간다. S.플로 = { 날, k, items, done, 쓴, 목표, 화면 } */
  var 분 = { ox: 5, card: 2, quiz: 6, review: 3 };
  function 항목(id, 종류, k, 이름) {
    var 주소 = 종류 === "review" ? "ox.html?review=1"
      : (종류 === "ox" ? "ox.html" : (종류 === "card" ? "card.html" : "quiz.html")) + "?k=" + encodeURIComponent(k);
    return { id: id, 종류: 종류, 분: 분[종류], k: k, 이름: 이름, 주소: 주소 };
  }
  function 만들기(쓴) {
    쓴 = 쓴 || [];
    var 복 = 다시볼것(), 할 = 테마고르기(쓴) || 테마고르기([]);
    var 후 = [], 목표 = S.목표분 || 기본분, q = 있다("quiz.html");
    if (복.length >= 8) 후.push(항목("review", "review"));
    if (할) {
      후.push(항목("ox", "ox", 할.k, 할.이름), 항목("card", "card", 할.k, 할.이름));
      if (q) 후.push(항목("quiz", "quiz", 할.k, 할.이름));
    }
    if (복.length && 복.length < 8) 후.push(항목("review", "review"));
    if (할) {                                                    // 더 하면 다른 테마 O·X(같은 테마는 문제풀이만 한 번 더)
      var 둘 = 테마고르기(쓴.concat([할.k])), 셋 = 둘 && 테마고르기(쓴.concat([할.k, 둘.k]));
      후.push(항목("ox2", "ox", (둘 || 할).k, (둘 || 할).이름));
      if (q) 후.push(항목("quiz2", "quiz", 할.k, 할.이름));
      후.push(항목("ox3", "ox", (셋 || 둘 || 할).k, (셋 || 둘 || 할).이름));
    }
    // 1021: 하루 목표가 1~4시간이라 테마 세 개로는 모자란다 — 목표만큼 다음 테마(O·X → 개념 → 문제풀이)를 이어 붙인다(최대 20테마)
    if (할) {
      var 합 = 후.reduce(function (a, x) { return a + x.분; }, 0), 쓴테마 = 쓴.concat([할.k]).concat(둘 ? [둘.k] : []).concat(셋 ? [셋.k] : []), 더 = 0;
      while (합 < 목표 && 더 < 20) {
        var 다음 = 테마고르기(쓴테마); if (!다음) break;
        쓴테마.push(다음.k); 더++;
        [["ox", "ox"], ["card", "card"]].concat(q ? [["quiz", "quiz"]] : []).forEach(function (z) {
          var it = 항목(z[0] + "_" + 더, z[1], 다음.k, 다음.이름); 후.push(it); 합 += it.분;
        });
      }
    }
    var items = [], sum = 0;
    for (var i = 0; i < 후.length; i++) {
      /* 다음 세트를 더하면 목표에서 더 멀어지면 거기서 멈춘다 — 15분 목표에 18분짜리 루틴이 나오던 것을 막음(2026-10-13 외부 검수 E) */
      if (items.length && Math.abs(sum + 후[i].분 - 목표) >= Math.abs(sum - 목표)) break;
      items.push(후[i]); sum += 후[i].분;
      if (sum >= 목표) break;
    }
    return { 날: 오늘(), k: 할 ? 할.k : null, items: items, done: [], 쓴: 쓴.slice(), 목표: 목표, 화면: 화면.join(",") };
  }
  function 플로() {
    var F = S.플로;
    if (!F || F.날 !== 오늘() || !F.items || (F.done.length === 0 && (F.목표 !== (S.목표분 || 기본분) || F.화면 !== 화면.join(",")))) {
      S.플로 = F = 만들기(F && F.날 === 오늘() ? F.쓴 : []);
      쓰기();
    }
    return F;
  }
  function 루틴() {
    var F = 플로(), 다음 = null, d = S.날[오늘()] || {};
    for (var i = 0; i < F.items.length; i++) if (F.done.indexOf(F.items[i].id) < 0) { 다음 = F.items[i]; break; }
    /* ★ 예상 분량과 실제 사용 시간을 나눈다(2026-10-11 외부 검수 E). 예상 = 끝낸 세트의 표준 분(d.fm),
       실제 = 세트·시험 화면이 보이고 2분 안에 손을 댄 시간(d.am, 15초 단위). 통계에는 실제만 쓴다 */
    var 예상 = 0; F.items.forEach(function (x) { 예상 += x.분; });
    var 실제분 = Math.round((d.am || 0) / 60), 목표 = S.목표분 || 기본분;
    return { k: F.k, t: F.k ? 테마맵[F.k] : null, items: F.items, done: F.done, 다음: 다음, 완료: !다음,
             처음: F.done.length === 0, 오늘분: 실제분, 실제분: 실제분, 예상분: 예상, 완료세트: F.done.length,
             목표분: 목표, 남은: Math.max(0, 목표 - 실제분) };
  }
  /* 실제 사용 시간 — 세트·시험 화면에서, 탭이 보이고, 마지막 조작 뒤 2분 안일 때만 15초씩 쌓는다.
     홈·설정에 머문 시간과 탭을 숨긴 시간, 2분 넘게 손을 안 댄 시간은 빠진다(2026-10-13 외부 검수 E) */
  var 학습화면 = /\/(ox|card|quiz|exam|silgi)\.html/.test(location.pathname);
  var 손 = Date.now();
  ["pointerdown", "keydown", "touchstart", "scroll"].forEach(function (ev) {
    try { window.addEventListener(ev, function () { 손 = Date.now(); }, { passive: true, capture: true }); } catch (e) {}
  });
  setInterval(function () {
    if (!학습화면 || document.hidden || Date.now() - 손 > 120000) return;
    var 날 = 오늘(), d = S.날[날] = S.날[날] || { n: 0, ok: 0, ms: 0 };
    d.am = (d.am || 0) + 15; 쓰기();
  }, 15000);
  function 루틴완료(종류, k) {
    var F = 플로(), it = null;
    for (var i = 0; i < F.items.length; i++) {
      var x = F.items[i];
      if (F.done.indexOf(x.id) >= 0 || x.종류 !== 종류) continue;
      if (종류 === "review" || !k || x.k === k) { it = x; break; }
    }
    if (!it) return false;
    F.done.push(it.id);
    var 날 = 오늘(), d = S.날[날] = S.날[날] || { n: 0, ok: 0, ms: 0 };
    d.fm = (d.fm || 0) + it.분;
    쓰기();
    return true;
  }
  function 더하기() {                                            // 오늘 목표 뒤에 한 세트 더 — 다른 테마로 새 루틴
    var F = 플로(), 쓴 = (F.쓴 || []).concat(F.items.map(function (x) { return x.k; }).filter(Boolean));
    S.플로 = 만들기(쓴); 쓰기();
  }
  function 라벨(it) {
    if (!it) return "";
    var 이 = it.이름 || "";
    if (it.종류 === "review") return "복습 " + 다시볼것().length;
    if (it.종류 === "card") return "개념 · " + 이;
    if (it.종류 === "quiz") return "문제풀이 · " + 이 + (/2$/.test(it.id) ? " 한 번 더" : "");
    return 이 + " O·X" + ((it.id !== "ox" && it.k === (S.플로 || {}).k) ? " 한 번 더" : "");
  }
  function 큰단추(R) {                                           // 「시작: …」「다음: …」 한 줄 이름표
    R = R || 루틴();
    if (!R.다음) return "오늘 목표 완료";
    return (R.처음 ? "시작: " : "다음: ") + 라벨(R.다음) + " (" + R.다음.분 + "분)";
  }
  function 최근테마() {
    if (S.최근 && 테마맵[S.최근.k]) return S.최근.k;
    var R = 루틴(); if (R.k) return R.k;
    var 할 = 오늘할것(); return 할 && 할.k ? 할.k : (D.테마[0] || {}).k;
  }

  /* ── 한 세션 뽑기 — 12문장 ─────────────────────
     다시 볼 것 → 아직 안 본 것 → 틀린 적 있는 것 순. 같은 기출은 한 번만. */
  function 섞기(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    } return a;
  }
  function 세션(k, 수) {
    수 = 수 || 12;
    var 풀 = k ? (테마별[k] || []) : D.ox.filter(function (o) { return !o.x; }), 날 = 오늘();
    var 다시 = 섞기(풀.filter(function (o) { var x = S.ox[o.i]; return x && x.다음 && x.다음 <= 날; }));
    var 새 = 섞기(풀.filter(function (o) { return !S.ox[o.i]; }));
    var 틀린 = 섞기(풀.filter(function (o) { var x = S.ox[o.i]; return x && !x.맞 && !(x.다음 && x.다음 <= 날); }));
    var 나머지 = 섞기(풀.slice());
    var 뽑음 = [], 쓴기출 = {}, 쓴문장 = {};
    [다시, 새, 틀린, 나머지].forEach(function (무더기) {
      무더기.forEach(function (o) {
        if (뽑음.length >= 수 || 쓴기출[o.q] || 쓴문장[o.i]) return;
        쓴기출[o.q] = 1; 쓴문장[o.i] = 1; 뽑음.push(o);
      });
    });
    return 뽑음;
  }

  /* ── 진단 — 과목마다 고르게 n문장(테마·기출 겹치지 않게) ── */
  function 진단뽑기(n) {
    n = n || 10;
    var by = {}, 과목 = [];
    D.ox.forEach(function (o) {
      var t = 테마맵[o.k]; if (!t || o.x) return;
      if (!by[t.s]) { by[t.s] = {}; 과목.push(t.s); }
      (by[t.s][o.k] = by[t.s][o.k] || []).push(o);
    });
    과목.sort(function (a, b) { return Object.keys(by[b]).length - Object.keys(by[a]).length; });
    var 줄 = 과목.map(function (s) {
      return Object.keys(by[s]).sort(function (a, b) {
        return (순[테마맵[a].g] + Math.random() * 1.5) - (순[테마맵[b].g] + Math.random() * 1.5);
      });
    });
    var 뽑음 = [], 쓴기출 = {}, 헛 = 0, i = 0;
    while (뽑음.length < n && 과목.length && 헛 < 과목.length * 3) {
      var j = i % 과목.length; i++;
      var 칸 = 줄[j];
      if (!칸.length) { 헛++; continue; }
      var k = 칸.shift();
      var 후 = 섞기(by[과목[j]][k].slice()).filter(function (o) { return !쓴기출[o.q]; });
      if (!후.length) { 헛++; continue; }
      쓴기출[후[0].q] = 1; 뽑음.push(후[0]); 헛 = 0;
    }
    return 뽑음;
  }
  function 진단결과(과목맵) {                                    // {과목:[맞,푼]}
    var 낮 = null, 약 = [];
    Object.keys(과목맵).forEach(function (s) {
      var a = 과목맵[s]; if (!a[1]) return;
      var p = a[0] / a[1];
      if (낮 == null || p < 낮) 낮 = p;
    });
    Object.keys(과목맵).forEach(function (s) {
      var a = 과목맵[s]; if (a[1] && a[0] / a[1] <= 낮) 약.push(s);
    });
    S.진단 = { 날: 오늘(), 과목: 과목맵, 약: 약 };
    S.시작 = S.시작 || 오늘();
    S.플로 = null; 쓰기();
    return 약;
  }

  /* ── 기록 ──
     칸은 **확신하고 맞혔을 때만** 오른다. 확신을 안 골랐거나 반반·찍음으로 맞힌 건 제자리(최대 1칸).
     틀리면 0칸 — 내일 다시 온다. */
  function 기록(id, 맞, 확신, ms) {
    var o = oxMap[id]; if (!o) return;
    var x = S.ox[id] || { n: 0, 칸: 0 };
    x.n++; x.맞 = 맞 ? 1 : 0; x.t = 오늘();
    if (!맞) x.칸 = 0;
    else if (확신 === "sure") x.칸 = Math.min(간격.length - 1, (x.칸 || 0) + 1);
    else x.칸 = Math.max(1, Math.min(x.칸 || 0, 1));
    x.다음 = 날더하기(오늘(), 맞 ? 간격[x.칸] : 1);
    S.ox[id] = x;
    var t = S.테마[o.k] || { r: [] };
    t.r.push(맞 ? 1 : 0); if (t.r.length > 30) t.r = t.r.slice(-30);
    S.테마[o.k] = t;
    var d = S.날[오늘()] || { n: 0, ok: 0, ms: 0 };
    d.n++; if (맞) d.ok++; d.ms += Math.min(ms || 0, 120000);
    S.날[오늘()] = d;
    S.최근 = { k: o.k, 날: 오늘() };
    캐시 = null;
    쓰기();
  }
  function 카드봄(k) { S.카드[k] = 오늘(); S.최근 = { k: k, 날: 오늘() }; 루틴완료("card", k); 쓰기(); }

  function 디데이() {
    if (!S.시험일) return null;
    return Math.round((new Date(S.시험일 + "T00:00:00") - new Date(오늘() + "T00:00:00")) / 864e5);
  }
  /* 2027년 일정은 공고 전 — 기본 날짜는 「예상」, 사용자가 다른 날짜를 고르면 「직접」 */
  function 시험일예상() { return !!(D.시험일 && S.시험일 === D.시험일); }
  function 시험일안내() {
    if (!S.시험일) return "";
    return 시험일예상()
      ? "2027년 일정은 공고 전이라 예상 날짜입니다" + (D.시험일근거 ? " (직전 시험: " + D.시험일근거 + ")" : "") + ". 공고가 나오면 직접 바꾸세요."
      : "직접 고른 날짜";
  }
  function 과목성적() {
    var 합 = {}, 통 = 통계();
    Object.keys(통).forEach(function (s) { 합[s] = { 푼: 통[s].푼, 맞: 통[s].맞 }; });
    return 합;
  }
  function 이번주() {
    var n = 0, ok = 0, 날 = 오늘();
    for (var i = 0; i < 7; i++) {
      var d = S.날[날더하기(날, -i)]; if (d) { n += d.n; ok += d.ok; }
    }
    return { n: n, ok: ok };
  }

  /* ── 내비 — 위 브랜드 줄 + 아래 탭(문제풀이 화면이 있으면 탭에 들어간다) ── */
  function 내비(지금, 옵션) {
    옵션 = 옵션 || {};
    var 탭 = [["index.html", "홈"]];
    // 1023 대표님: 실기는 아래 탭에서 빼고 문제풀이 화면 위 필기·실기 단추로 옮긴다
    if (지금 === "silgi.html" && !샀다("실기")) { location.replace("quiz.html#buy"); return; }
    if (있다("quiz.html")) 탭.push(["quiz.html", "문제풀이"]);
    탭.push(["tree.html", "개념트리"], ["card.html", "개념"], ["settings.html", "설정"]);
    var 위 = '<header class="gbar"><div class="gin"><span id="th-slot"></span><a class="gb" href="index.html"><i></i>모두의 ' + (D.별칭 || "") + '</a></div></header>';
    var 아래 = 옵션.탭 === false ? "" : '<nav class="gtabs" style="grid-template-columns:repeat(' + 탭.length + ',1fr)">' + 탭.map(function (t) {
      var 켜짐 = t[0] === 지금 || (t[0] === "quiz.html" && 지금 === "silgi.html");
      return '<a href="' + t[0] + '"' + (켜짐 ? ' class="on"' : '') + '>' + t[1] + '</a>';
    }).join("") + '</nav>';
    document.body.insertAdjacentHTML("afterbegin", 위);
    if (있다("silgi.html") && (지금 === "quiz.html" || 지금 === "silgi.html")) 필실단추(지금);
    // 1021 테라러닝 홈 단추(허브 공용 terrahome.js) — 위 줄 맨 앞 #th-slot 에 들어간다
    if (!document.querySelector('script[src*="terrahome.js"]')) { var th = document.createElement("script"); th.src = "js/terrahome.js?v=1021"; th.setAttribute("data-slot", "#th-slot"); document.head.appendChild(th); }
    if (아래) document.body.insertAdjacentHTML("beforeend", 아래);
  }
  /* ── 이용권(1023) — 필기는 기본. 실기는 이용권이 있어야 열린다.
   *   modugisa2.buy = { "<종목>": { 실기: 1 } } — 결제가 붙으면 결제 완료 화면이 이 값을 쓴다 */
  var 산키 = "modugisa2.buy", 구매주소 = "buy.html";
  function 샀다(갈래) {
    if (갈래 === "필기") return true;
    try { var o = JSON.parse(localStorage.getItem(산키) || "{}"); return !!(o[D.종목] && o[D.종목][갈래]); } catch (e) { return false; }
  }
  function 필실단추(지금) {
    var 쪽 = document.querySelector(".page"); if (!쪽) return;
    var 자물쇠 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
    var 실 = 샀다("실기")
      ? '<a href="silgi.html"' + (지금 === "silgi.html" ? ' class="on"' : '') + '>실기</a>'
      : '<button type="button" class="lock" id="mode-lock" aria-disabled="true" aria-expanded="false">' + 자물쇠 + '실기</button>';
    쪽.insertAdjacentHTML("afterbegin",
      '<nav class="mode" aria-label="필기·실기"><a href="quiz.html"' + (지금 === "quiz.html" ? ' class="on"' : '') + '>필기</a>' + 실 + '</nav>' +
      (샀다("실기") ? "" : '<div class="buy" id="mode-buy" hidden><p>실기는 실기 이용권을 결제하면 쓸 수 있습니다.</p>' +
        '<small>필답형 기출과 모범답안이 들어 있습니다.</small>' +
        '<a class="b main" href="' + 구매주소 + '?p=실기">실기 구매하기</a></div>'));
    var 단 = document.getElementById("mode-lock"), 판 = document.getElementById("mode-buy");
    if (!단) return;
    function 열기(v) { 판.hidden = !v; 단.setAttribute("aria-expanded", v ? "true" : "false"); }
    단.onclick = function () { 열기(판.hidden); };
    if (location.hash === "#buy") 열기(true);
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  window.GS = {
    D: D, S: S, 오늘: 오늘, 테마맵: 테마맵, 테마별: 테마별, oxMap: oxMap, 순: 순,
    갈래: 갈래, 과락있음: 과락있음, 분선택: 분선택, 기본분: 기본분, 분글: 분글, 있다: 있다, 깨끗: 깨끗,
    숙련: 숙련, 연속오답: 연속오답, 다시볼것: 다시볼것, 오늘할것: 오늘할것, 세션: 세션,
    모의필요: 모의필요, 옥수: 옥수, 개념있음: 개념있음, 시험성적: 시험성적, 루틴: 루틴, 루틴완료: 루틴완료, 더하기: 더하기, 라벨: 라벨, 큰단추: 큰단추, 최근테마: 최근테마,
    과목표: 과목표, 가늠: 가늠, 역할: 역할, 진단뽑기: 진단뽑기, 진단결과: 진단결과,
    기록: 기록, 카드봄: 카드봄, 디데이: 디데이, 시험일예상: 시험일예상, 시험일안내: 시험일안내, 과목성적: 과목성적, 이번주: 이번주,
    내비: 내비, esc: esc, 샀다: 샀다,
    고유기출: 고유기출,
    /* 기록 옮기기 — 이 종목 기록 전부를 앱·종목·판 표시와 함께 내보낸다. 가져올 때 종목이 다르면 거절(다른 종목 기록을 덮지 않게) */
    내보내기: function () { return JSON.stringify({ 앱: "modu-gisa", 종목: D.종목, 판: 2, 날: 오늘(), 기록: S }); },
    가져오기: function (글) {
      var o; try { o = JSON.parse(글); } catch (e) { return "파일을 읽지 못함"; }
      if (!o || o.앱 !== "modu-gisa" || !o.기록) return "모두의 기사 기록 파일이 아님";
      if (o.종목 !== D.종목) return "다른 종목(" + o.종목 + ") 기록이라 넣지 않음";
      try { localStorage.setItem(KEY, JSON.stringify(o.기록)); } catch (e) { return "저장 실패"; }
      return "";
    },
    저장: function () { 캐시 = null; 쓰기(); },
    초기화: function () { try { localStorage.removeItem(KEY); } catch (e) {} }
  };
})();

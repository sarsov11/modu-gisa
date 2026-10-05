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
    s.목표분 = s.목표분 || 15;
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
    var 모 = (S.모의 || []).slice(-3), 합 = {}, i;
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
    return { 점: Math.round(합 / 키.length), 선: 60, 과락: 위험, 과락있음: 과락있음, 출처: r.출처, 과목: r.과목 };
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
  function 테마고르기(제외) {
    제외 = 제외 || [];
    var 후보 = D.테마.filter(function (t) { return !t.x && (테마별[t.k] || []).length >= 4 && 제외.indexOf(t.k) < 0; });
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
    var 후 = [], 목표 = S.목표분 || 15, q = 있다("quiz.html");
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
    var items = [], sum = 0;
    for (var i = 0; i < 후.length; i++) {
      items.push(후[i]); sum += 후[i].분;
      if (sum >= 목표) break;
    }
    return { 날: 오늘(), k: 할 ? 할.k : null, items: items, done: [], 쓴: 쓴.slice(), 목표: 목표, 화면: 화면.join(",") };
  }
  function 플로() {
    var F = S.플로;
    if (!F || F.날 !== 오늘() || !F.items || (F.done.length === 0 && (F.목표 !== (S.목표분 || 15) || F.화면 !== 화면.join(",")))) {
      S.플로 = F = 만들기(F && F.날 === 오늘() ? F.쓴 : []);
      쓰기();
    }
    return F;
  }
  function 루틴() {
    var F = 플로(), 다음 = null, d = S.날[오늘()] || {};
    for (var i = 0; i < F.items.length; i++) if (F.done.indexOf(F.items[i].id) < 0) { 다음 = F.items[i]; break; }
    var 오늘분 = Math.round(d.fm || 0), 목표 = S.목표분 || 15;
    return { k: F.k, t: F.k ? 테마맵[F.k] : null, items: F.items, done: F.done, 다음: 다음, 완료: !다음,
             처음: F.done.length === 0, 오늘분: 오늘분, 목표분: 목표, 남은: Math.max(0, 목표 - 오늘분) };
  }
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
    if (있다("quiz.html")) 탭.push(["quiz.html", "문제풀이"]);
    탭.push(["tree.html", "개념트리"], ["card.html", "개념"], ["settings.html", "설정"]);
    var 위 = '<header class="gbar"><a href="index.html"><i></i>모두의 ' + (D.별칭 || "") + '</a></header>';
    var 아래 = 옵션.탭 === false ? "" : '<nav class="gtabs" style="grid-template-columns:repeat(' + 탭.length + ',1fr)">' + 탭.map(function (t) {
      return '<a href="' + t[0] + '"' + (t[0] === 지금 ? ' class="on"' : '') + '>' + t[1] + '</a>';
    }).join("") + '</nav>';
    document.body.insertAdjacentHTML("afterbegin", 위);
    if (아래) document.body.insertAdjacentHTML("beforeend", 아래);
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  window.GS = {
    D: D, S: S, 오늘: 오늘, 테마맵: 테마맵, 테마별: 테마별, oxMap: oxMap, 순: 순,
    갈래: 갈래, 과락있음: 과락있음, 있다: 있다, 깨끗: 깨끗,
    숙련: 숙련, 연속오답: 연속오답, 다시볼것: 다시볼것, 오늘할것: 오늘할것, 세션: 세션,
    모의필요: 모의필요, 옥수: 옥수, 시험성적: 시험성적, 루틴: 루틴, 루틴완료: 루틴완료, 더하기: 더하기, 라벨: 라벨, 큰단추: 큰단추, 최근테마: 최근테마,
    과목표: 과목표, 가늠: 가늠, 역할: 역할, 진단뽑기: 진단뽑기, 진단결과: 진단결과,
    기록: 기록, 카드봄: 카드봄, 디데이: 디데이, 과목성적: 과목성적, 이번주: 이번주,
    내비: 내비, esc: esc,
    저장: function () { 캐시 = null; 쓰기(); },
    초기화: function () { try { localStorage.removeItem(KEY); } catch (e) {} }
  };
})();

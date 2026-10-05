/* 모두의기사 2판 — 기출 4지선다 공용(quiz.html · exam.html)
 *
 * 데이터   window.GQ = { S:[과목…], M:{과목:[[이름,문항수]…], 총, 유형, 분율}, Q:[[id,과목번호,테마,날짜,번호,정답률,발문,[선지4],정답,법령옛,회차]…] }
 * 기록     GS.S.기출  = { [기출 id]: { n: 푼 횟수, 맞: 1|0 (가장 최근), t: "YYYY-MM-DD" } }
 *          GS.S.모의  = [ { t, ts, 종목, 유형, 합: 1|0, 평균, 총맞, 총문, 분, 통과선, 과락선,
 *                           과목: [ { n, 맞, 총, 점, 락: 1|0 } ] } … ]  (최근 30회)
 *   합격 = 기사·산업기사: 평균 60 이상 + 모든 과목 40 이상 / 기능사: 총점 60 이상
 */
(function () {
  "use strict";
  var G = window.GQ || { S: [], M: { 과목: [], 총: 0, 유형: "기사", 분율: 1.5 }, Q: [] };
  var 테마맵 = (window.GS && GS.테마맵) || {};
  var 번호 = ["①", "②", "③", "④"];

  var Q = G.Q.map(function (r) {
    return { id: r[0], si: r[1], s: G.S[r[1]], k: r[2], y: r[3], no: r[4], r: r[5], q: r[6], c: r[7], a: r[8], v: r[9], ex: r[10] };
  });
  var 맵 = {};
  Q.forEach(function (x) { 맵[x.id] = x; });

  function 밖(x) {
    var t = 테마맵[x.k];
    if (t && t.x) return true;
    return !!(G.현행 && G.현행.length && G.현행.indexOf(x.s) < 0 && !(t && !t.x && G.현행.indexOf(t.s) >= 0));   // 현행 과목이 아닌 옛 과목 문항
  }
  function 키(s) { return String(s || "").replace(/[\W_]+/g, "").slice(0, 60); }
  function 섞기(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    } return a;
  }
  /* 선지 섞기 → { 순: 보이는 칸 → 원래 선지 번호(0~3) } */
  function 보기섞기(x) { return 섞기([0, 1, 2, 3]); }

  function 기록(id, 맞) {
    var S = GS.S; S.기출 = S.기출 || {};
    var r = S.기출[id] || { n: 0 };
    r.n++; r.맞 = 맞 ? 1 : 0; r.t = GS.오늘();
    S.기출[id] = r;
  }
  function 틀린것() {
    var S = GS.S.기출 || {};
    return Object.keys(S).filter(function (id) { return S[id].맞 === 0 && 맵[id]; });
  }

  /* 한 번 풀 문제 n개 — 안 푼 것 → 틀린 것 → 나머지, 같은 발문 한 번만, 법령 옛 기출·출제기준 밖은 맨 뒤 */
  function 뽑기(풀, n) {
    var S = GS.S.기출 || {};
    function 층(x) { return (x.v ? 4 : 0) + (S[x.id] ? (S[x.id].맞 ? 2 : 1) : 0); }
    var 차례 = 섞기(풀.slice()).sort(function (a, b) { return 층(a) - 층(b); });
    var 쓴 = {}, 뽑음 = [];
    for (var i = 0; i < 차례.length && 뽑음.length < n; i++) {
      var h = 키(차례[i].q); if (쓴[h]) continue; 쓴[h] = 1; 뽑음.push(차례[i]);
    }
    return 뽑음;
  }

  function 점수(맞, 총) { return 총 ? Math.round(맞 * 1000 / 총) / 10 : 0; }
  function 판정(과목들, 유형) {
    var 총맞 = 0, 총문 = 0, 합점 = 0;
    과목들.forEach(function (s) { 총맞 += s.맞; 총문 += s.총; 합점 += s.점; });
    if (유형 === "기능사") {
      var p = 점수(총맞, 총문);
      return { 합: p >= 60 ? 1 : 0, 평균: p, 통과선: 60, 과락선: 0 };
    }
    var 평균 = 과목들.length ? Math.round(합점 / 과목들.length * 10) / 10 : 0;
    var 락 = 과목들.some(function (s) { return s.점 < 40; });
    return { 합: (평균 >= 60 && !락) ? 1 : 0, 평균: 평균, 통과선: 60, 과락선: 40 };
  }
  function 마크(x) {
    var o = [];
    if (x.v) o.push('<span class="pl wr">법령 개정 확인</span>');
    if (밖(x)) o.push('<span class="pl">출제기준 밖</span>');
    return o.join("");
  }
  function 이름(s) { return s === "과목 구분 없음" ? "전체" : s; }

  window.QL = { Q: Q, S: G.S, M: G.M, 맵: 맵, 번호: 번호, 밖: 밖, 섞기: 섞기, 보기섞기: 보기섞기, 기록: 기록,
    틀린것: 틀린것, 뽑기: 뽑기, 점수: 점수, 판정: 판정, 마크: 마크, 이름: 이름, 키: 키 };
})();

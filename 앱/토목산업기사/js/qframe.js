/* 문제 화면 틀 도우미(2026-11-10) — 공용 부품 tera-q.js·tera-q.css·tera-pad.js 위에서 기사 화면(ox·quiz·exam)이 같이 쓰는 조각 */
(function () {
  var I = {
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.5a2.4 2.4 0 1 1 3.3 2.2c-.7.3-1 .8-1 1.6M12 16.5h.01"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 6.5C10.2 5 7.6 4.5 4.5 4.8v13c3.1-.3 5.7.2 7.5 1.7 1.8-1.5 4.4-2 7.5-1.7v-13c-3.1-.3-5.7.2-7.5 1.7zM12 6.5v13"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 19.5l1-4L16 5l3 3L8.5 18.5z"/></svg>'
  };
  function 진행(칸, 총) {   /* 칸 = 지금까지 끝낸 수 */
    var 남 = Math.max(0, 총 - 칸);
    return '<div class="tq-prog"><i><u style="width:' + (총 ? Math.round(칸 * 100 / 총) : 0) + '%"></u></i><span><b>' + 남 + '</b>문제 남았어요</span></div>';
  }
  function 번호줄(번호, 최빈출) {
    return '<div class="tq-meta"><span class="tq-no">' + 번호 + '번 문제</span><span id="qf-bd"></span><span class="tq-sp"></span><span id="qf-tg"></span></div>';
  }
  function 번호줄채우기(등급) {
    var b = document.getElementById("qf-bd"), t = document.getElementById("qf-tg");
    if (b && 등급 && window.TERA_Q) TERA_Q.badge(b, { tier: 등급 });
    if (t && window.TERA_Q) TERA_Q.toggle(t);
  }
  /* 아래 줄: o = { 도구:[{id,icon,글,켜짐}], 위치:"2", 총:"5", 이전:fn|null, 다음:fn|null, 다음끔:bool, 번호판:fn|null } */
  function 바(o) {
    var 줄 = document.getElementById("qf-bar");
    if (!줄) { 줄 = document.createElement("div"); 줄.id = "qf-bar"; 줄.className = "tq-bar"; document.body.appendChild(줄); document.body.classList.add("has-tqbar"); }
    줄.innerHTML = (o.도구 || []).map(function (t) {
      return '<button type="button" class="tq-tool' + (t.켜짐 ? " is-on" : "") + '" data-t="' + t.id + '"' + (t.끔 ? " disabled" : "") + ">" + I[t.icon] + t.글 + "</button>";
    }).join("") + '<span class="tq-sp"></span><button type="button" class="tq-nav" id="qf-prev" aria-label="이전"' + (o.이전 ? "" : " disabled") + '>‹</button>' +
      '<span class="tq-pos" id="qf-pos">' + o.위치 + " <small>/ " + o.총 + "</small></span>" +
      '<button type="button" class="tq-nav is-next" id="qf-next" aria-label="다음"' + (o.다음끔 ? " disabled" : "") + '>' + (o.다음글 || "다음") + ' ›</button>';
    (o.도구 || []).forEach(function (t) { var b = 줄.querySelector('[data-t="' + t.id + '"]'); if (b && t.fn) b.onclick = function (e) { t.fn(b, e); }; });
    if (o.이전) 줄.querySelector("#qf-prev").onclick = o.이전;
    if (!o.다음끔 && o.다음) 줄.querySelector("#qf-next").onclick = o.다음;
    if (o.번호판) 줄.querySelector("#qf-pos").onclick = o.번호판;
    return 줄;
  }
  function 펜(키) { if (window.TERA_PAD && TERA_PAD.pen) TERA_PAD.pen({ key: String(키) }); }
  function 펜숨김() { if (window.TERA_PAD && TERA_PAD.penHide) TERA_PAD.penHide(); }
  function 개념어() {
    if (!window.TERA_Q) return;
    var o = {};
    if (window.DIAGRAM && DIAGRAM.terms) o = DIAGRAM.terms; else if (window.TNQ && TNQ.terms) o = TNQ.terms;
    TERA_Q.terms(o);
  }
  function 밑줄(요소들) { if (window.TERA_Q) TERA_Q.annotate(요소들); }
  window.QF = { 진행: 진행, 번호줄: 번호줄, 번호줄채우기: 번호줄채우기, 바: 바, 펜: 펜, 펜숨김: 펜숨김, 개념어: 개념어, 밑줄: 밑줄 };
})();

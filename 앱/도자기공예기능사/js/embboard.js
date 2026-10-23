/* 테라러닝 공용 앰블럼판 — 2026-10-23
   대표님: 「작은 앰블럼을 다 채우면 상위 칭호, 매일 접속으로 1개, 과목당 5~6개·맥스 30개쯤, 30개쯤이면 합격 수준」
   TEMBOARD.render(el, {
     키: "gisa.건축기사",                      // 오늘의 앰블럼·본 기록 저장 열쇠
     과목: [{ n, 색, 칭호, 한줄, 상징, 표, 앰: [앰블럼…] }],
     합격칸: 4,                                 // 과목마다 이만큼(★ 묶음부터) 모으면 합격권. 없으면 합격선 표시 안 함
     조건글: "모든 테마 4번 이상 · 정답률 80%면 획득",
     도전글: "20문장 · 정답률 80%면 획득",
     단위: "테마"                               // 시트 목록 이름
   })
   앰블럼 = { id, 번, 이름, 칭호, 한줄, 상징, 표, 단계(0·2·3), 얻, 률, 목록:[{n, v}], 도전: "주소" | function }
   새로 얻은 앰블럼·과목 칭호는 획득 장면(THEX.축하)으로 보여 준다. */
(function () {
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function 오늘() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function 읽(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (x) { return null; } }
  function 쓰(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} }
  var CSS = [
    ".emb-top{padding:12px 14px;border:1px solid var(--line-2,var(--line,#e3e0d8));border-radius:14px;background:var(--surface,#fff)}",
    ".emb-cnt b{font-size:30px;font-weight:900;letter-spacing:-.03em}.emb-cnt span{font-size:14px;color:var(--ink-3,#8b93a3);font-weight:700;margin-left:4px}",
    ".emb-bar{position:relative;height:10px;border-radius:9px;background:var(--surface-2,#eef0f4);margin:8px 0 24px}.emb-bar i{display:block;height:100%;border-radius:9px;background:#d9a21b}",
    ".emb-bar em{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--ink,#1d2230);font-style:normal}.emb-bar em span{position:absolute;top:18px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:12px;font-weight:800;color:var(--ink,#1d2230)}",
    ".emb-note{margin:0;font-size:13px;color:var(--ink-3,#8b93a3);line-height:1.5}",
    ".emb-today{display:flex;gap:12px;align-items:center;margin:12px 0 4px;padding:12px;border-radius:16px;background:linear-gradient(135deg,#1d2230,#2c3550);color:#fff}",
    ".emb-today .tx{flex:1;min-width:0}.emb-today small{display:block;font-size:12px;color:#ffd75e;font-weight:800}.emb-today b{display:block;font-size:17px;font-weight:900;margin:2px 0;letter-spacing:-.02em;color:#fff}",
    ".emb-today span{display:block;font-size:12.5px;color:#c9d0de;margin-bottom:8px}.emb-today .b{display:inline-block;text-decoration:none;font:inherit;font-weight:900;font-size:14px;padding:9px 16px;border-radius:99px;border:0;background:#ffd75e;color:#2a1d00;cursor:pointer}",
    ".emb-today.done{background:linear-gradient(135deg,#2a2000,#4a3a00)}",
    ".emb-sj{margin:18px 0 0}.emb-sh{display:flex;gap:10px;align-items:center}.emb-sh .tx{flex:1;min-width:0}.emb-sh b{display:block;font-size:17px;font-weight:900;letter-spacing:-.03em}",
    ".emb-sh span{display:block;font-size:12.5px;color:var(--ink-3,#8b93a3)}.emb-sh em{font-style:normal;color:#b8860b;font-weight:900}",
    ".emb-sh .ct{text-align:right;font-size:13px;color:var(--ink-3,#8b93a3);font-weight:700}.emb-sh .ct b{font-size:20px;color:var(--ink,#1d2230)}.emb-sh .ct i{display:block;font-style:normal;font-size:11.5px}.emb-sh .ct i.ok{color:#16a37a;font-weight:900}",
    ".emb-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px 6px;margin-top:8px}",
    ".emb{font:inherit;background:none;border:0;padding:6px 2px;cursor:pointer;display:flex;flex-direction:column;align-items:center;color:var(--ink,#1d2230);border-radius:12px}",
    ".emb b{font-size:12.5px;line-height:1.3;font-weight:800;text-align:center;word-break:keep-all;margin-top:3px;letter-spacing:-.03em}",
    ".emb small{font-size:10.5px;color:var(--ink-3,#8b93a3)}.emb.core small::before{content:'★ ';color:#d9a21b}",
    ".emb.today{background:rgba(217,162,27,.15)}.emb:not(.got) b{color:var(--ink-3,#8b93a3)}",
    ".emb-sheet{position:fixed;inset:0;z-index:99990;background:rgba(8,10,16,.45);display:flex;align-items:flex-end;justify-content:center}",
    ".emb-sheet .in{width:min(520px,100%);max-height:85vh;overflow:auto;background:#fff;color:#1d2230;border-radius:22px 22px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom));font-family:'Pretendard Variable',Pretendard,'Noto Sans KR',sans-serif}",
    ".emb-sheet .tp{display:flex;gap:14px;align-items:center}.emb-sheet h3{margin:4px 0;font-size:20px;font-weight:900;letter-spacing:-.03em;color:#1d2230}.emb-sheet small{color:#5d6575;font-weight:700;font-size:12.5px}",
    ".emb-sheet ul{margin:10px 0 0;padding:0;list-style:none}.emb-sheet li{display:flex;justify-content:space-between;gap:8px;font-size:13.5px;padding:6px 0;border-bottom:1px solid #eef0f4}.emb-sheet li span{color:#8b93a3;white-space:nowrap}",
    ".emb-sheet .go{display:flex;gap:8px;margin-top:14px}.emb-sheet .go a,.emb-sheet .go button{flex:1;text-align:center;font:inherit;font-weight:900;font-size:15px;padding:12px;border-radius:12px;border:1.5px solid #d8dbe3;background:#fff;color:#1d2230;text-decoration:none;cursor:pointer}.emb-sheet .go .p{background:#1d2230;border-color:#1d2230;color:#fff}"
  ].join("\n");

  function render(el, o) {
    if (!window.TEMB) return;
    if (!document.getElementById("emb-css")) { var st = document.createElement("style"); st.id = "emb-css"; st.textContent = CSS; document.head.appendChild(st); }
    var 과목들 = o.과목.filter(function (g) { return g.앰.length; });
    과목들.forEach(function (g) { g.얻은 = g.앰.filter(function (a) { return a.얻; }).length; g.다 = g.얻은 === g.앰.length; g.앰.forEach(function (a) { a.과목 = g.n; a.색 = a.색 || g.색; }); });
    var 전체 = [].concat.apply([], 과목들.map(function (g) { return g.앰; })), 얻은수 = 전체.filter(function (a) { return a.얻; }).length;
    var 합격칸 = o.합격칸 || 0, 합격선 = 과목들.reduce(function (s, g) { return s + Math.min(합격칸, g.앰.length); }, 0);
    /* 오늘의 앰블럼 — 합격칸에 가장 못 미친 과목의 다음 묶음. 하루 동안 같은 것 */
    var 오늘키 = "emb.오늘." + o.키, 날 = 오늘(), 기록 = 읽(오늘키);
    var 후보 = 과목들.slice().sort(function (a, b) { return Math.min(a.얻은, 합격칸 || 99) - Math.min(b.얻은, 합격칸 || 99) || a.얻은 - b.얻은; })
      .map(function (g) { return g.앰.filter(function (a) { return !a.얻; })[0]; }).filter(Boolean);
    var 오늘것 = 기록 && 기록.날 === 날 ? 전체.filter(function (a) { return a.id === 기록.id; })[0] : null;
    if (!오늘것) { 오늘것 = 후보[0] || null; if (오늘것) 쓰(오늘키, { 날: 날, id: 오늘것.id }); }
    function svg(a, 크기) { return TEMB.svg({ 상징: a.상징, 표: 크기 >= 60 ? a.표 : "", 색: a.색, 단계: a.단계, 크기: 크기, 칭호: a.칭호 }); }
    function 도전단추(a, 글, cls) { return typeof a.도전 === "function" ? '<button type="button" class="' + cls + '" data-go="' + esc(a.id) + '">' + 글 + '</button>' : '<a class="' + cls + '" href="' + esc(a.도전) + '">' + 글 + '</a>'; }

    var h = '<div class="emb-top"><div class="emb-cnt"><b>' + 얻은수 + '</b><span>/ ' + 전체.length + ' 앰블럼</span></div>' +
      '<div class="emb-bar"><i style="width:' + Math.round(100 * 얻은수 / Math.max(1, 전체.length)) + '%"></i>' + (합격선 ? '<em style="left:' + Math.round(100 * 합격선 / 전체.length) + '%"><span>합격선 ' + 합격선 + '</span></em>' : '') + '</div>' +
      '<p class="emb-note">' + esc(o.안내 || "") + '</p></div>';
    if (오늘것) {
      var 끝 = 오늘것.얻, 다음 = 후보.filter(function (a) { return a.id !== 오늘것.id; })[0];
      h += '<div class="emb-today' + (끝 ? ' done' : '') + '">' + svg(오늘것, 84) + '<div class="tx"><small>오늘의 앰블럼 · ' + esc(오늘것.과목) + ' ' + 오늘것.번 + '번</small><b>' + esc(끝 ? 오늘것.칭호 : 오늘것.이름) + '</b>' +
        '<span>' + (끝 ? '오늘 것은 받았음. 내일 새 앰블럼이 열림' : esc(o.도전글 || "")) + '</span>' + (끝 ? (다음 ? 도전단추(다음, "하나 더 도전", "b") : '') : 도전단추(오늘것, "도전하기", "b")) + '</div></div>';
    }
    과목들.forEach(function (g) {
      var 칸 = Math.min(합격칸, g.앰.length);
      h += '<section class="emb-sj"><div class="emb-sh">' + TEMB.svg({ 상징: g.상징, 표: g.표, 색: g.색, 단계: g.다 ? 3 : 0, 크기: 56, 큰: true }) +
        '<div class="tx"><b>' + esc(g.n) + '</b><span>' + (g.다 ? '<em>' + esc(g.칭호) + '</em>' : '앰블럼 ' + g.앰.length + '개를 다 모으면 칭호') + '</span></div>' +
        '<div class="ct"><b>' + g.얻은 + '</b>/' + g.앰.length + (합격칸 ? (g.얻은 >= 칸 ? '<i class="ok">합격칸 ✓</i>' : '<i>합격칸 ' + 칸 + '</i>') : '') + '</div></div><div class="emb-grid">' +
        g.앰.map(function (a) {
          return '<button type="button" class="emb' + (a.얻 ? ' got' : '') + (합격칸 && a.번 <= 합격칸 ? ' core' : '') + (오늘것 && a.id === 오늘것.id ? ' today' : '') + '" data-id="' + esc(a.id) + '">' + svg(a, 64) +
            '<b>' + esc(a.얻 ? a.칭호 : a.이름) + '</b><small>' + a.번 + '번' + (a.률 != null && !a.얻 ? ' · ' + Math.round(a.률 * 100) + '%' : '') + '</small></button>';
        }).join("") + '</div></section>';
    });
    el.innerHTML = '<div id="emb">' + h + '</div>';
    function 찾(id) { return 전체.filter(function (x) { return x.id === id; })[0]; }
    el.querySelectorAll("[data-go]").forEach(function (b) { b.onclick = function () { var a = 찾(b.dataset.go); if (a) a.도전(); }; });
    el.querySelectorAll(".emb").forEach(function (b) {
      b.onclick = function () {
        var a = 찾(b.dataset.id); if (!a) return;
        var d = document.createElement("div"); d.className = "emb-sheet";
        d.innerHTML = '<div class="in"><div class="tp">' + TEMB.svg({ 상징: a.상징, 표: a.표, 색: a.색, 단계: a.단계, 크기: 96 }) + '<div><small>' + esc(a.과목) + ' ' + a.번 + '번' + (합격칸 && a.번 <= 합격칸 ? ' · ★ 자주 나옴' : '') + (a.부 ? ' · ' + esc(a.부) : '') + '</small><h3>' + esc(a.얻 ? a.칭호 : a.이름) + '</h3><small>' + esc(a.얻 ? a.한줄 : (o.조건글 || "")) + '</small></div></div>' +
          '<ul>' + (a.목록 || []).map(function (t) { return '<li>' + esc(t.n) + '<span>' + esc(t.v) + '</span></li>'; }).join("") + '</ul>' +
          '<div class="go">' + (a.얻 ? '' : 도전단추(a, "도전하기", "p")) + '<button type="button" class="x">닫기</button></div></div>';
        d.addEventListener("click", function (ev) { if (ev.target === d || (ev.target.classList && ev.target.classList.contains("x"))) d.remove(); });
        var g = d.querySelector("[data-go]"); if (g) g.onclick = function () { d.remove(); a.도전(); };
        document.body.appendChild(d);
      };
    });
    /* 새로 얻은 것 — 획득 장면 */
    var 봄키 = "emb.봄." + o.키, 봄 = 읽(봄키), 지금 = {}, 새 = [];
    과목들.forEach(function (g) { if (g.다) { 지금["과목:" + g.n] = 1; if (봄 && !봄["과목:" + g.n]) 새.push({ 칭호: g.칭호, 한줄: g.한줄, 상징: g.상징, 표: g.표, 색: g.색, 단계: 3, 자식: [1], 라벨: "칭호 획득" }); } });
    전체.forEach(function (a) { if (a.얻) { 지금[a.id] = 1; if (봄 && !봄[a.id]) 새.push({ 칭호: a.칭호, 한줄: a.한줄, 상징: a.상징, 표: a.표, 색: a.색, 단계: a.단계, 라벨: "앰블럼 획득" }); } });
    쓰(봄키, 지금);
    if (새.length && window.THEX && THEX.축하) THEX.축하(새);
  }
  window.TEMBOARD = { render: render };
})();

/* 테라러닝 공용 육각 테크트리 — 2026-10-23
   THEX.render(el, data, {안:"A"|"B"|"C"})
   data = { 앱키, 제목, 티어(TTIER 결과), 큰:[노드] }
   노드 = { id, 이름, 색, 단계 0~3, 진척 0~1|null, 칭호, 한줄, 상징, 표, 조건, 링크:[{글,href}], 자식:[노드] }
     단계 0 잠김 · 1 동(해금) · 2 은(칭호 획득) · 3 금(전설)
   큰 줄기(과목·갈래 → 대단원) 선은 금색, 작은 줄기(테마·스킬로 가는 선)는 그 갈래 색.
   안 A 벌집 줄기(줄마다 큰 칸 + 벌집 띠) · B 성장 나무(아래 뿌리에서 위로) · C 밤 보드(송이 카드) */
(function () {
  var SQ3 = Math.sqrt(3), uid = 0;
  var 금선 = "#d9a21b";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function hp(cx, cy, r) { return TEMB.hexPts(cx, cy, r); }
  function css() {
    if (document.getElementById("thx-css")) return;
    var st = document.createElement("style"); st.id = "thx-css";
    st.textContent = [
      ".thx{--k:#1d2230;--k2:#5d6575;--k3:#8b93a3;--bg:#fbf8f1;--card:#fff;--ln:#e6e0d2;--gold:" + 금선 + ";font-family:'Pretendard Variable',Pretendard,'Noto Sans KR',sans-serif;color:var(--k);background:var(--bg);border-radius:18px;padding:14px 12px 18px;position:relative;overflow:hidden}",
      ".thx.thx-C{--k:#eef1f8;--k2:#aab3c5;--k3:#6f7a90;--bg:#0d1018;--card:#151a26;--ln:#232a3a;background:radial-gradient(120% 60% at 50% 0%,#1a2140 0%,#0d1018 60%)}",
      ".thx.thx-B{--bg:#f4f1e6;background:linear-gradient(#eaf3ea,#f6f1e2 70%)}",
      ".thx h2{color:var(--k);margin:2px 2px 2px;font-size:20px;font-weight:900;letter-spacing:-.03em}",
      ".thx .thx-sum{display:flex;gap:10px;align-items:center;margin:8px 0 10px;padding:10px 12px;border-radius:14px;background:var(--card);border:1px solid var(--ln)}",
      ".thx .thx-sum .tt{flex:1;min-width:0}.thx .thx-sum b{display:block;font-size:17px;font-weight:900;letter-spacing:-.02em}",
      ".thx .thx-sum small{display:block;font-size:12.5px;color:var(--k2);margin-top:2px}",
      ".thx .thx-sum .cnt{text-align:right;font-size:12px;color:var(--k2);font-weight:700}.thx .thx-sum .cnt b{font-size:18px;color:var(--k)}",
      ".thx .bar{height:6px;border-radius:9px;background:rgba(127,127,127,.18);overflow:hidden;margin-top:6px}.thx .bar i{display:block;height:100%;border-radius:9px;background:var(--gold)}",
      ".thx .lg{display:flex;flex-wrap:wrap;gap:6px 12px;font-size:12px;color:var(--k2);margin:2px 2px 10px}",
      ".thx .lg i{display:inline-block;width:18px;height:4px;border-radius:3px;vertical-align:3px;margin-right:5px}",
      ".thx svg.thx-s{display:block;overflow:visible;margin:0 auto}",
      ".thx .cell{cursor:pointer}.thx .cell:hover{filter:brightness(1.08)}",
      ".thx .l3 .temb-rays{animation:thxspin 14s linear infinite;transform-origin:50px 48px}",
      ".thx .l3{filter:drop-shadow(0 0 5px rgba(255,205,60,.75))}",
      ".thx.thx-C .l2{filter:drop-shadow(0 0 4px rgba(200,220,255,.55))}",
      ".thx .pop{animation:thxpop .9s cubic-bezier(.2,1.6,.4,1) both}",
      "@keyframes thxspin{to{transform:rotate(360deg)}}@keyframes thxpop{0%{transform:scale(.2);opacity:0}100%{transform:scale(1);opacity:1}}",
      ".thx .grp{margin:0 0 6px}.thx .gh{display:flex;align-items:center;gap:10px;margin:14px 2px 4px}",
      ".thx .gh .nm{flex:1;min-width:0}.thx .gh b{display:block;font-size:16.5px;font-weight:900;letter-spacing:-.03em;line-height:1.25}",
      ".thx .gh small{display:block;font-size:12.5px;color:var(--k2);margin-top:1px}.thx .gh em{font-style:normal;color:var(--gold);font-weight:800}",
      ".thx .mh{font-size:13.5px;font-weight:800;color:var(--k2);margin:6px 0 0 4px;display:flex;gap:6px;align-items:center}",
      ".thx .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}",
      ".thx .cardc{background:var(--card);border:1px solid var(--ln);border-radius:16px;padding:8px 6px 6px;box-shadow:0 0 0 1px rgba(255,255,255,.02) inset}",
      ".thx .cardc .ct{font-size:13.5px;font-weight:800;margin:2px 6px 0;color:var(--k);display:flex;justify-content:space-between;gap:6px}.thx .cardc .ct span{color:var(--k3);font-weight:700;font-size:12px}",
      ".thx .scroll{max-height:72vh;overflow:auto;border-radius:14px;-webkit-overflow-scrolling:touch}",
      /* 시트 */
      ".thx-sh{position:fixed;inset:0;z-index:99990;display:flex;align-items:flex-end;justify-content:center;background:rgba(8,10,16,.45);animation:thxfade .2s both}",
      ".thx-sh .in{width:min(520px,100%);background:#fff;color:#1d2230;border-radius:22px 22px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom));animation:thxup .28s cubic-bezier(.2,.9,.3,1) both;font-family:'Pretendard Variable',Pretendard,'Noto Sans KR',sans-serif}",
      ".thx-sh .top{display:flex;gap:14px;align-items:center}.thx-sh .top .t{flex:1;min-width:0}",
      ".thx-sh .lvl{display:inline-block;font-size:12px;font-weight:900;padding:2px 9px;border-radius:99px;background:#eef1f6;color:#5d6575}",
      ".thx-sh h3{margin:6px 0 2px;font-size:21px;font-weight:900;letter-spacing:-.03em;line-height:1.25}",
      ".thx-sh .nm{font-size:13.5px;color:#5d6575;font-weight:700}",
      ".thx-sh p{margin:10px 0 0;font-size:14.5px;line-height:1.55;color:#2c3240}",
      ".thx-sh .steps{display:flex;gap:6px;margin:12px 0 0}.thx-sh .steps div{flex:1;text-align:center;font-size:11.5px;color:#8b93a3;font-weight:700}",
      ".thx-sh .steps div.on{color:#1d2230}.thx-sh .steps svg{display:block;margin:0 auto 2px}",
      ".thx-sh .go{display:flex;gap:8px;margin-top:14px}.thx-sh .go a,.thx-sh .go button{flex:1;text-align:center;text-decoration:none;font:inherit;font-weight:800;font-size:15px;padding:12px;border-radius:12px;border:1.5px solid #d8dbe3;background:#fff;color:#1d2230;cursor:pointer}",
      ".thx-sh .go a.p{background:#1d2230;border-color:#1d2230;color:#fff}",
      /* 획득 연출 */
      ".thx-cel{position:fixed;inset:0;z-index:99995;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,rgba(60,44,0,.82),rgba(6,8,14,.96) 68%);color:#fff;text-align:center;padding:24px;animation:thxfade .25s both;font-family:'Pretendard Variable',Pretendard,'Noto Sans KR',sans-serif}",
      ".thx-cel .em{animation:thxcel 1s cubic-bezier(.2,1.5,.35,1) both;filter:drop-shadow(0 0 22px rgba(255,210,80,.65))}",
      ".thx-cel .k{margin-top:14px;font-size:13px;letter-spacing:.3em;color:#ffd75e;font-weight:900;animation:thxfade .4s .5s both}",
      ".thx-cel h3{color:#fff;margin:6px 0 0;font-size:28px;font-weight:900;letter-spacing:-.03em;animation:thxup .5s .6s both}",
      ".thx-cel p{margin:8px 0 0;color:#d9deea;font-size:15px;color:#d9deea;max-width:320px;line-height:1.5;animation:thxfade .4s .8s both}",
      ".thx-cel button{margin-top:22px;font:inherit;font-weight:900;font-size:16px;padding:13px 34px;border-radius:99px;border:0;background:#ffd75e;color:#2a1d00;cursor:pointer;animation:thxfade .4s 1s both}",
      ".thx-cel .more{margin-top:10px;font-size:13px;color:#aab3c5}",
      "@keyframes thxfade{from{opacity:0}}@keyframes thxup{from{transform:translateY(30px);opacity:0}}",
      "@keyframes thxcel{0%{transform:scale(.1) rotate(-200deg);opacity:0}70%{transform:scale(1.12) rotate(6deg);opacity:1}100%{transform:scale(1) rotate(0)}}",
    ].join("\n");
    document.head.appendChild(st);
  }

  /* ── 칸 하나 ── */
  function cell(n, x, y, r, 색, 큰, 클래스) {
    var 단 = n.단계 || 0, s = "";
    if (단 >= 1) {
      s = '<g class="cell ' + (클래스 || "") + ' l' + 단 + '" data-id="' + esc(n.id) + '">' +
        TEMB.svg({ 상징: n.상징, 표: r >= 22 ? n.표 : "", 색: n.색 || 색, 단계: 단, 크기: (2 * r).toFixed(1), x: (x - r).toFixed(1), y: (y - 1.04 * r).toFixed(1), 큰: 큰, 칭호: n.칭호 }) + '</g>';
      return s;
    }
    var id = "thc" + (++uid), p = n.진척 == null ? 0 : Math.max(0, Math.min(1, n.진척));
    s += '<g class="cell ' + (클래스 || "") + '" data-id="' + esc(n.id) + '">';
    s += '<clipPath id="' + id + '"><polygon points="' + hp(x, y, r * .92) + '"/></clipPath>';
    s += '<polygon points="' + hp(x, y, r * .92) + '" fill="var(--card)" stroke="' + 색 + '" stroke-opacity="' + (n.진척 == null ? .35 : .8) + '" stroke-width="' + (큰 ? 2.4 : 1.6) + '"' + (n.진척 == null ? ' stroke-dasharray="3 3"' : '') + '/>';
    if (p > 0) s += '<rect clip-path="url(#' + id + ')" x="' + (x - r) + '" y="' + (y + r * .92 - 2 * r * .92 * p) + '" width="' + 2 * r + '" height="' + 2 * r * .92 * p + '" fill="' + 색 + '" fill-opacity=".38"/>';
    if (큰) s += '<text x="' + x + '" y="' + (y + r * .28) + '" text-anchor="middle" font-size="' + (r * .8).toFixed(1) + '" font-weight="900" fill="' + 색 + '" fill-opacity=".55">?</text>';
    s += '</g>';
    return s;
  }

  /* ── 송이(벌집 나선) 좌표 ── */
  var DIR = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  function spiral(n) {
    var out = [[0, 0]], k = 1;
    while (out.length < n) {
      var q = DIR[4][0] * k, r = DIR[4][1] * k;
      for (var d = 0; d < 6 && out.length < n; d++) for (var j = 0; j < k && out.length < n; j++) { out.push([q, r]); q += DIR[d][0]; r += DIR[d][1]; }
      k++;
    }
    return out;
  }
  function ax2px(q, r, R) { var G = 1.14; return [SQ3 * R * G * (q + r / 2), 1.5 * R * G * r]; }
  /* 송이 하나: 가운데 칸(중심 노드 또는 마디) + 둘레에 자식 */
  function cluster(center, kids, R, 색, opt) {
    var cells = spiral(kids.length + 1), pts = cells.map(function (c) { return ax2px(c[0], c[1], R); });
    var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    pts.forEach(function (p) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); });
    return {
      w: maxx - minx + SQ3 * R, h: maxy - miny + 2 * R, ox: -minx + SQ3 * R / 2, oy: -miny + R,
      draw: function (cx, cy) {
        var s = "", ln = "";
        for (var i = 1; i < pts.length; i++) {        // 작은 줄기: 바로 안쪽 고리의 가장 가까운 칸과 잇는다
          var best = 0, bd = 1e9, ri = ring(cells[i]);
          for (var j = 0; j < i; j++) { if (ring(cells[j]) !== ri - 1) continue; var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], d = dx * dx + dy * dy; if (d < bd) { bd = d; best = j; } }
          var on = (kids[i - 1].단계 || 0) >= 1;
          ln += '<line x1="' + (cx + pts[best][0]).toFixed(1) + '" y1="' + (cy + pts[best][1]).toFixed(1) + '" x2="' + (cx + pts[i][0]).toFixed(1) + '" y2="' + (cy + pts[i][1]).toFixed(1) + '" stroke="' + 색 + '" stroke-width="' + (on ? 3.2 : 2) + '" stroke-opacity="' + (on ? .95 : .35) + '" stroke-linecap="round"/>';
        }
        s += ln;
        if (center) s += cell(center, cx, cy, R * 1.12, 색, true);
        else s += '<polygon points="' + hp(cx, cy, R * .45) + '" fill="' + 금선 + '"/>';
        kids.forEach(function (k, i) { s += cell(k, cx + pts[i + 1][0], cy + pts[i + 1][1], R, 색, false); });
        return s;
      }
    };
  }
  function ring(c) { return Math.max(Math.abs(c[0]), Math.abs(c[1]), Math.abs(-c[0] - c[1])); }

  function 세기(data) {
    var a = { 전: 0, 칭: 0, 금: 0 };
    (function walk(ns) { ns.forEach(function (n) { a.전++; if ((n.단계 || 0) >= 2) a.칭++; if (n.단계 === 3) a.금++; if (n.자식) walk(n.자식); }); })(data.큰);
    return a;
  }
  function 머리(data, 안) {
    var c = 세기(data), t = data.티어, h = '<h2>' + esc(data.제목 || "테크트리") + '</h2>';
    h += '<div class="thx-sum">' + (t && window.TTIER ? TTIER.svg(t, 58) : "") + '<div class="tt">';
    if (t && t.배치) h += '<b>배치 중 ' + t.표본 + ' / ' + t.최소 + '</b><small>' + esc(t.안내 || "기출을 더 풀면 티어가 정해짐") + '</small><div class="bar"><i style="width:' + Math.round(100 * t.표본 / t.최소) + '%"></i></div>';
    else if (t) h += '<b style="color:' + t.색 + '">' + t.이름 + (t.단 ? " " + t.단 : "") + '</b><small>' + esc(t.설명 || "") + (t.다음 ? ' · ' + esc(t.다음.이름) + '까지 ' + t.다음.남은점 + '점' : '') + '</small><div class="bar"><i style="width:' + Math.round(100 * (t.비율 || 0)) + '%;background:' + t.색 + '"></i></div>';
    else h += '<b>칭호 수집</b><small>강점이 확인되면 칭호와 앰블럼이 박힘</small>';
    h += '</div><div class="cnt">칭호<br><b>' + c.칭 + '</b> / ' + c.전 + (c.금 ? '<br>전설 ' + c.금 : '') + '</div></div>';
    h += '<div class="lg"><span><i style="background:' + 금선 + '"></i>큰 줄기</span><span><i style="background:linear-gradient(90deg,#3b82f6,#10b981,#f43f5e)"></i>작은 줄기(갈래 색)</span><span>동 해금 · 은 칭호 · 금 전설</span></div>';
    return h;
  }

  /* ── 안 A: 벌집 줄기 ── */
  function 안A(el, data) {
    var W = Math.max(300, Math.min(720, el.clientWidth - 24)), h = 머리(data, "A");
    data.큰.forEach(function (b, bi) {
      var 색 = b.색 || "#3b6fd8";
      h += '<div class="grp"><div class="gh">' + svgWrap(cell(b, 30, 30, 27, 색, true), 60, 60) + '<div class="nm"><b>' + esc(b.이름) + '</b><small>' + 칭호글(b) + '</small><div class="bar"><i style="width:' + Math.round(100 * (b.진척 || 0)) + '%;background:' + 색 + '"></i></div></div></div>';
      var 묶음 = (b.자식 || []).some(function (k) { return k.자식 && k.자식.length; }) ? b.자식 : [{ 가상: 1, 자식: b.자식 || [] }];
      묶음.forEach(function (m) {
        var kids = m.자식 || [], R = W < 420 ? 16 : 19, G = 1.16, cw = SQ3 * R * G, x0 = 30, per = Math.max(3, Math.floor((W - x0 - 14) / cw - .5));
        var rows = Math.ceil(kids.length / per), H = rows * 1.5 * R * G + R * 1.4 + (m.가상 ? 4 : 0), s = "";
        var head = m.가상 ? 0 : 46, y0 = head + R + 4;
        H += head;
        /* 큰 줄기: 왼쪽 금색 세로줄 */
        s += '<line x1="30" y1="0" x2="30" y2="' + H + '" stroke="' + 금선 + '" stroke-width="5" stroke-linecap="round" opacity="' + (bi === data.큰.length - 1 ? .5 : .9) + '"/>';
        if (!m.가상) {
          s += '<line x1="30" y1="23" x2="56" y2="23" stroke="' + 금선 + '" stroke-width="5" stroke-linecap="round"/>';
          s += cell(m, 74, 23, 19, 색, true);
          s += '<text x="98" y="20" font-size="14" font-weight="800" fill="var(--k)">' + esc(cut(m.이름, Math.floor((W - 110) / 13.5))) + '</text>';
          s += '<text x="98" y="37" font-size="12" font-weight="700" fill="' + ((m.단계 || 0) >= 2 ? 색 : "var(--k3)") + '">' + esc(cut(칭호글(m, 1), Math.floor((W - 110) / 12))) + '</text>';
        }
        var pts = kids.map(function (k, i) { var r = Math.floor(i / per), c = i % per; if (r % 2) c = per - 1 - c; return [x0 + 26 + c * cw + (r % 2 ? cw / 2 : 0), y0 + r * 1.5 * R * G]; });
        /* 작은 줄기: 칸 가운데를 뱀처럼 잇는 선 */
        if (pts.length) {
          var d = "M" + (m.가상 ? 30 : 74) + "," + (m.가상 ? pts[0][1] : 23) + " L" + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" L");
          s += '<path d="' + d + '" fill="none" stroke="' + 색 + '" stroke-width="2.6" stroke-opacity=".7" stroke-linejoin="round" stroke-linecap="round"/>';
        }
        kids.forEach(function (k, i) { s += cell(k, pts[i][0], pts[i][1], R, 색, false); });
        h += svgWrap(s, W, H);
      });
      h += '</div>';
    });
    return h;
  }
  /* ── 안 B: 성장 나무 ── */
  function 안B(el, data) {
    var W = Math.max(300, Math.min(720, el.clientWidth - 24)), cx = W / 2, R = W < 420 ? 13.5 : 16;
    var items = [], y = 0, side = 1, s = "", 위 = 0;
    /* 아래(뿌리)에서 위로 쌓는다. y 는 위로 갈수록 작아짐 */
    var 뿌리y = 0; y = -60;
    var 마디 = [];
    data.큰.forEach(function (b) {
      var 색 = b.색 || "#3b6fd8";
      var 묶음 = (b.자식 || []).some(function (k) { return k.자식 && k.자식.length; }) ? b.자식.map(function (m) { return { c: m, k: m.자식 || [] }; }) : [{ c: null, k: b.자식 || [] }];
      var by = y; 마디.push({ b: b, y: by, 색: 색 });
      var yl = by - 34, yr = by - 34;
      묶음.forEach(function (g) {
        var cl = cluster(g.c, g.k, R, 색), half = W / 2 - 8; cl.h += 16; cl.oy += 16;
        var 옆 = cl.w + 40 <= half * 2 - 60 && cl.w <= half - 20;
        var ccx, top;
        if (옆) {
          if (side > 0) { ccx = cx + 26 + cl.w / 2 - (cl.w / 2 - cl.ox) * 0; ccx = Math.min(W - cl.w + cl.ox - 4, cx + 30 + cl.ox); top = yr - cl.h; yr = top - 10; }
          else { ccx = Math.max(cl.ox + 4, cx - 30 - (cl.w - cl.ox)); top = yl - cl.h; yl = top - 10; }
          side = -side;
        } else { ccx = cx - cl.w / 2 + cl.ox; top = Math.min(yl, yr) - cl.h - 20; yl = yr = top - 10; }
        var ccy = top + cl.oy;
        items.push({ cl: cl, x: ccx, y: ccy, top: top, by: by, 색: 색, c: g.c });
      });
      y = Math.min(yl, yr) - 52;
    });
    위 = y + 20;
    var off = -위 + 10, H = 뿌리y - 위 + 70;
    /* 큰 줄기(금): 뿌리 → 줄기 → 각 송이 */
    s += '<path d="M' + cx + ',' + (뿌리y + off + 40) + ' L' + cx + ',' + (마디[마디.length - 1].y + off) + '" stroke="' + 금선 + '" stroke-width="9" stroke-linecap="round" fill="none"/>';
    s += '<path d="M' + (cx - 40) + ',' + (뿌리y + off + 52) + ' Q' + cx + ',' + (뿌리y + off + 26) + ' ' + (cx + 40) + ',' + (뿌리y + off + 52) + '" stroke="' + 금선 + '" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>';
    items.forEach(function (it) {
      s += '<path d="M' + cx + ',' + (it.by + off) + ' Q' + cx + ',' + (it.y + off + 10) + ' ' + it.x.toFixed(1) + ',' + (it.y + off).toFixed(1) + '" stroke="' + 금선 + '" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".85"/>';
    });
    items.forEach(function (it) { s += it.cl.draw(it.x, it.y + off); });
    items.forEach(function (it) { if (!it.c) return; s += '<text x="' + it.x.toFixed(1) + '" y="' + (it.top + off + 2).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="900" fill="' + it.색 + '" paint-order="stroke" stroke="var(--bg)" stroke-width="4">' + esc(cut(it.c.이름, 14)) + '</text>'; });
    마디.forEach(function (m) {
      s += cell(m.b, cx, m.y + off, 24, m.색, true);
      s += '<text x="' + cx + '" y="' + (m.y + off + 40) + '" text-anchor="middle" font-size="13" font-weight="900" fill="var(--k)" paint-order="stroke" stroke="var(--bg)" stroke-width="4">' + esc(cut(m.b.이름, 12)) + '</text>';
    });
    s += '<text x="' + cx + '" y="' + (뿌리y + off + 66) + '" text-anchor="middle" font-size="12" font-weight="800" fill="var(--k2)">뿌리 · 여기서 자람</text>';
    return 머리(data, "B") + '<div class="scroll">' + svgWrap(s, W, H) + '</div>';
  }
  /* ── 안 C: 밤 보드 ── */
  function 안C(el, data) {
    var h = 머리(data, "C"), W = Math.min(340, Math.max(250, el.clientWidth - 40)), R = 15;
    data.큰.forEach(function (b) {
      var 색 = b.색 || "#3b6fd8";
      var 셋 = (b.자식 || []).some(function (k) { return k.자식 && k.자식.length; });
      h += '<div class="grp"><div class="gh">' + svgWrap(cell(b, 30, 30, 27, 색, true), 60, 60) + '<div class="nm"><b>' + esc(b.이름) + '</b><small>' + 칭호글(b) + '</small><div class="bar"><i style="width:' + Math.round(100 * (b.진척 || 0)) + '%;background:' + 색 + '"></i></div></div></div><div class="cards">';
      (셋 ? b.자식 : [b]).forEach(function (m) {
        var kids = 셋 ? (m.자식 || []) : (b.자식 || []), cl = cluster(셋 ? m : null, kids, R, 색), sc = Math.min(1, (W - 8) / cl.w);
        var Wc = cl.w * sc, Hc = cl.h * sc, s = '<g transform="scale(' + sc.toFixed(3) + ')">' + cl.draw(cl.ox, cl.oy) + '</g>';
        var 수 = kids.filter(function (k) { return (k.단계 || 0) >= 2; }).length;
        h += '<div class="cardc"><div class="ct">' + esc(셋 ? m.이름 : b.이름) + '<span>칭호 ' + 수 + '/' + kids.length + '</span></div>' + svgWrap(s, Wc, Hc) + '</div>';
      });
      h += '</div></div>';
    });
    return h;
  }
  function cut(s, n) { s = String(s || ""); return s.length > n ? s.slice(0, Math.max(1, n - 1)) + "…" : s; }
  function 칭호글(n, 짧게) {
    var 단 = n.단계 || 0;
    if (단 >= 2) return (짧게 ? "" : "<em>") + esc(n.칭호 || "") + (짧게 ? "" : "</em>");
    return 짧게 ? "칭호 ???" : "칭호 ??? · " + esc(n.조건 || "강점이 확인되면 열림");
  }
  function svgWrap(s, w, h) { return '<svg class="thx-s" width="' + Math.round(w) + '" height="' + Math.round(h) + '" viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>'; }

  /* ── 노드 시트 ── */
  function 찾기(data, id) { var f = null; (function w(ns, p) { ns.forEach(function (n) { if (n.id === id) f = { n: n, p: p }; if (n.자식) w(n.자식, n); }); })(data.큰, null); return f; }
  function 시트(data, id) {
    var f = 찾기(data, id); if (!f) return;
    var n = f.n, 단 = n.단계 || 0, 색 = n.색 || (f.p && f.p.색) || (색찾기(data, id)) || "#3b6fd8";
    var 큰 = !!(n.자식 && n.자식.length);
    var d = document.createElement("div"); d.className = "thx-sh";
    var steps = [1, 2, 3].map(function (l) { return '<div class="' + (단 >= l ? "on" : "") + '">' + TEMB.svg({ 상징: n.상징, 색: 색, 단계: 단 >= l ? l : 0, 크기: 34 }) + ["", "동 해금", "은 칭호", "금 전설"][l] + '</div>'; }).join("");
    d.innerHTML = '<div class="in"><div class="top">' + TEMB.svg({ 상징: n.상징, 표: n.표, 색: 색, 단계: 단, 크기: 104, 큰: 큰 }) +
      '<div class="t"><span class="lvl">' + ["잠김", "동 · 해금", "은 · 칭호 획득", "금 · 전설"][단] + '</span><h3>' + (단 >= 2 ? esc(n.칭호) : "칭호 ???") + '</h3><div class="nm">' + esc(n.이름) + '</div></div></div>' +
      '<p>' + (단 >= 2 ? esc(n.한줄 || "") : esc(n.조건 || "")) + '</p>' +
      (n.진척 != null ? '<div class="bar" style="height:7px;border-radius:9px;background:#eef1f6;margin-top:10px;overflow:hidden"><i style="display:block;height:100%;width:' + Math.round(100 * n.진척) + '%;background:' + 색 + '"></i></div><div style="font-size:12px;color:#8b93a3;margin-top:4px">' + esc(n.진척글 || ("진척 " + Math.round(100 * n.진척) + "%")) + '</div>' : '') +
      '<div class="steps">' + steps + '</div>' +
      '<div class="go">' + (n.링크 || []).map(function (l, i) { return '<a class="' + (i === 0 ? "p" : "") + '" href="' + esc(l.href) + '">' + esc(l.글) + '</a>'; }).join("") + '<button type="button">닫기</button></div></div>';
    d.addEventListener("click", function (e) { if (e.target === d || e.target.tagName === "BUTTON") d.remove(); });
    document.body.appendChild(d);
  }
  function 색찾기(data, id) { var c = null; data.큰.forEach(function (b) { (function w(ns) { ns.forEach(function (n) { if (n.id === id) c = b.색; if (n.자식) w(n.자식); }); })([b]); }); return c; }

  /* ── 새로 얻은 칭호 연출 ── */
  function 새것(data) {
    var 키 = "thx." + (data.앱키 || "x"), 옛 = null, 지금 = {}, 새 = [];
    try { 옛 = JSON.parse(localStorage.getItem(키) || "null"); } catch (e) {}
    (function w(ns) { ns.forEach(function (n) { 지금[n.id] = n.단계 || 0; if (옛 && (n.단계 || 0) >= 2 && (n.단계 || 0) > (옛[n.id] || 0)) 새.push(n); if (n.자식) w(n.자식); }); })(data.큰);
    try { localStorage.setItem(키, JSON.stringify(지금)); } catch (e) {}
    var 동 = {}; if (옛) Object.keys(지금).forEach(function (k) { if (지금[k] >= 1 && !(옛[k] >= 1)) 동[k] = 1; });
    return { 새: 새.sort(function (a, b) { return (b.단계 || 0) - (a.단계 || 0); }), 동: 동 };
  }
  function 축하(data, list, 기다림) {
    if (!list.length) return;
    /* 첫 진입 안내(zzcoach #zzc)나 다른 큰 장면이 떠 있으면 끝날 때까지 기다린다 */
    if (기다림 !== 0 || document.getElementById("zzc") || document.querySelector(".thx-cel")) { setTimeout(function () { 축하(data, list, 0); }, 기다림 === undefined ? 1300 : 600); return; }
    var n = list[0], 색 = n.색 || 색찾기(data, n.id) || "#3b6fd8", d = document.createElement("div");
    d.className = "thx-cel";
    d.innerHTML = '<div class="em">' + TEMB.svg({ 상징: n.상징, 표: n.표, 색: 색, 단계: n.단계, 크기: 190, 큰: !!(n.자식 && n.자식.length) }) + '</div>' +
      '<div class="k">' + (n.단계 === 3 ? "전설 승급" : "칭호 획득") + '</div><h3>' + esc(n.칭호) + '</h3><p>' + esc(n.한줄 || "") + '</p>' +
      (list.length > 1 ? '<div class="more">이번에 칭호 ' + list.length + '개를 한꺼번에 얻음</div>' : '') + '<button type="button">받기</button>';
    d.querySelector("button").onclick = function () { d.remove(); };
    document.body.appendChild(d);
  }

  function render(el, data, opt) {
    if (!window.TEMB) { el.textContent = "emblem.js 가 먼저 필요함"; return; }
    css(); opt = opt || {};
    var 안 = opt.안 || "A";
    var 결 = 새것(data);
    el.classList.add("thx"); el.classList.remove("thx-A", "thx-B", "thx-C"); el.classList.add("thx-" + 안);
    el.innerHTML = (안 === "B" ? 안B : 안 === "C" ? 안C : 안A)(el, data);
    el.querySelectorAll(".cell").forEach(function (c) {
      if (결.동[c.dataset.id]) c.classList.add("pop");
      c.addEventListener("click", function () { 시트(data, c.dataset.id); });
    });
    if (안 === "B") { var sc = el.querySelector(".scroll"); if (sc) sc.scrollTop = sc.scrollHeight; }
    if (!opt.조용히) 축하(data, 결.새);
  }
  window.THEX = { render: render, 시트: 시트 };
})();

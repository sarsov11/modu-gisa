/* 막판 루틴 카드 — 정보처리기사 실기 시험 7일 전부터 홈 맨 위 (2026-10-18)
 *
 *  모양은 통사 routinecard.js A안(큰 숫자 + 칸 막대 + 세로 길, 지금 할 것만 떠 있는 카드)을 따른다.
 *  자료: js/gmakpan.js(window.MK) — 앱생성.py 가 20_실기\<종목>\막판.json 에 항목별 문항 id 를 채워 싣는다.
 *  진행: 실기 기록 GS.S.실기[id] = {n:푼 횟수, v:채점, t:마지막으로 푼 날} 에서 오늘(t) 푼 수를 센다.
 *        같은 문항을 오늘 두 번 풀면 한 번으로 센다.
 *  오답 다시: 오늘 다시 푼 문항(n≥2, t=오늘)을 센다. 다시 볼 문항이 하나도 없으면 끝난 것으로 친다.
 *  전날 체크: 시험 전날 18시부터 시험 당일 정오까지 카드 맨 위에 뜬다. 이틀 전부터는 아래에 작은 링크.
 *  화면 확인용: ?mkday=2026-10-24T20 (그 날짜·시각으로 보고 싶을 때)
 */
(function () {
  "use strict";
  var MK = window.MK, GS = window.GS;
  if (!MK || !GS || !GS.S) return;
  var D = document;
  function esc(t) { return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { } return null; }
  function 키(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  var 지금 = new Date();
  try { var q = new URLSearchParams(location.search).get("mkday"); if (q) { var m = q.match(/^(\d{4})-(\d\d)-(\d\d)(?:T(\d\d))?$/); if (m) 지금 = new Date(+m[1], m[2] - 1, +m[3], +(m[4] || 9)); } } catch (e) { }
  var 오늘 = 키(지금);
  var 시험 = new Date(MK.시험일 + "T00:00:00");
  var 남은 = Math.round((new Date(오늘 + "T00:00:00") - 시험) / -864e5);
  if (남은 < 0 || 남은 > (MK.며칠전부터 || 7)) return;
  var 시 = 지금.getHours();
  var 전날창 = MK.전날 && ((남은 === 1 && 시 >= 18) || (남은 === 0 && 시 < 12));

  var 기 = GS.S.실기 || {};
  var COL = { code: "#E5484D", sql: "#0EA5E9", def: "#8B5CF6", wrong: "#F59E0B" };
  var ICON = { code: "{ }", sql: "DB", def: "방", wrong: "↺" };
  var 오답남음 = Object.keys(기).filter(function (id) { return 기[id] && 기[id].v < 2; }).length;

  var 항목 = (MK.항목 || []).map(function (it) {
    var 한 = 0, 목표 = it.목표 || 10, href, 부제 = it.부제 || "";
    if (it.k === "wrong") {
      Object.keys(기).forEach(function (id) { var r = 기[id]; if (r && r.t === 오늘 && r.n >= 2) 한++; });
      목표 = Math.min(목표, 한 + 오답남음);
      href = "silgi.html?wrong=1&rt=1";
      부제 = 목표 === 0 ? "앞의 세 가지에서 틀린 문항이 여기로 옵니다" : "다시 볼 문항 " + 오답남음 + "개";
    } else {
      (it.ids || []).forEach(function (id) { var r = 기[id]; if (r && r.t === 오늘) 한++; });
      href = "silgi.html?z=" + encodeURIComponent((it.z || []).join("|")) + "&n=" + 목표 + "&rt=1&tt=" + encodeURIComponent(it.제목 + " " + 목표);
    }
    return { k: it.k, 제목: it.제목 + (it.k === "wrong" ? "" : " " + (it.목표 || 10)), 부제: 부제, 한: Math.min(한, 목표), 목표: 목표, 끝: 한 >= 목표, href: href };
  });
  /* 다시 볼 문항이 하나도 없으면 앞의 항목을 다 끝냈을 때 함께 끝난 것으로 친다(첫날부터 공짜 한 칸이 되지 않게) */
  항목.forEach(function (it) { if (it.k === "wrong" && it.목표 === 0) it.끝 = 항목.every(function (o) { return o === it || o.끝; }); });
  var n = 항목.length, nd = 항목.filter(function (it) { return it.끝; }).length, 다 = nd === n;
  var 지금할 = 다 ? null : 항목.filter(function (it) { return !it.끝; })[0];
  if (다) ls("makpan." + MK.시험일 + "." + 오늘, "1");

  var css = [
    ".mkc{margin:16px 0 6px;border-radius:20px;padding:18px 16px 14px;background:var(--surface);box-shadow:0 10px 30px -14px rgba(0,0,0,.35),0 0 0 1px var(--line)}",
    ".mkc .mk-hd2{display:flex;align-items:flex-end;gap:10px}.mkc .mk-hd2 .mk-k{font-size:13px;font-weight:800;color:var(--ink-3);letter-spacing:.02em}",
    ".mkc .mk-hd2 .mk-k em{font-style:normal;color:var(--cta,var(--accent))}",
    ".mkc .mk-hd2 .mk-big{font:900 34px/1 var(--mono);color:var(--ink);letter-spacing:-.04em;margin-top:4px}.mkc .mk-hd2 .mk-big small{font-size:18px;color:var(--ink-3);font-weight:800}",
    ".mkc .mk-hd2 .mk-hr{margin-left:auto;text-align:right}.mkc .mk-hd2 .mk-chip{display:inline-block;padding:6px 11px;border-radius:999px;background:var(--bg);font:800 13.5px/1 var(--mono);color:var(--ink)}",
    ".mkc .mk-seg4{display:flex;gap:5px;margin:12px 0 4px}.mkc .mk-seg4 i{flex:1;height:12px;border-radius:7px;background:var(--line-2)}",
    ".mkc .mk-seg4 i.mk-done{background:linear-gradient(90deg,#16B364,#3DD68C)}.mkc .mk-seg4 i.mk-now{position:relative;overflow:hidden}",
    ".mkc .mk-seg4 i.mk-now::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,var(--cta,var(--accent)),transparent);animation:mkSweep 1.6s ease-in-out infinite}",
    "@keyframes mkSweep{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}",
    ".mkc .mk-tl{position:relative;margin:12px 0 0;padding:0;list-style:none}",
    ".mkc .mk-tl::before{content:'';position:absolute;left:21px;top:22px;bottom:22px;width:3px;border-radius:3px;background:var(--line-2)}",
    ".mkc .mk-tl li{position:relative;display:flex;align-items:center;gap:13px;padding:9px 4px}",
    ".mkc .mk-tl a.mk-row{display:contents;color:inherit;text-decoration:none}",
    ".mkc .mk-tl .mk-nd{position:relative;z-index:1;flex:0 0 auto;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:#fff;font:900 14px/1 var(--mono);background:var(--c);box-shadow:0 3px 0 rgba(0,0,0,.18)}",
    ".mkc .mk-tl li.mk-up .mk-nd{background:var(--surface);color:var(--c);box-shadow:inset 0 0 0 2.5px var(--c)}",
    ".mkc .mk-tl li.mk-done .mk-nd{background:#16B364;box-shadow:0 3px 0 #0E8A4B}",
    ".mkc .mk-tl .mk-tx{flex:1;min-width:0}.mkc .mk-tl .mk-tx b{display:block;font-size:16px;font-weight:800;letter-spacing:-.02em;color:var(--ink)}",
    ".mkc .mk-tl .mk-tx span{display:block;margin-top:2px;font-size:13.5px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".mkc .mk-tl .mk-mn{font:800 13.5px/1 var(--mono);color:var(--ink-3);font-variant-numeric:tabular-nums}.mkc .mk-tl li.mk-done .mk-mn{color:#16B364}",
    ".mkc .mk-tl li.mk-done .mk-tx b{color:var(--ink-2)}",
    ".mkc .mk-tl li.mk-now{flex-wrap:wrap;margin:6px -6px;padding:13px 10px 12px;border-radius:18px;background:var(--bg);box-shadow:0 12px 28px -12px rgba(0,0,0,.35),0 0 0 1px var(--line)}",
    ".mkc .mk-tl li.mk-now .mk-nd{width:50px;height:50px;font-size:16px;margin-left:-3px;animation:mkPulse 1.8s ease-out infinite}",
    "@keyframes mkPulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--c) 60%,transparent),0 3px 0 rgba(0,0,0,.18)}100%{box-shadow:0 0 0 14px transparent,0 3px 0 rgba(0,0,0,.18)}}",
    ".mkc .mk-tl li.mk-now .mk-tx b{font-size:18px}.mkc .mk-tl li.mk-now .mk-k2{display:block;font-size:12.5px;font-weight:800;color:var(--c);margin-bottom:2px}",
    ".mkc .mk-go{display:flex;align-items:center;justify-content:center;width:100%;margin-top:12px;padding:15px 16px;border-radius:14px;background:var(--cta,var(--accent));color:#fff;text-decoration:none;font-weight:900;font-size:17px;letter-spacing:-.02em;box-shadow:0 4px 0 color-mix(in srgb,var(--cta,var(--accent)) 70%,#000)}",
    ".mkc .mk-eve{display:block;margin:12px 0 4px;padding:14px 14px 13px;border-radius:16px;background:var(--ink);color:var(--bg);text-decoration:none}",
    ".mkc .mk-eve small{display:block;font-size:12.5px;font-weight:800;opacity:.7}.mkc .mk-eve b{display:block;font-size:19px;font-weight:900;letter-spacing:-.03em;margin-top:3px}",
    ".mkc .mk-eve span{display:block;font-size:13.5px;margin-top:3px;opacity:.85}",
    ".mkc .mk-wk{display:flex;justify-content:space-between;gap:4px;margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}",
    ".mkc .mk-wk div{flex:1;text-align:center;font-size:11.5px;font-weight:800;color:var(--ink-3);font-family:var(--mono)}",
    ".mkc .mk-wk div i{display:grid;place-items:center;width:28px;height:28px;margin:4px auto 0;border-radius:50%;border:2px solid var(--line-2);font-style:normal;font-size:13px;font-weight:900}",
    ".mkc .mk-wk div.mk-full i{background:linear-gradient(160deg,#FFB020,#FF6A00);border:0;color:#fff;box-shadow:0 2px 6px rgba(255,106,0,.35)}",
    ".mkc .mk-wk div.mk-tdy{color:var(--ink)}.mkc .mk-wk div.mk-tdy i{border-color:var(--ink)}",
    ".mkc .mk-ft{margin:10px 0 0;font-size:13.5px;color:var(--ink-3);text-align:center}.mkc .mk-ft a{color:var(--ink-2);font-weight:800}",
    ".mkc.alldone .mk-hd2 .mk-k{color:#16B364}"
  ].join("\n");

  function 그리기() {
    var 막대 = '<div class="mk-seg4">' + 항목.map(function (it) { return '<i class="' + (it.끝 ? "mk-done" : (it === 지금할 ? "mk-now" : "")) + '"></i>'; }).join("") + '</div>';
    var 머리 = '<div class="mk-hd2"><div><span class="mk-k">' + (다 ? "오늘 막판 루틴 끝" : '막판 루틴 · <em>' + (남은 === 0 ? "시험 당일" : "D-" + 남은) + '</em>') + '</span>' +
      '<div class="mk-big">' + nd + '<small> / ' + n + '</small></div></div>' +
      '<div class="mk-hr"><span class="mk-chip">' + (시험.getMonth() + 1) + "/" + 시험.getDate() + " " + esc(MK.시험이름 || "시험") + '</span></div></div>';
    var 전날 = 전날창 ? '<a class="mk-eve" href="' + esc(MK.전날.href) + '"><small>' + (남은 === 1 ? "내일 시험" : "오늘 시험") + '</small><b>' + esc(MK.전날.제목) + ' →</b><span>' + esc(MK.전날.부제) + '</span></a>' : "";
    var 길 = '<ol class="mk-tl">' + 항목.map(function (it, i) {
      var s = it.끝 ? "done" : (it === 지금할 ? "now" : "up"), col = COL[it.k] || "#6B7280";
      var 칸 = '<span class="mk-nd">' + (it.끝 ? "✓" : esc(ICON[it.k] || (i + 1))) + '</span>' +
        '<span class="mk-tx">' + (s === "now" ? '<span class="mk-k2">' + (i + 1) + '번째, 지금</span>' : '') + '<b>' + esc(it.제목) + '</b><span>' + esc(it.부제) + '</span></span>' +
        '<span class="mk-mn">' + (it.끝 ? "완료" : it.한 + "/" + it.목표) + '</span>';
      return '<li class="mk-' + s + '" style="--c:' + col + '">' + (s === "now" ? 칸 + '<a class="mk-go" href="' + it.href + '">' + (it.한 ? "이어서 하기" : "시작하기") + ' →</a>' : '<a class="mk-row" href="' + it.href + '">' + 칸 + '</a>') + '</li>';
    }).join("") + '</ol>';
    /* 시험 전 7일 칸 — 그날 네 가지를 다 끝낸 날은 채운다 */
    var 칸들 = "";
    for (var k = MK.며칠전부터 || 7; k >= 1; k--) {
      var d = new Date(시험); d.setDate(시험.getDate() - k);
      var dk = 키(d), full = ls("makpan." + MK.시험일 + "." + dk) === "1";
      칸들 += '<div class="' + (full ? "mk-full " : "") + (dk === 오늘 ? "mk-tdy" : "") + '">D-' + k + '<i>' + (full ? "✓" : d.getDate()) + '</i></div>';
    }
    var 꼬리 = (!전날창 && MK.전날 && 남은 <= 2) ? '<p class="mk-ft"><a href="' + esc(MK.전날.href) + '">' + esc(MK.전날.제목) + ' 미리 보기</a></p>' : "";
    return '<div class="mkc' + (다 ? " alldone" : "") + '" id="mkc">' + 머리 + 막대 + 전날 + 길 + '<div class="mk-wk">' + 칸들 + '</div>' + 꼬리 + '</div>';
  }

  var st = D.createElement("style"); st.textContent = css; D.head.appendChild(st);
  var 자리 = D.querySelector(".page .when") || D.querySelector(".page");
  if (!자리) return;
  if (자리.classList && 자리.classList.contains("when")) 자리.insertAdjacentHTML("afterend", 그리기());
  else 자리.insertAdjacentHTML("afterbegin", 그리기());
})();

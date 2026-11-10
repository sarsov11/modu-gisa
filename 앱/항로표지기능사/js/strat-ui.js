/* 합격 전략 창(zzstrat.js) 덮개 — 공용 파일은 그대로 두고, 앱에서 글자·색·모양만 덮는다(화면표준 14절).
   열린 Shadow DOM 안에 덮개 style 을 넣고, 떠 있는 알약은 쓰지 않는다(오늘 목록 줄 · 설정 줄로 연다).  2026-11-10 */
window.ZZSTRAT_THEME = "light";   /* 검은 화면 이야기 대신 흰 화면(화면표준 14절) */
  (function(){
    var P="#E8590C", PI="#C2410C", PS="rgba(232,89,12,.10)";
    var 덮개=[
      "#zs,#zst,#zsy{--zs-bg:#FFFFFF;--zs-card:#FFFFFF;--zs-line:#E6E8EC;--zs-red:"+P+";--zs-blue:#F4A06B;--zs-gold:#7C818C;--zs-soft:#F1F3F6;--zs-tx:#111419;--zs-sub:#5F6670}",
      "#zs .top .t{letter-spacing:0;font-size:13px}#zs .top button{border-radius:12px}",
      "#zs section{border-radius:18px;box-shadow:none}",
      "#zs .chip{border-radius:999px;background:#F1F3F6;color:#333941}#zs .chip.r{background:"+PS+";color:"+PI+"}",
      "#zs .pk{border:1px solid #E6E8EC;border-radius:14px;background:#FFFFFF}#zs .pk.on{border-color:"+P+";background:"+PS+";box-shadow:none}",
      "#zs .tg{border-radius:999px;font-size:11.5px}#zs .tg.a{background:"+P+";color:#fff}#zs .tg.l{background:rgba(232,89,12,.16);color:"+PI+";border:0}#zs .tg.g{background:#F1F3F6;color:#5F6670;border:0}",
      "#zs .sc,#zs .sc.s,#zs .sc.d{border:1px solid #E6E8EC;border-radius:14px}#zs .sc.on{background:#FFFFFF}#zs .sc .rb{border-radius:999px}",
      "#zs .sc.s .rb,#zs .sc.s .bar b{background:"+P+"}#zs .sc.d .rb,#zs .sc.d .bar b{background:#F4A06B}#zs .sc.b .bar b{background:#B4BAC3}",
      "#zs .det{border-radius:14px}#zs .vl i{background:"+P+";border-radius:50%}",
      "#zs .gauge .fl{background:rgba(232,89,12,.14)}#zs .stack i.s{background:"+P+"}#zs .stack i.d{background:#F4A06B}#zs .stack i.b{background:#B4BAC3}",
      "#zs .gp b{background:"+P+";border-radius:12px}#zs .gp::after{background:"+P+"}#zs .gb .gline b{border-radius:12px}",
      "#zs .gc .cd{border:1px solid #E6E8EC;border-radius:14px}",
      "#zs .gc .cd:nth-child(1){--c:"+P+"!important}#zs .gc .cd:nth-child(2){--c:#F08A4B!important}#zs .gc .cd:nth-child(3){--c:#F5B58A!important}#zs .gc .cd:nth-child(n+4){--c:#9CA3AF!important}",
      "#zs .gc .cg{border-radius:999px}#zs .hit{border-radius:14px}",
      "#zs .q li.a::before{background:"+P+";border-color:"+P+"}#zs .q .st.f{color:"+PI+";border-color:"+PI+"}#zs .q{border-radius:14px}",
      "#zs .go{background:"+P+";border-radius:12px}#zst .nx{background:"+P+";border-radius:12px}#zst .hole{border-radius:14px}#zst .bub{border-radius:18px}",
      "#zsy .nx{background:"+P+"}#zsy .pg i{background:"+P+"}#zsy .pk{border:1px solid #E6E8EC}#zsy .pk.on{border-color:"+P+";box-shadow:none}",
      "#zsy{background:#FFFFFF}#zsy .ln{color:#111419}#zsy .ln b{color:"+P+"}#zsy.B .ln.old{color:#B4BAC3}#zsy .pg{background:#EFF1F4}#zsy .nx{color:#fff}",
      "#zsy .end button{border:1px solid "+P+";color:"+PI+"}#zsy .end .main{background:"+P+";color:#fff}"
    ].join("\n");
    function 글(root){ var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false), n; while((n=w.nextNode())){ if(n.nodeValue.indexOf("합격전략")>=0) n.nodeValue=n.nodeValue.replace(/합격전략/g,"합격 전략"); } }
    function 말(){
      document.querySelectorAll(".zs-fab,.zs-btn").forEach(function(el){ 글(el); });
      var h=document.getElementById("zs-host");
      if(h && h.shadowRoot){
        if(!h.shadowRoot.getElementById("gs-ov")){ var st=document.createElement("style"); st.id="gs-ov"; st.textContent=덮개; h.shadowRoot.appendChild(st); }
        글(h.shadowRoot);
      }
    }
    new MutationObserver(말).observe(document.documentElement,{childList:true,subtree:true}); 말();
  })();
window.GSTRATUI = {
  /* 목록 줄(오늘 화면 「다른 연습」과 같은 모양) 하나를 컨테이너 맨 위에 넣는다 */
  줄: function (컨테이너, id, 안) {
    if (!컨테이너 || 컨테이너.querySelector("[data-zs]")) return null;
    var a = document.createElement("a");
    a.href = "#"; a.setAttribute("data-zs", "1"); a.className = 안 ? "zs-row" : "pan";
    var 화살 = document.querySelector(".links .ar") ? document.querySelector(".links .ar").outerHTML : '<span class="ar">›</span>';
    a.innerHTML = '<div><b>합격 전략</b><small>합격선과 과목별 목표</small></div>' + 화살;
    a.onclick = function (ev) { ev.preventDefault(); if (window.ZZSTRAT) ZZSTRAT.open(id); };
    컨테이너.appendChild(a); return a;
  }
};

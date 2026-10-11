/* 실기 확장 엔진 (정보처리기사 1011) — 코드 출력 예측·SQL 실행 채점·단답 동의어·한 줄씩 따라가기
   SGX.색(코드, 언어)       → 줄별 HTML (구문 색)
   SGX.출력채점(학생, 정답)  → true/false   규칙: SGX.출력규칙
   SGX.용어채점(학생, 문항)  → true/false   (a + syn 목록)
   SGX.SQL채점(학생SQL, 문항) → Promise<{ok, 표학생, 표정답, 오류}>
   SGX.재생기(상자, 문항)    → 따라가기 화면을 상자에 그린다                          */
(function(){
  var SGX = {};
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}

  /* ── 구문 색 ── */
  var KW = {
    c: "auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while NULL include define",
    java: "abstract boolean break byte case catch char class continue default do double else extends final finally float for if implements import instanceof int interface long new null package private protected public return short static super switch this throw throws try void while true false String",
    sql: "SELECT FROM WHERE GROUP BY HAVING ORDER ASC DESC INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE VIEW INDEX DROP ALTER ADD JOIN INNER LEFT RIGHT OUTER ON AS AND OR NOT IN IS NULL LIKE BETWEEN DISTINCT COUNT SUM AVG MAX MIN UNION ALL EXISTS PRIMARY KEY FOREIGN REFERENCES CHECK UNIQUE DEFAULT GRANT REVOKE TO CASCADE select from where group by having order asc desc insert into values update set delete create table join on as and or not in is null like between distinct count sum avg max min union all",
    python: "and as assert break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield print range len"
  };
  SGX.색 = function(code, lang){
    var kw = {}; (KW[lang]||"").split(" ").forEach(function(w){kw[w]=1;});
    var cm = lang==="python" ? /#.*/y : lang==="sql" ? /--.*/y : /\/\/.*|\/\*[\s\S]*?\*\//y;
    var out = "", i = 0, s = code;
    var re = {
      str: /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y,
      num: /\b\d+(?:\.\d+)?[fFlL]?\b/y,
      id: /[A-Za-z_]\w*/y,
      pre: /#\s*\w+/y
    };
    while (i < s.length){
      var m, hit = null;
      cm.lastIndex = i; if ((m = cm.exec(s))) hit = ["cm", m[0]];
      if (!hit && lang==="c"){ re.pre.lastIndex=i; if ((m=re.pre.exec(s)) && (i===0||s[i-1]==="\n")) hit=["kw",m[0]]; }
      if (!hit){ re.str.lastIndex=i; if ((m=re.str.exec(s))) hit=["st",m[0]]; }
      if (!hit){ re.num.lastIndex=i; if ((m=re.num.exec(s))) hit=["nu",m[0]]; }
      if (!hit){ re.id.lastIndex=i; if ((m=re.id.exec(s))) hit=[kw[m[0]]?"kw":(s[i+m[0].length]==="("?"fn":""), m[0]]; }
      if (hit){ out += hit[0] ? '<span class="x-'+hit[0]+'">'+esc(hit[1])+'</span>' : esc(hit[1]); i += hit[1].length; }
      else { out += esc(s[i]); i++; }
    }
    /* 줄마다 자르되 여러 줄에 걸친 span 은 줄 끝에서 닫고 다음 줄에서 다시 연다 */
    var lines = [], open = null, cur = "";
    out.split(/(<span class="x-\w+">|<\/span>|\n)/).forEach(function(t){
      if (!t) return;
      if (t === "\n"){ lines.push(cur + (open?"</span>":"")); cur = open || ""; }
      else if (t.indexOf("<span")===0){ open = t; cur += t; }
      else if (t === "</span>"){ open = null; cur += t; }
      else cur += t;
    });
    lines.push(cur);
    return lines;
  };

  /* ── 코드 출력 채점 ── */
  SGX.출력규칙 = "줄바꿈은 그대로 비교합니다. 각 줄의 앞뒤 공백과 맨 끝 빈 줄은 보지 않고, 줄 안의 공백은 여러 칸이어도 한 칸으로 봅니다. 대소문자는 구별합니다.";
  function 줄정리(s){
    var L = String(s||"").replace(/\r\n?/g,"\n").split("\n").map(function(x){return x.replace(/[ \t 　]+/g," ").trim();});
    while (L.length && L[L.length-1]==="") L.pop();
    while (L.length && L[0]==="") L.shift();
    return L;
  }
  SGX.출력채점 = function(학생, 정답){
    var a = 줄정리(학생), b = 줄정리(정답);
    if (a.length !== b.length) return false;
    for (var i=0;i<a.length;i++) if (a[i]!==b[i]) return false;
    return true;
  };
  SGX.출력비교 = function(학생, 정답){   /* 줄마다 같음/다름 — 결과 화면에 보여 준다 */
    var a = 줄정리(학생), b = 줄정리(정답), n = Math.max(a.length,b.length), r=[];
    for (var i=0;i<n;i++) r.push({내:a[i]==null?"":a[i], 답:b[i]==null?"":b[i], 같:a[i]===b[i]});
    return r;
  };

  /* ── 단답 용어 채점 ── */
  function 용어정리(s){
    return String(s||"").toLowerCase().replace(/[\s 　·•\-_.,'"`]/g,"");
  }
  function 조각(s){   /* 「테스트 드라이버(Test Driver)」 → 전체·괄호 밖·괄호 안 */
    var r=[s], m=String(s).match(/^(.*?)[\(（](.*?)[\)）]\s*$/);
    if (m){ r.push(m[1]); r.push(m[2]); }
    return r.map(용어정리).filter(Boolean);
  }
  SGX.용어채점 = function(학생, x){
    var 허용 = {}; [x.a].concat(x.syn||[]).forEach(function(s){ 조각(s).forEach(function(t){허용[t]=1;}); });
    var 답들 = 조각(학생);
    /* 여러 칸 답(①… ②…)은 a 를 줄 단위로 나눠 순서대로 비교 */
    if (x.multi){
      var 내 = String(학생||"").split(/\n|,|，/).map(function(t){return t.replace(/^[\s①-⑳\d.)]+/,"");}).filter(function(t){return t.trim();});
      return x.multi.length===내.length && x.multi.every(function(syns,i){
        var ok={}; syns.forEach(function(s){조각(s).forEach(function(t){ok[t]=1;});});
        return 조각(내[i]).some(function(t){return ok[t];});
      });
    }
    return 답들.some(function(t){return 허용[t];});
  };

  /* 순서 무관 출력(set 등): 낱말 묶음으로 비교 */
  SGX.낱말같음 = function(학생, 정답){
    function 쪼개(s){ return String(s||"").split(/[\s,{}\[\]()'"]+/).filter(Boolean).sort().join("|"); }
    return 쪼개(학생) === 쪼개(정답);
  };
  /* 한 칸 채점: 용어(동의어) + 수(단위·쉼표 무시) */
  function 수(s){ var m=String(s||"").replace(/,/g,"").match(/^\s*([-+]?\d+(?:\.\d+)?)\s*[^\d\s]*\s*$/); return m?parseFloat(m[1]):null; }
  SGX.칸채점 = function(학생, 칸){   /* 칸 = {a, syn} */
    if (SGX.용어채점(학생, {a:칸.a, syn:칸.syn||[]})) return true;
    var a=수(학생), b=수(칸.a);
    if (a!=null && b!=null && Math.abs(a-b)<1e-9) return true;
    return (칸.syn||[]).some(function(s){ var c=수(s); return a!=null && c!=null && Math.abs(a-c)<1e-9; });
  };
  /* 여러 칸: 학생 답 배열 → 칸마다 true/false (순서무관이면 짝 맞추기) */
  SGX.칸들채점 = function(답들, 칸들, 순서무관){
    if (!순서무관) return 칸들.map(function(k,i){ return SGX.칸채점(답들[i]||"", k); });
    var 남 = 칸들.map(function(_,i){return i;}), r = 답들.map(function(){return false;});
    답들.forEach(function(d,i){ for (var j=0;j<남.length;j++) if (SGX.칸채점(d, 칸들[남[j]])){ r[i]=true; 남.splice(j,1); break; } });
    return r;
  };

  /* ── SQL 채점 (sql.js) ── */
  var 엔진 = null;
  function sql준비(){
    if (엔진) return 엔진;
    엔진 = new Promise(function(ok, no){
      var s = document.createElement("script");
      s.src = "js/sqljs/sql-wasm.js";
      s.onload = function(){ initSqlJs({locateFile:function(f){return "js/sqljs/"+f;}}).then(ok, no); };
      s.onerror = no;
      document.head.appendChild(s);
    });
    return 엔진;
  }
  SGX.sql준비 = sql준비;
  function 실행(SQL, schema, 문){
    var db = new SQL.Database();
    try {
      db.run(schema);
      var r = db.exec(문);
      var 변경 = /^\s*(insert|update|delete|create|alter|drop)/i.test(문);
      if (변경 || !r.length){
        /* 바꾸는 문장이면 결과표 대신 테이블 상태를 비교한다 */
        var 표들 = db.exec("SELECT name FROM sqlite_master WHERE type IN ('table','view') ORDER BY name");
        var 상태 = (표들[0]?표들[0].values:[]).map(function(v){
          var t = db.exec('SELECT * FROM "'+v[0]+'"');
          return {이름:v[0], 열:t[0]?t[0].columns:[], 행:t[0]?t[0].values:[]};
        });
        return {변경:true, 상태:상태, 마지막:r.length?r[r.length-1]:null};
      }
      var last = r[r.length-1];
      return {열:last.columns, 행:last.values};
    } finally { db.close(); }
  }
  function 같은값(a,b){
    if (typeof a==="number" && typeof b==="number") return Math.abs(a-b) < 1e-6;
    return String(a)===String(b);
  }
  function 행같음(a,b){ return a.length===b.length && a.every(function(v,i){return 같은값(v,b[i]);}); }
  function 표같음(A,B,순서){
    if (A.열.length!==B.열.length || A.행.length!==B.행.length) return false;
    if (순서) return A.행.every(function(r,i){return 행같음(r,B.행[i]);});
    var 남 = B.행.slice();
    return A.행.every(function(r){ for (var i=0;i<남.length;i++) if (행같음(r,남[i])){ 남.splice(i,1); return true; } return false; });
  }
  SGX.SQL채점 = function(학생, x){
    return sql준비().then(function(SQL){
      var 정 = 실행(SQL, x.schema, x.a), 내;
      try { 내 = 실행(SQL, x.schema, 학생); }
      catch(e){ return {ok:false, 오류:String(e.message||e), 표정답:정}; }
      var ok;
      if (정.변경){
        ok = !!내.변경 && 정.상태.length===내.상태.length && 정.상태.every(function(t,i){return 표같음({열:t.열,행:t.행},{열:내.상태[i].열,행:내.상태[i].행},false);});
      } else {
        var 순서 = /order\s+by/i.test(x.a);
        ok = !내.변경 && 표같음(내, 정, 순서) && (!순서 || /order\s+by/i.test(학생));   /* 우연히 같은 순서로 나온 것은 정답이 아니다 */
      }
      return {ok:ok, 표학생:내, 표정답:정};
    });
  };
  SGX.표HTML = function(t, 이름){
    if (!t) return "";
    if (t.변경) return t.상태.map(function(s){return SGX.표HTML({열:s.열,행:s.행}, s.이름);}).join("");
    return '<div class="x-tbl">'+(이름?'<b>'+esc(이름)+'</b>':'')+'<table><thead><tr>'+t.열.map(function(c){return "<th>"+esc(c)+"</th>";}).join("")+
      '</tr></thead><tbody>'+(t.행.length?t.행.map(function(r){return "<tr>"+r.map(function(v){return "<td>"+esc(v==null?"NULL":(typeof v==="number"&&v%1?(+v.toFixed(4)):v))+"</td>";}).join("")+"</tr>";}).join(""):'<tr><td colspan="'+t.열.length+'">결과 없음</td></tr>')+'</tbody></table></div>';
  };
  SGX.스키마표 = function(x){   /* 문제에 보여 줄 처음 테이블 */
    return sql준비().then(function(SQL){
      var db = new SQL.Database(); db.run(x.schema);
      var 표들 = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid");
      var h = (표들[0]?표들[0].values:[]).map(function(v){var t=db.exec('SELECT * FROM "'+v[0]+'"'); return SGX.표HTML(t[0]?{열:t[0].columns,행:t[0].values}:{열:[],행:[]}, "["+v[0]+"]");}).join("");
      db.close(); return h;
    });
  };

  /* 문제 글: 마크다운 표(| a | b |)는 표로, **굵게** 는 굵게 — 나머지는 줄바꿈 그대로 */
  SGX.본문HTML = function(q){
    var L = String(q||"").replace(/\r\n?/g,"\n").split("\n"), out = [], 표 = [];
    function 칸(l){ return l.trim().replace(/^\||\|$/g,"").split("|").map(function(c){return c.trim();}); }
    function 굵게(t){ return esc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>"); }
    function 닫기(){
      if (!표.length) return;
      var 줄 = 표.filter(function(l){return !/^\s*\|?\s*:?-{2,}/.test(l);}).map(칸);
      out.push('<div class="x-tbl"><table><thead><tr>'+줄[0].map(function(c){return "<th>"+굵게(c)+"</th>";}).join("")+'</tr></thead><tbody>'+
        줄.slice(1).map(function(r){return "<tr>"+r.map(function(c){return "<td>"+굵게(c)+"</td>";}).join("")+"</tr>";}).join("")+'</tbody></table></div>');
      표 = [];
    }
    L.forEach(function(l){ if (/^\s*\|.*\|\s*$/.test(l)) 표.push(l); else { 닫기(); out.push(굵게(l)); } });
    닫기();
    return out.join("\n").replace(/\n*(<div class="x-tbl">)/g,"$1").replace(/(<\/table><\/div>)\n*/g,"$1");
  };
  SGX.표있음 = function(q){ return /^\s*\|.*\|\s*$/m.test(String(q||"")); };

  /* ── 코드 상자 ── */
  SGX.코드HTML = function(x){
    var L = SGX.색(x.code, x.lang);
    return '<div class="x-code" data-lang="'+esc(x.lang)+'"><div class="x-lang">'+({c:"C",java:"Java",python:"Python",sql:"SQL"}[x.lang]||x.lang)+'</div><ol>'+
      L.map(function(h,i){return '<li data-l="'+(i+1)+'"><span class="x-ln">'+(i+1)+'</span><code>'+(h||" ")+'</code><em class="x-iv"></em></li>';}).join("")+'</ol></div>';
  };

  /* ── 한 줄씩 따라가기 ── */
  SGX.재생기 = function(상자, x, 옵션){
    옵션 = 옵션||{};
    var T = x.trace||[], k = 0, 타이머 = null;
    var 코드 = 상자.querySelector(".x-code");
    var 판 = document.createElement("div"); 판.className = "x-trace";
    판.innerHTML =
      '<div class="x-frame" id="xf"></div>'+
      '<table class="x-vars"><thead><tr><th>변수</th><th>값</th></tr></thead><tbody id="xv"></tbody></table>'+
      '<div class="x-out"><b>출력</b><pre id="xo"></pre></div>';
    (옵션.판자리||상자).appendChild(판);
    var 막대 = document.createElement("div"); 막대.className = "x-bar";
    막대.innerHTML = '<button data-k="first" aria-label="처음">⏮</button><button data-k="prev" aria-label="이전 줄">◀</button>'+
      '<span class="x-cnt" id="xc"></span><button data-k="play" class="x-play" aria-label="자동 재생">▶</button><button data-k="next" class="x-next" aria-label="다음 줄">다음 줄 ▶</button>';
    (옵션.막대자리||상자).appendChild(막대);
    var 이전값 = {};
    function 그려(){
      var t = T[k] || {l:0,v:{},o:""};
      코드.querySelectorAll("li").forEach(function(li){
        var on = +li.dataset.l === t.l; li.classList.toggle("on", on);
        var iv = li.querySelector(".x-iv"); if (iv) iv.textContent = "";
      });
      var li = 코드.querySelector('li[data-l="'+t.l+'"]');
      if (li){
        li.scrollIntoView({block:"nearest"});
        if (옵션.인라인){
          var 바뀐 = Object.keys(t.v).filter(function(n){return 이전값[n]!==t.v[n];});
          li.querySelector(".x-iv").textContent = 바뀐.slice(0,3).map(function(n){return n+" = "+t.v[n];}).join("  ");
        }
      }
      판.querySelector("#xf").innerHTML = t.f ? '<span>'+esc(t.f.replace(/^\w+\./,""))+'() 안</span> 호출 깊이 '+(t.d||0) : '<span>main</span>';
      판.querySelector("#xv").innerHTML = Object.keys(t.v).filter(function(n){return n!=="args";}).map(function(n){
        var ch = 이전값[n]!==undefined && 이전값[n]!==t.v[n];
        return '<tr class="'+(ch?"x-ch":"")+'"><td>'+esc(n)+'</td><td>'+esc(t.v[n])+'</td></tr>';
      }).join("") || '<tr><td colspan="2" class="x-none">아직 변수가 없습니다</td></tr>';
      판.querySelector("#xo").textContent = t.o || "";
      막대.querySelector("#xc").textContent = (k+1)+" / "+T.length;
      이전값 = Object.assign({}, t.v);
    }
    function 가(n){ k = Math.max(0, Math.min(T.length-1, n)); 그려(); }
    막대.addEventListener("click", function(e){
      var b = e.target.closest("button"); if (!b) return;
      var c = b.dataset.k;
      if (c==="first"){ 이전값={}; 가(0); }
      if (c==="prev"){ var p=k-1; 이전값 = p>0?Object.assign({},T[p-1].v):{}; 가(p); }
      if (c==="next") 가(k+1);
      if (c==="play"){
        if (타이머){ clearInterval(타이머); 타이머=null; b.textContent="▶"; return; }
        b.textContent="❚❚"; 타이머 = setInterval(function(){ if (k>=T.length-1){clearInterval(타이머);타이머=null;b.textContent="▶";return;} 가(k+1); }, 700);
      }
    });
    가(0);
    return {닫기:function(){ if(타이머) clearInterval(타이머); 판.remove(); 막대.remove(); 코드.querySelectorAll("li").forEach(function(li){li.classList.remove("on"); var iv=li.querySelector(".x-iv"); if(iv) iv.textContent="";}); }};
  };

  window.SGX = SGX;
})();

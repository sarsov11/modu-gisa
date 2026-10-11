/* 소방 실기 계산기 엔진 — 식 해석·단위 변환·채점.
   정본 식: 앱공용\_실기\계산식.json (앱에는 js/gcalc.js 의 window.CF 로 들어온다)
   파이썬 판(엔진\소방계산.py)과 문법·채점 규칙이 같아야 한다. 고치면 test_소방계산.py 를 다시 돌린다. */
(function (W) {
  "use strict";
  var 단위표 = {
    "유량": {"m3/s": 1, "m3/min": 1 / 60, "m3/h": 1 / 3600, "L/s": 1e-3, "L/min": 1 / 60000},
    "부피": {"m3": 1, "L": 1e-3},
    "압력": {"Pa": 1, "kPa": 1e3, "MPa": 1e6, "bar": 1e5, "atm": 101325, "kgf/cm2": 98066.5,
            "mAq": 9806.65, "mmAq": 9.80665, "mmHg": 133.322},
    "길이": {"m": 1, "cm": 0.01, "mm": 0.001},
    "질량": {"kg": 1, "g": 1e-3, "t": 1000},
    "시간": {"s": 1, "min": 60, "h": 3600},
    "동력": {"kW": 1, "W": 1e-3},
    "넓이": {"m2": 1, "cm2": 1e-4, "mm2": 1e-6},
    "질량유량": {"kg/s": 1, "kg/min": 1 / 60},
    "전류": {"A": 1, "mA": 1e-3}
  };
  var 온도 = {"℃": 1, "K": 1};
  function 차원(u) {
    if (온도[u]) return "온도";
    for (var d in 단위표) if (단위표[d][u] != null) return d;
    return null;
  }
  function 변환(x, a, b) {
    if (a === b) return x;
    if (온도[a] && 온도[b]) return a === "℃" ? x + 273.15 : x - 273.15;
    var da = 차원(a), db = 차원(b);
    if (!da || da !== db) return null;
    return x * 단위표[da][a] / 단위표[db][b];
  }
  function 같은차원(u) {
    var d = 차원(u);
    if (d === "온도") return ["℃", "K"];
    return d ? Object.keys(단위표[d]) : [u];
  }
  /* 화면용 단위 표기 */
  var 보기 = {"m3": "m³", "m3/s": "m³/s", "m3/min": "m³/min", "m3/h": "m³/h", "m2": "m²", "cm2": "cm²", "mm2": "mm²",
    "kg/m3": "kg/m³", "kN/m3": "kN/m³", "kg/m2": "kg/m²", "m3/kg": "m³/kg", "m3/m3": "m³/m³", "m2/s": "m²/s",
    "L/(min·m2)": "L/min·m²", "kgf/cm2": "kgf/cm²"};
  function 단위글(u) { return 보기[u] || u || ""; }

  /* ── 식 해석 (엔진\소방계산.py 와 같은 문법) ── */
  var 호칭 = [15, 20, 25, 32, 40, 50, 65, 80, 90, 100, 125, 150, 200, 250, 300, 350, 400];
  function 토큰(s) {
    var re = /\s*(?:(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+(?:e[+-]?\d+)?)|([A-Za-z_][A-Za-z_0-9]*)|(>=|<=|[-+*/^(),<>]))/y, out = [], i = 0;
    s = s.trim();
    while (i < s.length) {
      re.lastIndex = i;
      var m = re.exec(s);
      if (!m || re.lastIndex === i) throw new Error("식을 읽을 수 없음: " + s.slice(i));
      out.push(m[1] ? ["n", parseFloat(m[1])] : m[2] ? ["v", m[2]] : ["o", m[3]]);
      i = re.lastIndex;
    }
    return out;
  }
  function 해석(s) {
    var t = 토큰(s), i = 0;
    function 봄() { return t[i] || [null, null]; }
    function 이것(o) { var k = 봄(); return k[0] === "o" && k[1] === o; }
    function 먹(o) { if (o && !이것(o)) throw new Error("'" + o + "' 가 와야 함"); return t[i++]; }
    function 비교() {
      var a = 합(), k = 봄();
      if (k[0] === "o" && (k[1] === ">" || k[1] === "<" || k[1] === ">=" || k[1] === "<=")) { 먹(); return ["cmp", k[1], a, 합()]; }
      return a;
    }
    function 합() { var a = 곱(); while (이것("+") || 이것("-")) { var o = 먹()[1]; a = [o, a, 곱()]; } return a; }
    function 곱() { var a = 단항(); while (이것("*") || 이것("/")) { var o = 먹()[1]; a = [o, a, 단항()]; } return a; }
    function 단항() {
      if (이것("-")) { 먹(); return ["neg", 단항()]; }
      if (이것("+")) { 먹(); return 단항(); }
      return 거듭();
    }
    function 거듭() { var a = 원자(); if (이것("^")) { 먹(); return ["^", a, 단항()]; } return a; }
    function 원자() {
      var k = 먹();
      if (!k) throw new Error("식이 끝남");
      if (k[0] === "n") return ["num", k[1]];
      if (k[0] === "v") {
        if (이것("(")) {
          먹(); var args = [];
          if (!이것(")")) { args.push(비교()); while (이것(",")) { 먹(); args.push(비교()); } }
          먹(")"); return ["call", k[1], args];
        }
        return ["var", k[1]];
      }
      if (k[0] === "o" && k[1] === "(") { var n = 비교(); 먹(")"); return n; }
      throw new Error("뜻밖의 기호 " + k[1]);
    }
    var n = 비교();
    if (i !== t.length) throw new Error("식 뒤에 남은 것이 있음");
    return n;
  }
  var 함수 = {
    sqrt: Math.sqrt, log: Math.log10, ln: Math.log, exp: Math.exp, abs: Math.abs, min: Math.min, max: Math.max,
    ceil: function (x) { return Math.ceil(x - 1e-9); }, floor: function (x) { return Math.floor(x + 1e-9); },
    series: function () { var s = 0; for (var j = 0; j < arguments.length; j++) if (arguments[j] > 0) s += 1 / (arguments[j] * arguments[j]); return Math.pow(s, -0.5); },
    nominal: function (x) { for (var j = 0; j < 호칭.length; j++) if (호칭[j] >= x - 1e-9) return 호칭[j]; return x; }
  };
  function 계산(n, 값) {
    var t = n[0];
    if (t === "num") return n[1];
    if (t === "var") { if (n[1] === "pi") return Math.PI; if (!(n[1] in 값)) throw new Error("값 없음: " + n[1]); return 값[n[1]]; }
    if (t === "neg") return -계산(n[1], 값);
    if (t === "call") {
      if (n[1] === "pick") return 계산(n[2][Math.round(계산(n[2][0], 값))], 값);
      if (n[1] === "if") return 계산(계산(n[2][0], 값) ? n[2][1] : n[2][2], 값);
      if (!함수[n[1]]) throw new Error("모르는 함수: " + n[1]);
      return 함수[n[1]].apply(null, n[2].map(function (a) { return 계산(a, 값); }));
    }
    if (t === "cmp") {
      var p = 계산(n[2], 값), q = 계산(n[3], 값);
      return t = n[1], t === ">" ? p > q : t === "<" ? p < q : t === ">=" ? p >= q : p <= q;
    }
    var a = 계산(n[1], 값), b = 계산(n[2], 값);
    return t === "+" ? a + b : t === "-" ? a - b : t === "*" ? a * b : t === "/" ? a / b : Math.pow(a, b);
  }
  function 식값(s, 값) { return 계산(해석(s), 값 || {}); }

  /* ── 수 표기: 자리까지 반올림, 끝 0 지움 ── */
  function 수(x, 자리) {
    if (x === true || x === false) return String(x);
    if (x == null || !isFinite(x)) return "—";
    if (자리 == null) 자리 = 2;
    var a = Math.abs(x), s;
    if (a !== 0 && a < Math.pow(10, -자리) * 5) s = Number(x.toPrecision(3)).toString(); /* 아주 작은 값은 유효숫자 3자리 */
    else {
      s = x.toFixed(자리);
      if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    }
    return s === "-0" ? "0" : s;
  }

  /* ── 식을 사람 표기로: 기호식·대입식 ── */
  var 위첨 = {"2": "²", "3": "³", "4": "⁴", "5": "⁵"};
  function 쓰기(n, 값, 이름표) {
    function 우(x) { var t = x[0]; return t === "+" || t === "-" ? 1 : t === "*" || t === "/" ? 2 : t === "neg" ? 3 : t === "^" ? 4 : t === "cmp" ? 0 : 5; }
    function 괄(x, 최소) { var s = 씀(x); return 우(x) < 최소 ? "(" + s + ")" : s; }
    function 씀(x) {
      var t = x[0];
      if (t === "num") return 수(x[1], 6);
      if (t === "var") {
        if (x[1] === "pi") return "π";
        if (값) { var v = 값[x[1]]; var s = 수(v, 4); return v < 0 ? "(" + s + ")" : s; }
        return (이름표 && 이름표[x[1]]) || x[1];
      }
      if (t === "neg") return "−" + 괄(x[1], 4);
      if (t === "call") {
        var f = x[1], a = x[2];
        if (f === "pick" && 값) return 씀(a[Math.round(계산(a[0], 값))]);
        if (f === "pick") return a.slice(1).map(씀).join(" 또는 ");
        if (f === "if" && 값) return 씀(계산(a[0], 값) ? a[1] : a[2]);
        if (f === "sqrt") return "√" + (a[0][0] === "var" || a[0][0] === "num" ? 씀(a[0]) : "(" + 씀(a[0]) + ")");
        if (f === "series") return "직렬(" + a.map(씀).join(", ") + ")";
        if (f === "nominal") return "호칭↑(" + 씀(a[0]) + ")";
        if (f === "ceil") return "올림(" + 씀(a[0]) + ")";
        return f + "(" + a.map(씀).join(", ") + ")";
      }
      if (t === "cmp") return 씀(x[2]) + " " + x[1] + " " + 씀(x[3]);
      if (t === "^") {
        var e = x[2];
        if (e[0] === "num" && 위첨[String(e[1])]) return 괄(x[1], 5) + 위첨[String(e[1])];
        return 괄(x[1], 5) + "^" + 괄(e, 5);
      }
      var p = 우(x), op = t === "*" ? "×" : t === "/" ? "/" : t === "-" ? " − " : " + ";
      return 괄(x[1], p) + op + 괄(x[2], t === "-" || t === "/" ? p + 1 : p);
    }
    return 씀(n);
  }

  /* ── 계산기 실행 ── */
  function 풀기(계, 넣은) {
    var 값 = {}, 빈 = {}, out = {};
    계.입력.forEach(function (i) {
      var v = 넣은[i.k];
      if (v == null || v === "" || (typeof v === "number" && isNaN(v))) v = i.기본;
      if (v == null) { if (i.선택) { 빈[i.k] = 1; return; } throw new Error("입력 없음: " + i.이름); }
      값[i.k] = Number(v);
    });
    계.단계.forEach(function (d) {
      if ((d.필요 || []).some(function (k) { return 빈[k]; })) { out[d.k] = null; return; }
      var n = 해석(d.식), r = 계산(n, 값);
      out[d.k] = d.판정 ? !!r : Number(r);
      out["@" + d.k] = { 기호: 쓰기(n, null), 대입: 쓰기(n, 값) };
      값[d.k] = Number(r);
    });
    return out;
  }
  function 빠진입력(계, 넣은) {
    return 계.입력.filter(function (i) { var v = 넣은[i.k]; return (v == null || v === "" || isNaN(v)) && i.기본 == null && !i.선택; });
  }

  /* ── 채점 (소방계산.py 채점·값판정과 같은 규칙) ── */
  function 값판정(x, 정답, 자리) {
    if (자리 === 0 && Math.abs(정답 - Math.round(정답)) < 1e-9) return Math.abs(x - 정답) < 1e-9 ? "정답" : "오답";
    var d = Math.abs(x - 정답), rel = 정답 ? d / Math.abs(정답) : d;
    if (rel <= 0.005 || d <= Math.pow(10, -자리) * 1.0001) return "정답";
    if (rel <= 0.02) return "근접";
    return "오답";
  }
  function 채점(학생값, 학생단위, 정답, 단계) {
    var 자리 = 단계.자리 == null ? 2 : 단계.자리, u = 단계.단위 || "";
    학생단위 = 학생단위 || "";
    var 빠짐 = !!u && !학생단위 && ["개", "병", "배"].indexOf(u) < 0;
    var x = 학생값;
    if (학생단위 && u && 학생단위 !== u) {
      x = 변환(학생값, 학생단위, u);
      if (x == null) return ["오답", "단위 차원이 다름"];
    }
    var 판 = 값판정(x, 정답, 자리);
    if (판 === "정답" && 학생단위 && u && 학생단위 !== u) return ["단위", "값은 맞음. 문제가 묻는 단위로 바꿔 적기"];
    if (판 === "정답" && 빠짐) return ["단위", "값은 맞음. 단위가 빠지면 감점"];
    return [판, 판 === "근접" ? "중간값을 일찍 반올림했는지 확인" : ""];
  }

  W.CALC = { 식값: 식값, 해석: 해석, 계산: 계산, 쓰기: 쓰기, 풀기: 풀기, 빠진입력: 빠진입력, 채점: 채점, 값판정: 값판정,
    변환: 변환, 차원: 차원, 같은차원: 같은차원, 단위글: 단위글, 수: 수, 단위표: 단위표 };
})(typeof window !== "undefined" ? window : globalThis);

var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// @ts-ignore
var GMWort;
(function (GMWort) {
    var GlobalWortList = new Array();
    var Wort = /** @class */ (function () {
        function Wort(e) {
            var _this = this;
            this.Kapitel = "";
            this.Typ = "";
            this.Data = new Array();
            this.Beispiel = "";
            this.Notiz = "";
            this.Kapitel = e.getAttribute("Kapitel") || "";
            this.Typ = e.getAttribute("Typ") || "einfach";
            var m = new Map();
            Array.from(e.children).forEach(function (c) {
                switch (c.tagName) {
                    case "Beispiel".toUpperCase():
                        _this.Beispiel = c.innerHTML.trim();
                        break;
                    case "Notiz".toUpperCase():
                        _this.Notiz = c.innerHTML.trim();
                        break;
                    default:
                        m.set(c.tagName, c.innerHTML.trim());
                        break;
                }
            });
            for (var i = 1;; i++) {
                if (m.has("W".concat(i))) {
                    this.Data.push(m.get("W".concat(i)) || "");
                }
                else {
                    break;
                }
            }
        }
        Wort.prototype.validate = function () {
            switch (this.Typ) {
                case "Verb":
                    return this.Data.length >= 4;
                case "Nomen":
                    return this.Data.length >= 4;
                case "2":
                    return this.Data.length >= 2;
                case "einfach":
                    return this.Data.length >= 2;
                default:
                    return false;
            }
        };
        Wort.prototype.html = function () {
            var innerHTML = "<div class=\"wort\">";
            innerHTML += "<div style=\"display: flex;\">";
            switch (this.Typ) {
                case "Verb":
                    innerHTML += "<div class=\"wort-col1\">".concat(this.Data.slice(0, 3).join(", "), "</div>");
                    innerHTML += "<div class=\"wort-col2\">".concat(this.Data[3], "</div>");
                    break;
                case "Nomen":
                    innerHTML += "<div class=\"wort-col1\">".concat(this.Data.slice(0, 3).join(", "), "</div>");
                    innerHTML += "<div class=\"wort-col2\">".concat(this.Data[3], "</div>");
                    break;
                case "2":
                    innerHTML += "<div class=\"wort-col1\">".concat(this.Data.slice(0, 1).join(", "), "</div>");
                    innerHTML += "<div class=\"wort-col2\">".concat(this.Data[1], "</div>");
                    break;
                case "einfach":
                    innerHTML += "<div class=\"wort-col1\">".concat(this.Data.slice(0, 1).join(", "), "</div>");
                    innerHTML += "<div class=\"wort-col2\">".concat(this.Data[1], "</div>");
                    break;
            }
            innerHTML += "</div>";
            if (this.Beispiel != "") {
                innerHTML += "<div class=\"pre\">".concat(this.Beispiel, "</div>");
            }
            if (this.Notiz != "") {
                innerHTML += "<div class=\"pre\">".concat(this.Notiz, "</div>");
            }
            innerHTML += "</div>";
            return innerHTML;
        };
        return Wort;
    }());
    function init(showButton) {
        var elementList = Array.from(document.getElementsByClassName("Wort"));
        elementList.forEach(function (e) {
            var w = new Wort(e);
            if (w.validate()) {
                e.innerHTML = w.html();
                GlobalWortList.push(w);
            }
            else {
                e.innerHTML += "<span style=\"background-color: red;\">validate error<span >";
            }
        });
        if (GlobalWortList.length == 0) {
            return;
        }
        if (showButton)
            initButton(GlobalWortList);
    }
    GMWort.init = init;
    function initButton(wortList) {
        var buttonSet = new Set;
        wortList.forEach(function (v) {
            buttonSet.add(v.Kapitel);
        });
        buttonSet.delete("");
        var buttonList = __spreadArray([], __read(buttonSet), false).sort();
        var div = document.createElement("div");
        div.appendChild(newButton("词汇测试", ""));
        //div.appendChild(document.createElement("br"));
        buttonList.forEach(function (v) {
            div.appendChild(newButton(v, v));
        });
        var toc = document.getElementById("table-of-contents");
        if (toc == null) {
            //没有找到toc，那么就放在body里面的最开头
            var first = document.body.firstChild;
            document.body.insertBefore(div, first);
        }
        else {
            var tocNext = toc.nextElementSibling;
            if (tocNext == null) {
                //如果toc后面没有元素了，那么放在body里面的最后即是开头
                document.body.appendChild(div);
            }
            else {
                //放在toc后面，也就是toc下一个元素的前面
                document.body.insertBefore(div, tocNext);
            }
        }
    }
    //<button class="btn btn-primary btn-lg" onclick = "getWortList()" > 词汇测试 < /button>
    function newButton(text, Kapitel) {
        var button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0.5em 0;");
        button.setAttribute("onclick", "GMWort.nextTest(\"".concat(Kapitel, "\")"));
        button.innerHTML = text;
        return button;
    }
    function genTest(Kapitel) {
        var list = GlobalWortList;
        if (Kapitel.length > 0) {
            list.filter(function (v) {
                return v.Kapitel == Kapitel;
            });
        }
        var w = list[Math.floor((Math.random() * list.length))];
        var questionList = new Array();
        var addQuestion = function () {
            var textList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                textList[_i] = arguments[_i];
            }
            textList.forEach(function (v) {
                if (v.length > 0)
                    questionList.push(v);
            });
        };
        switch (w.Typ) {
            case "Verb":
                addQuestion(w.Data[0], w.Data[3]);
                break;
            case "Nomen":
                addQuestion(w.Data[1], w.Data[3]);
                break;
            case "2":
                addQuestion(w.Data[0], w.Data[1]);
                break;
            case "einfach":
                if (w.Data[0].match("^(der|die|das) .+")) {
                    addQuestion(w.Data[0].substring(4), w.Data[1]);
                }
                else {
                    addQuestion(w.Data[0], w.Data[1]);
                }
                break;
        }
        var question = questionList[Math.floor((Math.random() * questionList.length))];
        var answer = "".concat(w.Data.join(", "), "<br/>").concat(w.Beispiel, "<br/>").concat(w.Notiz);
        // @ts-ignore
        $("#modal1-question").html(question);
        // @ts-ignore
        $("#modal1-answer").html(answer);
    }
    function hiddenAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "hidden");
    }
    GMWort.hiddenAnswer = hiddenAnswer;
    function showAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "visible");
    }
    GMWort.showAnswer = showAnswer;
    function nextTest(Kapitel) {
        hiddenAnswer();
        // @ts-ignore
        $("#modal1-show").attr("onclick", "GMWort.showAnswer()");
        // @ts-ignore
        $("#modal1-next").attr("onclick", "GMWort.nextTest(\"".concat(Kapitel, "\")"));
        genTest(Kapitel);
        // @ts-ignore
        $("#modal1").modal('show');
    }
    GMWort.nextTest = nextTest;
})(GMWort || (GMWort = {}));
// 使用以下命令生成gm_wort.js
// tsc gm_wort.ts --target "es5" --lib "es2015,dom" --downlevelIteration

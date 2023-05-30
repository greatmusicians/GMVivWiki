// @ts-ignore
var GMDanCi;
(function (GMDanCi) {
    var GlobalList = new Array();
    var DanCi = /** @class */ (function () {
        function DanCi(e) {
            this.DanCi = "";
            this.FanYi = "";
            this.BeiZhu = "";
            this.DanCi = e.getAttribute("DanCi") || "";
            this.FanYi = e.getAttribute("FanYi") || "";
            var BeiZhu = e.innerHTML;
            e.setAttribute("BeiZhu", BeiZhu);
        }
        DanCi.prototype.validate = function () {
            return true;
        };
        DanCi.prototype.html = function () {
            var innerHTML = "<div class=\"danci\">";
            innerHTML += "<div style=\"display: flex;\">";
            innerHTML += "<div style=\"min-width: 10em;\">".concat(this.DanCi, "</div>");
            if (this.FanYi != "") {
                innerHTML += "<div style=\"margin-left: 1em;\">".concat(this.FanYi, "</div>");
            }
            innerHTML += "</div>";
            if (this.BeiZhu != "") {
                innerHTML += "<div class=\"pre\">".concat(this.BeiZhu.trim(), "</div>");
            }
            innerHTML += "</div>";
            return innerHTML;
        };
        return DanCi;
    }());
    function init(showButton) {
        var elementList = Array.from(document.getElementsByTagName("div"));
        //只要有DanCi属性，就认为是单词
        elementList = elementList.filter(function (e) {
            return e.getAttribute("DanCi") != null;
        });
        elementList.forEach(function (e) {
            var w = new DanCi(e);
            if (w.validate()) {
                e.innerHTML = w.html();
                GlobalList.push(w);
            }
            else {
                e.innerHTML += "<span style=\"background-color: red;\">validate error<span >";
            }
        });
        if (GlobalList.length == 0) {
            return;
        }
        if (showButton)
            initButton();
    }
    GMDanCi.init = init;
    function initButton() {
        var div = document.createElement("div");
        div.appendChild(newButton("单词测试"));
        div.appendChild(document.createElement("br"));
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
    function newButton(text) {
        var button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0.5em 0;");
        button.setAttribute("onclick", "GMDanCi.nextTest()");
        button.innerHTML = text;
        return button;
    }
    function genTest() {
        var list = GlobalList;
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
        addQuestion(w.DanCi);
        addQuestion(w.FanYi);
        //如果是德语的名词，那么去掉词性后，也当作一个问题
        if (w.DanCi.match("^(der|die|das) .+")) {
            addQuestion(w.DanCi.substring(4));
        }
        var question = questionList[Math.floor((Math.random() * questionList.length))];
        var answer = "".concat(w.DanCi, "&emsp;").concat(w.FanYi, "<br/>").concat(w.BeiZhu.trim());
        // @ts-ignore
        $("#modal1-question").html(question);
        // @ts-ignore
        $("#modal1-answer").html(answer);
    }
    function hiddenAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "hidden");
    }
    GMDanCi.hiddenAnswer = hiddenAnswer;
    function showAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "visible");
    }
    GMDanCi.showAnswer = showAnswer;
    function nextTest() {
        hiddenAnswer();
        // @ts-ignore
        $("#modal1-show").attr("onclick", "GMDanCi.showAnswer()");
        // @ts-ignore
        $("#modal1-next").attr("onclick", "GMDanCi.nextTest()");
        genTest();
        // @ts-ignore
        $("#modal1").modal('show');
    }
    GMDanCi.nextTest = nextTest;
})(GMDanCi || (GMDanCi = {}));
// 使用以下命令生成gm_wort.js
// tsc gm_danci.ts --target "es5" --lib "es2015,dom" --downlevelIteration

// @ts-ignore
var GMQSA;
(function (GMQSA) {
    var GlobalList = new Array();
    var GlobalTest;
    var Data = /** @class */ (function () {
        function Data(e) {
            var _this = this;
            this.Q = "";
            this.S = "";
            this.A = "";
            this.NeedSwap = false;
            if (e.hasAttribute("swap"))
                this.NeedSwap = true;
            Array.from(e.children).forEach(function (c) {
                switch (c.tagName) {
                    case "Q":
                        _this.Q = c.innerHTML.trim();
                        break;
                    case "S":
                        _this.S = c.innerHTML.trim();
                        break;
                    case "A":
                        _this.A = c.innerHTML.trim();
                        break;
                }
            });
        }
        Data.prototype.validate = function () {
            return this.Q.length > 0 && this.A.length > 0;
        };
        Data.prototype.swap = function () {
            var qsa = new Data(document.createElement("div"));
            qsa.Q = this.A;
            qsa.S = this.S;
            qsa.A = this.Q;
            return qsa;
        };
        Data.prototype.html = function () {
            var innerHTML = "<div class=\"qsa\">";
            if (this.Q != "") {
                innerHTML += "<div class=\"qsa-q\">".concat(this.Q, "</div>");
            }
            if (this.S != "") {
                innerHTML += "<div class=\"qsa-s\">".concat(this.S, "</div>");
            }
            if (this.A != "") {
                innerHTML += "<div class=\"qsa-a\">".concat(this.A, "</div>");
            }
            innerHTML += "</div>";
            return innerHTML;
        };
        Data.prototype.getQuestion = function () {
            var innerHTML = "<div style=\"display: flex; flex-direction: column;\">";
            innerHTML += "<div>".concat(this.Q, "</div>");
            innerHTML += "<div><font color=#A52A2A >".concat(this.S, "</font></div>");
            innerHTML += "</div>";
            return innerHTML;
        };
        Data.prototype.getAnswer = function () {
            var innerHTML = "".concat(this.A);
            return innerHTML;
        };
        return Data;
    }());
    /* 目的是一轮测试完，再进行下一轮，防止随机数不均匀，有些条目总也测试不到的情况 */
    var Test = /** @class */ (function () {
        function Test() {
            this.list = [];
            this.list = GlobalList;
        }
        Test.prototype.random = function () {
            var index = Math.floor((Math.random() * this.list.length));
            var d = this.list[index];
            this.list.splice(index, 1);
            return d;
        };
        Test.prototype.empty = function () {
            return this.list.length == 0;
        };
        return Test;
    }());
    function init(showButton) {
        var elementList = Array.from(document.getElementsByClassName("QSA"));
        elementList.forEach(function (e) {
            var w = new Data(e);
            if (w.validate()) {
                e.innerHTML = w.html();
                GlobalList.push(w);
                if (w.NeedSwap)
                    GlobalList.push(w.swap());
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
    GMQSA.init = init;
    function initButton() {
        if (GlobalList.length == 0)
            return;
        var div = document.createElement("div");
        div.appendChild(newButton("QSA测试"));
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
        button.setAttribute("onclick", "GMQSA.nextTest()");
        button.innerHTML = text;
        return button;
    }
    function hiddenAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "hidden");
    }
    GMQSA.hiddenAnswer = hiddenAnswer;
    function showAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "visible");
    }
    GMQSA.showAnswer = showAnswer;
    function nextTest() {
        hiddenAnswer();
        // @ts-ignore
        $("#modal1-show").attr("onclick", "GMQSA.showAnswer()");
        // @ts-ignore
        $("#modal1-next").attr("onclick", "GMQSA.nextTest()");
        if (!GlobalTest || GlobalTest.empty()) {
            GlobalTest = new Test();
        }
        var d = GlobalTest.random();
        if (d) {
            // @ts-ignore
            $("#modal1-question").html(d.getQuestion());
            // @ts-ignore
            $("#modal1-answer").html(d.getAnswer());
        }
        // @ts-ignore
        $("#modal1").modal('show');
    }
    GMQSA.nextTest = nextTest;
})(GMQSA || (GMQSA = {}));
// 使用以下命令生成gm_wort.js
// tsc gm_qsa.ts --target "es5" --lib "es2015,dom" --downlevelIteration

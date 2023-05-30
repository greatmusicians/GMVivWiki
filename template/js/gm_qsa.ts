// @ts-ignore
namespace GMQSA {
    let GlobalList = new Array<Data>();
    let GlobalTest: Test;

    class Data {
        Q: string = "";
        S: string = "";
        A: string = "";
        NeedSwap: boolean = false;

        constructor(e: Element) {
            if (e.hasAttribute("swap")) this.NeedSwap = true;

            Array.from(e.children).forEach((c) => {
                switch (c.tagName) {
                    case "Q":
                        this.Q = c.innerHTML.trim();
                        break;
                    case "S":
                        this.S = c.innerHTML.trim();
                        break;
                    case "A":
                        this.A = c.innerHTML.trim();
                        break;
                }
            })
        }

        validate(): boolean {
            return this.Q.length > 0 && this.A.length > 0;
        }

        swap(): Data {
            let qsa = new Data(document.createElement("div"));
            qsa.Q = this.A;
            qsa.S = this.S;
            qsa.A = this.Q;
            return qsa;
        }

        html(): string {
            let innerHTML = `<div class="qsa">`;
            if (this.Q != "") {
                innerHTML += `<div class="qsa-q">${this.Q}</div>`;
            }
            if (this.S != "") {
                innerHTML += `<div class="qsa-s">${this.S}</div>`;
            }
            if (this.A != "") {
                innerHTML += `<div class="qsa-a">${this.A}</div>`;
            }
            innerHTML += `</div>`;
            return innerHTML;
        }

        getQuestion(): string {
            let innerHTML = `<div style="display: flex; flex-direction: column;">`;
            innerHTML += `<div>${this.Q}</div>`;
            innerHTML += `<div><font color=#A52A2A >${this.S}</font></div>`;
            innerHTML += `</div>`;
            return innerHTML;
        }

        getAnswer(): string {
            let innerHTML = `${this.A}`;
            return innerHTML;
        }
    }

    /* 目的是一轮测试完，再进行下一轮，防止随机数不均匀，有些条目总也测试不到的情况 */
    class Test {
        list: Data[] = [];

        constructor() {
            this.list = GlobalList;
        }

        random(): Data {
            let index = Math.floor((Math.random() * this.list.length));
            let d = this.list[index];
            this.list.splice(index, 1)
            return d;
        }

        empty(): boolean {
            return this.list.length == 0;
        }
    }

    export function init(showButton: boolean): void {
        let elementList = Array.from(document.getElementsByClassName("QSA"));
        elementList.forEach((e) => {
            let w = new Data(e);
            if (w.validate()) {
                e.innerHTML = w.html();
                GlobalList.push(w);
                if (w.NeedSwap) GlobalList.push(w.swap());
            } else {
                e.innerHTML += `<span style="background-color: red;">validate error<span >`;
            }
        })
        if (GlobalList.length == 0) {
            return
        }

        if (showButton) initButton();
    }

    function initButton(): void {
        if (GlobalList.length == 0) return;

        let div = document.createElement("div");
        div.appendChild(newButton("QSA测试"));
        div.appendChild(document.createElement("br"));

        let toc = document.getElementById("table-of-contents");
        if (toc == null) {
            //没有找到toc，那么就放在body里面的最开头
            let first = document.body.firstChild;
            document.body.insertBefore(div, first);
        } else {
            let tocNext = toc.nextElementSibling;
            if (tocNext == null) {
                //如果toc后面没有元素了，那么放在body里面的最后即是开头
                document.body.appendChild(div);
            } else {
                //放在toc后面，也就是toc下一个元素的前面
                document.body.insertBefore(div, tocNext);
            }
        }
    }

    //<button class="btn btn-primary btn-lg" onclick = "getWortList()" > 词汇测试 < /button>
    function newButton(text: string): Element {
        let button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0.5em 0;");
        button.setAttribute("onclick", `GMQSA.nextTest()`);
        button.innerHTML = text;
        return button;
    }

    export function hiddenAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "hidden");
    }

    export function showAnswer() {
        // @ts-ignore
        $("#modal1-answer").css("visibility", "visible");
    }

    export function nextTest() {
        hiddenAnswer();
        // @ts-ignore
        $("#modal1-show").attr("onclick", "GMQSA.showAnswer()");
        // @ts-ignore
        $("#modal1-next").attr("onclick", `GMQSA.nextTest()`);

        if (!GlobalTest || GlobalTest.empty()) {
            GlobalTest = new Test();
        }
        let d = GlobalTest.random();
        if (d) {
            // @ts-ignore
            $("#modal1-question").html(d.getQuestion());
            // @ts-ignore
            $("#modal1-answer").html(d.getAnswer());
        }

        // @ts-ignore
        $("#modal1").modal('show');
    }
}

// 使用以下命令生成gm_wort.js
// tsc gm_qsa.ts --target "es5" --lib "es2015,dom" --downlevelIteration
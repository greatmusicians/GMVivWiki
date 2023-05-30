// @ts-ignore
namespace GMWort {
    let GlobalList = new Array<Data>();
    let GlobalTestMap = new Map<string, Test>();

    class Data {
        Kapitel: string = "";
        Typ: string = "";
        Data: string[] = new Array<string>();
        Beispiel: string = "";
        Notiz: string = "";

        constructor(e: Element) {
            this.Kapitel = e.getAttribute("Kapitel") || "";
            this.Typ = e.getAttribute("Typ") || "einfach";
            let m = new Map<string, string>();
            Array.from(e.children).forEach((c) => {
                switch (c.tagName) {
                    case "Beispiel".toUpperCase():
                        this.Beispiel = c.innerHTML.trim();
                        break;
                    case "Notiz".toUpperCase():
                        this.Notiz = c.innerHTML.trim();
                        break;
                    default:
                        m.set(c.tagName, c.innerHTML.trim());
                        break;
                }
            })
            for (let i = 1; ; i++) {
                if (m.has(`W${i}`)) {
                    this.Data.push(m.get(`W${i}`) || "");
                } else {
                    break
                }
            }
        }

        validate(): boolean {
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
        }

        html(): string {
            let innerHTML = `<div class="wort">`;
            innerHTML += `<div style="display: flex;">`;
            switch (this.Typ) {
                case "Verb":
                    innerHTML += `<div class="wort-col1">${this.Data.slice(0, 3).join(", ")}</div>`;
                    innerHTML += `<div class="wort-col2">${this.Data[3]}</div>`;
                    break;
                case "Nomen":
                    innerHTML += `<div class="wort-col1">${this.Data.slice(0, 3).join(", ")}</div>`;
                    innerHTML += `<div class="wort-col2">${this.Data[3]}</div>`;
                    break;
                case "2":
                    innerHTML += `<div class="wort-col1">${this.Data.slice(0, 1).join(", ")}</div>`;
                    innerHTML += `<div class="wort-col2">${this.Data[1]}</div>`;
                    break;
                case "einfach":
                    innerHTML += `<div class="wort-col1">${this.Data.slice(0, 1).join(", ")}</div>`;
                    innerHTML += `<div class="wort-col2">${this.Data[1]}</div>`;
                    break;
            }
            innerHTML += `</div>`;
            if (this.Beispiel != "") {
                innerHTML += `<div class="pre">${this.Beispiel}</div>`;
            }
            if (this.Notiz != "") {
                innerHTML += `<div class="pre">${this.Notiz}</div>`;
            }
            innerHTML += `</div>`;
            return innerHTML;
        }

        getQuestion(): string {
            let qList = new Array<string>();
            let addQuestion = function (...textList: string[]): void {
                textList.forEach((v) => {
                    if (v.length > 0) qList.push(v);
                })
            }
            switch (this.Typ) {
                case "Verb":
                    addQuestion(this.Data[0], this.Data[3]);
                    break;
                case "Nomen":
                    addQuestion(this.Data[1], this.Data[3]);
                    break;
                case "2":
                    addQuestion(this.Data[0], this.Data[1]);
                    break;
                case "einfach":
                    if (this.Data[0].match("^(der|die|das) .+")) {
                        addQuestion(this.Data[0].substring(4), this.Data[1]);
                    } else {
                        addQuestion(this.Data[0], this.Data[1]);
                    }
                    break;
            }
            return qList[Math.floor((Math.random() * qList.length))];
        }

        getAnswer(): string {
            return `${this.Data.join(", ")}<br/>${this.Beispiel}<br/>${this.Notiz}`;
        }
    }


    /* 目的是一轮测试完，再进行下一轮，防止随机数不均匀，有些条目总也测试不到的情况 */
    class Test {
        list: Data[] = [];

        constructor(Kapitel: string) {
            this.list = GlobalList;
            if (Kapitel.length > 0) {
                this.list.filter((v) => {
                    return v.Kapitel == Kapitel;
                });
            }
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
        let elementList = Array.from(document.getElementsByClassName("Wort"));
        elementList.forEach((e) => {
            let w = new Data(e);
            if (w.validate()) {
                e.innerHTML = w.html();
                GlobalList.push(w);
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

        let buttonSet = new Set<string>;
        GlobalList.forEach((v) => {
            buttonSet.add(v.Kapitel);
        })
        buttonSet.delete("");
        let buttonList = [...buttonSet].sort();
        let div = document.createElement("div");
        div.appendChild(newButton("词汇测试", ""));
        //div.appendChild(document.createElement("br"));
        buttonList.forEach((v) => {
            div.appendChild(newButton(v, v));
        })

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
    function newButton(text: string, Kapitel: string): Element {
        let button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0.5em 0;");
        button.setAttribute("onclick", `GMWort.nextTest("${Kapitel}")`);
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

    export function nextTest(Kapitel: string) {
        hiddenAnswer();
        // @ts-ignore
        $("#modal1-show").attr("onclick", "GMWort.showAnswer()");
        // @ts-ignore
        $("#modal1-next").attr("onclick", `GMWort.nextTest("${Kapitel}")`);

        if (!GlobalTestMap.has(Kapitel) || GlobalTestMap.get(Kapitel)?.empty()) {
            GlobalTestMap.set(Kapitel, new Test(Kapitel));
        }
        let d = GlobalTestMap.get(Kapitel)?.random();
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
// tsc gm_wort.ts --target "es5" --lib "es2015,dom" --downlevelIteration
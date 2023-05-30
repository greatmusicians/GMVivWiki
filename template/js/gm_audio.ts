// @ts-ignore
namespace GMAudio {
    let GlobalList = new Array<HTMLAudioElement>();

    export function init(showButton: boolean): void {
        if (!showButton) return;

        GlobalList = Array.from(document.getElementsByTagName("audio"));
        GlobalList.forEach((e, i) => {
            //设置audio的显示样式
            e.setAttribute("controlsList", "nodownload");
            //e.playbackRate = 1;

            //添加播放全部的按钮
            let p = e.parentElement;
            if (p && p.tagName == "P" && p.childElementCount == 1) {
                p.insertBefore(newButton("播放此后全部", i), null);
                //使button和audio水平对齐
                e.style.marginRight = "1em";
                p.style.display = "flex";
                p.style.alignItems = "center";
                p.style.marginLeft = "2em";
            }
        })
        if (GlobalList.length > 0) {
            let div = document.createElement("div");
            let button = newButton("播放全部", 0);
            button.setAttribute("style", "margin: 0 0.5em 0.5em 0;");
            div.appendChild(button);
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
    }

    //<button class="btn btn-primary btn-lg" onclick = "getAudioList()" > 词汇测试 < /button>
    function newButton(text: string, index: number): Element {
        let button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0 0;");
        button.setAttribute("onclick", `GMAudio.playFrom(${index})`);
        button.innerHTML = text;
        return button;
    }

    export function playFrom(index: number): void {
        let list = new Array<HTMLAudioElement>();
        // 反转数组，这样每次pop最后一个就是从前往后的顺序了
        for (let i = GlobalList.length - 1; i >= index; i--) {
            list.push(GlobalList[i]);
        }

        var audio = list.pop();
        if (!audio) return;
        audio.scrollIntoView();
        audio.loop = false; // 禁止循环，否则无法触发ended事件
        if (list.length > 0) {
            audio.addEventListener('ended', playEndedHandler);
        }
        audio.play();
        function playEndedHandler() {
            if (audio)
                audio.removeEventListener('ended', playEndedHandler);
            audio = list.pop();
            if (!audio) return;
            audio.scrollIntoView();
            audio.loop = false; // 禁止循环，否则无法触发ended事件
            if (list.length > 0) {
                audio.addEventListener('ended', playEndedHandler);
            }
            audio.play();
        }
    }
}

// 使用以下命令生成gm_audio.js
// tsc gm_audio.ts --target "es5" --lib "es2015,dom" --downlevelIteration

// @ts-ignore
var GMAudio;
(function (GMAudio) {
    var GlobalList = new Array();
    function init(showButton) {
        if (!showButton)
            return;
        GlobalList = Array.from(document.getElementsByTagName("audio"));
        GlobalList.forEach(function (e, i) {
            //设置audio的显示样式
            e.setAttribute("controlsList", "nodownload");
            //e.playbackRate = 1;
            //添加播放全部的按钮
            var p = e.parentElement;
            if (p && p.tagName == "P" && p.childElementCount == 1) {
                p.insertBefore(newButton("播放此后全部", i), null);
                //使button和audio水平对齐
                e.style.marginRight = "1em";
                p.style.display = "flex";
                p.style.alignItems = "center";
                p.style.marginLeft = "2em";
            }
        });
        if (GlobalList.length > 0) {
            var div = document.createElement("div");
            var button = newButton("播放全部", 0);
            button.setAttribute("style", "margin: 0 0.5em 0.5em 0;");
            div.appendChild(button);
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
    }
    GMAudio.init = init;
    //<button class="btn btn-primary btn-lg" onclick = "getAudioList()" > 词汇测试 < /button>
    function newButton(text, index) {
        var button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary btn-lg");
        button.setAttribute("style", "margin: 0 0.5em 0 0;");
        button.setAttribute("onclick", "GMAudio.playFrom(".concat(index, ")"));
        button.innerHTML = text;
        return button;
    }
    function playFrom(index) {
        var list = new Array();
        // 反转数组，这样每次pop最后一个就是从前往后的顺序了
        for (var i = GlobalList.length - 1; i >= index; i--) {
            list.push(GlobalList[i]);
        }
        var audio = list.pop();
        if (!audio)
            return;
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
            if (!audio)
                return;
            audio.scrollIntoView();
            audio.loop = false; // 禁止循环，否则无法触发ended事件
            if (list.length > 0) {
                audio.addEventListener('ended', playEndedHandler);
            }
            audio.play();
        }
    }
    GMAudio.playFrom = playFrom;
})(GMAudio || (GMAudio = {}));
// 使用以下命令生成gm_audio.js
// tsc gm_audio.ts --target "es5" --lib "es2015,dom" --downlevelIteration

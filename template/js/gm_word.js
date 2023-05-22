// Namespace.
var gm_word = {};

gm_word.getWordList = function () {
    var wordList = Array.from(document.getElementsByTagName("div"));

    //只要有DanCi属性，就认为是单词
    wordList = wordList.filter((e) => {
        return e.getAttribute("DanCi") != null;
    });

    return wordList;
}

gm_word.showAll = function () {
    var wordList = gm_word.getWordList();

    wordList.forEach((e) => {
        var DanCi = e.getAttribute("DanCi") || "";
        var FanYi = e.getAttribute("FanYi") || "";
        var BeiZhu = e.innerHTML;
        e.setAttribute("BeiZhu", BeiZhu);
        var innerHTML = `<div class="word">`;
        innerHTML += `<div style="display: flex;">`;
        innerHTML += `<div style="min-width: 10em;">${DanCi}</div>`;
        if (FanYi != "") {
            innerHTML += `<div style="margin-left: 1em;">${FanYi}</div>`;
        }
        innerHTML += `</div>`;
        if (BeiZhu != "") {
            innerHTML += `<div class="pre">${BeiZhu.trim()}</div>`;
        }
        innerHTML += `</div>`;
        e.innerHTML = innerHTML;
    });
}

gm_word.genTest = function () {
    var wordList = gm_word.getWordList();
    var e = wordList[Math.floor((Math.random() * wordList.length))];
    var DanCi = e.getAttribute("DanCi") || "";
    var FanYi = e.getAttribute("FanYi") || "";
    var BeiZhu = e.getAttribute("BeiZhu") || "";
    var questionList = [DanCi, FanYi];
    //如果是德语的名词，那么去掉词性后，也当作一个问题
    if (DanCi.match("^(der|die|das) .+")) {
        questionList.push(DanCi.substring(4));
    }
    var question = questionList[Math.floor((Math.random() * questionList.length))];
    var answer = `${DanCi}&emsp;${FanYi}<br/>${BeiZhu.trim()}`;
    document.getElementById("word-question").innerHTML = question;
    document.getElementById("word-answer").innerHTML = answer;
}

gm_word.hiddenAnswer = function () {
    //document.getElementById("word-answer").hidden = "hidden";
    $("#word-answer").attr("hidden", "hidden");
}

gm_word.showAnswer = function () {
    //document.getElementById("word-answer").removeAttribute("hidden");
    $("#word-answer").removeAttr("hidden");
}

gm_word.nextTest = function () {
    gm_word.hiddenAnswer();
    gm_word.genTest();
    $("#word-modal").modal('show');
}
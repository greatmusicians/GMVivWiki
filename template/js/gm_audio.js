// Namespace.
var gm_audio = {};

gm_audio.playAll = function () {
    //把HTMLCollection转为数组
    var audioList = Array.from(document.getElementsByTagName("audio"));
    // 反转数组，这样每次pop最后一个就是从前往后的顺序了
    audioList = audioList.reverse();

    var audio = audioList.pop();
    audio.scrollIntoView();
    audio.loop = false; // 禁止循环，否则无法触发ended事件
    if (audioList.length > 0) {
        audio.addEventListener('ended', playEndedHandler);
    }
    audio.play();
    function playEndedHandler() {
        audio.removeEventListener('ended', playEndedHandler);
        audio = audioList.pop();
        audio.scrollIntoView();
        audio.loop = false; // 禁止循环，否则无法触发ended事件
        if (audioList.length > 0) {
            audio.addEventListener('ended', playEndedHandler);
        }
        audio.play();
    }
}
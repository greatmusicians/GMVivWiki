// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "H+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
	if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//获取文本宽度
function getTextWidth(text){ 
    var sensor = $('<pre>'+ text +'</pre>').css({display: 'none'}); 
    $('body').append(sensor); 
    var width = sensor.width();
    sensor.remove(); 
    return width;
};

//页面打开时，填入当天的日期
function initDate() {
    var idList = ['FormYwwt_clrq', 'FormHjwt_clrq', 'FormQtgz_gzrq', 'FormSjcq_clrq'];
    for (var i=0;i<idList.length;i++) {
	$(`#${idList[i]}`).val(new Date().Format("yyyy-MM-dd"));
	$(`#${idList[i]}`).width(getTextWidth("yyyy-MM-dd "));
    }
}

function alertNull(name, value) {
    if(value == '') {
	alert(name + '不能为空')
	return true
    }
    return false
}

function alertNullDefault(name, value, defaultValue) {
    if(value == '') {
	alert(name + '不能为空')
	return true
    }
    if(value == defaultValue) {
	alert(name + '不能为默认值')
	return true
    }
    return false
}

function postFormYwwt() {
    var xt_dm = $('#FormYwwt_xt_dm').val();//所属系统
    var ywy_dm = $('#FormYwwt_ywy_dm').val();//业务域
    var wtlx_dm = $('#FormYwwt_wtlx_dm').val();//问题类型
    var wtly_dm = $('#FormYwwt_wtly_dm').val();//问题来源
    var ywry_dm = $('#FormYwwt_ywry_dm').val();//运维人员
    var clrq = $('#FormYwwt_clrq').val();//处理日期
    var wtms = $('#FormYwwt_wtms').val();//问题描述
    var clfs = $('#FormYwwt_clfs').val();//处理方式

    if(alertNullDefault('所属系统', xt_dm, 'xt_dm')) {
	return
    }
    if(alertNullDefault('业务域', ywy_dm, 'ywy_dm')) {
	return
    }
    if(alertNullDefault('问题类型', wtlx_dm, 'wtlx_dm')) {
	return
    }
    if(alertNullDefault('问题来源', wtly_dm, 'wtly_dm')) {
	return
    }
    if(alertNullDefault('运维人员', ywry_dm, 'ywry_dm')) {
	return
    }
    if(alertNull('处理日期', clrq)) {
	return
    }
    if(alertNull('问题描述', wtms)) {
	return
    }
    if(alertNull('处理方式', clfs)) {
	return
    }

    var sqlInsert = `insert into Bach_data.worklog_rzb_ywwt (UUID, XT_DM, YWY_DM, WTLX_DM, WTLY_DM, YWRY_DM, CLRQ, WTMS, CLFS) values (sys_guid(), '${xt_dm}', '${ywy_dm}', '${wtlx_dm}', '${wtly_dm}', '${ywry_dm}', date'${clrq}', '${wtms}', '${clfs}');`;
    
    $.ajax({
	type: 'POST',
	url: '/add',
	data: {sql:sqlInsert},
	success: function(data){
	    alert(data);
        },
	dataType: "text"
    });
}

function postFormSjcq() {
    var xt_dm = $('#FormSjcq_xt_dm').val();//所属系统
    var ywbm_dm = $('#FormSjcq_ywbm_dm').val();//业务部门
    var ywry_dm = $('#FormSjcq_ywry_dm').val();//运维人员
    var clrq = $('#FormSjcq_clrq').val();//处理日期
    var xqms = $('#FormSjcq_xqms').val();//需求描述
    var djr = $('#FormSjcq_djr').val();//对接人
    var sjl = $('#FormSjcq_sjl').val();//数据量

    if(alertNullDefault('所属系统', xt_dm, 'xt_dm')) {
	return
    }
    if(alertNullDefault('业务部门', ywbm_dm, 'ywbm_dm')) {
	return
    }
    if(alertNullDefault('运维人员', ywry_dm, 'ywry_dm')) {
	return
    }
    if(alertNull('处理日期', clrq)) {
	return
    }
    if(alertNull('需求描述', xqms)) {
	return
    }
    if(alertNull('对接人', djr)) {
	return
    }
    if(alertNull('数据量', sjl)) {
	return
    }

    var sqlInsert = `insert into Bach_data.worklog_rzb_sjcq (UUID, XT_DM, YWBM_DM, YWRY_DM, CLRQ, XQMS, DJR, SJL) values (sys_guid(), '${xt_dm}', '${ywbm_dm}', '${ywry_dm}', date'${clrq}', '${xqms}', '${djr}', '${sjl}');`;
    
    $.ajax({
	type: 'POST',
	url: '/add',
	data: {sql:sqlInsert},
	success: function(data){
	    alert(data);
        },
	dataType: "text"
    });
}


function postFormHjwt() {
    var xt_dm = $('#FormHjwt_xt_dm').val();//所属系统
    var wtlx_dm = $('#FormHjwt_wtlx_dm').val();//问题类型
    var ywry_dm = $('#FormHjwt_ywry_dm').val();//运维人员
    var clrq = $('#FormHjwt_clrq').val();//处理日期
    var wtms = $('#FormHjwt_wtms').val();//问题描述
    var clfs = $('#FormHjwt_clfs').val();//处理方式
    var wtyy = $('#FormHjwt_wtyy').val();//问题原因
    var bh = $('#FormHjwt_bh').val();//编号
    var gjc = $('#FormHjwt_gjc').val();//关键词
    var clsc = $('#FormHjwt_clsc').val();//处理时长

    if(alertNullDefault('所属系统', xt_dm, 'xt_dm')) {
	return
    }
    if(alertNullDefault('问题类型', wtlx_dm, 'wtlx_dm')) {
	return
    }
    if(alertNullDefault('运维人员', ywry_dm, 'ywry_dm')) {
	return
    }
    if(alertNull('处理日期', clrq)) {
	return
    }
    if(alertNull('问题描述', wtms)) {
	return
    }
    if(alertNull('处理方式', clfs)) {
	return
    }
    if(alertNull('需求描述', xqms)) {
	return
    }
    if(alertNull('问题原因', xqms)) {
	return
    }
    if(alertNull('编号', bh)) {
	return
    }
    if(alertNull('关键词', gjc)) {
	return
    }
    if(alertNull('处理时长', clsc)) {
	return
    }

    var sqlInsert = `insert into Bach_data.worklog_rzb_hjwt (UUID, XT_DM, WTLX_DM, YWRY_DM, CLRQ, WTMS, CLFS, WTYY, BH, GJC, CLSC) values (sys_guid(), '${xt_dm}', '${wtlx_dm}', '${ywry_dm}', date'${clrq}', '${wtms}', '${clfs}', '${wtyy}', '${bh}', '${gjc}', '${clsc}');`;
    
    $.ajax({
	type: 'POST',
	url: '/add',
	data: {sql:sqlInsert},
	success: function(data){
	    alert(data);
        },
	dataType: "text"
    });
}


function postFormQtgz() {
    var xt_dm = $('#FormQtgz_xt_dm').val();//所属系统
    var gzlx_dm = $('#FormQtgz_gzlx_dm').val();//工作类型
    var ywry_dm = $('#FormQtgz_ywry_dm').val();//运维人员
    var clrq = $('#FormQtgz_clrq').val();//处理日期
    var gznr = $('#FormQtgz_gznr').val();//工作内容

    if(alertNullDefault('所属系统', xt_dm, 'xt_dm')) {
	return
    }
    if(alertNullDefault('工作类型', gzlx_dm, 'gzlx_dm')) {
	return
    }
    if(alertNullDefault('运维人员', ywry_dm, 'ywry_dm')) {
	return
    }
    if(alertNull('处理日期', clrq)) {
	return
    }
    if(alertNull('工作内容', gznr)) {
	return
    }

    var sqlInsert = `insert into Bach_data.worklog_rzb_qtgz (UUID, XT_DM, GZLX_DM, YWRY_DM, CLRQ, GZNR) values (sys_guid(), '${xt_dm}', '${gzlx_dm}', '${ywry_dm}', date'${clrq}', '${gznr}');`;
    
    $.ajax({
	type: 'POST',
	url: '/add',
	data: {sql:sqlInsert},
	success: function(data){
	    alert(data);
        },
	dataType: "text"
    });
}


/**
 * Created by arid6405 on 11/21/13.
 *
 *定义一个map结构
*/
function Map(){
    this.container = new Object();
}


Map.prototype.put = function(key, value){
    this.container[key] = value;
}


Map.prototype.get = function(key){
    return this.container[key];
}

Map.prototype.keySet = function() {
    var keyset = new Array();
    var count = 0;
    for (var key in this.container) {
// 跳过object的extend函数
        if (key == 'extend') {
            continue;
        }
        keyset[count] = key;
        count++;
    }
    return keyset;
}


Map.prototype.size = function() {
    var count = 0;
    for (var key in this.container) {
// 跳过object的extend函数
        if (key == 'extend'){
            continue;
        }
        count++;
    }
    return count;
}


Map.prototype.remove = function(key) {
    delete this.container[key];
}


Map.prototype.toString = function(){
    var str = "";
    for (var i = 0, keys = this.keySet(), len = keys.length; i < len; i++) {
        str = str + keys[i] + "=" + this.container[keys[i]] + ";\n";
    }
    return str;
}





/*将timestamp转换为date格式*/
Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1,
        // month
        "d+": this.getDate(),
        // day
        "h+": this.getHours(),
        // hour
        "m+": this.getMinutes(),
        // minute
        "s+": this.getSeconds(),
        // second
        "q+": Math.floor((this.getMonth() + 3) / 3),
        // quarter
        "S": this.getMilliseconds()
        // millisecond
    };
    if (/(y+)/.test(format) || /(Y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};
function timestampformat(timestamp) {
    return (new Date(timestamp)).format("yyyy-MM-dd hh:mm:ss");
}
/*添加yy-mm-dd hh:mm:ss转为timestamp功能*/
function datetime_to_unix(datetime){
    var tmp_datetime = datetime.replace(/:/g,'-');
    tmp_datetime = tmp_datetime.replace(/ /g,'-');
    var arr = tmp_datetime.split("-");
    var now = new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5]));
    return parseInt(now.getTime());
}


/*获取当前窗口的部分参数，用于分页*/
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
Map.prototype.toString = function(){
    var str = "";
    for (var i = 0, keys = this.keySet(), len = keys.length; i < len; i++) {
        str = str + keys[i] + "=" + this.container[keys[i]] + ";\n";
    }
    return str;
}


/*为Array添加删除功能*/
Array.prototype.remove=function(dx)
{
    if(isNaN(dx)||dx>this.length){return false;}
    for(var i=0,n=0;i<this.length;i++)
    {
        if(this[i]!=this[dx])
        {
            this[n++]=this[i]
        }
    }
    this.length-=1
}


function  TimeFromTo(){
    var  $from=document.getElementById('from').value;
    var  $to=document.getElementById('to').value;
    console.log("原始from数据："+$from);
    console.log("原始to数据："+$to);
    $fromTime=datetime_to_unix($from);
    $toTime=datetime_to_unix($to);
    console.log("转换from数据："+$fromTime);
    console.log("转换to数据："+$toTime) ;
    if($from!=""||$to!=""){
        var  $searchData=new Map();
        if($from!="")
            $searchData.put("$gt",$fromTime);
        if($to!=""){
            if($fromTime==$toTime)
                $toTime+=86400000;
            $searchData.put("$lt",$toTime);
        }
        if($from!="" && $to!="" && $toTime<$fromTime){
            alert("WARN：起始时间长于终止时间");
        }
    }
    else
        var $searchData;
    if($searchData)
        return $searchData.container;
    else
        return  $searchData;
}

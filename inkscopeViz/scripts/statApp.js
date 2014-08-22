/**
 * Created by arid6405 on 11/21/13.
 */


function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}


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



angular.module('statApp', ['ngRoute','ngTable','D3Directives','ui.bootstrap','dialogs'])
    .filter('bytes', funcBytesFilter)
    .config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: ListCtrl}).//, templateUrl: 'partials/pools/aboutPools.html'}).
            when('/detail/:poolID', {controller: DetailCtrl, templateUrl: 'partials/detailStat.html'}).
            otherwise({redirectTo: '/'})
    });


function  SwapCtrl($http, $rootScope,$host, $templateCache) {
    $http({method:"post",data:"hostname="+$host,url:"../inkscopeCtrl/ceph/swapstat",timeout:4000})
        .success(function (data) {
            var  len=data.length;
            var dataList=[];
            if(len>0){
                dataList[0]=data[len-1];
                dataList[0].timestamp=timestampformat(dataList[0].timestamp);
            }
            $rootScope.swapDataList=dataList;
        });
}

function  CpuCtrl($http, $rootScope,$host, $templateCache) {
    $http({method:"post",data:"hostname="+$host,url:"../inkscopeCtrl/ceph/cpustat",timeout:4000})
        .success(function (data) {
            var  len=data.length;
            var dataList=[];
            if(len>0){
                dataList[0]=data[len-1];
                dataList[0].timestamp=timestampformat(dataList[0].timestamp);
            }
             $rootScope.cpudataList=dataList;
        });
}
function  MemCtrl($http, $rootScope,$host,$templateCache) {
    $http({method:"post",data:"hostname="+$host,url:"../inkscopeCtrl/ceph/memstat",timeout:4000})
        .success(function (data) {
            var  len=data.length;
            var dataList=[];
            if(len>0){
                dataList[0]=data[len-1];
                dataList[0].timestamp=timestampformat(dataList[0].timestamp);
            }
            $rootScope.memdataList=dataList;
        });
}
function  NetworkCtrl($http, $rootScope, $host,$templateCache) {
    $http({method:"post",data:"hostname="+$host,url:"../inkscopeCtrl/ceph/netstat",timeout:4000})
        .success(function (data) {
            var  len=data.length;
            var dataList=[];
            if(len>0){
                dataList[0]=data[len-1];
                dataList[0].timestamp=timestampformat(dataList[0].timestamp);
            }
             $rootScope.netDataList=dataList;
        });

}

function  DiskCtrl($http, $rootScope,$host, $templateCache) {
    $http({method:"post",data:"hostname="+$host,url:"../inkscopeCtrl/ceph/diskstat",timeout:4000})
        .success(function (data) {
            var dataLen=data.length;
            var dataCount=0;
            if(dataLen!=0)
		var dataDisk1=data[0].disk.$id;
            for(var i=0;i<dataLen;i++){
		if(data[i].disk.$id==dataDisk1)
                    dataCount++;
            }
            var  dataListNumber=0;
            if(dataCount!=0)
		dataListNumber=dataLen/dataCount;
            var  dataList=[];
            var  dataStartNumber=0;
            for(var  i=dataStartNumber;i<dataListNumber;i++){
		dataList[i-dataStartNumber]=data[i];
		dataList[i-dataStartNumber].timestamp=timestampformat(dataList[i-dataStartNumber].timestamp);
            }
             $rootScope.diskDataList=dataList;
        });
}


function refreshPools($http, $rootScope,$templateCache) {

    var  $page=getQueryString("page");
    if($page==null)
        $page=1;
    var  $pageNumber=20;
    var  $skip=$page-1;
    var  $limit=$pageNumber;
    if($page==1)
        $rootScope.leftPage=1;
           else
        $rootScope.leftPage=$page-1;
    $rootScope.rightPage=$page-1+2;
    $http({method: "get",url: "../inkscopeCtrl/ceph/hosts?skip="+$skip+"&limit="+$limit, cache: $templateCache}).
        success(function (data, status) {
	    var $len=data.length;
	    for(var  $i=0;$i<$len;$i++){
		data[$i].timestamp=timestampformat(data[$i].timestamp);
		data[$i].num=$i;
	    }
            $rootScope.orderedData =  data;
        }).
        error(function (data, status, headers) {
            //alert("refresh pools failed with status "+status);
            $rootScope.status = status;
            $rootScope.pools =  data || "Request failed";
            $rootScope.stats.total_used = "N/A";
            $rootScope.stats.total_space = "N/A";
        });
}


function ListCtrl($rootScope,$http, $filter, ngTableParams) {
    refreshPools($http,$rootScope);
    setInterval(function(){
        refreshPools($http, $rootScope)
    }, 10000);
}

function DetailCtrl($rootScope,$scope, $http, $routeParams, $route, $dialogs) {
    var  $page=getQueryString("page");
    if($page==null)
        $page=1;
    var  $pageNumber=20;
    var  $skip=$page-1;
    var  $limit=$pageNumber;
     var uri = inkscopeCtrlURL + "/ceph/pg?skip="+$skip+"&limit="+$limit;
    var v;
    var v2 = '';
    $host=$routeParams.poolID;
    CpuCtrl($http, $rootScope ,$host);//申明函数
    setInterval(function () {
        CpuCtrl($http, $rootScope,$host);
    },10*1000);

    MemCtrl($http, $rootScope,$host);
    setInterval(function () {
        MemCtrl($http, $rootScope,$host);
    },10*1000);
SwapCtrl($http, $rootScope,$host);
    setInterval(function () {
        SwapCtrl($http, $rootScope,$host);
    },10*1000);

NetworkCtrl($http, $rootScope,$host);
    setInterval(function () {
        NetworkCtrl($http, $rootScope,$host);
    },10*1000);
DiskCtrl($http, $rootScope,$host);//申明函数
    setInterval(function () {
        DiskCtrl($http, $rootScope,$host);
    },3*1000);
}


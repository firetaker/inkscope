/*添加模块，并添加js跳转路由*/
var statApp=angular.module('statApp', ['ngRoute','ngTable','D3Directives','ui.bootstrap','dialogs'])
    .filter('bytes', funcBytesFilter)
    .config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: ListCtrl}).
	    when('/detail/:poolID/CPUstat', {controller: CpuCtrl, templateUrl: 'partials/detailCpuStat.html'}).             //CPU详细信息展示
            when('/detail/:poolID/MEMstat', {controller: MemCtrl, templateUrl: 'partials/detailMemStat.html'}).             //Mem详细信息展示
            when('/detail/:poolID/Networkstat', {controller: NetworkCtrl, templateUrl: 'partials/detailNetworkStat.html'}). //网卡详细信息展示
            when('/detail/:poolID/Swapstat', {controller: SwapCtrl, templateUrl: 'partials/detailSwapStat.html'}).          //交换空间详细信息展示
 	    otherwise({redirectTo: '/'})                                                                                    //重定向到默认路由
    });

jQuery(function () {
    // 时间设置
    jQuery('#from').datetimepicker({
        timeFormat: "HH:mm:ss",
        dateFormat: "yy-mm-dd"
    });
});
jQuery(function () {
    // 时间设置
    jQuery('#to').datetimepicker({
        timeFormat: "HH:mm:ss",
        dateFormat: "yy-mm-dd"
    });

});
function  SwapCtrl($rootScope,$scope, $http, $routeParams, $route, $dialogs) {
    $host=$routeParams.poolID;
    var $timeFromTo=TimeFromTo();
    var para = {"hostname":$host,"timestamp":$timeFromTo};

    $http({method:"post",data :JSON.stringify(para),url:"../inkscopeCtrl/ceph/swapstat",timeout:4000})
        .success(function (data) {
            var  len=data.length;
            var dataList=[];
            if(len>0){
                dataList[0]=data[len-1];
                dataList[0].timestamp=timestampformat(dataList[0].timestamp);
            }
	    var arr_used = new Array();
            var arr_free = new Array();
            var arr_cached = new Array();
            var tids = new Array();
            for (var i = 0; i < data.length; i++) {
                //console.log(data[i].timestamp);
                tids.push(i);
                arr_used.push(Number(data[i].used));
                arr_free.push(Number(data[i].free));
            }
            var style = {
            default: {
                point: {
                    visible: false
                },

                line: {
                    width: 1
                }
            }
            }
            console.log(len);
            var graph = $("#SwapChart").aristochart({
                style:style,
                data: {
                    x: tids,
                    y: arr_used,
                    y1:arr_free
                }
            });
            $rootScope.swapDataList=dataList;
        });
}

function  CpuCtrl($rootScope,$scope, $http, $routeParams, $route, $dialogs) {
    $host=$routeParams.poolID;
    var $timeFromTo=TimeFromTo();
    var para = {"hostname":$host,"timestamp":$timeFromTo};
    $http({method:"post",data :JSON.stringify(para),url:"../inkscopeCtrl/ceph/cpustat",timeout:4000})
        .success(function (data) {
            var  len=data.length;
            var dataList=[];
            if(len>0){
                dataList[0]=data[len-1];
                dataList[0].timestamp=timestampformat(dataList[0].timestamp);
            }
            console.log(len);
	   
	    var apply = new Array();
	    var tids = new Array();
	    for (var i = 0; i < data.length; i++) {
		//console.log(data[i].timestamp);
		tids.push(i);
		apply.push(Number(data[i].iowait));            
	    }
	    var style = {
	        default: {
		    point: {
			visible: false
		    },

		    line: {
			width: 1
		    }
		}
	    } 
            console.log(len);

	    var graph = $("#iowait").aristochart({
		style:style,                   
		data: {
		    x: tids,
		    y: apply
		}
            });
            $rootScope.cpudataList=dataList;
        });
}
function  MemCtrl($rootScope,$scope, $http, $routeParams, $route, $dialogs) {
    $host=$routeParams.poolID;
    var $timeFromTo=TimeFromTo();
    var para = {"hostname":$host,"timestamp":$timeFromTo};
    $http({method:"post",data:JSON.stringify(para), headers:{'Content-Type': 'application/x-www-form-urlencoded'},url:"../inkscopeCtrl/ceph/memstat",timeout:4000})
        .success(function (data) {
            var  len=data.length;
            var dataList=[];
            if(len>0){
                dataList[0]=data[len-1];
                dataList[0].timestamp=timestampformat(dataList[0].timestamp);
            }
            var arr_used = new Array();
	    var arr_free = new Array();
	    var arr_cached = new Array();
            var tids = new Array();
            for (var i = 0; i < data.length; i++) {
                //console.log(data[i].timestamp);
                tids.push(i);
                arr_used.push(Number(data[i].used));
		arr_cached.push(Number(data[i].cached));
		arr_free.push(Number(data[i].free));
	    }
            var style = {
            default: {
                point: {
                    visible: false
                },

                line: {
                    width: 1
                }
            }
            }
            console.log(len);
            var graph = $("#MemChart").aristochart({
                style:style,
                data: {
                    x: tids,
                    y: arr_used,
		    y1:arr_free,
		    y2:arr_cached
		}
            });
            $rootScope.memdataList=dataList;
        });
}
function  NetworkCtrl($rootScope,$scope, $http, $routeParams, $route, $dialogs) {
    var $host=$routeParams.poolID;
    var $timeFromTo=TimeFromTo();
    var para = {"hostname":$host,"timestamp":$timeFromTo};
    $http({method:"post",data:JSON.stringify(para),url:"../inkscopeCtrl/ceph/netstat",timeout:4000})
        .success(function (data) {
            var  $len=data.length;
            var $dataList=new Array();
	    var  $arrRxList=new Array();
            var  $arrTxList=new Array();
     	    while($len!=0){
		$dataList.push(data[0]);
		var $count=0;
		var  $arrRx=new Array();
		var  $arrTx=new Array();

		for(var  $i=0;$i<$len;$i++){
		    if($i==0){
			$arrRx.push(data[$i].rx.bytes);
			$arrTx.push(data[$i].tx.bytes);
			data.remove($i);
                        $i--;
                        $len--;
                        $count++;
			continue;
		    }
		    if(data[$i].network_interface.$id==$arr[0].network_interface.$id){
			$arrRx.push(data[$i].rx.bytes);
                        $arrTx.push(data[$i].tx.bytes);
                        data.remove($i);
                        $i--;
                        $len--;
                        $count++;
                        continue;
		    }
		}
		$arrRxList.push($arrRx);
		$arrTxList.push($arrTx);
	    }

	    var $lenRx=$arrRxList[0].length;
	    var $lenTx=$arrRxList[0].length;
	    var $len2=$arrRxList.length;
	    var $dataRx  =new  Map();
	    var $dataTx  =new  Map();

	    $dataRx.put("x",$lenRx);
	    $dataTx.put("x",$lenTx);
            for(var $i=0;$i<$len2;$i++){
		if($i!=0){
		    $dataTx.put("y"+$i,$arrTxList[$i]);
		    $dataRx.put("y"+$i,$arrRxList[$i]);

		}
		else{
		    $dataTx.put("y",$arrTxList[$i]);
		    $dataRx.put("y",$arrRxList[$i]);
		}
	    }
	    var style = {
            default: {
                point: {
                    visible: false
                },

                line: {
                    width: 1
                }
              }
            }	    
	    var $networkRx=new Map();
            var $networkTx=new Map();

	    $networkRx.put("data",$dataRx.container);
            $networkTx.put("data",$dataTx.container);
            $networkRx.put("style",style);
            $networkTx.put("style",style);
	    var graph = $("#NetworkRxChart").aristochart($networkRx.container);
            var graph = $("#NetworkTxChart").aristochart($networkTx.container);
            $rootScope.netDataList=$dataList;
        });

}

function  DiskCtrl($http, $rootScope,$host, $templateCache) {
    $http({method:"post",data:{"hostname" : $host},url:"../inkscopeCtrl/ceph/diskstat",timeout:4000})
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
    var  $searchData;
    refreshPools($http,$rootScope,$searchData);
}

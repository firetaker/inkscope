
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


function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}



function datetime_to_unix(datetime){
    var tmp_datetime = datetime.replace(/:/g,'-');
    tmp_datetime = tmp_datetime.replace(/ /g,'-');
    var arr = tmp_datetime.split("-");
    var now = new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5]));
    return parseInt(now.getTime());
}
 

var processOsdApp=angular.module('processOsdApp', ['ngRoute','ngTable','D3Directives','ui.bootstrap','dialogs'])
    .filter('bytes', funcBytesFilter)
    .config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: ListCtrl}).//, templateUrl: 'partials/pools/aboutPools.html'}).
            when('/detail/:processId', {controller: DetailCtrl, templateUrl: 'partials/detailProcess.html'}).
            otherwise({redirectTo: '/'})}
);

function refreshPools($http, $rootScope,$searchData, $templateCache) {
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
    $http({method: "get",url: "../inkscopeCtrl/ceph/osd?skip="+$skip+"&limit="+$limit, cache: $templateCache}).
        success(function (data, status) {
	    var $len=data.length;
	    for(var  $i=0;$i<$len;$i++){
		data[$i].num=$i;
	    }
            $rootScope.orderedData =  data;
	    $rootScope.pageTitle="Ceph osd view";
        }).
        error(function (data, status, headers) {
            //alert("refresh pools failed with status "+status);
            $rootScope.status = status;
            $rootScope.pools =  data || "Request failed";
        });
}


function ListCtrl($rootScope,$http, $filter, ngTableParams) {
    refreshPools($http,$rootScope);
}

function DetailCtrl($rootScope,$scope, $http, $routeParams, $route, $dialogs) {
    $host=$routeParams.processId;
    var $timeFromTo=TimeFromTo();
    var para = {"daemontype" : "osd."+$host,"timestamp":$timeFromTo};
    $http({method:"post",data:JSON.stringify(para),url:"../inkscopeCtrl/ceph/processstat",timeout:4000})
	.success(function (data) {
            var  len=data.length;
            var dataList=[];
            if(len>0){
                dataList[0]=data[len-1];
            }
            var arr_cpu_times_user = new Array();
            var arr_mem_shared = new Array();
            var arr_cpu_times_system = new Array();
	    var arr_shared = new Array();
	    var arr_mem_rss = new Array();
	    var arr_mem_vms = new Array();
            var tids = new Array();
            

	    arr_cpu_times_user.push(0.1);
            arr_mem_shared.push(0.1);
            arr_cpu_times_system.push(0.1);
            arr_mem_vms.push(0.1);
            arr_mem_rss.push(0.1);
            tids.push(0);
            for (var i = 1; i <=data.length; i++) {
                //console.log(data[i].timestamp);
                tids.push(i);
                arr_cpu_times_user.push(Number(data[i-1].cpu_times_user));
                arr_mem_shared.push(Number(data[i-1].mem_shared));
                arr_cpu_times_system.push(Number(data[i-1].cpu_times_system));
                arr_mem_rss.push(Number(data[i-1].mem_rss));
                arr_mem_vms.push(Number(data[i-1].mem_vms));
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
            var graph = $("#ProcessChart").aristochart({
                style:style,
                data: {
                    x: tids,
                    y: arr_cpu_times_user,
		}
            });
	    var graph = $("#ProcessCuptimeChart").aristochart({
                style:style,
                data: {
                    x: tids,
                    y:arr_cpu_times_system,
                }
            });
	    var graph = $("#ProcessMemsharedChart").aristochart({
                style:style,
                data: {
                    x: tids,
                    y: arr_mem_shared,
                }
            });

	    var graph = $("#ProcessMemvmsChart").aristochart({
                style:style,
                data: {
                    x: tids,
                    y: arr_mem_vms,
                }
            });
	    var graph = $("#ProcessMemrssChart").aristochart({
                style:style,
                data: {
                    x: tids,
                    y: arr_mem_rss,
                }
            });
            $rootScope.memdataList=dataList;

        })
        .error(function (data, status, headers) {
            $rootScope.status = status;
            $rootScope.pools =  data || "Request failed";
            $dialogs.error("<h3>Can't display pools with num "+$routeParams.poolNum+"</h3><br>"+$scope.data);
        });
}

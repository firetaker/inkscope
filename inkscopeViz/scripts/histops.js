angular.module('histOpsApp', ['ngRoute','ngTable','ui.bootstrap','dialogs',"ngQuickDate"])
    .config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: ListCtrl, templateUrl: 'partials/hosts/aboutHosts.html'}).
            when('/detail/:optid', {controller: DetailCtrl, templateUrl: 'partials/hosts/event.html'}).
            otherwise({redirectTo: '/'})
    });

function refreshHistOps($http, $rootScope, $templateCache) {
	$http({method: "get", url: inkscopeCtrlURL + "ceph/histops"}).
        success(function (data, status) {
            $rootScope.status = status;
            $rootScope.ops =  data;
            $rootScope.tableParams.reload();
        }).
        error(function (data, status, headers) {
            //alert("refresh buckets failed with status "+status);
            $rootScope.status = status;
            $rootScope.ops =  data || "Request failed";
        });
}

function GetDateDiff(startTime, endTime, diffType) {
    //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式 
    startTime = startTime.replace(/\-/g, "/");
    endTime = endTime.replace(/\-/g, "/");

    //将计算间隔类性字符转换为小写
    diffType = diffType.toLowerCase();
    var sTime =new Date(startTime);      //开始时间
    var eTime =new Date(endTime);  //结束时间
    //作为除数的数字
    var divNum =1;
    switch (diffType) {
        case"second":
            divNum =1000;
            break;
        case"minute":
            divNum =1000*60;
            break;
        case"hour":
            divNum =1000*3600;
            break;
        case"day":
            divNum =1000*3600*24;
            break;
        default:
            break;
    }
    return parseInt(eTime.getTime() - sTime.getTime());
    //return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
}

function ListCtrl($rootScope,$scope, $http, $filter, ngTableParams, $location) {
    $rootScope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,          // count per page
        sorting: {
            bucket: 'asc'     // initial sorting
        }
    }, {
        counts: [], // hide page counts control
        total: 1,  // value less than count hide pagination
        getData: function ($defer, params) {
            // use build-in angular filter
            $rootScope.histOpsData = params.sorting() ?
                $filter('orderBy')($rootScope.ops, params.orderBy()) :
                data;
            $defer.resolve($rootScope.histOpsData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });
    refreshHistOps($http,$rootScope);
    $rootScope.tid = "";

    $scope.showDetail = function (optid) {
        $location.path('/detail/'+optid);
    }
}

function DetailCtrl($rootScope,$scope, $http, $routeParams, $route, $dialogs) {
    var para ={"_id" : $routeParams.optid}; 
    $rootScope.tid = $routeParams.optid;
    var uri = inkscopeCtrlURL + "ceph/histops";
    $http({method: "post", data:para, url: uri }).
        success(function (data, status) {
            $rootScope.status = status;
            $rootScope.duration = data[0].duration;
            $rootScope.received_at = data[0].received_at;
        	var evts = data[0].type_data;
        	var entsarr = evts[2];
        	var new_evt_arr = new Array();
        	for (var i = 0; i < entsarr.length; i++) {
        		//console.log(entsarr[i].event);
        		//console.log(entsarr[i].time);
        		//console.log(GetDateDiff(data[0].received_at,entsarr[i].time,"second"));
        		var time_elaped = 0;
        		if( i == 0)
        			time_elaped = GetDateDiff(data[0].received_at,entsarr[i].time,"second");
        		else
        			time_elaped = GetDateDiff(entsarr[i-1].time,entsarr[i].time,"second");
        		var new_item ={"event":entsarr[i].event,"time":entsarr[i].time,"elapsed":time_elaped};
        		new_evt_arr.push(new_item);
        	}
        	
            $rootScope.detailedEvents =  new_evt_arr;
        }).
        error(function (data, status, headers) {
            $rootScope.status = status;
            $rootScope.detailedEvents =  data || "Request failed";
            //$dialogs.error("<h3>Can't display bucket named "+$routeParams.bucketName+"</h3><br>"+$scope.data);
        });
}

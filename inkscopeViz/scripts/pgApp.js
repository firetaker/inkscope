/**
 * Created by arid6405 on 11/21/13.
 */


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
 

angular.module('pgApp', ['ngRoute','ngTable','D3Directives','ui.bootstrap','dialogs'])
    .filter('bytes', funcBytesFilter)
    .config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: ListCtrl}).//, templateUrl: 'partials/pools/aboutPools.html'}).
            when('/detail/:poolNum', {controller: DetailCtrl, templateUrl: 'partials/detailPG.html'}).
            otherwise({redirectTo: '/'})}
);

function refreshPools($http, $rootScope, $templateCache) {
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
    var  $search=document.getElementById('search').value;
    var  $from=document.getElementById('from').value;
    var  $to=document.getElementById('to').value;
    console.log($search);
    console.log($from);
    console.log(datetime_to_unix($to));
    $searchData="";
    if($search!="")
	$searchData={"_id" : $search };
    
    $http({method: "get",data:$searchData,url: "../inkscopeCtrl/ceph/pg?page="+$page+"&skip="+$skip+"&limit="+$limit, cache: $templateCache}).
        success(function (data, status) {
	    var $len=data.length;
	    for(var  $i=0;$i<$len;$i++){
		data[$i].num=$i;
	    }
            $rootScope.orderedData =  data;
	    $rootScope.pageTitle="Ceph PG view";
        }).
        error(function (data, status, headers) {
            //alert("refresh pools failed with status "+status);
            $rootScope.status = status;
            $rootScope.pools =  data || "Request failed";
        });
}


function ListCtrl($rootScope,$http, $filter, ngTableParams) {
    refreshPools($http,$rootScope);
    setInterval(function(){
        refreshPools($http, $rootScope)
    }, 10000);
}

function SearchCtrl($rootScope,$http, $filter, ngTableParams) {
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
     var uri = inkscopeCtrlURL + "/ceph/pg?page="+$page+"&skip="+$skip+"&limit="+$limit;
    var v;
    var v2 = '';
    $http({method: "get", url: cephRestApiURL + "tell/osd.0/version.json"}).
        success(function(data,status){
            $rootScope.status = status;
            v = data.output.version;
            for (var i=13; i<17; i++){
                v2 = v2 + v[i];
            }
            $rootScope.version = parseFloat(v2);
        }).
        error(function (data, status, headers) {
            $rootScope.status = status;
            $rootScope.versionosd =  data || "Request failed";
        }
    );

    $http({method: "get", url: uri }).
        success(function (data, status) {
            $rootScope.status = status;
            $rootScope.detailedPool =  data[$routeParams.poolNum];
            $scope.hasSnap=false;

            for (var key in $rootScope.detailedPool){

                    if ( key == "pool_snaps"){
                        if ($rootScope.version < 0.80){
                            var value = ($rootScope.detailedPool[key])["pool_snap_info"];
                        }
                        else{
                            var value = ($rootScope.detailedPool[key])[$rootScope.detailedPool[key].length-1];
                        }
                        $rootScope.detailedPool[key] = "nr: "+value["snapid"]+", date: "+value["stamp"]+", name: "+value["name"];
                        $scope.hasSnap=true;
                        $scope.snap_name = value["name"];
                        break;
                    }
            }

        }).
        error(function (data, status, headers) {
            $rootScope.status = status;
            $rootScope.pools =  data || "Request failed";
            $dialogs.error("<h3>Can't display pools with num "+$routeParams.poolNum+"</h3><br>"+$scope.data);
        });
}
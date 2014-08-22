/**
 * Created by arid6405 on 11/21/13.
 */


function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

angular.module('pgApp', ['ngRoute','ngTable','D3Directives','ui.bootstrap','dialogs'])
    .filter('bytes', funcBytesFilter)
    .config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: ListCtrl}).//, templateUrl: 'partials/pools/aboutPools.html'}).
            when('/detail/:poolNum', {controller: DetailCtrl, templateUrl: 'partials/detailPG.html'}).
            otherwise({redirectTo: '/'})

    });




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
    $http({method: "get", url: "../inkscopeCtrl/ceph/pg?page="+$page+"&skip="+$skip+"&limit="+$limit, cache: $templateCache}).
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

function SnapshotCtrl($rootScope,$scope, $http, $routeParams, $location, $dialogs) {
    $scope.poolNum = $routeParams.poolNum;
    $scope.poolName = $routeParams.poolName;
    var uri = inkscopeCtrlURL + "pools/"+$scope.poolNum+"/snapshot" ;

    $scope.submit = function () {
        $scope.status = "en cours ...";

        $http({method: "post", url: uri, data: "json={\"snapshot_name\":\""+$scope.snap_name+"\"}", headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).
            success(function (data, status) {
                $rootScope.status = status;
                $dialogs.notify("Snapshot creation for pool \""+ $scope.poolName+"\"","Snapshot <strong>"+$scope.snap_name+"</strong> was created");
                $location.path('/detail/'+$scope.poolNum);
            }).
            error(function (data, status, headers) {
                $scope.status = status;
                $scope.data =  data || "Request failed";
                $dialogs.error("<h3>Can't create snapshot for pool \""+ $scope.poolName+"\"</h3><br>"+$scope.data);
            });
    }
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


    $scope.removeSnapshot = function () {
        var uri = inkscopeCtrlURL + "pools/"+$scope.detailedPool.pool+"/snapshot/"+$scope.snap_name ;
        $scope.status = "en cours ...";
        $http({method: "delete", url: uri}).
            success(function (data, status) {
                $rootScope.status = status;
                $dialogs.notify("Snapshot deletion for pool \""+ $scope.detailedPool.pool_name+"\"","Snapshot <strong>"+$scope.snap_name+"</strong> was deleted");
                $route.reload();
            }).
            error(function (data, status, headers) {
                $scope.status = status;
                $scope.data =  data || "Request failed";
                $dialogs.error("<h3>Can't delete snapshot for pool \""+ $scope.detailedPool.pool_name+"\"</h3><br>"+$scope.data);
            });
    }
}


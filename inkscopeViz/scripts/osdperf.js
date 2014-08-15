angular.module('hostsApp', ['ngRoute','ngTable','D3Directives','ui.bootstrap','dialogs'])
    .filter('bytes', funcBytesFilter)
    .config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: ListCtrl, templateUrl: 'partials/hosts/aboutHosts.html'}).
            when('/detail/:osdId', {controller: DetailCtrl, templateUrl: 'partials/hosts/detailosd.html'}).
            otherwise({redirectTo: '/'})
    });

function refreshHosts($http, $scope, $templateCache) {
    $http({method: "get", url: inkscopeCtrlURL + "ceph/osd", cache: $templateCache}).
        success(function (data, status) {
            $scope.status = status;
            $scope.osds =  data;
            $scope.tableParams.reload();
        }).
        error(function (data, status, headers) {
            //alert("refresh hosts failed with status "+status);
            $scope.status = status;
            $scope.osds =  data || "Request failed";
        });
}

function ListCtrl($scope,$http, $filter, ngTableParams, $location) {
    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 20,          // count per page
        sorting: {
            _id: 'asc'     // initial sorting
        }
    }, {
        counts: [], // hide page counts control
        total: 1,  // value less than count hide pagination
        getData: function ($defer, params) {
            // use build-in angular filter
            $scope.orderedData = params.sorting() ?
                $filter('orderBy')($scope.osds, params.orderBy()) :
                data;
            //$defer.resolve($scope.orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });

    refreshHosts($http,$scope);
    setInterval(function(){
        //refreshHosts($http, $scope)
    }, 10000);
    var data;

    $scope.showDetail = function (hostid) {
        $location.path('/detail/'+hostid);
    }
}

function DetailCtrl($scope, $http, $routeParams, $dialogs) {
    $scope.detailedOsd = {};
    $scope.detailedOsd._id = $routeParams.osdId;
    var data ={"osdtypeid" : "osd."+$routeParams.osdId}
  
    var uri = inkscopeCtrlURL + "ceph/osdperf";
    $http({method: "post", data:data, url: uri }).
        success(function (data, status) {
            //$scope.detailedHost =  data[0];
            var apply = new Array();
        	var commit = new Array();
            for (var i = 0; i < data.length; i++) {
            	console.log(data[i].timestamp);
            	console.log(data[i].perf_stats.apply_latency_ms);
            	var apply_p = {x:i,y: data[i].perf_stats.apply_latency_ms};
            	var commit_p = {x:i, y: data[i].perf_stats.commit_latency_ms};
            	apply.push(apply_p);
            	commit.push(commit_p)
               }
            console.log(apply)
         
            var graph = new Rickshaw.Graph( {
                element: document.querySelector("#iopschart"), 
                width: 580,
            	height: 250,
                renderer: 'line',
                series: [{
                    color: 'steelblue',
                    name:"apply_latency_ms",
                    data: apply
                     },
                     {
                    color: 'lightblue',
                    name:"commit_latency_ms",
                    data: commit
                     }]
            });
            new Rickshaw.Graph.HoverDetail({ graph: graph });
            graph.render();
            $scope.status = status;            
        }).
        error(function (data, status, headers) {
            $scope.status = status;
            $scope.osds =  data || "Request failed";
            $dialogs.error("<h3>Can't display hosts with id "+$routeParams.hostId+"</h3><br>"+$scope.data);
        });
}
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
            // alert("refresh hosts failed with status "+status);
            $scope.status = status;
            $scope.osds =  data || "Request failed";
        });
}

function show_my_all($http, $scope, $templateCache) {
	var show_data = {
		x:10
	};
	
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
    
	for(var osdid = 0; osdid < 2; osdid++)
	{
		var para ={"osd_typeid" : "osd."+ osdid};	
		var uri = inkscopeCtrlURL + "ceph/histops";
	    $http({method: "post", data: para,  url: uri }).
	        success(function (data, status) {
	            var apply = new Array();
	        	var tids = new Array();
	            for (var i = 0; i < data.length; i++) {
	            	console.log(data[i].timestamp);
	            	tids.push(i);
	            	apply.push(Number(data[i].duration));            	
	               }
	           
	            show_data[osdid] = apply;
	            var color = Math.floor((i/2) * 255);
	            style[osdid] = {
	              line: {
	                 stroke: "rgb(" + [color, 255 - color, Math.floor(Math.random() * 255)].join(", ") + ")"
	              }
	            }
	        }).
	        error(function (data, status, headers) {
	            $scope.status = status;
	            $scope.osds =  data || "Request failed";
	            $dialogs.error("<h3>Can't display hosts with id "+$routeParams.hostId+"</h3><br>"+$scope.data);
	        });
		
	}

           
   var graph = $("#xxcontrol").aristochart({
       style:style,                   
       data:show_data
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
            // $defer.resolve($scope.orderedData.slice((params.page() - 1) *
			// params.count(), params.page() * params.count()));
        }
    });
    
    show_my_all($http,$scope);
    refreshHosts($http,$scope);
    setInterval(function(){
        // refreshHosts($http, $scope)
    }, 10000);
    var data;

    $scope.showDetail = function (hostid) {
        $location.path('/detail/'+hostid);
    }
}


function DetailCtrl($scope, $http, $routeParams, $dialogs) {
    $scope.detailedOsd = {};
    $scope.detailedOsd._id = $routeParams.osdId;
    var data ={"osd_typeid" : "osd."+$routeParams.osdId}
  
    var uri = inkscopeCtrlURL + "ceph/histops";
    $http({method: "post", data:data, url: uri }).
        success(function (data, status) {
            var apply = new Array();
        	var tids = new Array();
            for (var i = 0; i < data.length; i++) {
            	console.log(data[i].timestamp);
            	tids.push(i);
            	apply.push(Number(data[i].duration));            	
               }
            console.log(apply);
            
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
            var graph = $("#iopschart").aristochart({
                   style:style,                   
            	   data: {
                		x: tids,
                		y: apply
                	}
                });
            $scope.status = status;            
        }).
        error(function (data, status, headers) {
            $scope.status = status;
            $scope.osds =  data || "Request failed";
            $dialogs.error("<h3>Can't display hosts with id "+$routeParams.hostId+"</h3><br>"+$scope.data);
        });
}
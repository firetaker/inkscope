angular.module('diskstatApp', ['ngRoute','ngTable','D3Directives','ui.bootstrap','dialogs'])
    .filter('bytes', funcBytesFilter)
    .config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: ListCtrl, templateUrl: 'partials/hosts/aboutHosts.html'}).
            when('/detail/:hostId', {controller: DetailCtrl, templateUrl: 'partials/hosts/detaildiskstat.html'}).
            otherwise({redirectTo: '/'})
    });

function refreshHosts($http, $scope, $templateCache) {
    $http({method: "get", url: inkscopeCtrlURL + "ceph/hosts", cache: $templateCache}).
        success(function (data, status) {
            $scope.status = status;
            $scope.hosts =  data;
            $scope.tableParams.reload();
        }).
        error(function (data, status, headers) {
            //alert("refresh hosts failed with status "+status);
            $scope.status = status;
            $scope.hosts =  data || "Request failed";
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
                $filter('orderBy')($scope.hosts, params.orderBy()) :
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
	$scope.detailedHostid = $routeParams.hostId;
	
    var data ={"hostname" : $routeParams.hostId}
    var uri = inkscopeCtrlURL + "ceph/diskstat";
    $http({method: "post", data: data, url: uri }).
        success(function (data, status) {
            $scope.status = status;
            /**
             * logical_name: "/dev/sdc"
               r_s: 0.02
               rkB_s: 0.14
               rrqm_s: 0

               w_s: 0.06
               wkB_s: 1.76
               wrqm_s: 0.04
               
               var disk["/dev/sdc"]["rkB_s"] = [];
               var disk["/dev/sdc"]["wkB_s"] = [];
             */
            
            var rd_show ={
            		x:10
            };
            
            var style = {
        	   default: {
        		   point: {
        			visible: false
        		   },

        		   line: {
        		    fill: false,
        			width: 1
        		  },
        		   label: {
        			    x: {
        			     fixed: true
        			    },

        			    y: {
        			     fixed: true
        			    }
        			   }
        	   }
            }
            
            var wr_show ={
            		x:10
            };
            
            
            var diskst = new Array();
            var max = 0;
            for(var idx = 0; idx < data.length; idx++){
            	var logicnm =  data[idx].logical_name;
            	if(logicnm == "/dev/sda")
            		continue;
            	var rkB_s = data[idx].rkB_s;
            	var wkB_s = data[idx].wkB_s;
            	//第一维数据已存在
            	if(typeof(diskst[logicnm]) != 'undefined'){
            		diskst[logicnm][0].push(rkB_s);
            		diskst[logicnm][1].push(wkB_s);
            		continue;
            	}else{ ////第一维数据不存在
            		diskst[logicnm] = new Array();
            		max++;
            		diskst[logicnm][0] = new Array();
            		diskst[logicnm][1] = new Array();
            		
            		diskst[logicnm][0].push(rkB_s);
            		diskst[logicnm][1].push(wkB_s);            		
            	}
           	}
            
            var ix = 0;
            console.log(max);
            
            for(var disk in diskst){
            	var line = "y" + (ix ? ix : "");            	           	
            	rd_show[line] = diskst[disk][0];
            	wr_show[line] = diskst[disk][1];
            	var color = Math.floor((ix/max) * 255);
            	style[line] = {
            		line: {
            			stroke: "rgb(" + [color, 255 - color, Math.floor(Math.random() * 255)].join(", ") + ")"
            		}
            	}
            	ix++; 
            }
            console.log(rd_show);
            console.log(wr_show);
            
            var rd_graph = $("#rd_disk").aristochart({
                style: style,                   
                data: rd_show
             });
            
            var wr_graph = $("#wr_disk").aristochart({
                style:style,                   
                data: wr_show
             });
            
        }).
        error(function (data, status, headers) {
            $scope.status = status;
        });
}
var ProbesApp = angular.module('PerfApp', [])
    .filter('duration', funcDurationFilter);

ProbesApp.controller("PerfCtrl", function ($scope, $http) {
	getOsdPerf();
	
    function getOsdPerf() {
        $scope.date = new Date();

        $http({method: "get", url: inkscopeCtrlURL + "ceph/osdperf"}).
            success(function (data,status,headers,config ) {
            	var apply = new Array();
            	var commit = new Array();
            	var datalen = data.length;
                for (var i = 0; i < data.length; i++) {
                	apply.push(data[i].perf_stats.apply_latency_ms);
                	commit.push(data[i].perf_stats.commit_latency_ms)
                   }
                console.log(apply)
                
                var graph = $("#probes").aristochart({
                	data: {
                		x: datalen,
                		y: apply,
                		y1: commit
                	}
                });

            }).
            error(function (data, status) {
                $scope.status = status;
                $scope.data = data || "Request failed";
            });
    }
});
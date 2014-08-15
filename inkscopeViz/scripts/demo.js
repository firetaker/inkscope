var StatusApp = angular.module('StatusApp', ['D3Directives','ngCookies','ngAnimate'])
    .filter('bytes', funcBytesFilter)
    .filter('duration', funcDurationFilter);

StatusApp.controller("statusCtrl", function ($scope, $http , $cookieStore) {
	/**   var apiURL = '/ceph-rest-api/';

  // instantiate our graph!
    var graph = new Rickshaw.Graph( {
        element: document.getElementById("iopschart"),
        width: 300,
        height: 30,
        renderer: 'line',
        series: new Rickshaw.Series.FixedDuration([{ name: 'read' },{ name: 'write' }], undefined, {
            timeInterval: 3000,
            maxDataPoints: 100,
            timeBase: new Date().getTime() / 1000
        })
    } );
    var hoverDetail = new Rickshaw.Graph.HoverDetail( {
        graph: graph,
        xFormatter: function(x) { return  ""; },
        yFormatter: function(y) { return  funcBytes(y)+ "/s" ;}
    } );
    var yAxis = new Rickshaw.Graph.Axis.Y({
        graph: graph,
        height: 30,
        orientation: 'left',
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        element: document.getElementById('y_axis')
    });
    yAxis.render();
    graph.render();
    
    //refreshData()
    setInterval(function () {
    	refreshOSDData()
    }, 10 * 1000);
    
    function refreshData() {
        console.log("refreshing data...");
        $scope.date = new Date();
        $http({method: "get", url: apiURL + "osd/perf.json",timeout:8000})
            .success(function (data) {
                $scope.read = (data.output.osd_perf_infos[0].perf_stats.commit_latency_ms ? data.output.osd_perf_infos[0].perf_stats.commit_latency_ms : 0);
                $scope.write = (data.output.osd_perf_infos[0].perf_stats.apply_latency_ms ? data.output.osd_perf_infos[0].perf_stats.apply_latency_ms : 0);

                var iopsdata = { read: $scope.read , write : $scope.write };
                graph.series.addData(iopsdata);
                yAxis.render();
                graph.render();

            })
            .error(function (data) {
                console.log("error")
            });
    }
    

    graph.render();
    **/
    refreshOSDData();
    
    function refreshOSDData() {
        $scope.date = new Date();
        var data ={"osdid" : 0};
        
  
        $http({method: "post", url: inkscopeCtrlURL + "ceph/osdperf",data:data,timeout:10000})
            .success(function (data, status) {
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
                
        });
    };
});
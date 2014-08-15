var ProbesApp = angular.module('HistOpsApp', [])
    .filter('duration', funcDurationFilter);

ProbesApp.controller("HistOpsCtrl", function ($scope, $http) {
	getHistOps();
	
    function getHistOps() {
        $scope.date = new Date();

        $http({method: "get", url: inkscopeCtrlURL + "ceph/histops"}).
            success(function (data,status) {
            	 console.log(data)
            }).
            error(function (data, status) {
                $scope.status = status;
                $scope.data = data || "Request failed";
            });
    }
});
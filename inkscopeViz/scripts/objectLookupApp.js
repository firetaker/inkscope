/**
 * Created by Alain Dechorgnat on 1/18/14.
 */
// angular stuff
// create module for custom directives
var ObjectLookupApp = angular.module('ObjectLookupApp', ['D3Directives'])
    .filter('bytes', funcBytesFilter)
    .filter('duration',funcDurationFilter);

ObjectLookupApp.controller("ObjectLookupCtrl", function ($rootScope, $scope, $http) {
    $scope.pool = "";

    getOsdInfo();
    setInterval(function () {getOsdInfo()},10*1000);

    getObjectInfo();
    setInterval(function () {getObjectInfo()},5*1000);

    function getOsdInfo(){
        $http({method: "get", url: inkscopeCtrlURL + "ceph/osd?depth=2"}).

            success(function (data, status) {
                $rootScope.data = data;
                for ( var i=0; i<data.length;i++){
                    data[i].id = data[i].node._id;
                    data[i].lastControl = ((+$rootScope.date)-data[0].stat.timestamp)/1000;
                }
                $scope.$apply();
            }).
            error(function (data, status) {
                $rootScope.status = status;
                $rootScope.data = data || "Request failed";
            });
    }


    function getObjectInfo() {
        $rootScope.date = new Date();
        if ($scope.pool+"" =="undefined" || $scope.objectId+"" =="undefined") return;

        console.log(cephRestApiURL + "osd/map?pool="+ $scope.pool +"&object="+ $scope.objectId );
        $http({method: "get", url: cephRestApiURL + "osd/map.json?pool="+$scope.pool+"&object="+$scope.objectId}).

            success(function (data, status) {
                $scope.data = data.output;
                $scope.acting = JSON.parse($scope.data.acting);
            }).
            error(function (data, status) {
                $rootScope.status = status;
                $scope.data = {"pgid":"not found","acting":"","up":""};
            });

    }

    $rootScope.osdClass = function (osdin,osdup){
        var osdclass = (osdin == true) ? "osd_in " : "osd_out ";
        osdclass += (osdup == true) ? "osd_up" : "osd_down";
        return osdclass;

    }

    $rootScope.osdClassForId = function (osdid){
        var osdin = $rootScope.getOsd(osdid).stat.in;
        var osdup = $rootScope.getOsd(osdid).stat.up;
        return $rootScope.osdClass(osdin,osdup);
    }

    $rootScope.osdState = function (osdin,osdup){
        var osdstate = (osdin == true) ? "in / " : "out / ";
        osdstate += (osdup == true) ? "up" : "down";
        return osdstate;

    }

    $rootScope.prettyPrint = function( object){
        return object.toString();
    }

    $rootScope.prettyPrintKey = function( key){
        return key.replace(new RegExp( "_", "g" )," ")
    }


    $rootScope.osdSelect = function (osd) {
        $rootScope.osd = osd;
        $rootScope.selectedOsd = osd.node._id;
    }

    $rootScope.getOsd = function (osd) {
        //console.log("osd:"+osd);
        for (var i=0 ;i<$rootScope.data.length;i++){
            if ($rootScope.data[i].node._id+"" == osd+"") {
                //console.log("osd found "+$rootScope.data[i]);
                return $rootScope.data[i];
            }
        }
        //console.log("osd not found");
    }


});
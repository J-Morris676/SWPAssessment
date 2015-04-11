/**
 * Created by Jamie on 31/03/2015.
 */
'use strict';

angular.module('myApp.studentResults', ['ngResource'])

    .controller("studentResultsCtrl", function($scope, $window, $location, $http, $routeParams) {
        $scope.justFinished = $routeParams.justFinished;

        $scope.popoverTemplates = {
            downloadReport:  "parts/student/popoverTpls/assessmentResults/downloadReport.html"
        };

        //Async retrieval of username:
        if ($scope.username == null) {
            var deregister = $scope.$watch("username", function() {
                if ($scope.username != null) {
                    $http.get("/resources/students/" + $scope.username + "/results/" + $routeParams.assessmentScheduleId).success(function(data, status) {
                        if (status == 400) $location.path("/student/home");
                        $scope.results = data;
                        deregister();
                    });
                }
            })
        }
        else {
            $http.get("/resources/students/" + $scope.username + "/results/" + $routeParams.assessmentScheduleId).success(function(data, status) {
                if (status == 400) $location.path("/student/home");
                $scope.results = data;
            });
        }

        $scope.downloadReport = function() {
            $window.open('/resources/schedules/' + $routeParams.assessmentScheduleId + '/students/' + $scope.username + '/report', '_blank');
        }

    });
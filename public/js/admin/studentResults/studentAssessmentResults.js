/**
 * Created by Jamie on 01/04/2015.
 */
'use strict';

angular.module('myApp.studentAssessmentResults', ['ngResource'])

    .controller("studentAssessmentResultsCtrl", function($scope, $http, $window, $routeParams) {
        $scope.studentUsername = $routeParams.studentUsername;

        $scope.popoverTemplates = {
            downloadReport:  "parts/admin/popoverTpls/assessmentResults/downloadReport.html"
        };

        $http.get("/resources/students/" + $routeParams.studentUsername + "/results/" + $routeParams.assessmentScheduleId).success(function(data, status) {
            $scope.results = data;
        });

        $scope.downloadReport = function() {
            $window.open('/resources/schedules/' + $routeParams.assessmentScheduleId + '/students/' + $routeParams.studentUsername + '/report', '_blank');
        }
    });
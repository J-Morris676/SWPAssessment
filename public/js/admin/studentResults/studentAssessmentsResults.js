/**
 * Created by Jamie on 01/04/2015.
 */
'use strict';

angular.module('myApp.studentAssessmentsResults', ['ngResource'])

    .controller("studentAssessmentsResultsCtrl", function($scope, $http, $routeParams, $location) {
        $http.get("/resources/students/" + $routeParams.studentUsername).success(function(data, status) {
            $scope.student = data;
        });

        $scope.goToStudentAssessmentResults = function(scheduleId) {
            $location.path("/admin/students/" + $routeParams.studentUsername + "/results/" + scheduleId);
        }
    });
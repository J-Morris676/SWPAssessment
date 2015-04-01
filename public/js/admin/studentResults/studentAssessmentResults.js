/**
 * Created by Jamie on 01/04/2015.
 */
'use strict';

angular.module('myApp.studentAssessmentResults', ['ngResource'])

    .controller("studentAssessmentResultsCtrl", function($scope, $http, $routeParams) {
        $scope.studentUsername = $routeParams.studentUsername;
        $http.get("/resources/students/" + $routeParams.studentUsername + "/results/" + $routeParams.assessmentScheduleId).success(function(data, status) {
            $scope.results = data;
        });
    });
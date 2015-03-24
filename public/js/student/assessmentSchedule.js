/**
 * Created by Jamie on 24/03/2015.
 */
'use strict';

angular.module('myApp.studentAssessmentSchedule', ['ngResource'])

    .controller("studentAssessmentScheduleCtrl", function($scope, $location, $http, $routeParams) {
        //Get
        $http.get("/resources/schedules/" + $routeParams.assessmentScheduleId).success(function(data, status) {
            $scope.assessmentSchedule = data;
            if (new Date($scope.assessmentSchedule.startDate) < new Date()) {
                $location.path("/student/home");
            }
            else if (((new Date($scope.assessmentSchedule.startDate).getTime() - new Date().getTime())/60000) > 30) {
                $location.path("/student/home");
            }
        }).error(function(data, status) {
           $location.path("/student/home");
        });

        $scope.goToSitAssessment = function() {
            $location.path("/student/assessmentSchedules/" + $routeParams.assessmentScheduleId + "/sitAssessment");
            $scope.countdownFinished = true;
        }
    });
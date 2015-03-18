/**
 * Created by Jamie Morris on 07/03/15.
 */
'use strict';

angular.module('myApp.home', ['ngResource'])

    .controller("homeCtrl", function($scope, $http, $location) {
        $scope.currentDate = new Date();

        $http.get("/resources/schedules").success(function(data, status) {
            $scope.assessmentSchedules = data;
            $scope.filterDates();
        }).error(function(data, err) {
                console.log("Failed to get schedules");
        });

        $http.get("/resources/assessments").success(function(data, status) {
            $scope.assessments = data;
        }).error(function(data, err) {
            console.log("Failed to get schedules");
        });

        $http.get("/resources/students").success(function(data, status) {
            $scope.students = data;
        }).error(function(data, err) {
            console.log("Failed to get students");
        });

        $scope.filterDates = function() {
            //Filter out the scheduled assessments:
            $scope.recentlyFinishedScheduledAssessments = $scope.assessmentSchedules.filter(function(scheduledAssessment) {
                if (new Date(scheduledAssessment.endDate) < new Date() && new Date(scheduledAssessment.startDate) > (new Date().getTime() - (7 * 24 * 60 * 60 * 1000))) {
                    return true;
                }
            });
            $scope.currentlyOngoingAssessments = $scope.assessmentSchedules.filter(function(scheduledAssessment) {
                if (new Date(scheduledAssessment.startDate) < new Date() && new Date() < new Date(scheduledAssessment.endDate)) {
                    return true;
                }
            });
            $scope.assessmentsInTheNextWeek = $scope.assessmentSchedules.filter(function(scheduledAssessment) {
                if (new Date(scheduledAssessment.startDate) > new Date() && new Date(scheduledAssessment.startDate) < (new Date().getTime() + (7 * 24 * 60 * 60 * 1000))) {
                    return true;
                }
            })
        };

        $scope.goToAssessment = function(id) {
            $location.path("/assessments/" + id);
        };
        $scope.goToAssessments = function() {
            $location.path("/assessments");
        };
        $scope.goToStudents = function() {
            $location.path("/students");
        }
    });
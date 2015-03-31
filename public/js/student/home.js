/**
 * Created by Jamie on 23/03/2015.
 */
'use strict';

angular.module('myApp.studentHome', ['ngResource'])

    .service("scheduledAssessmentService", function($http) {
        return function(username, when, callback) {
            $http.get("/resources/schedules/students/" + username + "?when=" + when).success(callback);
        };
    })

    .controller("studentHomeCtrl", function($scope, $http, scheduledAssessmentService,  $location) {
        $scope.trainers = [];
        var getUser = function(username) {
            $http.get("/resources/students/" + username).success(function(data, status) {
                $scope.student = data;
                insertTrainerUnique(data.assessmentResults);
                console.log($scope.student);
            });
        };
        $scope.getAssessmentSchedules = function() {
            scheduledAssessmentService($scope.user.username, "future", function(data) {
                $scope.futureAssessments = data;
                insertTrainerUnique(data);
            });
            scheduledAssessmentService($scope.user.username, "ongoing", function(data) {
                $scope.ongoingAssessments = data;
                //Change 'students' field in objects to just the 'student' that's viewing:
                for (var ongoingAssessment = 0; ongoingAssessment < $scope.ongoingAssessments.length; ongoingAssessment++) {
                    for (var student = 0; $scope.ongoingAssessments[ongoingAssessment].students; student++) {
                        if ($scope.ongoingAssessments[ongoingAssessment].students[student].username == $scope.username) {
                            $scope.ongoingAssessments[ongoingAssessment].student = $scope.ongoingAssessments[ongoingAssessment].students[student];
                            delete $scope.ongoingAssessments[ongoingAssessment].students;
                        }
                    }
                }
                insertTrainerUnique(data);
            });
        };

        var insertTrainerUnique = function(assessmentSchedules) {
            for (var assessmentSchedule in assessmentSchedules) {
                if ($scope.trainers.indexOf(assessmentSchedules[assessmentSchedule].admin) == -1) {
                    $scope.trainers.push(assessmentSchedules[assessmentSchedule].admin);
                }
            }
        };

        $scope.findDurationInMinutes = function(startDate, endDate) {
            if (startDate == "now") startDate = new Date();
            if (endDate == "now") endDate = new Date();
            return Math.round((new Date(endDate) - new Date(startDate)) / 60000);
        };

        //User is async:
        if ($scope.user!=null) {
            $scope.getAssessmentSchedules();
            getUser($scope.user.username);
        }
        else {
            var deregister = $scope.$watch("user", function() {
                if ($scope.user!=null) {
                    $scope.getAssessmentSchedules();
                    getUser($scope.user.username);
                    deregister();
                }
            })
        }

        $scope.goToStudentScheduledAssessmentPage = function(scheduledAssessmentId) {
            $location.path("/student/assessmentSchedules/" + scheduledAssessmentId);
        };
        $scope.goToSitAssessment = function(scheduledAssessmentId) {
            $location.path("/student/assessmentSchedules/" + scheduledAssessmentId + "/sitAssessment");
        };

        $scope.sendToResults = function(scheduleId) {
            console.log("/student/assessmentSchedules/results/" + scheduleId)
            $location.path("/student/assessmentSchedules/results/" + scheduleId);
        }
    });
'use strict';

angular.module('myApp.studentSitAssessment', ['ngResource'])

    .controller("studentSitAssessmentCtrl", function($scope, $location, $http, $routeParams) {
        //Index of questions array:
        $scope.currentIndex = 0;
        $scope.userAnswers = [];

        $http.get("/resources/schedules/" + $routeParams.assessmentScheduleId).success(function(data, status) {
            $scope.assessmentSchedule = data;
            $scope.questions = data.version.object.QAs;

            //Populate userAnswers of the questions
            for (var question in $scope.questions) {
                if ($scope.questions[question].type == "call") $scope.questions[question].callView = "background";

                $scope.userAnswers.push({
                    "question": $scope.questions[question].question,
                    "answer": null,
                    "type": $scope.questions[question].type
                });
            }

            //This will pre-populate userAnswers with any answers a user has chosen in a previous session (For continuing):
            $scope.userAnswers = data.student.assessmentAnswers;

        });

        //Starts assessment:
        $http.post("/resources/schedules/" + $routeParams.assessmentScheduleId + "/start/" + $scope.username).error(function(data, status) {
            if (status == 401) {
                $location.path("/student/home");
            }
        });

        $scope.updateStudentAnswers = function() {
            $http.post("/resources/schedules/" + $routeParams.assessmentScheduleId + "/updateProgress/" + $scope.username, $scope.userAnswers)
                .success(function(data, status) {
                    console.log(data);
                })
        };

        $scope.submitAssessmentAnswers = function() {
            var confirmed = confirm("Are you sure you would like to submit your answers?");
            if (confirmed) {
                $http.post("/resources/schedules/" + $routeParams.assessmentScheduleId + "/end/" + $scope.username, $scope.userAnswers).success(function(data, status) {
                    console.log(status);
                    $location.path("/student/assessmentSchedules/results/" + $routeParams.assessmentScheduleId).search({justFinished: 1});
                }).error(function(data, status) {
                    if (status == 401) {
                        $location.path("/student/home");
                    }
                });
            }
        }
    });
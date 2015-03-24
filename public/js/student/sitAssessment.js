'use strict';

angular.module('myApp.studentSitAssessment', ['ngResource'])

    .controller("studentSitAssessmentCtrl", function($scope, $location, $http, $routeParams) {
        //Index of questions array:
        $scope.currentIndex = 0;
        $scope.userAnswers = [];

        $http.get("/resources/schedules/" + $routeParams.assessmentScheduleId).success(function(data, status) {
            $scope.questions = data.version.object.QAs;

            //Populate userAnswers of the questions
            for (var question in $scope.questions) {
                $scope.userAnswers.push({
                    "question": $scope.questions[question].question,
                    "answer": null,
                    "type": $scope.questions[question].type
                });
            }
        })
    });
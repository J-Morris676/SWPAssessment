/**
 * Created by Jamie on 01/04/2015.
 */
'use strict';

angular.module('myApp.scheduledAssessmentResults', ['ngResource'])

    .controller("scheduledAssessmentResultsCtrl", function($scope, $http, $routeParams, $location) {
        $http.get("/resources/schedules/" + $routeParams.assessmentScheduleId).success(function (data, status) {
            console.log(data);
            $scope.students = data.students;

            var noFinished = 0;
            var noStarted = 0;
            for (var studentIndex = 0; studentIndex < data.students.length; studentIndex++) {
                if (data.students[studentIndex].dates != null && data.students[studentIndex].dates.endDate != null) {
                    noFinished++;
                }
                if (data.students[studentIndex].dates != null && data.students[studentIndex].dates.startDate != null) {
                    noStarted++;
                }
            }
            $scope.startPercentage = noStarted/data.students.length;
            $scope.finishPercentage = noFinished/data.students.length;
        });

        $scope.goToStudentResults = function(username) {
            $location.path("/admin/students/" + username + "/results/" + $routeParams.assessmentScheduleId);
        };

    });
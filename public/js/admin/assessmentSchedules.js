/**
 * Created by Jamie on 19/03/2015.
 */
'use strict';

angular.module('myApp.assessmentSchedules', ['ngResource'])

    .controller("assessmentSchedulesCtrl", function($scope, $http, $timeout, $location) {
        $scope.newAssessmentSchedule = {
            "admin": $scope.username,
            "students": [],
            "startDate": new Date(new Date().getTime()+31*60000)
        };
        //Async, watch out for username change:
        $scope.$watch("username", function() {
            $scope.newAssessmentSchedule.admin = $scope.username;
        });

        $scope.schedules = null;
        $scope.minDate = new Date();

        var setMessageTimer = function(messages, isError) {
            if (!isError) {
                $scope.successSubmitMessage = messages;
                $timeout(function() {
                    $scope.successSubmitMessage = null;
                }, 3000*messages.length);
            }
            else {
                $scope.errorSubmitMessage = messages;
                $timeout(function() {
                    $scope.errorSubmitMessage = null;
                }, 3000*messages.length);
            }
        };

        $scope.getSchedules = function(selection) {
            $scope.selectedButton = selection;
            $scope.schedules = null;

            var url = "";
            if (selection == "All")
                url = "/resources/schedules";
            else {
                url = "/resources/schedules?when=" + selection;
            }

            $http.get(url).success(function(data, status) {
                console.log(data);
                $scope.schedules = data;
            });
        };

        $scope.insertAssessment = function() {
            //If time is not at least 30 minutes ahead:
            if ($scope.newAssessmentSchedule.startDate < new Date(new Date().getTime()+30*60000)) {
                setMessageTimer(["Start date must be at least 30 minutes ahead of now."], true);
            }
            else {
                $http.post("/resources/schedules", $scope.newAssessmentSchedule).success(function(data, status) {
                    $scope.getSchedules($scope.selectedButton);
                    console.log(data);
                    setMessageTimer(["Successfully scheduled assessment."]);

                    //Reset new assessment schedule:
                    $scope.newAssessmentSchedule["admin"] = $scope.username;
                    $scope.newAssessmentSchedule["students"] = [];
                    $scope.newAssessmentSchedule["startDate"] = new Date();
                    $scope.duration = 60;
                    $scope.updateEndDate($scope.duration);
                })
            }
        };

        $scope.updateEndDate = function(duration) {
            $scope.newAssessmentSchedule.endDate = new Date($scope.newAssessmentSchedule.startDate.getTime()+duration*60000);
        };

        $scope.selectedAssessment = function(id) {
            for (var assessment in $scope.assessments) {
                if ($scope.assessments[assessment]._id == id) {
                    return $scope.assessments[assessment];
                }
            }
        };

        $scope.deleteAssessmentSchedule = function(id) {
            var confirmed = confirm("Are you sure you want to delete this scheduled assessment?");
            if (confirmed) {
                $http.delete("/resources/schedules/" + id).success(function(data, status) {
                    $scope.getSchedules($scope.selectedButton);
                })
            }
        };

        //Get Assessments:
        $http.get("/resources/assessments").success(function(data, status) {
            $scope.assessments = data;
            //Pre add assessment & version:
            if ($scope.assessments.length > 0) {
                $scope.newAssessmentSchedule.assessment = $scope.assessments[0]._id;
                if ($scope.assessments[0].versions.length > 0) {
                    $scope.newAssessmentSchedule.version = $scope.assessments[0].versions[0]._id;
                }
            }
        });

        $scope.getStudents = function(val) {
            return $http.get('/resources/students?like=' + val).then(function (response) {
                return response.data;
            }).then(function (response) {
                var students = response.map(function (item) {
                    return {username: item.username};
                });
                students = students.filter(function (item) {
                    for (var student = 0; student < $scope.newAssessmentSchedule.students.length; student++) {
                        if ($scope.newAssessmentSchedule.students[student].username == item.username) {
                            return false;
                        }
                    }
                    return true;
                });
                return students;
            });
        };

        $scope.removeStudent = function(index) {
            $scope.newAssessmentSchedule.students.splice(index, 1);
        };

        $scope.addStudent= function() {
            $scope.changes = true;

            if ($scope.newAssessmentSchedule.students == null) $scope.newAssessmentSchedule.students = [$scope.student];
            else $scope.newAssessmentSchedule.students.unshift($scope.student);

            var newStudent = $scope.student;

            $scope.student = null;
        };

        $scope.goToAssessmentSchedule = function(scheduleId) {
            $location.path("/assessmentSchedules/" + scheduleId);
        }

    });
/**
 * Created by Jamie on 21/03/2015.
 */
'use strict';

angular.module('myApp.assessmentSchedule', ['ngResource'])

    .controller("assessmentScheduleCtrl", function($scope, $http, $routeParams, $timeout) {

        $scope.popoverTemplates = {
            trainerInputBox: "parts/admin/popoverTpls/assessmentScheduling/trainerInputBox.html",
            assessmentInputBox: "parts/admin/popoverTpls/assessmentScheduling/assessmentInputBox.html",
            validVersionInput: "parts/admin/popoverTpls/assessmentScheduling/validVersionInput.html",
            invalidVersionInput: "parts/admin/popoverTpls/assessmentScheduling/invalidVersionInput.html",
            studentInput: "parts/admin/popoverTpls/assessmentScheduling/studentInput.html",
            studentsTable: "parts/admin/popoverTpls/assessmentScheduling/studentsTable.html",
            startTimeInput: "parts/admin/popoverTpls/assessmentScheduling/startTimeInput.html",
            startDateInput: "parts/admin/popoverTpls/assessmentScheduling/startDateInput.html",
            durationInput: "parts/admin/popoverTpls/assessmentScheduling/durationInput.html"
        };


        $scope.getSchedule = function() {
            $http.get("/resources/schedules/" + $routeParams.assessmentScheduleId).success(function(data, status) {
                $scope.assessmentSchedule = data;
                $scope.assessmentSchedule.assessment = $scope.assessmentSchedule.assessment._id;
                $scope.assessmentSchedule.version = $scope.assessmentSchedule.version.object._id;

                //Figure out difference in minutes between start & end date and update duration:
                $scope.duration = Math.round((new Date($scope.assessmentSchedule.endDate) - new Date($scope.assessmentSchedule.startDate)) / 60000);

                console.log($scope.assessmentSchedule);

                //Then get Assessments:
                $http.get("/resources/assessments").success(function(data, status) {
                    $scope.assessments = data;
                });
            });
        };
        $scope.getSchedule();

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

        $scope.selectedAssessment = function(id) {
            for (var assessment in $scope.assessments) {
                if ($scope.assessments[assessment]._id == id) {
                    return $scope.assessments[assessment];
                }
            }
        };

        $scope.getStudents = function(val) {
            return $http.get('/resources/students?like=' + val).then(function (response) {
                return response.data;
            }).then(function (response) {
                var students = response.map(function (item) {
                    return {username: item.username};
                });
                students = students.filter(function (item) {
                    for (var student = 0; student < $scope.assessmentSchedule.students.length; student++) {
                        if ($scope.assessmentSchedule.students[student].username == item.username) {
                            return false;
                        }
                    }
                    return true;
                });
                return students;
            });
        };

        $scope.updateEndDate = function(duration) {
            if ($scope.assessmentSchedule != null) {
                $scope.assessmentSchedule.endDate = new Date(new Date($scope.assessmentSchedule.startDate).getTime()+duration*60000);
            }
        };

        $scope.getAdmins = function(val) {
            return $http.get('/resources/admins?like=' + val).then(function (response) {
                return response.data;
            }).then(function (response) {
                var admins = response.map(function (item) {
                    return item.username;
                });
                return admins;
            });
        };

        $scope.changeSelectedAssessment = function(id) {
            for (var assessment in $scope.assessments) {
                if ($scope.assessments[assessment]._id == id) {
                    //Clone assessment object into assessment schedule object:
                    $.extend($scope.assessmentSchedule.assessment, $scope.assessments[assessment]);
                    $scope.assessmentSchedule.version.object = $scope.assessments[assessment].versions.length == 0 ? null : $scope.assessments[assessment].versions[0];
                }
            }
        };

        $scope.removeStudent = function(index) {
            $scope.assessmentSchedule.students.splice(index, 1);
        };

        $scope.addStudent= function() {
            $scope.changes = true;

            if ($scope.assessmentSchedule.students == null) $scope.assessmentSchedule.students = [$scope.student];
            else $scope.assessmentSchedule.students.unshift($scope.student);

            $scope.student = null;
        };

        $scope.updateAssessment = function() {

            //If time is not at least 30 minutes ahead:
            if ($scope.assessmentSchedule.startDate < new Date(new Date().getTime()+30*60000)) {
                setMessageTimer(["Start date must be at least 30 minutes ahead of now."], true);
            }
            else if ($scope.selectedAssessment($scope.assessmentSchedule.assessment).versions.length == 0) {
                setMessageTimer(["An assessment with a version must be selected!"], true)
            }
            else {
                $http.get("/resources/admins/" +  $scope.assessmentSchedule.admin).success(function(data, status) {

                    $http.put("/resources/schedules/" + $scope.assessmentSchedule._id, $scope.assessmentSchedule).success(function (data, status) {
                        $scope.getSchedule();
                        setMessageTimer(["Successfully updated assessment schedule."]);
                    });
                }).error(function(data, status) {
                    if (status == 404) {
                        setMessageTimer(["Selected trainer is invalid (" + $scope.assessmentSchedule.admin + "), please " +
                        "begin typing the trainer and select them from menu."], true)
                    }
                });
            }
        };
    });
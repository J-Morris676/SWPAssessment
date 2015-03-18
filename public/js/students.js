/**
 * Created by Jamie on 18/03/2015.
 */
'use strict';

angular.module('myApp.students', ['ngResource'])

    .controller("studentsCtrl", function($scope, $http, $location, $timeout) {
        $scope.newStudent = {
            "username": "",
            "password": "",
            "firstName": "",
            "lastName": ""
        };

        var getStudents = function() {
            $http.get("/resources/students").success(function(data, status) {
                $scope.students = data;
            }).error(function(data, err) {
                console.log("Failed to get students");
            });
        };
        getStudents();

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

        $scope.goToStudent = function(id) {
            $location.path("/students/" + id);
        };

        $scope.deleteStudent = function(username) {
            var confirmed = confirm("Are you sure you want to delete Student '" + username + "'?");
            if (confirmed) {
                $http.delete("/resources/students/" + username).success(function(data, status) {
                    getStudents();
                }).error(function(data, err) {
                    console.log("Failed to delete student");
                });
            }
        };

        $scope.addStudent = function() {
            if (jQuery.isEmptyObject($scope.newStudent)) {
                setMessageTimer(["All fields must be filled."], true);
                return;
            }
            for (var field in $scope.newStudent) {
                if ($scope.newStudent[field] == "" || $scope.newStudent[field] == null) {
                    setMessageTimer(["All fields must be filled."], true);
                    return;
                }
            }

            $http.post("/resources/students", $scope.newStudent).success(function(data, status) {
                setMessageTimer(["Successfully added '" + $scope.newStudent.username + "'"], false);
                getStudents();
                $scope.newStudent = {
                    "username": "",
                    "password": "",
                    "firstName": "",
                    "lastName": ""
                };
            }).error(function(data, err) {
                var errorArray = [];
                for (var error in data.error.errors) {
                    errorArray.push(data.error.errors[error].messages[0])
                }
                setMessageTimer(errorArray, true);
            });

        };
    });
/**
 * Created by Jamie on 18/03/2015.
 */
'use strict';

angular.module('myApp.student', ['ngResource'])

    .controller("studentCtrl", function($scope, $http, $routeParams, $timeout) {
        var getStudent = function() {
            $http.get("/resources/students/" + $routeParams.studentUsername).success(function(data, status) {
                $scope.student = data;
            });
        };
        getStudent();


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

        $scope.editStudent = function() {
            if ($scope.student.password == "") delete $scope.student.password;
            if (jQuery.isEmptyObject($scope.student)) {
                setMessageTimer(["All fields must be filled."], true);
                return;
            }
            for (var field in $scope.newStudent) {
                if ($scope.student[field] == "" || $scope.student[field] == null) {
                    setMessageTimer(["All fields must be filled."], true);
                    return;
                }
            }

            $http.put("/resources/students/" + $routeParams.studentUsername, $scope.student).success(function(data, status) {
                setMessageTimer(["Successfully updated '" + $scope.student.username + "'"], false);
                getStudent();
            }).error(function(data, err) {
                var errorArray = [];
                for (var error in data.error.errors) {
                    errorArray.push(data.error.errors[error].messages[0])
                }
                setMessageTimer(errorArray, true);
            });

        };
    });
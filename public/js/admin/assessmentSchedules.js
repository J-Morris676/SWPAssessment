/**
 * Created by Jamie on 19/03/2015.
 */
'use strict';

angular.module('myApp.assessmentSchedules', ['ngResource'])

    /*
        Time filter to display time as in a desired format:
            url: http://stackoverflow.com/questions/25470475/angular-js-format-minutes-in-template
     */
    .filter('time', function() {

        var conversions = {
            'ss': angular.identity,
            'mm': function(value) { return value * 60; },
            'hh': function(value) { return value * 3600; }
        };

        var padding = function(value, length) {
            var zeroes = length - ('' + (value)).length,
                pad = '';
            while(zeroes-- > 0) pad += '0';
            return pad + value;
        };

        return function(value, unit, format, isPadded) {
            var totalSeconds = conversions[unit || 'ss'](value),
                hh = Math.floor(totalSeconds / 3600),
                mm = Math.floor((totalSeconds % 3600) / 60),
                ss = totalSeconds % 60;

            format = format || 'hh:mm:ss';
            isPadded = angular.isDefined(isPadded)? isPadded: true;
            hh = isPadded? padding(hh, 2): hh;
            mm = isPadded? padding(mm, 2): mm;
            ss = isPadded? padding(ss, 2): ss;
            console.log(format);
            return format.replace(/hh/, hh).replace(/mm/, mm).replace(/ss/, ss);
        };
    })

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
            else if ($scope.selectedAssessment($scope.newAssessmentSchedule.assessment).versions.length == 0) {
                setMessageTimer(["An assessment with a version must be selected!"], true)
            }
            else {
                $http.get("/resources/admins/" +  $scope.newAssessmentSchedule.admin).success(function(data, status) {
                    $http.post("/resources/schedules", $scope.newAssessmentSchedule).success(function (data, status) {
                        $scope.getSchedules($scope.selectedButton);
                        setMessageTimer(["Successfully scheduled assessment."]);

                        //Reset new assessment schedule:
                        $scope.newAssessmentSchedule["admin"] = $scope.username;
                        $scope.newAssessmentSchedule["students"] = [];
                        $scope.newAssessmentSchedule["startDate"] = new Date(new Date().getTime() + 31 * 60000);
                        $scope.duration = 60;
                        $scope.updateEndDate($scope.duration);
                    })
                }).error(function(data, status) {
                    if (status == 404) {
                        setMessageTimer(["Selected trainer is invalid (" + $scope.newAssessmentSchedule.admin + "), please " +
                        "begin typing the trainer and select them from menu."], true)
                    }
                })


            }
        };

        $scope.updateEndDate = function(duration) {
            $scope.newAssessmentSchedule.endDate = new Date($scope.newAssessmentSchedule.startDate.getTime()+duration*60000);
        };

        $scope.findDurationInMinutes = function(startDate, endDate) {
            return Math.round((new Date(endDate) - new Date(startDate)) / 60000);
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

            $scope.student = null;
        };


        //Determines whether the given date is in the past:
        $scope.isPast = function(date) {
            if (new Date(date) < new Date()) {
                return true;
            }
            return false;
        };

        $scope.goToAssessmentSchedule = function(scheduleId) {
            $location.path("/admin/assessmentSchedules/" + scheduleId);
        };
        $scope.goToScheduledAssessmentResults = function(scheduleId) {
            $location.path("/admin/assessmentSchedules/" + scheduleId + "/results");
        }

    });
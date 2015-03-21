/**
 * Created by Jamie on 21/03/2015.
 */
'use strict';

angular.module('myApp.assessmentSchedule', ['ngResource'])

    .controller("assessmentScheduleCtrl", function($scope, $http, $routeParams, $timeout) {
        //TODO: Finish off assessment schedule editing and tighten up forms for adding stuff!
        $http.get("/resources/schedules/" + $routeParams.assessmentScheduleId).success(function(data, status) {
           $scope.assessmentSchedule = data;
        });
    });
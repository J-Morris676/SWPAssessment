/**
 * Created by Jamie Morris on 09/03/15.
 */
'use strict';

angular.module('myApp.assessments', ['ngResource'])

    .controller("assessmentsCtrl", function($scope, $http) {
        $http.get("/resources/assessments").success(function(data, status) {
            console.log(data);
        })
    });
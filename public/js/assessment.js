/**
 * Created by Jamie Morris on 09/03/15.
 */
'use strict';

angular.module('myApp.assessment', ['ngResource'])

    .controller("assessmentCtrl", function($scope, $http, $routeParams) {
        console.log($routeParams);
        $http.get("/resources/assessments/" + $routeParams.assessmentId).success(function(data, status) {
            $scope.assessment = data;
            console.log(data);
        });


        //TODO: .. Updates on keypress - too heavy!
        $scope.updateAssessment = function() {
            $http.put("/resources/assessments/" + $routeParams.assessmentId, $scope.assessment).success(function(data, status) {
                console.log(data);
            })
        }
    });
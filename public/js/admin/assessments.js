/**
 * Created by Jamie Morris on 09/03/15.
 */
'use strict';

angular.module('myApp.assessments', ['ngResource'])

    .controller("assessmentsCtrl", function($scope, $http, $location) {
        $scope.newAssessment = {
            "title": ""
        };

        $scope.isValidTitle = function() {
            if ($scope.newAssessment.title == "") return false;
            else if ($scope.newAssessment.title.length > 30) return false;

            for (var assessment in $scope.assessments)
                if ($scope.assessments[assessment].title.toLowerCase() == $scope.newAssessment.title.toLowerCase())
                    return false;


            return true;
        };

        var getAssessments = function() {
            $http.get("/resources/assessments").success(function(data, status) {
                $scope.assessments = data;
                console.log(data);
            })
        };
        getAssessments();


        $scope.submitAssessment = function() {
            $http.post("/resources/assessments", $scope.newAssessment).success(function(data, status) {
                console.log(data);
                $scope.newAssessment.title = "";
                getAssessments();
            })
        };

        $scope.deleteAssessment = function(index) {
            var confirmed = confirm("Are you sure you want to delete assessment '" + $scope.assessments[index].title + "'?");
            if (confirmed) {
                $http.delete("/resources/assessments/" + $scope.assessments[index]._id).success(function(data, status) {
                    getAssessments();
                })
            }
        };

        $scope.goToAssessment = function(id) {
            $location.path("/admin/assessments/" + id);
        }
    });
/**
 * Created by Jamie Morris on 09/03/15.
 */
'use strict';

angular.module('myApp.assessment', ['ngResource'])

    .controller("assessmentCtrl", function($scope, $http, $routeParams) {
        console.log($routeParams);
        $scope.popoverTemplates = {
            assessmentTitleInput: "parts/admin/popoverTpls/assessments/assessmentTitleInput.html",
            addVersion: "parts/admin/popoverTpls/assessments/addVersion.html",
            deleteVersion: "parts/admin/popoverTpls/assessments/deleteVersion.html",
            showQuestions: "parts/admin/popoverTpls/assessments/showQuestions.html",
            showQuestion: "parts/admin/popoverTpls/assessments/showQuestion.html",
            addQuestion: "parts/admin/popoverTpls/assessments/addQuestion.html",
            deleteQuestion: "parts/admin/popoverTpls/assessments/deleteQuestion.html"
        };

        $scope.collapsedVersions = [];
        $scope.collapsedQuestions= [];

        $scope.getAssessments = function() {
            $http.get("/resources/assessments/" + $routeParams.assessmentId).success(function(data, status) {
                $scope.assessment = data;
                $scope.tempTitle=$scope.assessment.title;
            });
        };
        $scope.getAssessments();

        $scope.deleteVersion = function(versionId, versionNo) {
            var confirmed = confirm("Are you sure you want to permanently delete version " + versionNo + " of this assessment?");
            if (confirmed) {
                $http.delete("/resources/assessments/" + $routeParams.assessmentId + "/versions/" + versionId)
                    .success(function(data, status) {
                        $scope.getAssessments();
                    })
            }
        };

        $scope.deleteQuestion = function(version, question) {
            var confirmed = confirm("Are you sure you want to permanently delete question " + question.no + " in version " +
            version.no + " of this assessment?");
            if (confirmed) {
                $http.delete("/resources/assessments/" + $routeParams.assessmentId + "/versions/" + version.id + "/questions/" +
                question.id)
                    .success(function(data, status) {
                        $scope.getAssessments();
                    })
            }
        };

        $scope.addVersion = function() {
            var newVersion = {QAs: [{
                "type": "multi",
                "question": "",
                "answer": null,
                "answers": []
            }]
        };
            $http.post("/resources/assessments/" + $routeParams.assessmentId + "/versions", newVersion)
                .success(function(data, status) {
                    $scope.getAssessments();
                });
        };

        $scope.addQuestion = function(versionId) {
            var newQuestion = {
                "type": "multi",
                "question": "",
                "answer": null,
                "answers": []
            };
            $http.post("/resources/assessments/" + $routeParams.assessmentId + "/versions/" + versionId + "/questions", newQuestion)
                .success(function(data, status) {
                    $scope.getAssessments();
                });
        };

        $scope.updateQuestion = function(versionId, questionNo, question, callback) {
            $http.put("/resources/assessments/" + $scope.assessment._id + "/versions/" + versionId + "/questions/" + questionNo, question)
                 .success(function(data, status) {
                     callback(data, status);
                 })
                 .error(function(data, status) {
                     callback(data, status);
                 })
        };

        $scope.isMobile = function() {
            if(window.innerWidth <= 800 && window.innerHeight <= 600) {
                return true;
            } else {
                return false;
            }
        };

        $scope.updateAssessment = function() {
            var id = $scope.assessment._id;
            delete $scope.assessment._id;
            $scope.assessment.title = $scope.tempTitle;
            $http.put("/resources/assessments/" + $routeParams.assessmentId, $scope.assessment).success(function(data, status) {
                console.log(data);
                $scope.assessment._id = id;
            })
        }
    });
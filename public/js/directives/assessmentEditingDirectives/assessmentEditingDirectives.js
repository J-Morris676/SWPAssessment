/**
 * Created by Jamie Morris on 11/03/2015.
 *  - Directives for the editing of questions
 */
angular.module("myApp.assessmentEditingDirectives", [])

    /*
        Top-level question directive that is the entry point for this element:
     */
    .directive("question", function($http, $interval, $compile) {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/assessmentEditingDirectives/templates/question.html',
            scope: {
                ngModel: "=ngModel",
                version: "=version",
                updateCallback: "=updateCallback",
                questionNumber: "=questionNumber"
            },
            link: function (scope, element, attrs) {
                console.log(scope);

                scope.popoverTemplates = {
                    typeInput: "parts/admin/popoverTpls/assessments/typeInput.html"
                };

                scope.updateQuestionCallback = function(question, updateCallback) {
                    scope.updateCallback(scope.version, scope.questionNumber, question, updateCallback);
                };

                scope.changeType = function() {
                    createAndCompileDirective(scope.ngModel.type);
                };

                //Handle asynchronous two-way binding:
                if (scope.ngModel == null) {
                    var unregister = scope.$watch("ngModel", function() {
                        if (scope.ngModel != null ) {
                            createAndCompileDirective(scope.ngModel.type);
                            unregister();
                        }
                    })
                }
                else {
                    createAndCompileDirective(scope.ngModel.type);
                }

                function createAndCompileDirective(directiveType) {
                    element.find("multi").remove();element.find("call").remove();element.find("free").remove();
                    var questionElement;
                    if (directiveType == "multi") {
                        questionElement = angular.element("<multi question-update='updateQuestionCallback' ng-model='ngModel'></multi>");
                    }
                    else if (directiveType == "free") {
                        questionElement = angular.element("<free question-update='updateQuestionCallback' ng-model='ngModel'></free>");
                    }
                    else if (directiveType == "call") {
                        questionElement = angular.element("<call question-update='updateQuestionCallback' ng-model='ngModel'></call>");
                    }
                    $compile(questionElement)(scope);
                    element.append(questionElement);
                }
            }
        }
    })

    /*
        multi question
     */
    .directive("multi", function($http, $interval, $timeout) {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/assessmentEditingDirectives/templates/multi-choice.html',
            scope: {
                ngModel: "=ngModel",
                questionUpdate: "=questionUpdate"
            },
            link: function (scope, element, attrs) {

                scope.popoverTemplates = {
                    questionInput: "parts/admin/popoverTpls/assessments/questionInput.html",
                    addAnswerInput: "parts/admin/popoverTpls/assessments/addAnswerInput.html",
                    answersTable: "parts/admin/popoverTpls/assessments/answersTable.html"
                };

                scope.changes = false;

                scope.isValidAnswer = function() {
                    if (scope.answer==""||scope.answer==null) return false;
                    else if (scope.ngModel.answers == null) return true;
                    else if (scope.ngModel.answers.length == 0) return true;
                    else return scope.ngModel.answers.indexOf(scope.answer) == -1 && scope.answer!='' && scope.answer!=null;
                };

                scope.updateCallback = function(data, status) {
                    if (status == 201) {
                        scope.updateMessage = "Successfully updated question.";
                        scope.changes = false;
                        $timeout(function() {
                            scope.updateMessage = null;
                        }, 2000)
                    }
                };

                scope.addAnswer= function() {
                    scope.changes = true;

                    if (scope.ngModel.answers == null) scope.ngModel.answers = [scope.answer];
                    else scope.ngModel.answers.unshift(scope.answer);

                    if (scope.ngModel.answer == null || typeof(scope.ngModel.answer) != "number") scope.ngModel.answer=1;
                    else scope.ngModel.answer++;

                    $(element).find("#answer-" + scope.ngModel._id).focus();

                    var newAnswer = scope.answer;
                    scope.answer = null;

                    $timeout(function() {
                        $(element).find("#" + newAnswer).css({"background-color": "#49E20E"});
                        $timeout(function() {
                            $(element).find("#" + newAnswer).css({"background-color": "white"});
                        }, 1500);
                    }, 1);
                };

                scope.removeAnswer = function(index) {
                    scope.changes = true;
                    var isConfirmed = confirm("Are you sure you would like to delete answer '" + scope.ngModel.answers[index] + "'?");
                    if (isConfirmed) {
                        if (scope.ngModel.answer > index) {
                            scope.ngModel.answer--;
                        }
                        scope.ngModel.answers.splice(index, 1);
                    }
                }
            }
        }
    })

    /*
        free question
     */
    .directive("free", function($http, $interval, $timeout) {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/assessmentEditingDirectives/templates/free.html',
            scope: {
                ngModel: "=ngModel",
                questionUpdate: "=questionUpdate"
            },
            link: function (scope, element, attrs) {

                scope.popoverTemplates = {
                    questionInput: "parts/admin/popoverTpls/assessments/questionInput.html",
                    addAnswerInput: "parts/admin/popoverTpls/assessments/addAnswerInput.html",
                    freeTextAnswersTable: "parts/admin/popoverTpls/assessments/freeTextAnswersTable.html"
                };

                scope.changes = false;

                //Delete any possibly pre-existing fields that is not suitable for a free type:
                delete scope.ngModel.answers;
                delete scope.ngModel.additionalInfo;

                scope.isValidAnswer = function() {
                    if (scope.answer==""||scope.answer==null) return false;
                    else if (scope.ngModel.answer == null || typeof(scope.ngModel.answer) != "object") return true;
                    else if (scope.ngModel.answer.length == 0) return true;
                    else return scope.ngModel.answer.indexOf(scope.answer) == -1 && scope.answer!='' && scope.answer!=null;
                };

                scope.updateCallback = function(data, status) {
                    if (status == 201) {
                        scope.updateMessage = "Successfully updated question.";
                        scope.changes = false;
                        $timeout(function() {
                            scope.updateMessage = null;
                        }, 2000)
                    }
                };

                scope.addAnswer= function() {
                    scope.changes = true;

                    if (scope.ngModel.answer == null || typeof(scope.ngModel.answer) != "object") scope.ngModel.answer = [scope.answer];
                    else scope.ngModel.answer.unshift(scope.answer);

                    $(element).find("#answer-" + scope.ngModel._id).focus();

                    var newAnswer = scope.answer;
                    scope.answer = null;

                    $timeout(function() {
                        $(element).find("#" + newAnswer).css({"background-color": "#49E20E"});
                        $timeout(function() {
                            $(element).find("#" + newAnswer).css({"background-color": "white"});
                        }, 1500);
                    }, 1);
                };

                scope.removeAnswer = function(index) {
                    scope.changes = true;
                    var isConfirmed = confirm("Are you sure you would like to delete answer '" + scope.ngModel.answer[index] + "'?");
                    if (isConfirmed) {
                        scope.ngModel.answer.splice(index, 1);
                    }
                }
            }
        }
    })

    /*
        call question
     */
    .directive("call", function($http, $interval, $timeout) {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/assessmentEditingDirectives/templates/call-log.html',
            scope: {
                ngModel: "=ngModel",
                questionUpdate: "=questionUpdate"
            },
            link: function (scope, element, attrs) {

                scope.popoverTemplates = {
                    questionInput: "parts/admin/popoverTpls/assessments/questionInput.html",
                    addAnswerInput: "parts/admin/popoverTpls/assessments/addAnswerInput.html",
                    answersTable: "parts/admin/popoverTpls/assessments/answersTable.html",
                    callInfoBackgroundInput: "parts/admin/popoverTpls/assessments/callInfoBackgroundInput.html",
                    callInfoDetailsInput: "parts/admin/popoverTpls/assessments/callInfoDetailsInput.html"
                };

                scope.changes = false;
                scope.view = 'background';

                scope.isValidAnswer = function() {
                    if (scope.answer==""||scope.answer==null) return false;
                    else if (scope.ngModel.answers == null) return true;
                    else if (scope.ngModel.answers.length == 0) return true;
                    else return scope.ngModel.answers.indexOf(scope.answer) == -1 && scope.answer!='' && scope.answer!=null;
                };

                scope.updateCallback = function(data, status) {
                    if (status == 201) {
                        scope.updateMessage = "Successfully updated question.";
                        scope.changes = false;

                        $timeout(function() {
                            scope.updateMessage = null;
                        }, 2000)
                    }
                };

                scope.addAnswer= function() {
                    scope.changes = true;
                    if (scope.ngModel.answers == null || typeof(scope.ngModel.answers) != "object") scope.ngModel.anwers = [scope.answer];
                    else scope.ngModel.answers.unshift(scope.answer);

                    $(element).find("#answer-" + scope.ngModel._id).focus();

                    var newAnswer = scope.answer;
                    scope.answer = null;

                    $timeout(function() {
                        $(element).find("#" + newAnswer).css({"background-color": "#49E20E"});
                        $timeout(function() {
                            $(element).find("#" + newAnswer).css({"background-color": "white"});
                        }, 1500);
                    }, 1);
                };

                scope.removeAnswer = function(index) {
                    scope.changes = true;
                    var isConfirmed = confirm("Are you sure you would like to delete answer '" + scope.ngModel.answers[index] + "'?");
                    if (isConfirmed) {
                        if (scope.ngModel.answer > index) {
                            scope.ngModel.answer--;
                        }
                        scope.ngModel.answers.splice(index, 1);
                    }
                };

                scope.addCallDetail = function() {
                    var newCallDetail = {
                        log: "",
                        date: new Date()
                    };
                    if (scope.ngModel.additionalInfo == null) {
                        scope.ngModel.additionalInfo = {
                            details: [newCallDetail],
                            background: {}
                        };
                    }
                    else if (scope.ngModel.additionalInfo.details == null) {
                        scope.ngModel.additionalInfo.details = [newCallDetail];
                    }
                    else {
                        scope.ngModel.additionalInfo.details.push(newCallDetail)
                    }
                };

                scope.removeCallDetail = function(index) {
                    var confirmed = confirm("Are you sure you want to delete this call log?");
                    if (confirmed) {
                        scope.ngModel.additionalInfo.details.splice(index, 1);
                    }
                }
            }
        }
    });
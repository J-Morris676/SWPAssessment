/**
 * Created by Jamie on 19/03/2015.
 */
angular.module("myApp.userDetailsDirectives", [])

    /*
        Directive to display a modal displaying user details.
            - ngModel is the username
            - triggerModal is a callback function to user when client requires opening.
     */
    .directive("userDetails", function($http, $timeout) {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/userDetailsDirective/templates/userDetails.html',
            scope: {
                ngModel: "=ngModel",
                triggerModal: "=triggerModal"
            },
            link: function (scope, element, attrs) {
                scope.userDetails = {};

                var getUser = function() {
                    $http.get("/resources/users/" + scope.ngModel).success(function(data, status) {
                        scope.userDetails = data;
                        console.log(scope.userDetails);
                    });
                };

                if (scope.ngModel != null) {
                    getUser();
                }
                else {
                    scope.$watch('ngModel', function () {
                        if (scope.ngModel != null) {
                            getUser();
                        }
                    });
                }

                scope.triggerModal = function() {
                    $('#userDetailsModal').modal();
                };


                var setMessageTimer = function(messages, isError) {
                    if (!isError) {
                        scope.successSubmitMessage = messages;
                        scope.errorSubmitMessage = null;
                        $timeout(function() {
                            scope.successSubmitMessage = null;
                        }, 3000*messages.length);
                    }
                    else {
                        scope.errorSubmitMessage = messages;
                        scope.successSubmitMessage = null;
                        $timeout(function() {
                            scope.errorSubmitMessage = null;
                        }, 3000*messages.length);
                    }
                };

                scope.editAdmin = function() {
                    if (scope.userDetails.user.password == "") delete scope.userDetails.user.password;

                    if (jQuery.isEmptyObject(scope.userDetails.user)) {
                        setMessageTimer(["All fields must be filled."], true);
                        return;
                    }
                    for (var field in scope.userDetails.user) {
                        if (scope.userDetails.user[field] == "" || scope.userDetails.user[field] == null) {
                            setMessageTimer(["All fields must be filled."], true);
                            return;
                        }
                    }

                    $http.put("/resources/admins/" + scope.userDetails.user.username, scope.userDetails.user).success(function(data, status) {
                        setMessageTimer(["Successfully updated '" + scope.userDetails.user.username + "'"], false);
                        getUser();
                    }).error(function(data, err) {
                        var errorArray = [];
                        for (var error in data.error.errors) {
                            errorArray.push(data.error.errors[error].messages[0])
                        }
                        setMessageTimer(errorArray, true);
                    });

                };
            }
        }
    });
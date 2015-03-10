/**
 * Created by Jamie Morris on 07/03/15.
 */
'use strict';

angular.module('myApp.signIn', ['ngResource'])

    .controller("signInCtrl", function($scope,$http, $timeout, $location) {
        $scope.loginDetails = {
            username: null,
            password: null
        };

        $scope.login = function() {
            if ($scope.loginDetails.username != null && $scope.loginDetails.password != null) {
                $http.post('auth/login', $scope.loginDetails).success(function(data, status) {
                    if (!data.authenticated) {
                        $scope.loginError = data.message;
                        $timeout(function() {
                            $scope.loginError = null;
                        }, 2000)
                    }
                    else {
                        //Begin user session
                        $location.path('/home');
                    }
                }).error(function(data, status) {
                        console.log(data);
                })
            }
        }
    });

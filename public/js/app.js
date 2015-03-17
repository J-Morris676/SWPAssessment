'use strict';

angular.module('myApp', ["myApp.signIn",
    "myApp.home",
    "myApp.assessment",
    "myApp.assessmentEditingDirectives",
    "myApp.assessments",
    "myApp.timeDirectives",
    "ngRoute",
    "ui.bootstrap"
])

	.config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');
        $routeProvider.when('/signIn', {templateUrl: 'parts/signIn.html', controller: 'signInCtrl'});
        $routeProvider.when('/home', {templateUrl: 'parts/home.html', controller: 'homeCtrl'});

        $routeProvider.when('/assessments', {templateUrl: 'parts/assessments.html', controller: 'assessmentsCtrl'});
        $routeProvider.when('/assessments/:assessmentId', {templateUrl: 'parts/assessment.html', controller: 'assessmentCtrl'});
        $routeProvider.otherwise({redirectTo: '/home'});
	})

	.controller('IndexCtrl', function($rootScope, $scope, $location, $http) {
		$scope.title = 'SWP Assessment';
		$scope.version = '0.1';

        //Listens out for route changes:
        $scope.$on('$routeChangeStart', function(next, current) {
            $http.get("/auth/isLoggedIn").success(function(data, status) {
                if (data.loggedIn) {
                    if ($location.path() == "/signIn") {
                        $location.path('/home');
                    }
                    $scope.username = data.username;
                }
                else {
                    $location.path('/signIn');
                }
            })
        });


        $scope.logOut = function() {
            $http.get("/auth/logout").success(function(data, status) {
                $location.path('/signIn');
            });
        };

        $scope.isRoute = function(route) {
			return $location.path() == route;
		};
	});
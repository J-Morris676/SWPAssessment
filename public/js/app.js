'use strict';

angular.module('myApp', ["myApp.signIn",
    //Admin modules & directives:
    "myApp.adminHome",
    "myApp.assessment",
    "myApp.assessmentEditingDirectives",
    "myApp.userDetailsDirectives",
    "myApp.assessments",
    "myApp.students",
    "myApp.student",
    "myApp.assessmentSchedules",
    "myApp.assessmentSchedule",

    //Student modules:
    "myApp.studentHome",
    "myApp.studentAssessmentSchedule",
    "myApp.studentSitAssessment",

    //Directives:
    "myApp.timeDirectives",

    //Lib modules:
    "ngRoute",
    "ui.bootstrap"
])

	.config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');
        $routeProvider.when('/signIn', {templateUrl: 'parts/signIn.html', controller: 'signInCtrl'});

        /*
            Admin routes
         */
        $routeProvider.when('/admin/home', {templateUrl: 'parts/admin/home.html', controller: 'adminHomeCtrl'});

        $routeProvider.when('/admin/assessments', {templateUrl: 'parts/admin/assessments.html', controller: 'assessmentsCtrl'});
        $routeProvider.when('/admin/assessments/:assessmentId', {templateUrl: 'parts/admin/assessment.html', controller: 'assessmentCtrl'});

        $routeProvider.when('/admin/assessmentSchedules', {templateUrl: 'parts/admin/assessmentSchedules.html', controller: 'assessmentSchedulesCtrl'});
        $routeProvider.when('/admin/assessmentSchedules/:assessmentScheduleId', {templateUrl: 'parts/admin/assessmentSchedule.html', controller: 'assessmentScheduleCtrl'});

        $routeProvider.when('/admin/students', {templateUrl: 'parts/admin/students.html', controller: 'studentsCtrl'});
        $routeProvider.when('/admin/students/:studentUsername', {templateUrl: 'parts/admin/student.html', controller: 'studentCtrl'});

        /*
            Student routes
         */
        $routeProvider.when('/student/home', {templateUrl: 'parts/student/home.html', controller: 'studentHomeCtrl'});
        $routeProvider.when('/student/assessmentSchedules/:assessmentScheduleId', {templateUrl: 'parts/student/assessmentSchedule.html', controller: 'studentAssessmentScheduleCtrl'});
        $routeProvider.when('/student/assessmentSchedules/:assessmentScheduleId/sitAssessment', {templateUrl: 'parts/student/sitAssessment.html', controller: 'studentSitAssessmentCtrl'});


        $routeProvider.otherwise({redirectTo: '/signIn'});
	})

	.controller('IndexCtrl', function($rootScope, $scope, $location, $http) {
		$scope.title = 'SWP Assessment';
		$scope.version = '0.1';

        //Listens out for route changes:
        $scope.$on('$routeChangeStart', function(next, current) {
            $http.get("/auth/isLoggedIn").success(function(data, status) {
                if (data.loggedIn) {
                    $scope.user = data;
                    $scope.username = data.username;
                    if ($location.path() == "/signIn") {
                        if ($scope.user.authType.toLowerCase() == "admin") {
                            $location.path('/admin/home');
                        }
                        else {
                            $location.path('/student/home');
                        }
                    }
                }
                else {
                    $scope.user = null;
                    $scope.username = null;
                    $location.path('/signIn');
                }
            })
        });

        $scope.logOut = function() {
            $http.get("/auth/logout").success(function(data, status) {
                $scope.user = {};
                $scope.username = "";
                $location.path('/signIn');
            });
        };


        $scope.isRoute = function(route) {
            var split = $location.path().split("/");
			return split[split.length-1] == route;
		};

        $scope.isRouteSignIn = function() {
            return $location.path() == '/signIn';
        }
	});
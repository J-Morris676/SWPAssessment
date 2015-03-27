/**
 * Created by Jamie Morris on 09/03/15.
 */

angular.module("myApp.timeDirectives", [])

    /*
     * Uses countdown solution from:
     *      - http://stackoverflow.com/questions/9335140/how-to-countdown-to-a-date
     *
     * Directive attributes:
     *      ng-model --> the date to countdown to
     *      onDone --> a callback function  to call when the countdown is complete.
     */

    .directive("countdown", function($http, $interval) {
        return {
            restrict: 'E',
            template: '<span ng-show="isValid(hoursRemaining)">' +
            '<span ng-hide="hoursRemaining==0">{{hoursRemaining}} Hr, </span>' +
            '<span ng-hide="hoursRemaining==0&&minutesRemaining==0">{{minutesRemaining}} Min, </span>' +
            '{{secondsRemaining}} Sec</span>',
            scope: {
                ngModel: '=ngModel',
                onDone: '=onDone'
            },
            link: function(scope, element, attrs) {
                var _second = 1000;
                var _minute = _second * 60;
                var _hour = _minute * 60;
                var _day = _hour * 24;

                scope.isValid = function(time) {
                    return !isNaN(time);
                };

                var countdown = function() {
                    var now = new Date();
                    var distance = new Date(scope.ngModel) - now;
                    if (distance < 0) {
                        $interval.cancel(timer);
                        $(element).parent().remove();
                        scope.onDone();
                    }
                    else {
                        scope.hoursRemaining = Math.floor((distance % _day) / _hour);
                        scope.minutesRemaining= Math.floor((distance % _hour) / _minute);
                        scope.secondsRemaining = Math.floor((distance % _minute) / _second);
                    }
                };
                countdown();
                var timer = $interval(countdown, 1000)
            }
        }
    })

    /*
     * Directive attributes:
     *      format --> the date format for this current time element to display
     */

    .directive("currentTime", function($http, $interval) {
        return {
            restrict: 'E',
            template: "<span><i>{{currentDate | date:format}}</i></span>",
            scope: {
                format: '@'
            },
            link: function(scope, element, attrs) {
                scope.currentDate = new Date();
                $interval(function() {
                    scope.currentDate = new Date();
                },1000)
            }
        }
    });
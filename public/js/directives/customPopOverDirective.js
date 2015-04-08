/**
 * Created by Jamie on 05/04/2015.
 *  Custom directive that encapsulates Bootstrap popover to allow for HTML
 */

angular.module("myApp.customPopOverDirectives", [])

    .directive('customPopover', function ($http) {
        return {
            restrict: 'A',
            scope: {
                popoverHtml: '=popoverHtml'
            },
            link: function (scope, el, attrs) {
                scope.label = attrs.popoverLabel;
                scope.title = attrs.popoverTitle;

                applyPopover();


                scope.$watch("popoverHtml", function() {
                    applyPopover();
                });
                function applyPopover() {
                    if (scope.popoverHtml != null) {
                        console.log(scope.popoverHtml);
                        $http.get(scope.popoverHtml).success(function(data, status) {
                            $(el).popover({
                                trigger: 'hover',
                                html: true,
                                content: data,
                                container: $( "div[ng-view='']"),
                                placement: attrs.popoverPlacement,
                                title: attrs.popoverTitle
                            });
                        });
                    }

                }
            }
        };
    });
/**
 * Created by Jamie on 05/04/2015.
 *  Custom directive that encapsulates Bootstrap popover to allow for HTML
 */

angular.module("myApp.customPopOverDirectives", [])

    .directive('customPopover', function ($http, isMobile) {
        return {
            restrict: 'A',
            scope: {
                popoverHtml: '=popoverHtml'
            },
            link: function (scope, el, attrs) {
                //Popovers are not used on mobile resolutions:
                if (!isMobile()) {
                    scope.label = attrs.popoverLabel;
                    scope.title = attrs.popoverTitle;

                    applyPopover();

                    scope.$watch("popoverHtml", function() {
                        applyPopover();
                    });
                    function applyPopover() {
                        if (scope.popoverHtml != null) {
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
            }
        };
    });
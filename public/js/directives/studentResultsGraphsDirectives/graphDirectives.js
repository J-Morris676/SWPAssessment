/**
 * Created by Jamie on 01/04/2015.
 */

angular.module("myApp.graphDirectives", [])
    /*
        Directives that encapsulate d3 graphs so that they work responsively & as
        basic html elements.
           - Takes the parent elements height (Must be defined using CSS)
           - Takes the width of the parent element (Can be defined using CSS - eliminates responsiveness.)
                - e.g. style="height:200px;width:200px;"
           - On smaller resolutions, will append scrollable css to the parent element.
     */
    .directive("studentGradesGraph", function() {
        return {
            restrict: 'E',
            scope: {
                ngModel: '=ngModel'
            },
            link: function (scope, element, attrs) {


                element.ready(function() {
                    var width = element.parent().width()
                    if (scope.ngModel != null) {
                        drawGraph(scope.ngModel);
                    }
                    else {
                        var deregister = scope.$watch("ngModel", function() {
                            if (scope.ngModel != null) {
                                if (scope.ngModel == null && scope.ngModel.length == 0) {
                                    drawInvalidParamsText("There isn't enough data to create a graph.");
                                }
                                else {
                                    drawGraph(scope.ngModel, width);
                                    registerWatches();
                                }
                                deregister();
                            }
                        })
                    }
                });


                //Registers the watches required to re-draw graphs on size changes:
                function registerWatches() {
                    $(window).resize(function() {
                        drawGraph(scope.ngModel, element.parent().width());
                    })
                }
                //Draws some text to the center of an svg based on some invalid given params:
                function drawInvalidParamsText(textToDisplay) {
                    removeGraph();
                    var width = scope.width;
                    var height = element.parent().height();

                    var svg = d3.select(element[0]).append("svg").attr("width", width).attr("height", height);
                    svg.append("text")
                        .text(textToDisplay)
                        .style("font-size", 15)
                        .attr("x", function(d, i) {
                            return (width/2) - (this.getBBox().width/2);
                        })
                        .attr("y", function(d, i) {
                            return (height/2) - (this.getBBox().height/2);
                        });
                }

                function drawGraph(data, width) {
                    removeGraph();
                    var height = element.parent().height();
                    console.log(width);


                    var margin = {top: 20, right: 30, bottom: 40, left: 40},
                        width = width - margin.left - margin.right,
                        height = height - margin.top - margin.bottom;

                    var x = d3.scale.ordinal()
                        .rangeRoundBands([0, width], .1);

                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left");

                    var svg = d3.select(element[0]).append("svg");
                    var chart = svg
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    x.domain(data.map(function (d) {
                        return d.username;
                    }));
                    y.domain([0, 100]);

                    chart.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    chart.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);

                    chart.selectAll(".bar")
                        .data(data)
                        .enter().append("rect")
                        .style("fill", function(d, i) {
                            if (i % 2 == 0) {
                                return "#CB1442";
                            }
                            else {
                                return "#AF0E38";
                            }
                        })
                        .attr("class", "bar")
                        .attr("x", function (d) {
                            return x(d.username);
                        })
                        .attr("y", function (d) {
                            return y(d.grade);
                        })
                        .attr("height", function (d) {
                            return height - y(d.grade);
                        })
                        .attr("width", x.rangeBand());
                }
                function removeGraph() {
                    d3.select(element[0]).select("svg").remove();
                }


            }
        }
    })


    /*
     Directives that encapsulate d3 graphs so that they work responsively & as
     basic html elements.
     - Takes the parent elements height (Must be defined using CSS)
     - Takes the width of the parent element (Can be defined using CSS - eliminates responsiveness.)
     - e.g. style="height:200px;width:200px;"
     - On smaller resolutions, will append scrollable css to the parent element.
     */
    .directive("pieChart", function() {
        return {
            restrict: 'E',
            scope: {
                ngModel: '=ngModel'
            },
            link: function (scope, element, attrs) {
                element.ready(function () {
                    var width = element.parent().width();
                    if (scope.ngModel != null) {
                        drawGraph(scope.ngModel, width);
                    }
                    else {
                        var deregister = scope.$watch("ngModel", function () {
                            if (scope.ngModel != null) {
                                drawGraph(scope.ngModel, width);
                                deregister();
                            }
                        })
                    }
                });

                function drawGraph(percent, width) {
                    var τ = 2 * Math.PI,
                        height = element.parent().height(),
                        width=width-20,
                        outerRadius = Math.min(width, height) / 2,
                        innerRadius = (outerRadius / 5) * 4,
                        fontSize = (Math.min(width, height) / 4);

                    var arc = d3.svg.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius)
                        .startAngle(0);

                    var svg = d3.select(element[0]).append("svg")
                        .attr("width", '100%')
                        .attr("height", '100%')
                        .attr('viewBox', '0 0 ' + width + ' ' + height)
                        .attr('preserveAspectRatio', 'xMinYMin')
                        .append("g")
                        .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

                    var text = svg.append("text")
                        .text('0%')
                        .attr("text-anchor", "middle")
                        .style("font-size", fontSize + 'px')
                        .attr("dy", fontSize / 3)
                        .attr("dx", 2);

                    var background = svg.append("path")
                        .datum({endAngle: τ})
                        .style("fill", "rgb(203, 20, 66)")
                        .attr("d", arc);

                    var foreground = svg.append("path")
                        .datum({endAngle: 0 * τ})
                        .style("fill", "#337ab7")
                        .attr("d", arc);


                    foreground.transition()
                        .duration(750)
                        .call(arcTween, percent * τ);

                    function arcTween(transition, newAngle) {

                        transition.attrTween("d", function (d) {

                            var interpolate = d3.interpolate(d.endAngle, newAngle);

                            return function (t) {

                                d.endAngle = interpolate(t);

                                text.text(Math.round((d.endAngle / τ) * 100) + '%');

                                return arc(d);
                            };
                        });
                    }
                }

            }
        }
    });

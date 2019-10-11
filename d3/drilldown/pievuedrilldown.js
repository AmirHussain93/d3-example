Vue.component("d3-pie",{
    template: `<div id="chart"></div>`,

    data() {
        return {
            dataset:[],
            width: 600,
            height: 600,
            radius: this.width / 2,
            chartOptions: [{
                "captions": [{
                  "name": "INDIA",
                  "name": "CANADA",
                  "name": "USA"
                }],
                "color": [{
                  "INDIA": "#FFA500",
                  "CANADA": "#0070C0",
                  "USA": "#ff0000"
                }],
                "xaxis": "Country",
                "xaxisl1": "Model",
                "yaxis": "Total"
              }],
              chartData: [{
                "Country": "USA",
                "Model": "Model 1",
                "Total": 487
              }, {
                "Country": "USA",
                "Model": "Model 2",
                "Total": 185
              }, {
                "Country": "USA",
                "Model": "Model 3",
                "Total": 140
              }, {
                "Country": "USA",
                "Model": "Model 4",
                "Total": 108
              }, {
                "Country": "USA",
                "Model": "Model 5",
                "Total": 26
              }, {
                "Country": "USA",
                "Model": "Model 6",
                "Total": 106
              }, {
                "Country": "USA",
                "Model": "Model 7",
                "Total": 27
              }, {
                "Country": "USA",
                "Model": "Model 8",
                "Total": 44
              }, {
                "Country": "USA",
                "Model": "Model 9",
                "Total": 96
              }, {
                "Country": "INDIA",
                "Model": "Model 1",
                "Total": 411
              }, {
                "Country": "INDIA",
                "Model": "Model 2",
                "Total": 33
              }, {
                "Country": "INDIA",
                "Model": "Model 3",
                "Total": 32
              }, {
                "Country": "INDIA",
                "Model": "Model 4",
                "Total": 29
              }, {
                "Country": "INDIA",
                "Model": "Model 5",
                "Total": 29
              }, {
                "Country": "CANADA",
                "Model": "Model 1",
                "Total": 7
              }, {
                "Country": "CANADA",
                "Model": "Model 2",
                "Total": 20
              }, {
                "Country": "CANADA",
                "Model": "Model 3",
                "Total": 232
              }, {
                "Country": "CANADA",
                "Model": "Model 4",
                "Total": 117
              }]
        }
    },

    mounted() {
        var _self = this;
        console.log("fired", this.chartOptions)

        this.transformChartData(this.chartData, this.chartOptions, 0);
        this.renderChart("chart", this.chartData, this.chartOptions, 0);
    },

    methods: {
        renderChart(id, chartData, options, level) {
            console.log("fired", id, chartData)
            var salesData;
            var chartInnerDiv = '<div class="innerCont" style="overflow: auto;top:1px; left: 1px; height:91% ; Width:100% ;position: relative;overflow: hidden;"/>';
            var truncLengh = 30;
            var xVarName;
            var divisionRatio = 2.5;
            var legendoffset = (level == 0) ? 0 : -40;

            d3.select("#chart")
              .attr("width", this.width)
              .attr("height", this.height)

            d3.selectAll("#" + id + " .innerCont").remove();
                d3.select("#" + id).append('div')
                  .attr('class','innerCont')
                  .style('overflow', 'auto')
                  .style('top', '1px')
                  .style('left', '1px')
                  .attr('height', 450)
                  .attr('width', 400)
                  .style('position', 'relative')
                  .style('overflow', 'hidden')

            var chart = d3.select("#" + id + " .innerCont");
            console.log('chart-----', chart)
            var yVarName = options[0].yaxis;
            width = d3.select("#chart").attr("width"),
            height = d3.select("#chart").attr("height"),
            radius = Math.min(width, height) / divisionRatio;
            
            if (level == 1) {
                xVarName = options[0].xaxisl1;
            } else {
                xVarName = options[0].xaxis;
            }

            if (level == 1) {
                xVarName = options[0].xaxisl1;
              } else {
                xVarName = options[0].xaxis;
              }
            
              var rcolor = d3.scaleOrdinal().range(runningColors);
            
              arc = d3.arc()
                .outerRadius(radius)
                .innerRadius(radius - 200);
            
              var arcOver = d3.arc().outerRadius(radius + 20).innerRadius(radius - 180);

              chart = chart.append("svg") //append svg element inside #chart
                           .attr("width", width) //set width
                           .attr("height", height) //set height
                           .append("g")
                           .attr("transform", "translate(" + (width / divisionRatio) + "," + ((height / divisionRatio) + 30) + ")");

              var pie = d3.pie()
                        .sort(null)
                        .value(function(d) {
                        return d.Total;
                        });

            var g = chart.selectAll(".arc")
                .data(pie(runningData))
                .enter().append("g")
                .attr("class", "arc");

            var count = 0;

            var path = g.append("path")
                .attr("d", arc)
                .attr("id", function(d) {
                return "arc-" + (count++);
                })
                .style("opacity", function(d) {
                return d.data["op"];
                });

                path.on("mouseenter", function(d) {
                    d3.select(this)
                      .attr("stroke", "white")
                      .transition()
                      .duration(200)
                      .attr("d", arcOver)
                      .attr("stroke-width", 1);
                  })
                  .on("mouseleave", function(d) {
                    d3.select(this).transition()
                      .duration(200)
                      .attr("d", arc)
                      .attr("stroke", "none");
                  })
                  .on("click", (d) => {
                      let self = this;
                    if (this._listenToEvents) {
                      // Reset inmediatelly
                      d3.select(this).attr("transform", "translate(0,0)")
                        // Change level on click if no transition has started
                      path.each(function() {
                        this._listenToEvents = false;
                      });
                    }
                    d3.selectAll("#" + id + " svg").remove();
                    if (level == 1) {
                      this.transformChartData(chartData, options, 0, d.data[xVarName]);
                      this.renderChart(id, chartData, options, 0);
                    } else {
                      var nonSortedChart = chartData.sort(function(a, b) {
                        return parseFloat(b[options[0].yaxis]) - parseFloat(a[options[0].yaxis]);
                      });
                      let self = this
                      this.transformChartData(nonSortedChart, options, 1, d.data[xVarName]);
                      this.renderChart(id, nonSortedChart, options, 1);
                    }
              
                  });
                  path.append("svg:title")
                  .text(function(d) {
                    return d.data["title"] + " (" + d.data[yVarName] + ")";
                  });
              
                  path.style("fill", function(d) {
                    return rcolor(d.data[xVarName]);
                  })
                  .transition().duration(1000).attrTween("d", tweenIn).on("end", function() {
                    this._listenToEvents = true;
                  });

                  g.append("text")
                    .attr("transform", function(d) {
                    return "translate(" + arc.centroid(d) + ")";
                    })
                    .attr("dy", ".35em")
                    .style("text-anchor", "middle")
                    .style("opacity", 1)
                    .text(function(d) {
                    return d.data[yVarName];
                    });

                    count = 0;

                    var legend = chart.selectAll(".legend")
                    .data(runningData).enter()
                    .append("g").attr("class", "legend")
                    .attr("legend-id", function(d) {
                    return count++;
                    })
                    .attr("transform", function(d, i) {
                    return "translate(15," + (parseInt("-" + (runningData.length * 10)) + i * 28 + legendoffset) + ")";
                    })
                    .style("cursor", "pointer")
                    .on("click", function() {
                    var oarc = d3.select("#" + id + " #arc-" + $(this).attr("legend-id"));
                    oarc.style("opacity", 0.3)
                        .attr("stroke", "white")
                        .transition()
                        .duration(200)
                        .attr("d", arcOver)
                        .attr("stroke-width", 1);
                    setTimeout(function() {
                        oarc.style("opacity", function(d) {
                            return d.data["op"];
                        })
                        .attr("d", arc)
                        .transition()
                        .duration(200)
                        .attr("stroke", "none");
                    }, 1000);
                    });

                    var leg = legend.append("rect");

                        leg.attr("x", width / 2)
                            .attr("width", 18).attr("height", 18)
                            .style("fill", function(d) {
                            return rcolor(d[yVarName]);
                            })
                            .style("opacity", function(d) {
                            return d["op"];
                            });
                        legend.append("text").attr("x", (width / 2) - 5)
                            .attr("y", 9).attr("dy", ".35em")
                            .style("text-anchor", "end").text(function(d) {
                            return d.caption;
                            });

                        leg.append("svg:title")
                            .text(function(d) {
                            return d["title"] + " (" + d[yVarName] + ")";
                            });

                            function tweenOut(data) {
                                data.startAngle = data.endAngle = (2 * Math.PI);
                                var interpolation = d3.interpolate(this._current, data);
                                this._current = interpolation(0);
                                return function(t) {
                                  return arc(interpolation(t));
                                };
                              }
                            
                              function tweenIn(data) {
                                var interpolation = d3.interpolate({
                                  startAngle: 0,
                                  endAngle: 0
                                }, data);
                                this._current = interpolation(0);
                                return function(t) {
                                  return arc(interpolation(t));
                                };
                              }

        },

        transformChartData(chartData, opts, level, filter) {
            var result = [];
            var resultColors = [];
            var counter = 0;
            var hasMatch;
            var xVarName;
            var yVarName = opts[0].yaxis;
          
            if (level == 1) {
              xVarName = opts[0].xaxisl1;
          
              for (var i in chartData) {
                hasMatch = false;
                for (var index = 0; index < result.length; ++index) {
                  var data = result[index];
          
                  if ((data[xVarName] == chartData[i][xVarName]) && (chartData[i][opts[0].xaxis]) == filter) {
                    result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                    hasMatch = true;
                    break;
                  }
          
                }
                if ((hasMatch == false) && ((chartData[i][opts[0].xaxis]) == filter)) {
                  if (result.length < 9) {
                    ditem = {}
                    ditem[xVarName] = chartData[i][xVarName];
                    ditem[yVarName] = chartData[i][yVarName];
                    ditem["caption"] = chartData[i][xVarName].substring(0, 10) + '...';
                    ditem["title"] = chartData[i][xVarName];
                    ditem["op"] = 1.0 - parseFloat("0." + (result.length));
                    result.push(ditem);
          
                    resultColors[counter] = opts[0].color[0][chartData[i][opts[0].xaxis]];
          
                    counter += 1;
                  }
                }
              }
            } else {
              xVarName = opts[0].xaxis;
          
              for (var i in chartData) {
                hasMatch = false;
                for (var index = 0; index < result.length; ++index) {
                  var data = result[index];
          
                  if (data[xVarName] == chartData[i][xVarName]) {
                    result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                    hasMatch = true;
                    break;
                  }
                }
                if (hasMatch == false) {
                  ditem = {};
                  ditem[xVarName] = chartData[i][xVarName];
                  ditem[yVarName] = chartData[i][yVarName];
                  ditem["caption"] = opts[0].captions != undefined ? opts[0].captions[0][chartData[i][xVarName]] : "";
                  ditem["title"] = opts[0].captions != undefined ? opts[0].captions[0][chartData[i][xVarName]] : "";
                  ditem["op"] = 1;
                  result.push(ditem);
          
                  resultColors[counter] = opts[0].color != undefined ? opts[0].color[0][chartData[i][xVarName]] : "";
          
                  counter += 1;
                }
              }
            }
          
          
            runningData = result;
            runningColors = resultColors;
            return;
          }
    }
    

})

new Vue({
    el:"#drilldown"
})
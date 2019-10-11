var d3Pie = {
  template: `<div class="d-pie">
      <div id="d3-chart"></div>
      <div id="tooltip" style="opacity:0">
          <p><span id="value">100</span></p>
      </div>
  </div>`,
  props: {
      dataset: Array,
      onClick: Function
  },

  data() {
      return {
          width: 960,
          height: 500,
          innerradius: 0
      }
  },

  created() {

  },
  updated() {
      this.updadeDateset();
      this.renderChart(this.dataset)
  },
  mounted() {
      this.updadeDateset();
      this.renderChart(this.dataset)
  },
  methods: {
      updadeDateset() {
          this.dataset.forEach((d) => {
              d.logValue = +d.logValue; // calculate count as we iterate through the data
              d.enabled = true; // add enabled property to track which entries are checked
              // console.log(parseInt(d.logValue));
          });
      },
      renderChart(dataset) {
          var width = 450;
          var height = 400;
          var radius = 140;
          var color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c', '#e4651c']);
          var regex = /[^A-Z0-9]+/ig;
          var colors = ['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c', '#e4651c'];
          
          var svg = d3.select('#d3-chart')
              .append('svg')
              .attr('width', width)
              .attr('height', height)
              .append('g')
              .attr('transform', 'translate(' +
                  (width / 2 ) + ',' + (height / 2) + ')');

          svg.append("g")
              .attr("transform", "translate(" + -(width / 2 - 130) + "," + -180 + ")")
              .append("text")
              .text("bibliography")
              .attr("class", "title");

          svg.append("g")
              .attr("transform", "translate(" + -(width / 2 - 210) + "," + -180 + ")")
              .append("text")
              .attr("id", "expand")
              .text("\uf065")
              .style("font-family", "FontAwesome")

          var arc = d3.arc()
              .innerRadius(this.innerradius) // NEW
              .outerRadius(radius);

          var arcOver = d3.arc()
              .innerRadius(this.innerradius)
              .outerRadius(140 + 10);

          var pie = d3.pie()
              .value(function (d) {
                  return d.logValue;
              })
              .sort(null);

          var path = svg.selectAll('path')
              .data(pie(dataset))
              .enter()
              .append('path')
            //   .attr('d', arc)
              .attr('fill', function (d, i) {
                  return color(d.data.name);
              })
              .attr('id', function (d) {
                  return d.data.name.replace(regex, '');
              })
              .each(function (d) {
                  this._current = d;
              })
            path.transition()
            .duration(function(d, i) {
              return i * 300;
            })
            .attrTween('d', function(d) {
                console.log('d---',d)
              var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
              return function(t) {
                  d.endAngle = i(t);
                return arc(d);
              }
          })
             
        ///////////////////////////// legend ///////////////////////////////
        // var legendCount = dataset.series.length;

		// var legendWidth = 10;
		// var legendSpacing = 6;

		// var netLegendHeight = (legendWidth + legendSpacing) * legendCount;
		// var legendPerPage, totalPages, pageNo;

		// legendPerPage = 2;
		// totalPages = Math.ceil(legendCount / legendPerPage);

		// pageNo = 1;

		// var startIndex = (pageNo - 1) * legendPerPage;
		// var endIndex = startIndex + legendPerPage;
		// var seriesSubset = [],
		// 	colorSubset = [];

		// for (var i = 0; i < this.dataset.length; i++) {
		// 	if (i >= startIndex && i < endIndex) {
		// 		seriesSubset.push(this.dataset[i]);
		// 		colorSubset.push(colors[i]);
		// 	}
        // }
        ////////////////////////////////////////// legend ///////////////////////////////
        var xl = d3.scaleBand()
            .range([0, width])
            .padding(0.3)
            .domain(dataset.map(d => d.name))
        ;
        var l = svg.append('g')
            .attr('transform', `translate(-210,${height-570})`);
        ;

      var legend = l.selectAll('.legend')
          .data(color.domain())
          .enter()
          .append('g')
          .attr('class', 'legend')
          .attr('transform', (d, i) => `translate(${xl(d)},0)`);

      legend.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', color)
              .style('stroke', color)
              .on('click', function (name) {
                  var rect = d3.select(this);
                  var enabled = true;
                  var totalEnabled = d3.sum(dataset.map(function (d) {
                      return (d.enabled) ? 1 : 0;
                  }));

                  if (rect.attr('class') === 'remove') {
                      rect.attr('class', '');
                      rect.style('fill', color);
                  } else {
                      if (totalEnabled < 2) return;
                      rect.attr('class', 'remove');
                      rect.style('fill', "#fff");
                      enabled = false;
                  }

                  pie.value(function (d) {
                      if (d.name === name) d.enabled = enabled;
                      return (d.enabled) ? d.logValue : 0;
                  });

                  path = path.data(pie(dataset));

                  path.transition()
                      // .duration(750)
                      .attrTween('d', function (d) {
                          var interpolate = d3.interpolate(this._current, d);
                          this._current = interpolate(0);
                          return function (t) {
                              return arc(interpolate(t));
                          };
                      });
              })
              .each(function (d, i) {
                  var current_item = d3.select(this);
                  current_item.on('mouseover', function () {
                      d = d.replace(regex, '');
                      // console.log("sliced value-------", d)
                      d3.selectAll('path')
                          .attr("d", arc)
                      d3.select(`#${d}`)
                          .transition()
                          // .duration(1000)
                          .attr('d', arcOver)
                  })
                  current_item.on('mouseout', function () {
                      d3.select(`#${d}`)
                          .transition()
                          // .duration(1000)
                          .attr('d', arc)
                  })
              });
  
                legend.append('text')
                    .attr('x', 20)
                    .attr('y', 10)
                    .text(d => {
                        return d.length > 7 ? d.slice(0,4) + '...' : d;
                    })
                ;

                path.on('mouseover', function (d) {
                    d3.select("#tooltip")
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")
                        .style("opacity", 1)
                        .select("#value")
                        .text(`${d.data.name}: ${d.data.value}`);

                    d3.select(this).transition()
                        // .duration(1000)
                        .attr("d", arcOver);
                });
                path.on('mouseout', function () {
                    // Hide the tooltip
                    d3.select("#tooltip")
                        .style("opacity", 0);

                    d3.select(this).transition()
                        // .duration(1000)
                        .attr("d", arc);
                });
                // path.on('click', (d) => {
                //     // console.log("on click", d);
                //     this.onClick(d.data);
                // })
                path.on('contextmenu', d => {
                    d3.event.preventDefault();
                    this.onClick(d.data);
                })

      },
      
  },
  watch: {
      dataset(newValue) {
        d3.selectAll("#d3-chart svg").remove();
        this.updadeDateset();

        if(newValue.length > 5) {
          this.innerradius = 100;
          this.renderChart(this.dataset)

        } else if (newValue.length <= 5) {
          this.innerradius = 0;
          this.renderChart(this.dataset)

        }
      }
  }
};

var d3ScatterPlot = {
  template: `<div id="scatter-load">
  </div>`,
  props: {
      dataset: Array,
      onClick: Function
  },
  data() {
      return {
      }
  },
  mounted() {
      this.showScatterPlot(this.dataset);
  },
  methods: {
      showScatterPlot(data) {
          var margins = {
              "left": 40,
                  "right": 30,
                  "top": 30,
                  "bottom": 30
          };
          
          var width = 500;
          var height = 375;
          
          var colors = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c', '#e4651c']);
      
          var svg = d3.select("#scatter-load")
                      .append("svg")
                      .attr("width", width)
                      .attr("height", height)
                      .append("g")
                      .attr("transform", "translate(" + margins.left + "," + margins.top + ")");
      
          var x = d3.scalePoint().range([0, width - margins.left - margins.right]).domain(this.dataset.map(function(d) { return d.name; })).padding(0.4);

          var y = d3.scaleLinear()
                      .domain(d3.extent(this.dataset, function (d) {
                          return d.value;
                      }))
                      .range([height - margins.top - margins.bottom, 0]);
      
          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + y.range()[0] + ")");
          svg.append("g")
          .attr("class", "y axis");
      
          svg.append("text")
              .attr("fill", "#414241")
              .attr("text-anchor", "end")
              .attr("x", width / 2)
              .attr("y", height - 30)
              .text("Name");
      
      
          var xAxis = d3.axisBottom(x)
                          .tickPadding(2);
          var yAxis = d3.axisLeft(y)
                          .tickPadding(2);
      
          svg.selectAll("g.y.axis").call(yAxis);
          svg.selectAll("g.x.axis").call(xAxis);
      
          var chocolate = svg.selectAll("g.node")
                              .data(this.dataset, function (d) {
                                  return d.name;
                              });
          
          var chocolateGroup = chocolate.enter()
                                  .append("g")
                                  .attr("class", "node")
                                  .attr('transform', function (d) {
                                      return "translate(" + x(d.name) + "," + y(d.value) + ")";
                                  });
          
          var tooltip = d3.select("#scatter-load").append("div")
                          .attr("class", "tooltip")
                          .style("opacity", 0);
                  
          // tooltip mouseover event handler
          var tipMouseover = function(d) {
              var color = colors(d.name);
              var html  = d.name + "<br/>" +
                          "<span style='color:" + color + ";'>" + d.value + "</span><br/>";
                  
          tooltip.html(html)
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY) + "px")
              .transition()
              .duration(200) // ms
              .style("opacity", .9) // started as 0!

          };
          // tooltip mouseout event handler
          var tipMouseout = function(d) {
              tooltip.transition()
                  .duration(300) // ms
                  .style("opacity", 0); // don't care about position!
          };
      
          chocolateGroup.append("circle")
              .attr("r", 5)
              .attr("class", "dot")
              .style("fill", function (d) {
                      return colors(d.name);
              })
              .on('mouseover', tipMouseover)
              .on('mouseout', tipMouseout)
              .on('click', (d) => {
                  this.onClick(d);
              });
      
          chocolateGroup.append("text")
              .style("text-anchor", "middle")
              .attr("dy", -10)
              .text(function (d) {
                  return d.name;
              });   
        
      }
  },
  watch: {
      dataset(newValue) {
          d3.selectAll("#scatter-load svg").remove();
          this.showScatterPlot(this.dataset)
      }
  }
};

var d3Bubble = {
  template: `<div class="d-pie">
              <div id="d3-bubble"></div>
              <div id="tooltip" style="opacity:0">
                  <p><span id="value">100</span></p>
              </div>
          </div>`,
  props: {
      dataset: Array,
      onClick: Function
  },

  data() {
      return {
          width: 960,
          height: 500,
          data: {},
      }
  },

  created() {
  },

  updated() {
      this.updadeDateset();
      this.renderChart(this.data)
  },

  mounted() {
      this.updadeDateset();
      if (this.data.children.length > 0)
          this.renderChart(this.data)
  },
  methods: {
      updadeDateset() {
          this.data = {
              children: Array.from(this.dataset)
          }
      },
      renderChart(dataset) {
          var diameter = 400;
          var color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c', '#e4651c']);

          var bubble = d3.pack(dataset)
              .size([diameter, diameter])
              .padding(1.5);
          var svg = d3.select("#d3-bubble")
              .append("svg")
              .attr("width", diameter)
              .attr("height", diameter)
              .attr("class", "bubble");

          var nodes = d3.hierarchy(dataset)
              .sum(function (d) { return d.value; });

          var node = svg.selectAll(".node")
              .data(bubble(nodes).descendants())
              .enter()
              .filter(function (d) {
                  return !d.children
              })
              .append("g")
              .attr("class", "node")
              .attr("transform", function (d) {
                  return "translate(" + d.x + "," + d.y + ")";
              });

          node.append("title")
              .text(function (d) {
                  return d.data.name + ": " + d.value;
              });

          node.append("circle")
            //   .attr("r", function (d) {
            //       console.log('dr', d.r);
            //       return d.r;
            //   })
            //   .style("fill", function (d) {
            //       return color(d.data.name);
            //   })
              .on('click', (d) => {
                  this.onClick(d.data);
              });

          node.append("text")
              .attr("dy", ".3em")
              .style("text-anchor", "middle")
              .text(function (d) {
                  // return d.data.name.substring(0, d.r / 3) + ": " + d.data.value;
              });

          node.selectAll('circle').transition().duration(1000).attr("r", function (d) {
                  console.log('dr', d.r);
                  return d.r;
              })
              .style("fill", function (d) {
                  return color(d.data.name);
              })
            //   .on('click', (d) => {
            //       this.onClick(d.data);
            //   });
        
          d3.select(self.frameElement)
              .style("height", diameter + "px");

      }
  },
  watch: {
      dataset(newValue) {
          d3.selectAll("#d3-bubble svg").remove();
          this.updadeDateset();
          this.renderChart(this.data)
      }
  }
};

var d3Bar = {
  template: `<div class="d-pie">
              <div id="d3-bar"></div>
              <div id="tooltip" style="opacity:0">
                  <p><span id="value">100</span></p>
              </div>
            </div>`,
  props: {
    dataset: Array,
    onClick: Function
  },
  data() {
      return {
      }
  },
  mounted() {
    this.showBarChart(this.dataset);
  },
  methods: {
    showBarChart(dataset) {
      var margin = {top: 20, right: 20, bottom: 30, left: 40},
          width = 450 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;
         
      var svg = d3.select("#d3-bar")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .attr("transform", "translate(" + (margin.left - 30) + "," + (margin.top - 5) + ")");

      var xScale = d3.scaleBand().range([0, width]).padding(0.8);
      var yScale = d3.scaleLinear().range([height, 0]);

      // format the data
      dataset.forEach(function(d) {
        d.value = +d.value;
      });

      xScale.domain(dataset.map(function(d) { return d.name; }));
      yScale.domain([0, d3.max(dataset, function(d) { return d.value; })]);

      // append the rectangles for the bar chart
      svg.selectAll(".bar")
      .data(dataset)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return xScale(d.name); })
      .attr("width", xScale.bandwidth())
      .attr("y", function(d) { return yScale(d.value); })
      .attr("height", function(d) { return height - yScale(d.value); })
      .on('contextmenu', d => {
        d3.event.preventDefault();
        this.onClick(d);
      })

      // add the x Axis
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

      // add the y Axis
      svg.append("g")
        .attr("transform", "translate(40,0)")
        .call(d3.axisLeft(yScale));
    }
  },

  watch: {
    dataset(newValue) {
        d3.selectAll("#d3-bar svg").remove();
        this.showBarChart(this.dataset);
    }
  }
}

var d3Treemap = {
    template: `<div class="d-pie">
              <div id="d3-treemap"></div>
              <div id="tooltip" style="opacity:0">
                  <p><span id="value">100</span></p>
              </div>
          </div>`,
    props: {
        dataset: Array,
        onClick: Function
    },
    data() {
        return {
        }
    },
    mounted() {
        this.showTreeMap(this.dataset);
    },
    methods: {
        showTreeMap(dataset) {
            var defaults = {
                margin: {top: 24, right: 0, bottom: 0, left: 0},
                rootname: "TOP",
                format: ",d",
                title: "",
                width: 960,
                height: 500
            };
        }
    },
    watch: {
        dataset(newValue) {
            d3.selectAll("#d3-treemap svg").remove();
            this.showTreeMap(this.dataset);
        }
      }
    
}

Vue.component("d3-widget", {
  template: `<div class="d-pie-w">
              <button v-on:click="backClick">Go Back</button>
              <button v-on:click="chart='pie'">Pie</button>
              <button v-on:click="chart='scatter'">Scatter</button>
              <button v-on:click="chart='bubble'">Bubble</button>
              <button v-on:click="chart='bar'">Bar</button>
              <button v-on:click="chart='treemap'">Treemap</button>
              <div v-if="chart==='pie'">
                  <d3-pie v-bind:dataset="dataset" v-bind:onClick="onClick"/>
              </div>
              <div v-if="chart==='scatter'">
                  <d3-scatter-plot v-bind:dataset="dataset" v-bind:onClick="onClick"/>
              </div>
              <div v-if="chart==='bubble'">
                  <d3-bubble v-bind:dataset="dataset" v-bind:onClick="onClick"/>
              </div>
              <div v-if="chart==='bar'">
                  <d3-bar v-bind:dataset="dataset" v-bind:onClick="onClick"/>
              </div>
              <div v-if="chart==='treemap'">
                  <d3-treemap v-bind:dataset="dataset" v-bind:onClick="onClick"/>
              </div>
            </div>`,
  components: {
      d3ScatterPlot,
      d3Pie,
      d3Bubble,
      d3Bar,
      d3Treemap
  },
  data() {
      return {
          chart: 'pie',
          ds: [],
          dataset: []
      }
  },
  mounted() {
    d3.json("pie.json")
      .then((res) => {
        res.forEach((d, i) => {
           d['logValue'] = Math.log10(parseInt(d.value + 1))
             if (d.tree_level === 1) {
                 this.dataset.push({
                     'name': d.name,
                     'value': d.value,
                     'logValue': Math.log10(parseInt(d.value + 1)),
                     'id': d.id,
                     'tree_level': d.tree_level,
                 })
             }
         });
        this.ds = res;
      })
      // axios({
      //    type: "GET",
      //    url:
      //      window.config.apiUrl +
      //      "security/allmapping/search/visualization/bibliography",
      //    data: null,
      //    headers: { userSessionId: window.config.userSessionId },
      //    contentType: "application/json"
      //    })
      //    .then((ds) => { 
      //        console.log("ds----", ds);
      //        this.ds = ds.data;
      //         this.ds.forEach((d) => {
      //             if (d.tree_level === 1) {
      //                 this.dataset.push({
      //                     'name': d.name,
      //                     'value': d.value,
      //                     'id': d.id,
      //                     'tree_level': d.tree_level,
      //                 })
      //             }
      //         });
      // })
  },
  methods: {
      onClick(d) {
          let a = this.ds.filter((ds) => {
              return ds.parent_id === d.id
          })
          if (a.length > 1) {

            if (a.length <= 10) {
              this.chart = "pie"
            } else if (a.length > 10) {
              this.chart = "bubble"
            }
              this.dataset = a
              this.currentParentId = d.parent_id;
              this.tree_level = d.tree_level;
          }
      },
      backClick() {
          let a = this.ds.filter((ds) => {
              return ds.tree_level === this.tree_level && (ds.tree_level === 1 || ds.parent_id === this.currentParentId)
          })

          if(a.length > 1){
            if (a.length <= 10) {
              this.chart = "pie"
            } else if (a.length > 10) {
              this.chart = "bubble"
            }
              this.dataset = a;
              // this.currentParentId = a[0].parent_id;
              this.tree_level = a[0].tree_level - 1;
          }
      }
  }
});
new Vue({ el: '#scatter-chart' })
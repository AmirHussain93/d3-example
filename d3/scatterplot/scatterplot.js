Vue.component("scatter-plot-chart",{
    template: `<div id="scatter-load">
    </div>`,
    data() {
        return {
            chocolates:[{
                "name": "Dairy Milk",
                    "manufacturer": "cadbury",
                    "price": 45000,
                    "rating": 2
            }, {
                "name": "Galaxy",
                    "manufacturer": "Nestle",
                    "price": 42,
                    "rating": 3
            }, {
                "name": "Lindt",
                    "manufacturer": "Lindt",
                    "price": 80,
                    "rating": 4
            }, {
                "name": "Hershey",
                    "manufacturer": "Hershey",
                    "price": 4000,
                    "rating": 1
            }, {
                "name": "Dolfin",
                    "manufacturer": "Lindt",
                    "price": 90,
                    "rating": 5
            }, {
                "name": "Bournville",
                    "manufacturer": "cadbury",
                    "price": 70,
                    "rating": 2
            }],
            dataset: []
        }
    },
    mounted() {
        d3.json("scatterplot.json")
            .then((data) => {
                console.log("data", data)
                this.showScatterPlot(data);

            });

        
    },
    methods: {
        showScatterPlot(data) {
            console.log("data", data)
            data.map(l => {
                if(l.tree_level === 1) {
                    this.dataset.push({
                        "name": l.name,
                        "value": l.value,
                        "id": l.id,
                        "tree_level": l.tree_level
                    })
                }
            })
            var margins = {
                "left": 40,
                    "right": 30,
                    "top": 30,
                    "bottom": 30
            };
            
            var width = 375;
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
                .attr("y", height - 35)
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
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
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
                    console.log(d)
                });

            
        
            chocolateGroup.append("text")
                .style("text-anchor", "middle")
                .attr("dy", -10)
                .text(function (d) {
                    return d.name;
                });   
          
        }
    }
})

new Vue({ el: '#scatter-chart' })
var d3Scatter = {
    template: `<div id="scatter-load"></div>`,
    props: {
        dataset: Array,
        onCircleClick: Function
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
                d.value = +d.value; // calculate count as we iterate through the data
                d.enabled = true; // add enabled property to track which entries are checked
            });
        },
        renderChart(data) {
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
        },
        watch: {
            dataset(newValue) {
                d3.selectAll("#scatter-load svg").remove();
    
                console.log(newValue)
                console.log(this.dataset)
                this.updadeDateset();
                this.renderChart(this.dataset)
            }
        }
    }
}

Vue.component("d3-scatterchart-widget", {
    template: `<div class="d-scatter-w">
        <button class="b-btn" v-on:click="backClick">Go back</button>
        <d3-scatter v-bind:dataset="dataset" v-bind:onCircleClick="onCircleClick"/>
    </div>`,
    components: {
        d3Scatter
    },
    data() {
        return {
            dataset: [],
            ds: []
        }
    },
    mounted() {
        d3.json("scatterplot.json")
            .then((ds) => {
                console.log("data", ds)
                this.ds = ds;
                ds.forEach((d) => {
                    if (d.tree_level === 1) {
                        this.dataset.push({
                            'name': d.name,
                            'value': d.value,
                            'id': d.id,
                            'tree_level': d.tree_level
                        })
                    }
                });

            });
    },
    methods: {
        onCircleClick(d) {
            console.log('d', d);
            let a = this.ds.filter((ds) => {
                return ds.parent_id === d.data.id
            })
            // console.log('a', a);
            // a.length > 1 ? this.dataset = a : ''
            if (a.length > 1) {
                this.dataset = a
                this.currentParentId = d.data.parent_id;
                this.tree_level = d.data.tree_level;
            }
        },
        // backClick() {
        // 	console.log("pID", this.currentParentId, "trww_level", this.tree_level);
        //     let a = this.ds.filter((ds) => {
        //         return ds.tree_level === this.tree_level && (ds.tree_level === 1 || ds.parent_id === this.currentParentId)
        //     })
        //     console.log("a", a);
            
        //     if(a.length > 1){
        //         this.dataset = a;
        //         // this.currentParentId = a[0].parent_id;
        //         this.tree_level = a[0].tree_level;
        //     }
        // },
        backClick() {
        	console.log("pID", this.currentParentId, "trww_level", this.tree_level);
            let a = this.ds.filter((ds) => {
                return ds.tree_level === this.tree_level && (ds.tree_level === 1 || ds.parent_id === this.currentParentId)
            })
            console.log("a", a);
            
            if(a.length > 1){
                this.dataset = a;
                this.tree_level = a[0].tree_level - 1;
            }
        }
    }
});

new Vue({ el: '#scatter-chart' })
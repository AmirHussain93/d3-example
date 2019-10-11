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
            width: 450,
            height: 400,
            innerradius: 0,
            legendNo: 3,    // number of legends to display at a time
						legendCount: 0,  //To store number of legends
						color: d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c', '#e4651c']),
						regex: /[^A-Z0-9]+/ig,
						radius: 140,
						total: 0
        }
    },
    created() {

    },
    updated() {
			this.updadeDateset();
			this.renderChart(this.dataset);
    },
    mounted() {
			this.updadeDateset();
			this.renderChart(this.dataset)
    },
    method: {
			updadeDateset() {
				this.dataset.forEach((d) => {
						d.logValue = +d.logValue; // calculate count as we iterate through the data
						d.enabled = true; // add enabled property to track which entries are checked
						// console.log(parseInt(d.logValue));
				});
			},
			renderChart(dataset) {
				//creating svg element	and appending to body
				var svg = d3.select("#d3-chart")
										.append("svg")
										.attr("width", this.width)
										.attr("height", this.height)
										.append("g")
										.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

				//creating start and end angle for each arc
				var pie = d3.pie()
										.value(function (d) {
											return d.logValue;
										})
										.sort(null);
		
				//creating the arcs based on pie layout
				var arc = d3.arc()		//inner arc with color					
										.innerRadius(this.innerradius) // NEW
										.outerRadius(this.radius);

				var arcOver = d3.arc()
												.innerRadius(this.innerradius)
												.outerRadius(140 + 10);
							
				//calculate the total to display in hole
				dataset.forEach(function(d) {
					d.value;
					this.total +=parseInt(d.value);
					this.legendCount++;
				});

				var path = svg.selectAll('path')
              .data(pie(dataset))
              .enter()
              .append('path')
              .attr('d', arc)
              .attr('fill', function (d, i) {
                  return color(d.data.name);
              })
              .attr('id', function (d) {
                  return d.data.name.replace(regex, '');
              })
              .each(function (d) {
                  this._current = d;
              });
			}
    }
}

Vue.component("chart", {
    template: `<div class="d-pie-w">
                <button v-on:click="backClick">Go Back</button>
                <button v-on:click="chart='pie'">Pie</button>
                <div v-if="chart==='pie'">
                    <d3-pie v-bind:dataset="dataset" v-bind:onClick="onClick"/>
                </div>
                
              </div>`,
    components: {
        d3Pie
    },
    data() {
        return {
            chart: 'pie',
            ds: [],
            dataset: []
        }
    },
    mounted() {
      d3.json("../drilldown/pie.json")
        .then((res) => {
            console.log("shd", res)
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
        
    },
    methods: {
        onClick(d) {
          console.log('d-----', d)
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
            console.log("TREE level", this.tree_level, "current parent id ---", this.currentParentId)
        },
        backClick() {
          console.log("currentParentId ---", this.currentParentId, "trww_level", this.tree_level);
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
  new Vue({ el: '#load-chart' })
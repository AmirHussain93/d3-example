new Vue({
    el: '#line-chart',
    mounted () {
        var tooltip = d3.select('#line-chart')
            .append('div')
            .attr('class', 'tooltip');

        tooltip.append('div')
            .attr('class', 'label');

        tooltip.append('div')
            .attr('class', 'count');

        tooltip.append('div')
            .attr('class', 'percent');

            d3.csv('weekdays.csv')
                .then(function(dataset) {
                    dataset.forEach(function(d) {
                        d.count = +d.count;
                        d.enabled = true;
                    });

            var pie = d3.pie()
                .value(function(d) {
                    return d.count;
                })
                .sort(null);

            var path = svg.selectAll('path')
                .data(pie(dataset))
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', function(d, i) {
                    return color(d.data.label);
                })
                .each(function(d) {
                    this._current = d;
                });

            var legendRectSize = 18;

            var legendSpacing = 4;

            var legend = svg.selectAll('.legend')
                .data(color.domain())
                .enter()
                .append('g')
                .attr('class', 'legend')
                .attr('transform', function(d, i) {
                    var height = legendRectSize + legendSpacing;
                    var offset = height * color.domain().length / 2;
                    var horz = -2 * legendRectSize;
                    var vert = i * height - offset;
                    return 'translate(' + horz + ',' + vert + ')';
                });

            legend.append('rect')
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .style('fill', color)
                .style('stroke', color)
                .on('click', function(label) {
                    console.log("label-----", label);
                    console.log("d3.select(this)-----", d3.select(this));

                    var rect = d3.select(this);
                    var enabled = true;
                    var totalEnabled = d3.sum(dataset.map(function(d) {
                        return (d.enabled) ? 1 : 0;
                    }));
                    console.log("totalenabled-----------------", totalEnabled);

                    console.log("condition", rect.attr('class'), 'disabled')
                    if (rect.attr('class') === 'disabled') {
                        console.log("condition", rect.attr('class'), 'disabled')
                        console.log("if fired------")
                        rect.attr('class', '');
                    } else {
                        if (totalEnabled < 2) return;
                        rect.attr('class', 'disabled');
                        enabled = false;
                    }
                    console.log("condition", rect.attr('class'), 'disabled')


                    pie.value(function(d) {
                        if (d.label === label) d.enabled = enabled;
                        return (d.enabled) ? d.count : 0;
                    });

                    path = path.data(pie(dataset));

                    path.transition()
                        .duration(750)
                        .attrTween('d', function(d) {
                            console.log('d', d);
                            var interpolate = d3.interpolate(this._current, d);
                            this._current = interpolate(0);
                            return function(t) {
                                return arc(interpolate(t));
                            };
                        });
                });

            legend.append('text')
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .text(function(d) {
                    return d;
                });

            path.on('mouseover', function(d) {
                var total = d3.sum(dataset.map(function(d) {
                    return (d.enabled) ? d.count : 0;
                }));

                var percent = Math.round(1000 * d.data.count / total) / 10;
                tooltip.select('.label').html(d.data.label);
                tooltip.select('.count').html(d.data.count);
                tooltip.select('.percent').html(percent + '%');
                tooltip.style('display', 'block');
            });
            path.on('mouseout', function() {
                tooltip.style('display', 'none');
            });

            path.on('mousemove', function(d) {
                tooltip.style('top', (d3.event.pageY + 10) + 'px')
                    .style('left', (d3.event.pageX + 10) + 'px');
            });// data is now whole data set
                    // draw chart in here!
                })
                .catch(function(error){
                    // handle error   
                })
        // d3.csv('weekdays.csv', function(error, dataset) {
            


        // });

        var width = 360;
        var height = 360;
        var radius = Math.min(width, height) / 2;
        var color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);

        var svg = d3.select('#line-chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' +
                (width / 2) + ',' + (height / 2) + ')');

        var donutWidth = 75;

        var arc = d3.arc()
            .innerRadius(radius-donutWidth) // NEW
            .outerRadius(radius);
    },
    data() {
      return {
            data: [],
            width: 960,
            height: 500 
        }
    },
    methods: {
      
   },
   
  })
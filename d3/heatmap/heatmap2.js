//pagination variables
var current_page = 1;
var records_per_page = 40;
var newData;
var paginationData;
var groupByData;

// set the dimensions and margins of the graph
var margin = {top: 80, right: 25, bottom: 30, left: 40},
  width = 850 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

d3.json("map.json")
    .then(function(data) {
        paginationData = data;
        groupByData = groupBy(data, 'commonName');
        console.log("groupByData", groupByData);

        var current = Paginator(groupByData, 1, 40)
        console.log(current)
        generateChart(current);
    })
function groupBy(d, key) {
    console.log("d---", d, key)
  return groupByMerge(d.reduce(function(o, x) {
    (o[x[key]] = o[x[key]] || []).push(x);
    return o;
  }, {}))
}
function groupByMerge(o){
    console.log('ooo',o)
    return Object.keys(o).map(function(k){
        return o[k];
    });
}
function generateChart(res) {
    // Labels of row and columns -> unique identifier of the column called 'commonName' and 'strId'
    var myGroups = d3.map(res.data, function(d){return d.commonName;}).keys()
    var myVars = d3.map(res.data, function(d){return d.strId;}).keys()

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Build X scales and axis:
    var x = d3.scaleBand()
              .range([ 0, width ])
              .domain(myGroups)
              .padding(0.05);

    svg.append("g")
      .style("font-size", 9)
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSize(10).tickFormat(d => d.length > 7 ? d.slice(0,5) + '...' : d))
      .selectAll("text")	
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-25)")
      .select(".domain").remove()

    // Build Y scales and axis:
    var y = d3.scaleBand()
      .range([ height, 0 ])
      .domain(myVars)
      .padding(0.05);

    svg.append("g")
      .style("font-size", 12)
      .call(d3.axisLeft(y).tickSize(0))
      .select(".domain").remove()

    // Build color scale
    var myColor = d3.scaleSequential()
      .interpolator(d3.interpolateInferno)
      .domain([1,100])

    // create a tooltip
    var tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("width", "200px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
    tooltip.style("opacity", 1)
        d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    }
    var mousemove = function(d) {
    tooltip.html(d.strId +"<br>"+ d.commonName +"<br>Activity value: " + d.activityValue)
        .style("left", (d3.mouse(this)[0]+70) + "px")
        .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function(d) {
    tooltip.style("opacity", 0)
        d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }

    // add the squares
    svg.selectAll()
    .data(res.data, function(d) {return d.commonName+':'+d.strId;})
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.commonName) })
    .attr("y", function(d) { return y(d.strId) })
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    // .attr("width", "40px")
    // .attr("height", "40px")
    .style("fill", function(d) { return myColor(d.activityValue)} )
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
}

function prevPage() {
    if (current_page > 1) {
        current_page--;
        d3.selectAll("#my_dataviz svg").remove();
        var prev = Paginator(groupByData, current_page, 40)
        generateChart(prev);
    }
}

function nextPage() {
    if (current_page < numPages()) {
        current_page++;
        d3.selectAll("#my_dataviz svg").remove();
        var next = Paginator(groupByData, current_page, 40)
        generateChart(next);
    }
}

function changePage(page, data) {
    var btn_next = document.getElementById("btn_next");
    var btn_prev = document.getElementById("btn_prev");
    var page_span = document.getElementById("page");

    // Validate page
    if (page < 1) page = 1;
    if (page > numPages()) page = numPages();

    for (var i = (page-1) * records_per_page; i < (page * records_per_page) && i < data.length; i++) {
        newData.push(data[i]);
    }

    page_span.innerHTML = page + "/" + numPages();

    if (page == 1) {
        btn_prev.style.visibility = "hidden";
    } else {
        btn_prev.style.visibility = "visible";
    }

    if (page == numPages()) {
        btn_next.style.visibility = "hidden";
    } else {
        btn_next.style.visibility = "visible";
    }
}

function Paginator(items, page, per_page) {
    var page = page || 1,
    per_page = per_page || 10,
    offset = (page - 1) * per_page,
   
    paginatedItems = items.slice(offset).slice(0, per_page),
    total_pages = Math.ceil(items.length / per_page);
    paginatedItems = paginatedItems.flat();

    return {
    page: page,
    per_page: per_page,
    pre_page: page - 1 ? page - 1 : null,
    next_page: (total_pages > page) ? page + 1 : null,
    total: items.length,
    total_pages: total_pages,
    data: paginatedItems
    };
  }
function numPages() {
    // console.log(paginationData)
    // return Math.ceil(paginationData.length / records_per_page);
    return Math.ceil(groupByData.length / records_per_page);
}

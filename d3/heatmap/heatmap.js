//pagination variables
var current_page = 1;
var records_per_page = 40;
var newData;
var paginationData;
var groupByData;
var data1;

var itemSize = 22,
    cellSize = itemSize - 1,
    margin = {top: 120, right: 20, bottom: 20, left: 110};
                     
var width = 750 - margin.right - margin.left,
    height = 300 - margin.top - margin.bottom;

  
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
  // console.log("d---", d, key)
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
  // console.log(res)
    data1 = res.data.map(function( item ) {
    var newItem = {};
    newItem.commonName = item.commonName;
    newItem.strId = item.strId;
    newItem.activityValue = item.activityValue;
      
    return newItem;
})

var x_elements = d3.set(data1.map(function( item ) { return item.commonName; } )).values(),
      y_elements = d3.set(data1.map(function( item ) { return item.strId; } )).values();

var xScale = d3.scaleBand()
               .domain(x_elements)
               .range([0, x_elements.length * itemSize]);

var xAxis = d3.axisBottom()
    .scale(xScale)
    .tickFormat(function (d) {
        return d.length > 5 ? d.slice(0, 4) + '...' : d;
})
               
var yScale = d3.scaleBand()
    .domain(y_elements)
    .range([0, y_elements.length * itemSize]);
              
var yAxis = d3.axisLeft()
    .scale(yScale)
    .tickFormat(function (d) {
        return d;
})
               
var colorScale = d3.scaleThreshold().domain([0.001, 10, 25, 50]).range(["#2980B9", "#E67E22", "#27AE60", "#27AE60", "#000000"]);

var svg = d3.select('.heatmap')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// create a tooltip
var tooltip = d3.select(".heatmap")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
  tooltip.style("opacity", 1)
  d3.select(this)
  .style("stroke", "black")
  .style("opacity", 1)
}
var mousemove = function(d) {
  tooltip.html("Activity value: " + d.activityValue + "<br> Name : " +d.commonName)
  .style("left", (d3.mouse(this)[0]+70) + "px")
  .style("top", (d3.mouse(this)[1]) + "px")
}
var mouseleave = function(d) {
  tooltip.style("opacity", 0)
  d3.select(this)
  .style("stroke", "none")
  .style("opacity", 0.8)
}
               
var cells = svg.selectAll('rect')
               .data(data1)
               .enter().append('g').append('rect')
               .attr('class', 'cell')
               .attr('width', cellSize)
               .attr('height', cellSize)
               .attr('y', function(d) { 
                 return yScale(d.strId); 
                })
               .attr('x', function(d) { 
                  return xScale(d.commonName); 
                })
               .attr('fill', function(d) { return colorScale(d.activityValue); })
               .on("mouseover", mouseover)
               .on("mousemove", mousemove)
               .on("mouseleave", mouseleave);
               
            svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
              .selectAll('text')
              .attr('font-weight', 'normal');
               
  
            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + (y_elements.length * itemSize) + ")")
              .call(xAxis)
              .selectAll('text')
              .attr('font-weight', 'normal')
              .style("text-anchor", "start")
              .attr("dx", ".8em")
              .attr("dy", ".5em")
              .attr("transform", function (d) {
                    return "rotate(65)";
              });
  
}

function prevPage() {
  if (current_page > 1) {
      current_page--;
      d3.selectAll(".heatmap svg").remove();
      var prev = Paginator(groupByData, current_page, 40)
      generateChart(prev);
  }
}
    
function nextPage() {
  if (current_page < numPages()) {
      current_page++;
      d3.selectAll(".heatmap svg").remove();
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
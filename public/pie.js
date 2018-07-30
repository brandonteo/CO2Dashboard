// Initialize piechart onto SVG canvas
function placePie(width, height) {
    var pie = d3.select("#pie")
                    .attr("width", width)
                    .attr("height", height);
  
    // Need to place piechart in the middle of the SVG element
    pie.append("g")
        .attr("transform", "translate(" + width / 2 + ", " + (height / 2 + 10) + ")")
        .classed("chart", true);
  
    // Add title element to the piechart
    pie.append("text")
        .attr("x", width / 2)
        .attr("y", "1em")
        .attr("font-size", "1.5em")
        .style("text-anchor", "middle")
        .classed("pie-title", true);
}
  
// Updates piechart element given inputs
function updatePie(data, currentYear) {
    var pie = d3.select("#pie");

    // Extract subset of row from `data` matching `currentYear`
    var yearData = data.filter(function(d) {return d.year === currentYear});

    // Extract the set of continents from `yearData`
    var continents = [];
    for (var i = 0; i < yearData.length; i++) {
        var continent = yearData[i].continent;
        if (!continents.includes(continent)) {
            continents.push(continent);
        }
    }

    var colorScale = d3.scaleOrdinal()
                       .domain(continents)
                       .range(["#ab47bc", "#7e57c2", "#26a69a", "#42a5f5", "#78909c"]);

    var arcsGenerator = d3.pie()
                          .sort(function(a,b) { // Sort function so that the piechart colors get grouped
                              if (a.continent < b.continent) return -1;
                              if (a.continent > b.continent) return 1;
                              return a.emissions - b.emissions;
                          })
                          .value(function(d) {return d.emissions});

    var arcs = arcsGenerator(yearData);
  
    var path = d3.arc()
                 .outerRadius(Number(pie.attr("height") / 2 - 50))
                 .innerRadius(0);

    // Standard update pattern
    // Step 1
    var updates = pie.select(".chart")
                     .selectAll(".arc")
                     .data(arcs);
  
    // Step 2
    updates.exit()
           .remove();
  
    // Step 3
    updates.enter()
           .append("path")
             .classed("arc", true)
             .attr("stroke", "#dff1ff")
             .attr("stroke-width", "0.25px")
           .merge(updates) // Step 4
             .attr("fill", d => colorScale(d.data.continent))
             .attr("d", path);
  
    // Update piechart title corr. to `currentYear`
    pie.select(".pie-title")
        .text("Total emissions by continent and region, " + currentYear);
}
  
  
  
  
  
  
  
  
  
  
  
  
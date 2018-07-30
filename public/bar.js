// Initialize barchart onto SVG canvas
function placeBar(width, height) {
    var bar = d3.select("#bar")
                  .attr("width", width)
                  .attr("height", height);
  
    // Attach x-axis to chart
    bar.append("g")
       .classed("x-axis", true);
  
    // Attach y-axis to chart
    bar.append("g")
       .classed("y-axis", true);
  
    // Attach y-axis label to chart
    bar.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", - height / 2)
        .attr("dy", "2em")
        .style("text-anchor", "middle")
        .style("font-size", "1em")
        .classed("y-axis-label", true);
  
    // Attach title to chart
    bar.append("text")
        .attr("x", width / 2)
        .attr("y", "1em")
        .attr("font-size", "1.5em")
        .style("text-anchor", "middle")
        .classed("bar-title", true);
}

// Updates barchart element given selected `country` from map element
function updateBar(data, dataType, country) {
    var bar = d3.select("#bar");
    
    var padding = {top: 30, right: 30, bottom: 30, left: 110};
    var barPadding = 1;
    var width = Number(bar.attr("width"));
    var height = Number(bar.attr("height"));

    // Extract subset of row from `data` matching `country`
    var countryData = data.filter(function(d) {return d.country === country;})
                          .sort((a, b) => a.year - b.year);
  
    var xScale = d3.scaleLinear()
                   .domain(d3.extent(data, function(d) {return d.year;}))
                   .range([padding.left, width - padding.right]);
  
    var yScale = d3.scaleLinear()
                   .domain([0, d3.max(countryData, function(d) {return d[dataType];})])
                   .range([height - padding.bottom, padding.top]);
  
    // Set the width of each bar using xScale
    var barWidth = xScale(xScale.domain()[0] + 1) - xScale.range()[0];
  
    // Execute x-axis
    d3.select(".x-axis")
        .attr("transform", "translate(0, " + (height - padding.bottom) + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format(".0f")));
  
    // Execute y-axis
    d3.select(".y-axis")
        .attr("transform", "translate(" + (padding.left - barWidth / 2) + ",0)")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(yScale));
  
    // Set axis label based on selected radio buttons `dataType`
    var axisLabel = (dataType === "emissions") ? "CO2 emissions, thousand metric tons" : "CO2 emissions, metric tons per capita";
    d3.select(".y-axis-label")
      .text(axisLabel);

    // Set barchart title based on selected `country`
    var barTitle = country ? "CO2 Emissions, " + country : "Click on a country to see annual trends.";
    d3.select(".bar-title")
      .text(barTitle);
  
    // Setup barchart transitions
    var t = d3.transition()
              .duration(1000)
  
    // Standard update pattern
    // Step 1
    var updates = bar.selectAll(".bar")
                     .data(countryData);
  
    // Step 2
    updates.exit()
             .transition(t)
             .attr("y", height - padding.bottom)
             .attr("height", 0)
           .remove();
  
    // Step 3
    updates.enter()
             .append("rect")
             .classed("bar", true)
             .attr("y", height - padding.bottom)
             .attr("height", 0)
           .merge(updates) // Step 4
             .attr("x", function(d) {return (xScale(d.year) + xScale(d.year - 1)) / 2;})
             .attr("width", barWidth - barPadding)
             .transition(t)
             .attr("y", function(d) {return yScale(d[dataType]);})
             .attr("height", function(d) {return height - padding.bottom - yScale(d[dataType]);});
}

// Function to highlight the bars that corr. to `year`
function highlightBars(year) {
    d3.select("#bar")
      .selectAll("rect")
      .attr("fill", function(d) {return (d.year === year) ? "#16a085" : "#1abc9c"});
}
  
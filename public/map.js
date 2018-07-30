// Initialize map onto SVG canvas
function placeMap(width, height) {
    d3.select("#map")
        .attr("width", width)
        .attr("height", height)
      .append("text")
        .attr("x", width / 2)
        .attr("y", "1em")
        .attr("font-size", "1.5em")
        .style("text-anchor", "middle")
        .classed("map-title", true);
}

// Updates map element given inputs
function updateMap(geoData, climateData, year, dataType) {
    var map = d3.select("#map");
  
    var projection = d3.geoMercator()
                       .scale(110)
                       .translate([
                         Number(map.attr("width") / 2),
                         Number(map.attr("height") / 1.4)
                       ]);
  
    var path = d3.geoPath()
                 .projection(projection);
  
    // Updates display year value in title
    d3.select("#year-val").text(year);
  

    geoData.forEach(function(d) {
      // Find `climateData` rows that corr. to the same country id
      var matchingClimateObjs = climateData.filter(row => row.countryCode === d.id);

      // Extract country name from the first entry if it exists
      var countryName = '';
      if (matchingClimateObjs.length > 0) countryName = matchingClimateObjs[0].country;

      // We only want the `climateData` row that corr. to the input `year`
      d.properties = matchingClimateObjs.find(function(c) {return c.year === year;}) || { country: name };
    });
  
    // Range for mapColorScale
    var colors = ["#f1c40f", "#e67e22", "#e74c3c", "#c0392b"];
  
    // Domain for mapColorScale
    var domains = {
      emissions: [0, 2.5e5, 1e6, 5e6],
      emissionsPerCapita: [0, 0.5, 2, 10]
    };
  
    var mapColorScale = d3.scaleLinear()
                          .domain(domains[dataType]) // Grabs the correct domain based on `dataType`
                          .range(colors);
  
    // Standard update pattern
    // Step 1
    var updates = map.selectAll(".country")
                    .data(geoData);
  
    // Step 2 - nothing to remove from `exit()`
          
    // Step 3
    updates
      .enter()
      .append("path")
        .classed("country", true)
        .attr("d", path)
      .merge(updates) // Step 4
        .transition()
        .duration(400)
        .attr("fill", function(d) {
          var val = d.properties[dataType];
          return val ? mapColorScale(val) : "#ccc";
        });
  
    // Updates map title according to input `year`
    d3.select(".map-title")
        .text("Carbon dioxide " + lower(dataType) + ", " + year);
}

// Helper function to change `str` into lowercase
function lower(str) {
    return str.replace(/[A-Z]/g, c => " " + c.toLowerCase());
}
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
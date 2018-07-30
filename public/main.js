// Formatter to process input rows of csv data
function csvFormatter(row) {
    return {
        continent: row.Continent,
        country: row.Country,
        countryCode: row["Country Code"],
        emissions: Number(row["Emissions"]),
        emissionsPerCapita: Number(row["Emissions Per Capita"]),
        region: row.Region,
        year: Number(row.Year)
    };
}

d3.queue()
  .defer(d3.json, "//unpkg.com/world-atlas@1.1.4/world/50m.json")
  .defer(d3.csv, "./data/all_data.csv", csvFormatter)
  .await(function(error, mapData, data) {
      if (error) throw error;

      // Get min & max year
      var extremeYears = d3.extent(data, function(d) {return d.year;});
      var currentYear = extremeYears[0];  

      // Get the data-type, i.e. emissions OR emissions per capita from radio buttons
      var currentDataType = d3.select('input[name="data-type"]:checked')
                              .attr("value");

      // Convert `mapData` into valid geoJson
      var geoData = topojson.feature(mapData, mapData.objects.countries).features;

      // Setup SVG canvas
      var width = Number(d3.select(".chart-container").node().offsetWidth);
      var height = 300;

      // Attach map onto SVG canvas and update the map with data based on current input
      placeMap(width, width * 4 / 5);
      updateMap(geoData, data, currentYear, currentDataType);

      // Attach piechart onto SVG canvas and update the piechart with data based on current input
      placePie(width, height);
      updatePie(data, currentYear);

      // Attach barchart onto SVG canvas and update the piechart
      placeBar(width, height);
      updateBar(data, currentDataType, "");

      // Attach input listener onto slider
      d3.select("#year")
          .property("min", currentYear)
          .property("max", extremeYears[1])
          .property("value", currentYear)
          .on("input", function() {
              // On sliding, call update SVG elements
              currentYear = Number(d3.event.target.value);
              updateMap(geoData, data, currentYear, currentDataType);
              updatePie(data, currentYear);
              highlightBars(currentYear);
          });

      // Attach change listener onto radio button selector
      d3.selectAll('input[name="data-type"]')
          .on("change", function() {
              // On radio button change, only update map and bars
              currentDataType = d3.event.target.value;
              updateMap(geoData, data, currentYear, currentDataType);
              updateBar(data, currentDataType, country);
          });

    
      // Updates tooltips 
      function updateTooltip() {
          var tooltip = d3.select(".tooltip");

          // Determine the mouseover target
          var tgt = d3.select(d3.event.target);
          var isCountry = tgt.classed("country");
          var isBar = tgt.classed("bar");
          var isArc = tgt.classed("arc");

          // Assign data based on what was hovered over
          var data;
          var percentage = "";
          if (isCountry) data = tgt.data()[0].properties;
          if (isBar) data = tgt.data()[0];
          if (isArc) {
            data = tgt.data()[0].data;
            percentage = `<p>Percentage of total: ${getPercentage(tgt.data()[0])}</p>`;
          }

          // Setup correct units based on `dataType`
          var dataType = d3.select("input:checked")
                           .property("value");
          var units = (dataType === "emissions") ? "thousand metric tons" : "metric tons per capita";

          // Tooltip basic styling for active hover
          tooltip.style("opacity", Number(isCountry || isArc || isBar))
                 .style("left", (d3.event.pageX - tooltip.node().offsetWidth / 2) + "px")
                 .style("top", (d3.event.pageY - tooltip.node().offsetHeight - 10) + "px");

          // Display information for active hovers
          if (data) {
              var dataValue = (data[dataType]) ? data[dataType].toLocaleString() + " " + units : "Data Not Available";
              tooltip.html(`
                             <p>Country: ${data.country}</p>
                             <p>Emissions: ${dataValue}</p>
                             <p>Year: ${data.year || d3.select("#year").property("value")}</p>
                             ${percentage}
                          `)
          }
      }

      // Attach mouseover events onto SVG canvas
      d3.selectAll("svg").on("mousemove touchmove", updateTooltip);
  });


// Calculate percentages using piechart arcs
function getPercentage(d) {
    var angle = d.endAngle - d.startAngle;
    var fraction = 100 * angle / (Math.PI * 2);
    return fraction.toFixed(2) + "%";
}

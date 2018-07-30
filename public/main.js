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

    placePie(width, height);
    updatePie(data, currentYear);

    // Attach input listener onto slider
    d3.select("#year")
        .property("min", currentYear)
        .property("max", extremeYears[1])
        .property("value", currentYear)
        .on("input", function() {
            // On sliding, call `updateMap` with `currentYear`
            currentYear = Number(d3.event.target.value);
            updateMap(geoData, data, currentYear, currentDataType);
            updatePie(data, currentYear);
        });

    // Attach change listener onto radio button selector
    d3.selectAll('input[name="data-type"]')
        .on("change", function() {
          currentDataType = d3.event.target.value;
          updateMap(geoData, data, currentYear, currentDataType);
        });
  });
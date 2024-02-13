// Get the dataset
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Assign coordinates and zoom level
let coordi = [33.8308334, -115.7938309];
let zoomLevel = 5;

// Function for markers and popup
function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p>`);
}

// Function to link marker size to magnitude. Multiply magnitude to make marker more visible
function getSize(mag) {
    let radius = mag * 3;
    return radius;
}

// Function to link marker color to the depth
function getColor(depth) {
    let color = "#00FF00";
    if (depth >= 90) {
        color = "#921C00";
    } else if (depth >= 70) {
        color = "#EA5F00";
    } else if (depth >= 50) {
        color = "#FFAD5B";
    } else if (depth >= 30) {
        color = "#F1C341";
    } else if (depth >= 10) {
        color = "#D6EF85";
    }
    return color;
}

// Create the function that makes the geojson layer
function createFeatures(earthquakeData) {
    let earthquakes = L.geoJSON(earthquakeData, {
        // Change standard maker to a circle and set radius to magnitude and color to depth
        pointToLayer: function (feature, latlng) {
            return new L.CircleMarker(latlng, {
                radius: getSize(feature.properties.mag),
                fillColor: getColor(feature.geometry.coordinates[2]),
                fillOpacity: 1,
                stroke: false
            });
        },
        onEachFeature: onEachFeature
    });
    createMap(earthquakes);
}

// Create the function that makes the map
function createMap(earthquakes) {
    let streetLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    );
    let myMap = L.map("map", {
        center: coordi,
        zoom: zoomLevel,
        layers: [streetLayer, earthquakes]
    });
    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");
        let limits = [-10, 10, 30, 50, 70, 90];

        let legendInfo = "<h4>Depth of <br>Earthquake</h4>";
        div.innerHTML = legendInfo;

        // loop through our depth intervals and generate a label with a colored square for each interval
        for (var i = 0; i < limits.length; i++) {
            div.innerHTML +=
                '<li style="background-color:' + getColor(limits[i] + 1) + '"></li> ' +
                limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
        }
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
}

// Use d3 to read the json data.
d3.json(url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    console.log(data);
    createFeatures(data.features);
});

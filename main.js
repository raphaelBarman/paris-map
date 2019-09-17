mapboxgl.accessToken = 'pk.eyJ1IjoicmFwaGFlbGJhcm1hbiIsImEiOiJjanR2emFpcDAxdzRtNDRwY2s5ZjdyOWZuIn0.3oA9tF27p0sOAK3rr-21cQ';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    style: 'mapbox://styles/raphaelbarman/cjxpr36xf3oam1cqnpc2hwh06', // stylesheet location
    center: [2.33, 48.85], // starting position [lng, lat]
    zoom: 13 // starting zoom
});

function debounce(fn, ms) {
    let timer = 0;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(fn.bind(this, ...args), ms || 0);
    }
}

var client = new elasticsearch.Client({
    host: 'http://iccluster036.iccluster.epfl.ch:9200',
    //            log: 'trace'
});

map.addControl(new mapboxgl.NavigationControl());

function constructQuery(precision, bounds, size, year = -1, searchQuery = "") {

    if (searchQuery) {
        searchQuery = {
            "multi_match": {
                query: searchQuery,
                type: "phrase_prefix",
                "fields": ["Nom", "Métier"]
            }
        };
    } else {
        searchQuery = {
            match_all: {}
        };
    }

    var yearQuery = {
        range : {
            "annee": {
                gte: 1839,
                lte: 1922
            }
        }
    };

    if (year != -1) {
        yearQuery = {
            range : {
                "annee": {
                    gte: year,
                    lte: year
                }
            }
        };
    }

    var query = {
        "index": "paris",
        "body": {
            "size": size,
            "query": {
                "bool": {
                    "must": [
                        searchQuery,
                        yearQuery
                    ],
                    "filter": {
                        "geo_bounding_box": {
                            "location": {
                                "top_left": {
                                    lat: bounds.getNorthWest().lat,
                                    lon: bounds.getNorthWest().lng
                                },
                                "bottom_right": {
                                    lat: bounds.getSouthEast().lat,
                                    lon: bounds.getSouthEast().lng,
                                }

                            }
                        }
                    }
                }
            },
            "aggregations": {
                "zoom": {
                    "filter": {
                        "geo_bounding_box": {
                            "location": {
                                "top_left": {
                                    lat: bounds.getNorthWest().lat,
                                    lon: bounds.getNorthWest().lng
                                },
                                "bottom_right": {
                                    lat: bounds.getSouthEast().lat,
                                    lon: bounds.getSouthEast().lng,
                                }

                            }
                        }
                    },
                    "aggregations": {
                        "zoom1": {
                            "geohash_grid": {
                                "field": "location",
                                "precision": precision
                            }
                        }
                    }
                }
            }
        }
    };


    return query;

}

function isWithin(b1, b2) {
    b1 = turf.bboxPolygon([b1.getWest(), b1.getSouth(), b1.getEast(), b1.getNorth()]);
    b2 = turf.bboxPolygon([b2.getWest(), b2.getSouth(), b2.getEast(), b2.getNorth()]);
    return turf.area(turf.union(b1, b2)) == turf.area(b2);
}

function getPrecision(zoom) {
    var precision = 6;

    if (zoom >= 20) {
        precision = 10;
    } else if (zoom >= 18) {
        precision = 9;
    } else if (zoom >= 15) {
        precision = 8;
    } else if (zoom >= 13) {
        precision = 7;
    }
    return precision;
}


var prevPrecision = 0;
var prevBounds = map.getBounds();

var prevYear = 1839;
var prevSearch = "tailleur";
var currYear = -1;
var currSearch = "";

var isPlaying = false;
var isTime = true;


map.on('load', function() {


    map.addSource("richelieu", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: []
        },
        cluster: true,
        clusterMaxZoom: 21, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
        clusterProperties: {
            //sum: ["+", 0, ["get", "doc_count"]]
            "doc_count": [
                ["+", ["accumulated"],
                    ["get", "doc_count"]
                ],
                ["get", "doc_count"]
            ]
        }
    });


    function reloadData() {

        var precision = getPrecision(map.getZoom());
        var bounds = map.getBounds();

        if (prevYear === currYear &&
            prevSearch === currSearch &&
            precision === prevPrecision &&
            isWithin(bounds, prevBounds)
            ) {
            prevPrecision = precision;
            prevBounds = bounds;
            return;
        }

        prevPrecision = precision;
        prevBounds = bounds;
        prevYear = currYear;
        prevSearch = currSearch;

        var query = constructQuery(precision, bounds, 0, currYear, currSearch);

        client.search(query).then(function(resp) {
                var total_docs = resp.aggregations.zoom.doc_count;
                console.log(resp.aggregations.zoom.doc_count);
                if (total_docs < 10000) {
                    client.search(constructQuery(precision, bounds, total_docs, currYear, currSearch)).then(function(resp) {
                        var data = turf.featureCollection(resp.hits.hits.map(person => {
                            var infos = person._source;
                            return turf.point([infos.location.lon, infos.location.lat], {
                                "metier": infos['Métier'],
                                "nom": infos['Nom'],
                                "rue": infos['Rue'],
                                "numero": infos['Numéro'],
                                "annee": infos['annee'],
                                "document": infos['document'],
                                "page": infos['page'],
                                "doc_count": 1
                            });
                        }));
                        console.log(data);
                        map.getSource("richelieu").setData(data);
                    }, function(err) {
                        console.trace(err);
                    });
                } else {
                    var data = turf.featureCollection(
                        resp.aggregations.zoom.zoom1.buckets.map(
                            point => {
                                var center = geohash.decode(point.key);
                                return turf.point([center.longitude, center.latitude], {
                                    doc_count: point.doc_count
                                });
                            }
                        ));
                    map.getSource("richelieu").setData(data);
                }
            },
            function(err) {
                console.trace(err);
            });
    }

    reloadData();


    map.addLayer({
        id: "clusters",
        type: "circle",
        source: "richelieu",
        filter: [">", "doc_count", 1],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            "circle-color": [
                "interpolate-lab", ["linear"], ["get", "doc_count"],
                10,
                "#51bbd6",
                100,
                "#f1f075",
                750,
                "#f28cb1"
            ],
            "circle-radius": [
                "interpolate", ["linear"], ["get", "doc_count"],
                10, 15,
                30, 20,
                50, 25,
                100, 30,
                500, 35,
                1000, 40,
                10000, 45
                //"step", ["get", "doc_count"],
                //20,
                //100,
                //30,
                //750,
                //40
            ]
        }
    });

    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "richelieu",
        filter: [">", "doc_count", 1],
        layout: {
            "text-field": "{doc_count}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
        }
    });

    map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "richelieu",
        filter: ["==", "doc_count", 1],
        paint: {
            "circle-color": "#11b4da",
            "circle-radius": 4,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff"
        },
        "icon-allow-overlap": true,
        "text-allow-overlap": true
    });


    // inspect a cluster on click
    map.on('click', 'clusters', function(e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        if (!features[0].properties.cluster_id) {
            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: features[0].properties.doc_count > 1 ? map.getZoom() + 2 : map.maxZoom()
            });
            return;
        }

        var clusterId = features[0].properties.cluster_id;
        map.getSource('richelieu').getClusterExpansionZoom(clusterId, function(err, zoom) {
            if (err)
                return;

            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
            });
        });
    });

    map.on('mouseenter', 'clusters', function() {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function() {
        map.getCanvas().style.cursor = '';
    });

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false
    });

    map.on('mousemove', 'unclustered-point', e => {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['unclustered-point']
        });
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

        if (!features.length) {
            popup.remove();
            return;
        }

        var feature = features[0];

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(feature.geometry.coordinates)
            .setHTML(`<div class="card">
  <div class="card-body">
    <h5 class="card-title">${feature.properties.nom}</h5>
    <h6 class="card-subtitle mb-2 text-muted">${feature.properties.metier}</h6>
    <p class="card-text">${feature.properties.rue}, ${feature.properties.numero} <br>
${feature.properties.annee}
</p>
    <a target="_blank" rel="noopener noreferrer" href="https://gallica.bnf.fr/ark:/12148/${feature.properties.document}/f${feature.properties.page-doc2start[feature.properties.document]}.item.r=${feature.properties.nom}%20${feature.properties.metier}%20${feature.properties.rue}%20${feature.properties.numero}.zoom" class="card-link">Gallica</a>
  </div>
</div>`)
            //.setHTML("<h3>" + feature.properties.nom + "</h3> <p>" + feature.properties.metier + "<br>" + feature.properties.rue + ", " + feature.properties.numero + "<br>" + feature.properties.annee + "</p>")
            .addTo(map);
    });

    map.on('zoomend', e => {
        reloadData();
    });

    $('#range-year').range({
        min: 0,
        max: valid_years.length,
        start: 0,
        onChange: debounce(function(val) {
            currYear = valid_years[parseInt(val)];
            $("#year").html(currYear.toString());
            reloadData();
        }
                           ,100)});


    $("#feature-filter-name").on('input', debounce(function(e) {
        currSearch = e.target.value;
        reloadData();
    }, 800));

    let timer = 0;
    $("#play-button").on('click', function() {
        if (isPlaying) {
            clearInterval(timer);
            $("#play-icon").removeClass("fa-pause");
            $("#play-icon").addClass("fa-play");
        } else {
            timer = setInterval(function() {
                var currInterval = valid_years.indexOf(currYear);
                currInterval = (currInterval + 1) % valid_years.length;
                currYear = valid_years[currInterval];
                $('#range-year').range('set value', currInterval);
                $("#year").html(currYear.toString());
                reloadData();
            }, 900);
            $("#play-icon").removeClass("fa-play");
            $("#play-icon").addClass("fa-pause");
        }
        isPlaying = !isPlaying;
    });

    var savedInterval = 0;

    $("#disable-button").on('click', function() {
        // Disable time
        if (isTime) {
            savedInterval = valid_years.indexOf(currYear);
            currYear = -1;
            $("#disable-button").addClass("active");
            $("#range-year").addClass('disabled');
            $("#play-button").attr("disabled", "");
            reloadData();

        } else {
            currYear = valid_years[savedInterval];
            $("#disable-button").removeClass("active");
            $("#range-year").removeClass('disabled');
            $("#play-button").removeAttr("disabled");
            reloadData();
        }
        isTime = !isTime;
    });

});

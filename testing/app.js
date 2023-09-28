// Open a connection to IndexedDB
const dbName = "verygoodname";
const dbVersion = 1;
const INIT_VIEW = ["51"];
const CENTER_LAT = -80;
const CENTER_LONG = 38;
const HEIGHT_LL = 3;
const WIDTH_LL = 8;

const openDB = (storeName) => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(storeName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const objectStore = db.createObjectStore(storeName, { keyPath: "id" });
            objectStore.createIndex("data", "data", { unique: false });
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject("Error opening IndexedDB:", event.target.error);
        };
    });
};

// Function 1: Fetch JSON data from the URL
async function fetchData(url) {
    try {
      const response = await fetch(url); // Make the asynchronous request
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json(); // Parse JSON data
      return jsonData;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

const storeData = (storeName, id, data) => {
    console.log("Storing data: ");
    // console.log(JSON.stringify(data, null, 4)),
    // Save the data into IndexedDB
    openDB(storeName).then(db => {
        //const transaction = db.transaction([storeName], "readwrite");

        // Store values in the newly created objectStore.
        const objectStore = db
          .transaction(storeName, "readwrite")
          .objectStore(storeName);

        const request = objectStore.add({'id': id, 'data': data});

        request.onsuccess = function (evt) {
            // do something after the add succeeded
            return true;
        };

        // const store = transaction.objectStore(storeName);
        // const request = store.put({ 'id': id, 'data': data});

    })    
};

const initMap = (storeName) => {
    const mapBounds = [CENTER_LONG - HEIGHT_LL, CENTER_LAT  - WIDTH_LL, CENTER_LONG + HEIGHT_LL, CENTER_LAT + WIDTH_LL]

    // initialize the map; center around usa
    let map = L.map('map', {
            zoomSnap: 0.25
        }).setView([CENTER_LONG, CENTER_LAT], 6.5);

    openDB(storeName).then(db => {
        // get list of shapefile names
        fetchData('https://raw.githubusercontent.com/wanghalan/shapes/main/manifest.json')
        .then((data) => {
            const transaction = db.transaction([dbName], 'readonly');
            const store = transaction.objectStore(dbName);

            // load and render each path
            data.forEach((filename, index) => {
                let bgCode = filename.split('/').pop().slice(0, 5);

                // test if shape already stored in db
                const request = store.get(bgCode);
                request.onsuccess = function(event) {
                    if (!event.target.result) {
                        // data is not in indexedDB, fetch it and then render map
                        const url = 'https://raw.githubusercontent.com/wanghalan/shapes/main/' + filename;


                        fetchData(url)
                        .then(geos => storeData(dbName, bgCode, geos))
                        .catch(error => {
                            console.error('Error in the asynchronous process: ', error);});
                    }

                    renderMap(storeName, bgCode, map)
                }
            })
        })
    })

    // fetch("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json")
    //     .then(results => results.json())
    //     .then(data => {
    //         L.geoJson(data).addTo(map);
    //     });

    //map.on("zoom", changeView);

    function changeView(event) {
        let currZoom = map.getZoom();
        console.log(currZoom);
        if (currZoom > 8) {
            let currBounds = map.getBounds();

            // if works... move to own fn
            openDB(storeName).then(db => {
                fetchData('https://raw.githubusercontent.com/wanghalan/shapes/main/manifest.json')
                .then((data) => {
                    const transaction = db.transaction([dbName], "readonly");
                    const store = transaction.objectStore(dbName);

                    data.forEach((filename, index) => {
                        let bgCode = filename.split("/").pop().slice(0, 12);

                        const request = store.get(bgCode);
                        store.get(bgCode).onsuccess = function(event){
                            if (!event.target.result)  {
                                // Data is not in IndexedDB, fetch it and then render the map
                                console.log("Fetching data...");
                                const url = 'https://raw.githubusercontent.com/wanghalan/shapes/main/' + filename;

                                fetchData(url)
                                    .then(geos => storeData(dbName, bgCode, geos))
                                    //.then(geos => renderMap(dbName, bgCode))
                                    .catch(error => {
                                      // Handle errors if needed
                                      console.error('Error in the asynchronous process:', error);
                                    });        
                            }

                            //renderMap(storeName, bgCode, map)
                        };
                    })
                }).catch(error => {
                    console.error('Error in the asynchronous process:', error);
                });
            });
        }
    }

}

const renderMap = (storeName, id, map) => {
    console.log("Rendering", id);
    openDB(storeName).then(db => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.openCursor(id);

        request.onsuccess = (event) => {
            console.log("Successful request of " + id);

            const cursor = event.target.result;
            console.log("Cursor: " + cursor);

            if (cursor) {
                const key = cursor.primaryKey;
                const value = cursor.value;

                if (key !== undefined) {
                    console.log("Key: " + key);

                    let places = topojson.feature(value.data,value.data.objects.places);
                    let geo=L.geoJSON(places).addTo(map);
                    map.fitBounds(geo.getBounds());
                    //L.geoJson(value.data).addTo(map);
                }
                else{
                    console.log("Key is undefined");
                }
                cursor.continue();
            }
        };

        request.onerror = (event) => {
            console.error("Error accessing IndexedDB:", event.target.error);
        };   
    });
};

// Render the map using D3.js and the fetched data
// const renderMap = (storeName, id) => {
//     console.log("Rendering " + id);
//     openDB(storeName).then(db => {
//         const transaction = db.transaction(storeName, "readonly");
//         const store = transaction.objectStore(storeName);
//         const request = store.openCursor(id);
        
//         request.onsuccess = (event) => {
//             console.log("Successful request of "+ id);
//             const cursor = event.target.result;
//             console.log("cursor: "+ cursor);
//             if (cursor) {                
//                 const key = cursor.primaryKey;
//                 const value = cursor.value;

//                 if (key!==undefined){
//                     console.log("Key: " + key);
//                     // console.log(JSON.stringify(value, null, 4));
//                     // // Use D3.js to render the map with the fetched geojsonData
//                     // // This part depends on the specific structure of your GeoJSON data
//                     // // For example, if you have polygons:
//                     // console.log(JSON.stringify(value, null, 4));
//                     // console.log(value.data["features"][0]["geometry"]["coordinates"]);
//                     // console.log(value.data)

//                     let width = 800,
//                         height = 400;

//                     let projection = d3.geoMercator()
//                         .scale(5000)
//                         .translate([width / 2, height / 2])
//                         .center([-80, 37]);
//                     let geoGenerator = d3.geoPath().projection(projection);

//                     if (d3.select('#map-svg').size() === 0) {
//                         let svg = d3.select("#map").append("svg").attr("id", "map-svg").attr("preserveAspectRatio", "xMinYMin meet")
//                             .attr("viewBox", "0 0 " + width + " " + height).style("background","#c9e8fd")
//                             .classed("svg-content", true);
//                     }

//                     d3.select("#map-svg")//.append("svg")
//                         //.attr("width", "95%")
//                         //.attr("height", "95%")
//                         //.style("padding", "2.5%")
//                         .selectAll("npath")
//                         .data(value.data.features)
//                         //.enter()
//                         .join("path")
//                         .attr("d", geoGenerator)
//                         .style("fill", "steelblue")
//                         .style("stroke", "white")
//                         .on("click", handleClick);
    
//                 }else{
//                     console.log("Key is undefined");
//                 }
//                 cursor.continue();
//             }

//             // for testing
//             function handleClick(event, d, i) {
//                 d3.select("#summary-table").append("text").text(d.properties.ALAND20)
//             }

//         };

//         request.onerror = (event) => {
//             console.error("Error accessing IndexedDB:", event.target.error);
//         };
//     });

//     // projection.fitExtent([[100,100],[w-100,h-100]],map);
// };


// Main function to initialize the app
const initApp = () => {
    initMap(dbName);

    // openDB(dbName).then(db => {
    //     // clean this up...
    //     fetchData('https://raw.githubusercontent.com/wanghalan/shapes/main/manifest.json')
    //         .then((data) => {
    //             const transaction = db.transaction([dbName], "readonly");
    //             const store = transaction.objectStore(dbName);

    //             data.forEach((filename, index) => {
    //                 let bgCode = filename.split("/").pop().slice(0, 12)

    //                 // if not in initial view
    //                 if (!INIT_VIEW.includes(bgCode.slice(0, 2))) {
    //                     return;
    //                 }

    //                 const request = store.get(bgCode);
    //                 store.get(bgCode).onsuccess = function(event){
    //                     if (event.target.result) {
    //                         // Data is already in IndexedDB, render the map directly
    //                         console.log("Data is already in IndexedDB, render the map directly");
    //                         renderMap(dbName, bgCode);
    //                     } else {
    //                         // Data is not in IndexedDB, fetch it and then render the map
    //                         console.log("Fetching data...");
    //                         const url = 'https://raw.githubusercontent.com/wanghalan/shapes/main/' + filename;

    //                         fetchData(url)
    //                             .then(geos => storeData(dbName, bgCode, geos))
    //                             //.then(geos => renderMap(dbName, bgCode))
    //                             .catch(error => {
    //                               // Handle errors if needed
    //                               console.error('Error in the asynchronous process:', error);
    //                             });        
    //                     }
    //                 };
    //             })
    //         }).catch(error => {
    //             console.error('Error in the asynchronous process:', error);
    //         });
    // });

    // Check if the data is already in IndexedDB or fetch it if not
    // openDB(dbName).then(db => {
    //     const transaction = db.transaction([dbName], "readonly");
    //     const store = transaction.objectStore(dbName);
     
    //     const request = store.get("010010201001");

    //     request.onsuccess = (event) => {
    //         if (event.target.result) {
    //             // Data is already in IndexedDB, render the map directly
    //             console.log("Data is already in IndexedDB, render the map directly");
    //             renderMap(dbName, "010010201001");
    //         } else {
    //             // Data is not in IndexedDB, fetch it and then render the map
    //             console.log("Fetching data...");
    //             const url = 'https://raw.githubusercontent.com/wanghalan/shapes/main/data/01001/010010201001.geojson';
    //             fetchData(url)
    //             .then(data => storeData(dbName, "010010201001", data))
    //             .then(data => renderMap(dbName, "010010201001", data))
    //             .catch(error => {
    //               // Handle errors if needed
    //               console.error('Error in the asynchronous process:', error);
    //             });
                
    //         }
    //     };
    // });
};

// Initialize the app
initApp();

// Open a connection to IndexedDB
const dbName = "tigerDB";
const dbVersion = 1;

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore("tigerShapes", { keyPath: "id" });
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

const storeData = (id, data) => {
    console.log("Storing data: " + data);
    console.log(JSON.stringify(data, null, 4)),
    // Save the data into IndexedDB
    openDB().then(db => {
        const transaction = db.transaction(["tigerShapes"], "readwrite");
        const store = transaction.objectStore("tigerShapes");
        request = store.put({ id: id, data: data});
        request.onsuccess = function (evt) {
            // do something after the add succeeded
            return true;
        };
    })    
};


// Render the map using D3.js and the fetched data
const renderMap = (id, stored) => {
    console.log("Rendering " + id);
    openDB().then(db => {
        const transaction = db.transaction(["tigerShapes"], "readonly");
        const store = transaction.objectStore("tigerShapes");
        const request = store.openCursor(id);
        
        request.onsuccess = (event) => {
            console.log("Successful request of "+ id);
            const cursor = event.target.result;
            console.log("cursor: "+ cursor);
            if (cursor) {                
                const key = cursor.primaryKey;
                const value = cursor.value;

                if (key!==undefined){
                    console.log("Key: " + key);
                    // console.log(JSON.stringify(value, null, 4));
                    // // Use D3.js to render the map with the fetched geojsonData
                    // // This part depends on the specific structure of your GeoJSON data
                    // // For example, if you have polygons:
                    // console.log(JSON.stringify(value, null, 4));
                    console.log(value.data["features"][0]["geometry"]["coordinates"]);
                    d3.select("#map").append("svg")
                        .selectAll("Polygon")
                        .data(value.data["features"])
                        .enter().append("path")
                        .attr("d", d3.geoPath())
                        .style("fill", "steelblue")
                        .style("stroke", "white");      
                }else{
                    console.log("Key is undefined");
                }
                cursor.continue();
            }
        };

        request.onerror = (event) => {
            console.error("Error accessing IndexedDB:", event.target.error);
        };
    });

    // projection.fitExtent([[100,100],[w-100,h-100]],map);
};

// Main function to initialize the app
const initApp = () => {
    // Check if the data is already in IndexedDB or fetch it if not
    openDB().then(db => {
        const transaction = db.transaction(["tigerShapes"], "readonly");
        const store = transaction.objectStore("tigerShapes");
        const request = store.get("010010201001");

        request.onsuccess = (event) => {
            if (event.target.result) {
                // Data is already in IndexedDB, render the map directly
                console.log("Data is already in IndexedDB, render the map directly");
                renderMap("010010201001");
            } else {
                // Data is not in IndexedDB, fetch it and then render the map
                console.log("Fetching data...");
                const url = 'https://raw.githubusercontent.com/wanghalan/shapes/main/data/01001/010010201001.geojson';
                fetchData(url)
                .then(data => storeData("010010201001", data))
                .then(renderMap)
                .catch(error => {
                  // Handle errors if needed
                  console.error('Error in the asynchronous process:', error);
                });
                
            }
        };
    });
};

// Initialize the app
initApp();

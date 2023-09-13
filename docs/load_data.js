// Open a connection to IndexedDB
const dbName = "verygoodname";
const dbVersion = 1;
const refStates = ["51"];
const shapeManifestUrl = 'https://raw.githubusercontent.com/wanghalan/shapes/main/manifest.json';

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


/**
 * 
 * @param {String} url 
 * @returns {String}
 */
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

const syncShapefiles = (storeName) => {
    // if works... move to own fn
    openDB(storeName).then(db => {
        fetchData(shapeManifestUrl)
        .then((data) => {
            const transaction = db.transaction([dbName], "readonly");
            const store = transaction.objectStore(dbName);

            data.forEach((filename, index) => {
                let bgCode = filename.split("/").pop().slice(0, 12)

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
                };
            })
        }).catch(error => {
            console.error('Error in the asynchronous process:', error);
        });
    });
}

const syncRepoData = (storeName) => {
    // if works... move to own fn
    openDB(storeName).then(db => {
        fetchData(shapeManifestUrl)
        .then((data) => {
            const transaction = db.transaction([dbName], "readonly");
            const store = transaction.objectStore(dbName);

            data.forEach((filename, index) => {
                let measure = "blah"
                const request = store.get(measure);
                store.get(bgCode).onsuccess = function(event){
                    if (!event.target.result)  {
                        // Data is not in IndexedDB, fetch it and then render the map
                        const url = 'https://raw.githubusercontent.com/wanghalan/shapes/main/' + filename;
                        console.log(url);
                        // fetchData(url)
                        //     .then(geos => storeData(dbName, bgCode, geos))
                        //     .catch(error => {
                        //         // Handle errors if needed
                        //         console.error('Error in the asynchronous process:', error);
                        //     });        
                    }
                };
            })
        }).catch(error => {
            console.error('Error in synchronizing repository data:', error);
        });
    });
}




// Main function to initialize the app
const syncAllData = () => {
    syncShapefiles("shapefiles");
    syncRepoData("testing"); //this can be the name of the repository

}


// Synchronize the data
syncAllData();

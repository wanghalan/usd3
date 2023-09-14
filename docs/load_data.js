// Open a connection to IndexedDB
const dbName = "verygoodname";
const dbVersion = 1;
const refStates = ["51"];
const shapeManifestUrl = 'https://raw.githubusercontent.com/wanghalan/shapes/main/manifest.json';


Array.prototype.geoidMatch= function(geoid){
    let ref = ""+ geoid.slice(0, 2);
    return refStates.includes(ref);
}

/**
 * Wait to get data from the url, returning the javascript content on success, and throwing an error on fail
 * @param {string} url 
 * @returns {json} jsonData
 */
async function fetchJSON(url) {
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


const openDB = (storeName) => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(storeName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const objectStore = db.createObjectStore(storeName, { keyPath: "key" });
            objectStore.createIndex("value", "value", { unique: false });
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
 * @param {string} storeName 
 * @param {string} key 
 * @param {string} value 
 */
const storeData = (storeName, key, value) => {
    // Save the data into IndexedDB
    openDB(storeName).then(db => {
        // Store values in the newly created objectStore.
        const objectStore = db
          .transaction(storeName, "readwrite")
          .objectStore(storeName);
        const request = objectStore.add({'key': key, 'value': value});
        request.onsuccess = function (evt) {
            // do something after the add succeeded
            return true;
        };
    })    
};

function syncShapefiles (storeName)  {
    const promises = []
    openDB(storeName).then(db => { //Once the database is opened
        fetchJSON(shapeManifestUrl).then(filepaths => { //And once the JSON is retrieved
            for (i = 0; i< filepaths.length; i++){

                let county = filepaths[i].split("/").pop().slice(0, 5);

                if (!refStates.geoidMatch(county)){ // if no matches
                    continue;
                }

                let filepath = filepaths[i];
                const transaction = db.transaction([storeName], "readonly");
                const store = transaction.objectStore(storeName);                
                const req = store.openCursor(county);

                req.onsuccess= function(e){
                    var cursor = e.target.result;
                    if (!cursor){
                        const url = 'https://raw.githubusercontent.com/wanghalan/shapes/main/' + filepath;
                        console.log(url);
                        // fetchJSON(url)
                        //     .then(geos => storeData(storeName, county, geos))
                        //     .catch(error => {
                        //         // Handle errors if needed
                        //         console.error('Error in the asynchronous process:', error);
                        //     });      
                    }
                }
            }
        });
    });
    return Promise.allSettled(promises);
}
    
        


// const syncRepoData = (storeName) => {
//     // if works... move to own fn
//     openDB(storeName).then(db => {
//         fetchData(shapeManifestUrl)
//         .then((data) => {
//             const transaction = db.transaction([dbName], "readonly");
//             const store = transaction.objectStore(dbName);

//             data.forEach((filename, index) => {
//                 let measure = "blah"
//                 const request = store.get(measure);
//                 store.get(bgCode).onsuccess = function(event){
//                     if (!event.target.result)  {
//                         // Data is not in IndexedDB, fetch it and then render the map
//                         const url = 'https://raw.githubusercontent.com/wanghalan/shapes/main/' + filename;
//                         console.log(url);
//                         // fetchData(url)
//                         //     .then(geos => storeData(dbName, bgCode, geos))
//                         //     .catch(error => {
//                         //         // Handle errors if needed
//                         //         console.error('Error in the asynchronous process:', error);
//                         //     });        
//                     }
//                 };
//             })
//         }).catch(error => {
//             console.error('Error in synchronizing repository data:', error);
//         });
//     });
// }

// Main function to initialize the app
function syncAllData() {

}



const start = Date.now();
syncShapefiles("shapefiles").then(()=>{
    const end = Date.now();
    console.log('Execution time: '+ (end - start) + ' ms');
})



// firebase-config-manager.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfigs = [
    { // Configuration for Database 1 (e.g., for days 1-...)
        apiKey: "AIzaSyB6AUBnK_7Vy2ABWI2JMo3ebG_Sljr8XlY",
        authDomain: "cyber-campus-2706f.firebaseapp.com",
        databaseURL: "https://cyber-campus-2706f-default-rtdb.firebaseio.com",
        projectId: "cyber-campus-2706f",
        storageBucket: "cyber-campus-2706f.appspot.com",
        messagingSenderId: "719410601264",
        appId: "1:719410601264:web:44fd2e3757721866303cf5",
        measurementId: "G-CEEFJP5LYZ"
    },
    { // Configuration for Database 2 (e.g., for days ...-...)
        apiKey: "AIzaSyA5-_WrIG8cLlHeDad9e59X4AxpQD5fn6U",
        authDomain: "cyber1-9c84f.firebaseapp.com",
        databaseURL: "https://cyber1-9c84f-default-rtdb.firebaseio.com",
        projectId: "cyber1-9c84f",
        storageBucket: "cyber1-9c84f.firebasestorage.app",
        messagingSenderId: "937482065699",
        appId: "1:937482065699:web:d46fb8b67516d17e049e96",
        measurementId: "G-BDJJ6D6FW0"
    },
    { // Configuration for Database 3 (e.g., for days ...-...)
        apiKey: "AIzaSyAWSRjhdtkHWhTDrhSak62jx-PxlD51xSs",
        authDomain: "cyber2-8ca5c.firebaseapp.com",
        databaseURL: "https://cyber2-8ca5c-default-rtdb.firebaseio.com",
        projectId: "cyber2-8ca5c",
        storageBucket: "cyber2-8ca5c.firebasestorage.app",
        messagingSenderId: "431461142755",
        appId: "1:431461142755:web:b6d0198172c6b6391cb5d6",
        measurementId: "G-FRXV7HTZ7Z"
    },
    { // Configuration for Database 3 (e.g., for days ...-...)
        apiKey: "AIzaSyBdAPWBErIhB8C9nip4j9b_QfamrSapO8Y",
        authDomain: "cyber3-95820.firebaseapp.com",
        databaseURL: "https://cyber3-95820-default-rtdb.firebaseio.com",
        projectId: "cyber3-95820",
        storageBucket: "cyber3-95820.firebasestorage.app",
        messagingSenderId: "151537661608",
        appId: "1:151537661608:web:8b845865b806b7a813b49d",
        measurementId: "G-DJCECSJ2KH"
    },
    {
  apiKey: "AIzaSyBvwJSv5iJy-YuL_m8QgVfqO06qNZVmAps",
  authDomain: "bonjour-75278.firebaseapp.com",
  databaseURL: "https://bonjour-75278-default-rtdb.firebaseio.com",
  projectId: "bonjour-75278",
  storageBucket: "bonjour-75278.firebasestorage.app",
  messagingSenderId: "805380694708",
  appId: "1:805380694708:web:55e6b53506b83624946de1",
  measurementId: "G-W3CBW4735M"
}
    // Add more configurations as needed, following the same structure
];

let app;
let db;
let currentDatabaseIndex = -1; // To track the currently active database index
let initializationPromise; // To ensure initialization completes before db is used

function initializeAppWithIndex(index) {
    app = initializeApp(firebaseConfigs[index]);
    db = getDatabase(app);
    console.log(`Firebase initialized with database ${index + 1}`);
}

// Function to synchronize data from the old database to the new one (if needed)
async function synchronizeDataIfNeeded(oldIndex, newIndex) {
    if (oldIndex === -1) return; // No need to synchronize if it's the first initialization

    console.log("Starting database synchronization...");

    const oldDb = getDatabase(initializeApp(firebaseConfigs[oldIndex])); // Initialize app with old config
    const newDb = getDatabase(initializeApp(firebaseConfigs[newIndex])); // Initialize app with new config

    const dataPathsToSync = ['TicketsTotal', 'TicketsVendus', 'TicketsTransit', 'TicketConnecté','Vendors','VendorsHistory','admins','sales','users','admin/subscription'];

    for (const path of dataPathsToSync) {
        try {
            const oldDataRef = ref(oldDb, path);
            const newDataRef = ref(newDb, path);
            const snapshot = await get(oldDataRef);
            const dataToSync = snapshot.val();

            if (dataToSync) {
                await set(newDataRef, dataToSync);
                console.log(`Data synchronized for path: ${path}`);
            }
        } catch (error) {
            console.error(`Error synchronizing path ${path}:`, error);
            throw new Error(`Error during synchronization: ${error.message}`);
        }
    }
    console.log("Database synchronization complete.");
}


// Function to select the Firebase database based on the day of the month and number of databases
async function selectDatabase() {
    const dayOfMonth = new Date().getDate();
    const numDatabases = firebaseConfigs.length; // Get the number of database configurations

    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(); // Get days in current month
    const daysPerDatabase = Math.floor(daysInMonth / numDatabases);  // Integer division
    let remainderDays = daysInMonth % numDatabases; // Remaining days after even distribution.

    let databaseIndex;
    let dayThreshold = 0; // Keep track of the day cut-off for each database.

    for (let i = 0; i < numDatabases; i++) {
        dayThreshold += daysPerDatabase;
        if (remainderDays > 0) { // Distribute remaining days one by one.
            dayThreshold++;
            remainderDays--;
        }
        if (dayOfMonth <= dayThreshold) {
            databaseIndex = i;
            break; // Important: Stop once we've found the correct database.
        }
    }

    if (databaseIndex !== currentDatabaseIndex) {
        console.log(`Switching to database index: ${databaseIndex}`);
        await synchronizeDataIfNeeded(currentDatabaseIndex, databaseIndex)
            .catch(error => {
                console.error("Synchronization failed:", error);
                throw error;
            });

        initializeAppWithIndex(databaseIndex);
        currentDatabaseIndex = databaseIndex;
        localStorage.setItem('currentDatabaseIndex', databaseIndex.toString());
    } else if (!db) {
        initializeAppWithIndex(databaseIndex); // Initialize if db is not yet set
    }
}

// Export an async function that initializes and returns the database
export async function getActiveDatabase() {
    if (!initializationPromise) {
        initializationPromise = selectDatabase(); // Start initialization promise
    }
    await initializationPromise; // Wait for initialization to complete
    return db;
}

// Immediately trigger initial database selection and initialization on module load (optional, can be done in login.html as well)
// selectDatabase().catch(error => console.error("Initial database selection error:", error));
// Darusihha Mega System - Core Database & Storage Manager
class DarusihhaDB {
  constructor() {
    this.dbName = 'DarusihhaMegaDB';
    this.version = 1;
  }

  // Initialize IndexedDB for robust offline patient and clinical records
  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create stores if they do not exist
        if (!db.objectStoreNames.contains('patients')) {
          db.createObjectStore('patients', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pharmacy')) {
          db.createObjectStore('pharmacy', { keyPath: 'code' });
        }
        if (!db.objectStoreNames.contains('finance')) {
          db.createObjectStore('finance', { keyPath: 'invoiceId' });
        }
        if (!db.objectStoreNames.contains('laboratory')) {
          db.createObjectStore('laboratory', { keyPath: 'orderId' });
        }
      };
    });
  }
}

window.DarusihhaDB = DarusihhaDB;
console.log('Database module loaded successfully.');

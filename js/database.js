// Darusihha Mega System - Core Database & Storage Manager v2.3
class DarusihhaDB {
  constructor() {
    this.dbName = 'DarusihhaMegaDB';
    this.version = 2;
    this.dbInstance = null;
    this.initPromise = null;
  }

  init() {
    if (this.dbInstance) {
      return Promise.resolve(this.dbInstance);
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        this.initPromise = null;
        return reject(new Error('IndexedDB is not supported by this browser.'));
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => {
        this.initPromise = null;
        console.error('Database connection error:', event.target.error);
        reject(event.target.error);
      };

      request.onblocked = (event) => {
        console.warn('Database upgrade is blocked by another open tab/connection running Darusihha Mega System.');
      };

      request.onsuccess = (event) => {
        this.dbInstance = event.target.result;
        this.initPromise = null;

        this.dbInstance.onversionchange = () => {
          if (this.dbInstance) {
            this.dbInstance.close();
          }
          this.dbInstance = null;
          this.initPromise = null;
          console.warn('Database outdated due to version change in another tab.');
        };

        resolve(this.dbInstance);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const transaction = event.target.transaction;

        let patientStore;
        if (!db.objectStoreNames.contains('patients')) {
          patientStore = db.createObjectStore('patients', { keyPath: 'id' });
        } else {
          patientStore = transaction.objectStore('patients');
        }
        if (!patientStore.indexNames.contains('fullName')) {
          patientStore.createIndex('fullName', 'fullName', { unique: false });
        }
        if (!patientStore.indexNames.contains('phone')) {
          patientStore.createIndex('phone', 'phone', { unique: false });
        }
        if (!patientStore.indexNames.contains('branch')) {
          patientStore.createIndex('branch', 'branch', { unique: false });
        }
        if (!patientStore.indexNames.contains('registeredAt')) {
          patientStore.createIndex('registeredAt', 'registeredAt', { unique: false });
        }

        let pharmacyStore;
        if (!db.objectStoreNames.contains('pharmacy')) {
          pharmacyStore = db.createObjectStore('pharmacy', { keyPath: 'code' });
        } else {
          pharmacyStore = transaction.objectStore('pharmacy');
        }
        if (!pharmacyStore.indexNames.contains('drugName')) {
          pharmacyStore.createIndex('drugName', 'drugName', { unique: false });
        }
        if (!pharmacyStore.indexNames.contains('category')) {
          pharmacyStore.createIndex('category', 'category', { unique: false });
        }
        if (!pharmacyStore.indexNames.contains('branch')) {
          pharmacyStore.createIndex('branch', 'branch', { unique: false });
        }

        let financeStore;
        if (!db.objectStoreNames.contains('finance')) {
          financeStore = db.createObjectStore('finance', { keyPath: 'invoiceId' });
        } else {
          financeStore = transaction.objectStore('finance');
        }
        if (!financeStore.indexNames.contains('branch')) {
          financeStore.createIndex('branch', 'branch', { unique: false });
        }

        let labStore;
        if (!db.objectStoreNames.contains('laboratory')) {
          labStore = db.createObjectStore('laboratory', { keyPath: 'orderId' });
        } else {
          labStore = transaction.objectStore('laboratory');
        }
        if (!labStore.indexNames.contains('branch')) {
          labStore.createIndex('branch', 'branch', { unique: false });
        }
      };
    });

    return this.initPromise;
  }
}

window.DarusihhaDB = DarusihhaDB;
console.log('Database module v2.3 loaded successfully.');

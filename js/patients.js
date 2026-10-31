// Darusihha Mega System - Patient Registration Module (IndexedDB Powered)
class PatientModule {
  constructor(dbInstance) {
    this.db = dbInstance;
  }

  registerPatient(patientData) {
    return new Promise((resolve, reject) => {
      this.db.init().then(db => {
        const transaction = db.transaction(['patients'], 'readwrite');
        const store = transaction.objectStore('patients');
        
        const newPatient = {
          id: 'DRS-' + Math.floor(100000 + Math.random() * 900000),
          fullName: patientData.fullName,
          age: parseInt(patientData.age, 10) || 0,
          gender: patientData.gender,
          phone: patientData.phone,
          branch: localStorage.getItem('darusihha_active_branch') || 'galkacyo',
          registeredAt: new Date().toISOString()
        };

        const request = store.put(newPatient);
        request.onsuccess = () => resolve(newPatient);
        request.onerror = (e) => reject(e.target.error);
      }).catch(err => reject(err));
    });
  }

  getAllPatients() {
    return new Promise((resolve, reject) => {
      this.db.init().then(db => {
        const transaction = db.transaction(['patients'], 'readonly');
        const store = transaction.objectStore('patients');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
      }).catch(err => reject(err));
    });
  }
}

window.PatientModule = PatientModule;
console.log('Patient module loaded successfully.');

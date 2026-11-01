// Darusihha Mega System - Patient Registration Module v2.3
class PatientModule {
  constructor(dbInstance) {
    this.db = dbInstance;
  }

  generateSecureId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      const uuid = window.crypto.randomUUID();
      return 'DRS-' + uuid.replace(/-/g, '').toUpperCase().slice(0, 8);
    }
    const randomBytes = new Uint32Array(1);
    window.crypto.getRandomValues(randomBytes);
    return 'DRS-' + (randomBytes[0] % 90000000 + 10000000).toString();
  }

  async registerPatient(patientData) {
    if (!patientData || typeof patientData !== 'object') {
      throw new Error('Invalid patient data payload provided.');
    }

    if (!patientData.fullName || typeof patientData.fullName !== 'string') {
      throw new Error('Patient full name is required and must be text.');
    }
    const cleanName = patientData.fullName.trim();
    if (cleanName.length < 2 || cleanName.length > 100) {
      throw new Error('Patient full name must be between 2 and 100 characters.');
    }

    const ageStr = String(patientData.age !== undefined ? patientData.age : '').trim();
    if (!/^\d+$/.test(ageStr)) {
      throw new Error('Age must be a valid whole number (e.g., 0 for newborns, 25 for adults).');
    }
    const ageNum = parseInt(ageStr, 10);
    if (ageNum < 0 || ageNum > 150) {
      throw new Error('Patient age must be between 0 and 150 years.');
    }

    const validGenders = ['Male', 'Female'];
    if (!validGenders.includes(patientData.gender)) {
      throw new Error('Explicit and valid gender selection (Male or Female) is required.');
    }

    if (!patientData.phone || typeof patientData.phone !== 'string') {
      throw new Error('Phone number is required.');
    }
    const cleanPhone = patientData.phone.trim();
    const somaliPhoneRegex = /^(\+?252|252|0)?(6[1-59]|7[1-9]|9\d)\d{7}$/;
    if (!somaliPhoneRegex.test(cleanPhone)) {
      throw new Error('Invalid Somali phone number format. Please use a valid format (e.g., +25261XXXXXXX or 061XXXXXXX).');
    }

    const activeBranchContext = localStorage.getItem('darusihha_active_branch') || 'galkacyo';
    const db = await this.db.init();

    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const candidateId = this.generateSecureId();

      const newPatient = {
        id: candidateId,
        fullName: cleanName,
        age: ageNum,
        gender: patientData.gender,
        phone: cleanPhone,
        branch: activeBranchContext,
        registeredAt: new Date().toISOString()
      };

      try {
        const savedRecord = await new Promise((resolve, reject) => {
          const transaction = db.transaction(['patients'], 'readwrite');
          const store = transaction.objectStore('patients');

          let requestError = null;
          const request = store.add(newPatient);

          request.onerror = (event) => {
            requestError = event.target.error;
            event.preventDefault();
          };

          transaction.oncomplete = () => {
            resolve(newPatient);
          };

          transaction.onerror = (event) => {
            reject(transaction.error || requestError || new Error('Transaction failed.'));
          };

          transaction.onabort = (event) => {
            const abortError = transaction.error || requestError;
            reject(abortError || new Error('Transaction was aborted.'));
          };
        });

        return savedRecord;

      } catch (err) {
        const isConstraintError = err && (err.name === 'ConstraintError' || (err.message && err.message.toLowerCase().includes('constraint')));
        
        if (isConstraintError) {
          console.warn(`ID collision detected for candidate ${candidateId} on attempt ${attempt}. Retrying with new ID...`);
          if (attempt === maxAttempts) {
            throw new Error('Failed to generate a unique patient ID after maximum collision attempts.');
          }
          continue;
        } else {
          throw err;
        }
      }
    }

    throw new Error('Patient registration failed due to persistent ID generation conflicts.');
  }

  async getAllPatients() {
    const db = await this.db.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['patients'], 'readonly');
      const store = transaction.objectStore('patients');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (e) => reject(e.target.error || new Error('Failed to retrieve patient records.'));
    });
  }
}

window.PatientModule = PatientModule;
console.log('Patient module v2.3 loaded successfully.');

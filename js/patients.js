// Darusihha Mega System - Patient Registration Module
class PatientModule {
  constructor() {
    this.storageKey = 'darusihha_patients';
  }

  getPatients() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  savePatient(patientData) {
    const patients = this.getPatients();
    const newPatient = {
      id: 'DRS-' + Math.floor(100000 + Math.random() * 900000),
      fullName: patientData.fullName,
      age: patientData.age,
      gender: patientData.gender,
      phone: patientData.phone,
      branch: localStorage.getItem('darusihha_active_branch') || 'galkacyo',
      registeredAt: new Date().toISOString()
    };
    patients.push(newPatient);
    localStorage.setItem(this.storageKey, JSON.stringify(patients));
    return newPatient;
  }
}

window.PatientModule = PatientModule;
console.log('Patient module loaded successfully.');

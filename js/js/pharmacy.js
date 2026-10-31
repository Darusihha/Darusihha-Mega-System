// Darusihha Mega System - Pharmacy Inventory Module
class PharmacyModule {
  constructor(dbInstance) {
    this.db = dbInstance;
  }

  addStock(itemData) {
    return new Promise((resolve, reject) => {
      this.db.init().then(db => {
        const transaction = db.transaction(['pharmacy'], 'readwrite');
        const store = transaction.objectStore('pharmacy');
        const newItem = {
          code: 'DRG-' + Math.floor(1000 + Math.random() * 9000),
          drugName: itemData.drugName,
          category: itemData.category,
          quantity: parseInt(itemData.quantity, 10) || 0,
          batchNumber: itemData.batchNumber,
          expiryDate: itemData.expiryDate,
          branch: localStorage.getItem('darusihha_active_branch') || 'galkacyo',
          addedAt: new Date().toISOString()
        };
        const request = store.put(newItem);
        request.onsuccess = () => resolve(newItem);
        request.onerror = (e) => reject(e.target.error);
      });
    });
  }
}

window.PharmacyModule = PharmacyModule;
console.log('Pharmacy module ready.');

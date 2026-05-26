import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useInventory } from '../context/InventoryContext';
import { Camera, RefreshCw, CheckCircle } from 'lucide-react';
import type { Item } from '../types';

export const Scanner = () => {
  const { items, updateItemQuantity } = useInventory();
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [scannedItem, setScannedItem] = useState<Item | null>(null);
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 300, height: 150 }, supportedScanTypes: [] },
      /* verbose= */ false
    );
    
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        handleScan(decodedText);
        // Optional: pause scanning after successful scan
        scanner.pause(true);
      },
      (_error) => {
        // Ignored, happens constantly when no barcode is in frame
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [items]); // Re-initialize if items change so handleScan has fresh closure? Actually, better to use state for scanned items.

  const handleScan = (barcode: string) => {
    setScannedBarcode(barcode);
    const item = items.find(i => i.barcode === barcode);
    if (item) {
      setScannedItem(item);
      setMessage(null);
    } else {
      setScannedItem(null);
      setMessage({ text: 'Item not found in inventory. Please generate it first.', type: 'error' });
    }
  };

  const resumeScanning = () => {
    setScannedBarcode(null);
    setScannedItem(null);
    setMessage(null);
    setAddQuantity(1);
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  const handleUpdateQuantity = async () => {
    if (!scannedItem) return;
    
    const newQuantity = scannedItem.quantity + addQuantity;
    const success = await updateItemQuantity(scannedItem.id, newQuantity);
    
    if (success) {
      setMessage({ text: `Successfully updated ${scannedItem.item_name} quantity to ${newQuantity}.`, type: 'success' });
      // Update local state temporarily to reflect
      setScannedItem({ ...scannedItem, quantity: newQuantity });
      setAddQuantity(1);
    } else {
      setMessage({ text: 'Failed to update quantity.', type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <div>
          <h1>Scan Barcode</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Scan a barcode to view or update inventory.</p>
      </div>

      <div className="grid-2-cols">
        
        {/* Scanner Section */}
        <div className="card glass">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--bg-navy)', fontWeight: '600' }}>
            <Camera size={20} />
            <h2>Camera feed</h2>
          </div>
          
          <div id="reader" style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}></div>
          
          {scannedBarcode && (
            <button 
              className="btn-outline" 
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={resumeScanning}
            >
              <RefreshCw size={18} />
              Scan Another
            </button>
          )}
        </div>

        {/* Results Section */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '1rem' }}>Scan Result</h2>
          
          {!scannedBarcode ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              Waiting for barcode scan...
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="label">Scanned Barcode</span>
                <code style={{ fontSize: '1.25rem', padding: '0.5rem 1rem', display: 'block', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', marginTop: '0.5rem' }}>
                  {scannedBarcode}
                </code>
              </div>

              {message && (
                <div style={{ 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1.5rem',
                  backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: message.type === 'success' ? '#166534' : '#991b1b',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  {message.type === 'success' && <CheckCircle size={20} style={{ flexShrink: 0 }} />}
                  <span style={{ fontSize: '0.875rem' }}>{message.text}</span>
                </div>
              )}

              {scannedItem && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 1rem' }}>{scannedItem.item_name}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Current Stock: <strong>{scannedItem.quantity}</strong>
                  </p>

                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label className="label" htmlFor="addQuantity">Add Quantity</label>
                      <input
                        id="addQuantity"
                        type="number"
                        className="input-field"
                        value={addQuantity}
                        onChange={(e) => setAddQuantity(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <button 
                      className="btn-primary" 
                      onClick={handleUpdateQuantity}
                    >
                      Update Stock
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

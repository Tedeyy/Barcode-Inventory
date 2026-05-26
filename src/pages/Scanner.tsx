import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { useInventory } from '../context/InventoryContext';
import { Camera, RefreshCw, CheckCircle, Upload, Folder, Package, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Item, Category } from '../types';

export const Scanner = () => {
  const { items, categories, updateItemQuantity } = useInventory();
  const navigate = useNavigate();
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [scannedItem, setScannedItem] = useState<Item | null>(null);
  const [scannedCategory, setScannedCategory] = useState<Category | null>(null);
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isScanning) return;
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 150 } },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        setScannedBarcode(decodedText);
        if (scanner.getState() !== 3) { // 3 = PAUSED
          scanner.pause(true);
        }
      },
      (_error) => {
        // Ignored
      }
    );

    return () => {
      try {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
        }
      } catch (e) {
        console.error(e);
      }
    };
  }, [isScanning]); // Re-initialize only when isScanning changes

  // React to barcode scans separately from the scanner initialization
  useEffect(() => {
    if (scannedBarcode) {
      const item = items.find(i => i.barcode === scannedBarcode);
      const category = categories.find(c => c.barcode === scannedBarcode);

      if (item) {
        setScannedItem(item);
        setScannedCategory(null);
        setMessage(null);
      } else if (category) {
        setScannedCategory(category);
        setScannedItem(null);
        setMessage(null);
      } else {
        setScannedItem(null);
        setScannedCategory(null);
        setMessage({ text: 'Barcode not found in inventory.', type: 'error' });
      }
    }
  }, [scannedBarcode, items, categories]);

  const resumeScanning = () => {
    setScannedBarcode(null);
    setScannedItem(null);
    setScannedCategory(null);
    setMessage(null);
    setAddQuantity(1);
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const html5QrCode = new Html5Qrcode("reader-hidden");
        const decodedText = await html5QrCode.scanFile(file, false);
        setScannedBarcode(decodedText);
        html5QrCode.clear();
      } catch (err) {
        console.error(err);
        setMessage({ text: 'No barcode found in this image.', type: 'error' });
      }
    }
  };

  const handleUpdateQuantity = async () => {
    if (!scannedItem) return;

    const newQuantity = scannedItem.quantity + addQuantity;
    const success = await updateItemQuantity(scannedItem.id, newQuantity);

    if (success) {
      setMessage({ text: `Successfully updated ${scannedItem.item_name} quantity to ${newQuantity}.`, type: 'success' });
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
      </div>

      <div className="grid-2-cols">

        {/* Scanner Section */}
        <div className="card glass">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--bg-navy)', fontWeight: '600' }}>
            <Camera size={20} />
            <h2>Camera feed</h2>
          </div>

          {isScanning ? (
            <div style={{ position: 'relative' }}>
              <div id="reader" style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}></div>
              {!scannedBarcode && (
                <button
                  className="btn-outline"
                  style={{ width: '100%', marginTop: '1rem', color: '#dc2626', borderColor: '#fca5a5' }}
                  onClick={() => setIsScanning(false)}
                >
                  Close Camera
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <Camera size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
              <button className="btn-primary" onClick={() => setIsScanning(true)} style={{ width: '100%', maxWidth: '200px' }}>
                Start Camera
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', width: '100%', maxWidth: '200px' }}>
                <hr style={{ flex: 1, borderColor: 'var(--border-color)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>OR</span>
                <hr style={{ flex: 1, borderColor: 'var(--border-color)' }} />
              </div>

              <label className="btn-outline" style={{ width: '100%', maxWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Upload size={18} />
                Upload Image
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
              <div id="reader-hidden" style={{ display: 'none' }}></div>
            </div>
          )}

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Package size={20} color="var(--accent-gold)" />
                    <h3 style={{ margin: 0 }}>{scannedItem.item_name}</h3>
                  </div>

                  {scannedItem.identification && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span className="label" style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Identification</span>
                      <div style={{ color: 'var(--text-primary)' }}>{scannedItem.identification}</div>
                    </div>
                  )}

                  {scannedItem.description && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span className="label" style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Description</span>
                      <div style={{ color: 'var(--text-primary)' }}>{scannedItem.description}</div>
                    </div>
                  )}

                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', marginTop: '1rem' }}>
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

              {scannedCategory && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Folder size={20} color="var(--accent-gold)" />
                    <h3 style={{ margin: 0 }}>{scannedCategory.name}</h3>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Items in this folder:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {items.filter(i => i.category_id === scannedCategory.id).length > 0 ? (
                        items.filter(i => i.category_id === scannedCategory.id).map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                            <div>
                              <span style={{ fontWeight: '500' }}>{item.shortname || item.item_name}</span>
                              {item.shortname && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block' }}>{item.item_name}</span>}
                            </div>
                            <span style={{ color: 'var(--text-secondary)', flexShrink: 0, marginLeft: '0.5rem' }}>Stock: {item.quantity}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Folder is empty.</div>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={() => navigate('/inventory', { state: { folderId: scannedCategory.id } })}
                  >
                    <FileText size={18} />
                    View Folder
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import JsBarcode from 'jsbarcode';
import { useNavigate } from 'react-router-dom';
import { Save, RefreshCw } from 'lucide-react';

export const Generator = () => {
  const { addItem, categories } = useInventory();
  const navigate = useNavigate();
  const barcodeRef = useRef<SVGSVGElement>(null);

  const [itemName, setItemName] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Generate a random 12-digit number for UPC-A or just a timestamp based string
  const generateRandomBarcode = () => {
    const timestamp = Date.now().toString().slice(-8);
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setBarcodeValue(timestamp + randomPart);
  };

  useEffect(() => {
    if (!barcodeValue) {
      generateRandomBarcode();
    }
  }, []);

  useEffect(() => {
    if (barcodeRef.current && barcodeValue) {
      try {
        JsBarcode(barcodeRef.current, barcodeValue, {
          format: 'CODE128',
          lineColor: 'var(--text-primary)',
          width: 2,
          height: 100,
          displayValue: true
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [barcodeValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !barcodeValue) return;

    setLoading(true);
    const success = await addItem({
      item_name: itemName,
      barcode: barcodeValue,
      category_id: categoryId || null,
      quantity: quantity
    });
    setLoading(false);

    if (success) {
      navigate('/inventory');
    } else {
      alert('Failed to save item. The barcode might already exist.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <div>
          <h1>Generate Barcode</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create a new item and generate its 1D barcode.</p>
        </div>
      </div>

      <div className="card glass" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="grid-2-cols">
            <div>
              <label className="label" htmlFor="itemName">Item Name</label>
              <input
                id="itemName"
                type="text"
                required
                className="input-field"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Wireless Mouse"
              />
            </div>
            
            <div>
              <label className="label" htmlFor="category">Category</label>
              <select
                id="category"
                className="input-field"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select a category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2-cols">
            <div>
              <label className="label" htmlFor="barcodeValue">Barcode Value</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="barcodeValue"
                  type="text"
                  required
                  className="input-field"
                  value={barcodeValue}
                  onChange={(e) => setBarcodeValue(e.target.value)}
                  placeholder="Barcode string"
                />
                <button 
                  type="button"
                  className="btn-outline"
                  style={{ padding: '0 1rem' }}
                  onClick={generateRandomBarcode}
                  title="Generate Random"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="quantity">Initial Quantity</label>
              <input
                id="quantity"
                type="number"
                required
                min="0"
                className="input-field"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div style={{ 
            marginTop: '1rem', 
            padding: '2rem', 
            backgroundColor: 'var(--bg-primary)', 
            borderRadius: 'var(--radius-md)', 
            border: '1px dashed var(--border-color)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <svg ref={barcodeRef}></svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

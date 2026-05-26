import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Search, Edit2, Trash2, Package } from 'lucide-react';

export const InventoryList = () => {
  const { items, categories, deleteItem, updateItemQuantity } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  const filteredItems = items.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.barcode.includes(searchTerm)
  );

  const getCategoryName = (id: string | null) => {
    if (!id) return 'Uncategorized';
    return categories.find(c => c.id === id)?.name || 'Unknown';
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setEditQuantity(item.quantity);
  };

  const handleSaveQuantity = async (id: string) => {
    await updateItemQuantity(id, editQuantity);
    setEditingId(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Inventory List</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your existing inventory.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', inset: 'y-0 left-0', display: 'flex', alignItems: 'center', paddingLeft: '0.75rem', color: 'var(--text-secondary)', pointerEvents: 'none' }}>
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by item name or barcode..."
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No items found matching your search.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem' }}>Barcode</th>
                  <th style={{ padding: '1rem' }}>Item Name</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Quantity</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {item.barcode}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{item.item_name}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                        {getCategoryName(item.category_id)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {editingId === item.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="number" 
                            className="input-field" 
                            style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                          />
                          <button 
                            onClick={() => handleSaveQuantity(item.id)}
                            style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-navy)', color: 'white', borderRadius: '4px' }}
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '999px',
                          fontWeight: '500',
                          backgroundColor: item.quantity < 5 ? '#fee2e2' : 'var(--bg-secondary)',
                          color: item.quantity < 5 ? '#991b1b' : 'var(--text-primary)'
                        }}>
                          {item.quantity}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          style={{ background: 'none', color: 'var(--bg-navy)', padding: '0.5rem', borderRadius: '4px' }}
                          onClick={() => handleEditClick(item)}
                          title="Edit Quantity"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          style={{ background: 'none', color: '#dc2626', padding: '0.5rem', borderRadius: '4px' }}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this item?')) {
                              deleteItem(item.id);
                            }
                          }}
                          title="Delete Item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

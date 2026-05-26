import { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Folder, Plus, Save, X } from 'lucide-react';

export const Sidebar = () => {
  const { categories, addCategory } = useInventory();
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setLoading(true);
    const success = await addCategory(newCategoryName.trim());
    setLoading(false);
    
    if (success) {
      setNewCategoryName('');
      setIsAdding(false);
    } else {
      alert('Failed to add category');
    }
  };

  return (
    <div className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Folder size={18} />
          Categories
        </h2>
        <button 
          className="btn-outline" 
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', border: 'none' }}
          onClick={() => setIsAdding(!isAdding)}
          title="Add Category"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {isAdding && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Category name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn-outline" 
              style={{ flex: 1, padding: '0.25rem' }}
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 1, padding: '0.25rem' }}
              onClick={handleAddCategory}
              disabled={loading}
            >
              <Save size={16} />
            </button>
          </div>
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {categories.map((cat) => (
          <li 
            key={cat.id} 
            style={{ 
              padding: '0.75rem 1rem', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-navy-light)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)' }} />
            {cat.name}
          </li>
        ))}
        {categories.length === 0 && !isAdding && (
          <li style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
            No categories yet.
          </li>
        )}
      </ul>
    </div>
  );
};

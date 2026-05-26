import { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Folder, Plus, Save, X, ChevronRight, ChevronDown } from 'lucide-react';
import type { Category } from '../../types';

interface CategoryTreeItemProps {
  category: Category;
  allCategories: Category[];
  level: number;
  onSelectCategory?: (id: string | null) => void;
  selectedCategoryId?: string | null;
}

const CategoryTreeItem = ({ category, allCategories, level, onSelectCategory, selectedCategoryId }: CategoryTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const children = allCategories.filter(c => c.parent_id === category.id);
  const hasChildren = children.length > 0;

  return (
    <div>
      <div 
        style={{ 
          padding: '0.5rem', 
          paddingLeft: `${level * 1.25 + 0.5}rem`,
          backgroundColor: selectedCategoryId === category.id ? 'var(--bg-navy-light)' : 'transparent',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: hasChildren ? 'pointer' : 'default',
          transition: 'background-color 0.2s',
          userSelect: 'none'
        }}
        onClick={() => {
          if (hasChildren) setIsExpanded(!isExpanded);
          if (onSelectCategory) onSelectCategory(category.id);
        }}
        onMouseOver={(e) => {
          if (selectedCategoryId !== category.id) {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
          }
        }}
        onMouseOut={(e) => {
          if (selectedCategoryId !== category.id) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div style={{ width: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {hasChildren ? (
            isExpanded ? <ChevronDown size={16} color="var(--text-secondary)" /> : <ChevronRight size={16} color="var(--text-secondary)" />
          ) : (
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)' }} />
          )}
        </div>
        <Folder size={14} color={hasChildren ? "var(--bg-navy)" : "var(--text-secondary)"} />
        {category.name}
      </div>
      
      {isExpanded && hasChildren && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.1rem' }}>
          {children.map(child => (
            <CategoryTreeItem 
              key={child.id} 
              category={child} 
              allCategories={allCategories} 
              level={level + 1} 
              onSelectCategory={onSelectCategory}
              selectedCategoryId={selectedCategoryId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  onSelectCategory?: (id: string | null) => void;
  selectedCategoryId?: string | null;
}

export const Sidebar = ({ onSelectCategory, selectedCategoryId }: SidebarProps = {}) => {
  const { categories, addCategory } = useInventory();
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  const rootCategories = categories.filter(c => c.parent_id === null);

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
    <div className="sidebar" style={{ width: '100%', height: '100%', borderRight: 'none', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Folder size={18} />
          Categories
        </h2>
        <button 
          className="btn-outline" 
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', border: 'none' }}
          onClick={() => setIsAdding(!isAdding)}
          title="Add Root Category"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {isAdding && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Root category name..."
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {/* Root option */}
        <div
          style={{
            padding: '0.5rem',
            paddingLeft: '0.5rem',
            backgroundColor: selectedCategoryId === null || selectedCategoryId === '' ? 'var(--bg-navy-light)' : 'transparent',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            color: selectedCategoryId === null || selectedCategoryId === '' ? 'var(--accent-gold)' : 'var(--text-primary)',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            userSelect: 'none',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.75rem',
            marginBottom: '0.5rem'
          }}
          onClick={() => onSelectCategory && onSelectCategory(null)}
          onMouseOver={(e) => {
            if (selectedCategoryId !== null && selectedCategoryId !== '') e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
          }}
          onMouseOut={(e) => {
            if (selectedCategoryId !== null && selectedCategoryId !== '') e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Folder size={14} color="var(--accent-gold)" />
          Root
        </div>

        {rootCategories.map((cat) => (
          <CategoryTreeItem 
            key={cat.id} 
            category={cat} 
            allCategories={categories} 
            level={0} 
            onSelectCategory={onSelectCategory}
            selectedCategoryId={selectedCategoryId}
          />
        ))}
        {categories.length === 0 && !isAdding && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
            No categories yet.
          </div>
        )}
      </div>
    </div>
  );
};

import { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Search, Edit2, Trash2, Package, Folder, ChevronRight, CornerLeftUp, Plus } from 'lucide-react';
import type { Category } from '../types';

export const InventoryList = () => {
  const { items, categories, updateItemQuantity, deleteItem, addCategory } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  
  // File Explorer State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  // Add Folder State
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Editing Item State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  // Compute Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs: Category[] = [];
    let currentId = currentFolderId;
    
    // Trace up the hierarchy safely
    const seenIds = new Set<string>();
    while (currentId) {
      if (seenIds.has(currentId)) break; // Prevent circular reference loops
      seenIds.add(currentId);
      
      const category = categories.find(c => c.id === currentId);
      if (category) {
        crumbs.unshift(category);
        currentId = category.parent_id;
      } else {
        break;
      }
    }
    return crumbs;
  }, [currentFolderId, categories]);

  // Filter content based on current folder
  const visibleCategories = categories.filter(c => c.parent_id === currentFolderId);
  
  // Filter items based on search and current folder
  const visibleItems = items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.barcode.includes(searchTerm);
    // If searching, we might want to search globally, but for now we search within the folder.
    // To search globally when searchTerm is active, we can ignore folder filter.
    if (searchTerm) {
      return matchesSearch;
    }
    return item.category_id === currentFolderId;
  });

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setEditQuantity(item.quantity);
  };

  const handleSaveQuantity = async (id: string) => {
    await updateItemQuantity(id, editQuantity);
    setEditingId(null);
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    const success = await addCategory(newFolderName.trim(), currentFolderId);
    if (success) {
      setNewFolderName('');
      setIsAddingFolder(false);
    } else {
      alert("Failed to create folder");
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Inventory Explorer</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your categories and inventory items.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Breadcrumb Navigation */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', minWidth: '300px' }}>
            <button 
              className="btn-outline" 
              style={{ padding: '0.5rem', border: 'none', background: currentFolderId === null ? 'var(--bg-navy-light)' : 'transparent', color: currentFolderId === null ? 'var(--accent-gold)' : 'var(--text-primary)' }}
              onClick={() => setCurrentFolderId(null)}
            >
              Root
            </button>
            
            {breadcrumbs.map((crumb) => (
              <div key={crumb.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChevronRight size={16} color="var(--text-secondary)" />
                <button 
                  className="btn-outline"
                  style={{ 
                    padding: '0.5rem', 
                    border: 'none', 
                    background: currentFolderId === crumb.id ? 'var(--bg-navy-light)' : 'transparent',
                    color: currentFolderId === crumb.id ? 'var(--accent-gold)' : 'var(--text-primary)'
                  }}
                  onClick={() => setCurrentFolderId(crumb.id)}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <div style={{ position: 'absolute', inset: 'y-0 left-0', display: 'flex', alignItems: 'center', paddingLeft: '0.75rem', color: 'var(--text-secondary)', pointerEvents: 'none' }}>
              <Search size={18} />
            </div>
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
              placeholder={searchTerm ? "Searching globally..." : "Search in folder..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Explorer Tools */}
      {!searchTerm && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {currentFolderId && (
            <button 
              className="btn-outline" 
              onClick={() => {
                const parent = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2].id : null;
                setCurrentFolderId(parent);
              }}
              title="Up one level"
            >
              <CornerLeftUp size={18} />
              Up
            </button>
          )}
          
          {isAddingFolder ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Folder name" 
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddFolder()}
                autoFocus
                style={{ width: '200px' }}
              />
              <button className="btn-primary" onClick={handleAddFolder}>Save</button>
              <button className="btn-outline" onClick={() => setIsAddingFolder(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn-outline" onClick={() => setIsAddingFolder(true)}>
              <Plus size={18} />
              New Folder
            </button>
          )}
        </div>
      )}

      {/* Grid View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        
        {/* Folders (Hidden if actively searching globally) */}
        {!searchTerm && visibleCategories.map(category => (
          <div 
            key={category.id} 
            className="card"
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '2rem 1rem',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              gap: '1rem'
            }}
            onClick={() => setCurrentFolderId(category.id)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <Folder size={48} color="var(--accent-gold)" fill="var(--bg-navy-light)" strokeWidth={1.5} />
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{category.name}</div>
              {category.barcode && (
                <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  {category.barcode}
                </code>
              )}
            </div>
          </div>
        ))}

        {/* Items/Files */}
        {visibleItems.map(item => (
          <div 
            key={item.id} 
            className="card"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative',
              padding: '1.5rem',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <Package size={40} color="var(--text-secondary)" strokeWidth={1.5} />
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.item_name}>
                {item.item_name}
              </div>
              <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                {item.barcode}
              </code>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              
              {editingId === item.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input 
                    type="number" 
                    className="input-field" 
                    style={{ width: '60px', padding: '0.25rem' }}
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                  />
                  <button 
                    onClick={() => handleSaveQuantity(item.id)}
                    style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-navy)', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Stock:</span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: item.quantity < 5 ? '#dc2626' : 'var(--text-primary)',
                    background: item.quantity < 5 ? '#fee2e2' : 'transparent',
                    padding: item.quantity < 5 ? '0.1rem 0.4rem' : '0',
                    borderRadius: '4px'
                  }}>
                    {item.quantity}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  style={{ background: 'none', border: 'none', color: 'var(--bg-navy)', cursor: 'pointer', padding: '0.25rem' }}
                  onClick={() => handleEditClick(item)}
                  title="Edit Quantity"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.25rem' }}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this item?')) {
                      deleteItem(item.id);
                    }
                  }}
                  title="Delete Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {visibleCategories.length === 0 && visibleItems.length === 0 && !searchTerm && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <Folder size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>This folder is empty.</p>
          </div>
        )}

        {visibleItems.length === 0 && searchTerm && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No items match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

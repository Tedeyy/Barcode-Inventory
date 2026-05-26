import { useState, useMemo, useRef, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Search, Edit2, Trash2, Package, Folder, ChevronRight, CornerLeftUp, Plus, X, Download } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { useLocation } from 'react-router-dom';
import type { Category } from '../types';

export const InventoryList = () => {
  const { items, categories, updateItemQuantity, deleteItem, addCategory } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  
  // File Explorer State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(location.state?.folderId || null);
  
  // Add Folder State
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Editing Item State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  // Properties Pane State
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'folder' | 'item', data: any } | null>(null);
  const folderClickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFolderClick = (category: Category) => {
    if (folderClickTimeout.current) {
      clearTimeout(folderClickTimeout.current);
      folderClickTimeout.current = null;
      setSelectedEntity({ type: 'folder', data: category });
    } else {
      folderClickTimeout.current = setTimeout(() => {
        setCurrentFolderId(category.id);
        folderClickTimeout.current = null;
      }, 250);
    }
  };

  useEffect(() => {
    if (selectedEntity && selectedEntity.data.barcode) {
      try {
        JsBarcode('#details-barcode-svg', selectedEntity.data.barcode, {
          format: 'CODE128',
          lineColor: 'var(--text-primary)',
          width: 2,
          height: 100,
          displayValue: true
        });
      } catch (e) { console.error(e) }
    }
  }, [selectedEntity]);

  const downloadBarcode = () => {
    if (!selectedEntity) return;
    const svg = document.getElementById('details-barcode-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgSize = svg.getBoundingClientRect();
    canvas.width = svgSize.width || 200;
    canvas.height = svgSize.height || 100;
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `${selectedEntity.data.name || selectedEntity.data.item_name}-barcode.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

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
              gap: '1rem',
              userSelect: 'none'
            }}
            onClick={() => handleFolderClick(category)}
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
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {categories.filter(c => c.parent_id === category.id).length} folders, {items.filter(i => i.category_id === category.id).length} items
              </div>
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
            onDoubleClick={() => setSelectedEntity({ type: 'item', data: item })}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative',
              padding: '1.5rem',
              gap: '1rem',
              userSelect: 'none'
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

      {selectedEntity && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={() => setSelectedEntity(null)}>
          <div className="card glass" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                {selectedEntity.type === 'folder' ? selectedEntity.data.name : selectedEntity.data.item_name}
              </h2>
              <button className="btn-outline" style={{ border: 'none', padding: '0.25rem' }} onClick={() => setSelectedEntity(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {selectedEntity.data.barcode ? (
                <>
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
                    <svg id="details-barcode-svg"></svg>
                  </div>
                  <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={downloadBarcode}>
                    <Download size={18} />
                    Save as PNG
                  </button>
                </>
              ) : (
                <div style={{ color: 'var(--text-secondary)' }}>No barcode assigned</div>
              )}
            </div>
            
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <strong>Type:</strong> {selectedEntity.type === 'folder' ? 'Category Folder' : 'Inventory Item'}
              {selectedEntity.type === 'item' && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <strong>Current Stock:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedEntity.data.quantity}</span>
                  </div>
                  {selectedEntity.data.identification && (
                    <div>
                      <strong>Identification:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedEntity.data.identification}</span>
                    </div>
                  )}
                  {selectedEntity.data.description && (
                    <div>
                      <strong>Description:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedEntity.data.description}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

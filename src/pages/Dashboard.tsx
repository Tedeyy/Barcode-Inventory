import { useInventory } from '../context/InventoryContext';
import { Package, ListOrdered, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { items, categories, loading } = useInventory();
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter(item => item.quantity < 5).length;
  const totalCategories = categories.length;

  const statCards = [
    { title: 'Total Unique Items', value: totalItems, icon: <Package size={24} />, color: 'var(--bg-navy)' },
    { title: 'Total Stock Quantity', value: totalStock, icon: <TrendingUp size={24} />, color: 'var(--accent-gold)' },
    { title: 'Low Stock Alerts', value: lowStockItems, icon: <AlertCircle size={24} />, color: '#dc2626' },
    { title: 'Categories', value: totalCategories, icon: <ListOrdered size={24} />, color: 'var(--text-secondary)' },
  ];

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Overview of your barcode inventory system.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" onClick={() => navigate('/generator')}>
            Generate Barcode
          </button>
          <button className="btn-primary" onClick={() => navigate('/scanner')}>
            Scan Barcode
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {statCards.map((stat, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p className="label" style={{ marginBottom: '0.25rem' }}>{stat.title}</p>
              <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--bg-navy)' }}>{stat.value}</h2>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', color: stat.color }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Recently Added Items</h2>
          <button 
            className="btn-outline" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            onClick={() => navigate('/inventory')}
          >
            View All
          </button>
        </div>
        
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No items in inventory yet.</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/generator')}>
              Add First Item
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem' }}>Item Name</th>
                  <th style={{ padding: '1rem' }}>Barcode</th>
                  <th style={{ padding: '1rem' }}>Quantity</th>
                  <th style={{ padding: '1rem' }}>Added Date</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 5).map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{item.item_name}</td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{item.barcode}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        backgroundColor: item.quantity < 5 ? '#fee2e2' : 'var(--bg-secondary)',
                        color: item.quantity < 5 ? '#991b1b' : 'var(--text-primary)'
                      }}>
                        {item.quantity}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(item.created_at).toLocaleDateString()}
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

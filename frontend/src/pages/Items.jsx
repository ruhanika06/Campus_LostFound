import { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Items = () => {
    const { user } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [activeTab, setActiveTab] = useState('Lost');
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, [search, category, statusFilter, activeTab]);

    const fetchItems = async () => {
        try {
            const params = {};
            if (category) params.category = category;
            if (statusFilter) params.status = statusFilter;

            const { data } = await API.get('/items', { params });
            const filtered = data.filter(item => {
                const matchesSearch = (item.item_name || '').toLowerCase().includes(search.toLowerCase()) || 
                                      (item.description || '').toLowerCase().includes(search.toLowerCase());
                
                let matchesTab = false;
                if (activeTab === 'Lost') matchesTab = item.status === 'Lost';
                else if (activeTab === 'Found') matchesTab = item.status === 'Found';
                else if (activeTab === 'Returned') matchesTab = item.status === 'Returned' || item.status === 'Claimed';

                return matchesSearch && matchesTab;
            });
            setItems(filtered);
        } catch (err) {
            console.error(err);
        }
    };

    const handleClaim = async (id) => {
        if (!user) {
            alert('Please login to claim items.');
            navigate('/login');
            return;
        }
        try {
            await API.post('/items/claim', { item_id: id });
            alert('Claim request submitted! Admin will verify and notify you.');
            fetchItems();
        } catch (err) {
            // Show the specific error message from the server
            const msg = err.response?.data?.message || 'Failed to submit claim. Please try again.';
            alert(msg);
        }
    };

    return (
        <div className="items-container animate-slide-up">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '3rem', color: 'var(--rust)', marginBottom: '0.5rem' }}>Browse Items</h2>
                <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>Look through the database to find your lost belongings or claim what's yours.</p>
            </div>

            <div className="filters">
                <input
                    placeholder="Search by name or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books</option>
                    <option value="ID Card">ID Cards</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Others">Others</option>
                </select>
                <select onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => setActiveTab('Lost')}
                    className={`btn ${activeTab === 'Lost' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1.5rem' }}
                >
                    Lost Items 
                </button>
                <button 
                    onClick={() => setActiveTab('Found')}
                    className={`btn ${activeTab === 'Found' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1.5rem' }}
                >
                    Found Items 
                </button>
                <button 
                    onClick={() => setActiveTab('Returned')}
                    className={`btn ${activeTab === 'Returned' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1.5rem' }}
                >
                    Returned History 
                </button>
            </div>

            <div className="items-grid">
                {items.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', gridColumn: '1 / -1', border: '1px dashed var(--beige-dark)' }}>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>No items found matching your criteria.</p>
                    </div>
                ) : items.map(item => (
                    <div key={item.item_id} className="item-card">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.item_name} className="item-card-image" />
                        ) : (
                            <div className="item-card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                                <span>No Image Available</span>
                            </div>
                        )}
                        <div className="item-card-content">
                            <h3>{item.item_name}</h3>
                            <p className="category">{item.category}</p>
                            <p style={{ flex: 1 }}>{item.description}</p>
                            
                            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--beige-dark)', paddingTop: '1rem' }}>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}><strong>Location:</strong> {item.location}</p>
                                <p style={{ margin: '0', fontSize: '0.9rem' }}><strong>Date Report:</strong> {item.date_reported.split('T')[0]}</p>
                            </div>

                            <span className={`item-status ${item.status.toLowerCase()}`}>
                                {item.status}
                            </span>

                            {item.status === 'Found' && (
                                <div className="item-actions">
                                    {!user ? (
                                        <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ width: '100%' }}>
                                            Login to Claim
                                        </button>
                                    ) : user.role === 'Admin' ? null : item.user_id === user.user_id ? (
                                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)', margin: 0 }}>
                                            📌 You reported this item
                                        </p>
                                    ) : (
                                        <button onClick={() => handleClaim(item.item_id)} className="btn btn-primary" style={{ width: '100%' }}>
                                            Claim This Item
                                        </button>
                                    )}
                                </div>
                            )}
                            {item.status === 'Lost' && (
                                <div className="item-actions">
                                    {!user ? (
                                        <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ width: '100%' }}>
                                            Login to Report Found
                                        </button>
                                    ) : user.role === 'Admin' ? null : item.user_id === user.user_id ? (
                                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)', margin: 0 }}>
                                            📌 You reported this item lost
                                        </p>
                                    ) : (
                                        <button 
                                            onClick={() => navigate('/report', { state: { prefill: { ...item, status: 'Found', date_reported: new Date().toISOString().split('T')[0] } } })} 
                                            className="btn btn-secondary" 
                                            style={{ width: '100%' }}
                                        >
                                            Found this item? Report
                                        </button>
                                    )}
                                </div>
                            )}
                            {item.status === 'Returned' && (
                                <div className="item-actions" style={{ justifyContent: 'center' }}>
                                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#16a34a', fontWeight: '600', margin: 0 }}>
                                        ✅ Successfully Returned
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Items;

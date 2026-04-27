import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [myItems, setMyItems] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [claims, setClaims] = useState([]);
    const [allAdminItems, setAllAdminItems] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [claimFilter, setClaimFilter] = useState('Pending'); // Admin claim filter
    const [selectedItemDetails, setSelectedItemDetails] = useState(null); // Modal state
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        if (user.role === 'Admin') {
            fetchClaims();
            fetchAllItems();
        } else {
            fetchMyItems();
            fetchMyClaims();
            fetchNotifications();
        }
    }, [user]);

    const fetchMyItems = async () => {
        try {
            const { data } = await API.get(`/items?user_id=${user.user_id}`);
            setMyItems(data);
        } catch (err) {
            console.error('Failed to fetch items');
        }
    };

    const fetchMyClaims = async () => {
        try {
            const { data } = await API.get('/items/my-claims');
            setMyClaims(data);
        } catch (err) {
            console.error('Failed to fetch my claims');
        }
    };

    const fetchClaims = async () => {
        try {
            const { data } = await API.get('/items/claims');
            setClaims(data);
        } catch (err) {
            console.error('Failed to fetch claims');
        }
    };

    const fetchAllItems = async () => {
        try {
            const { data } = await API.get('/items');
            setAllAdminItems(data);
        } catch (err) {
            console.error('Failed to fetch all items');
        }
    };

    const fetchNotifications = async () => {
        try {
            const { data } = await API.get('/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const handleClaimAction = async (claimId, status) => {
        const label = status === 'Approved' ? 'approve' : 'reject';
        if (!confirm(`Are you sure you want to ${label} this claim?`)) return;
        try {
            await API.put(`/items/claim/${claimId}`, { status });
            alert(`Claim ${status} successfully!`);
            fetchClaims();
            fetchAllItems(); // Refresh item statuses too
        } catch (err) {
            const msg = err.response?.data?.message || 'Action failed. Please try again.';
            alert(msg);
        }
    };

    const handleUpdateItemStatus = async (itemId, newStatus) => {
        if (!confirm(`Are you sure you want to change this item's status to '${newStatus}'?`)) return;
        try {
            await API.put(`/items/${itemId}/status`, { status: newStatus });
            fetchAllItems();
        } catch (err) {
            alert('Failed to update item status.');
        }
    };

    const deleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this report?')) return;
        try {
            await API.delete(`/items/${id}`);
            fetchMyItems();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleReadNotification = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    // Helper: badge style for claim verification status
    const getClaimStatusClass = (status) => {
        if (!status) return '';
        return status.toLowerCase(); // pending / approved / rejected
    };

    const filteredAdminClaims = claimFilter === 'All' ? claims : claims.filter(c => c.verification_status === claimFilter);

    if (!user) return <p style={{textAlign: 'center', marginTop: '2rem'}}>Loading...</p>;

    return (
        <div className="dashboard-container animate-slide-up">
            <div className="dashboard-header">
                <div>
                    <h1 style={{marginBottom: '0'}}>Dashboard</h1>
                    <p style={{color: 'var(--text-light)', marginTop: '0.5rem'}}>Welcome back, {user.name} ({user.role})</p>
                </div>
                <div style={{display: 'flex', gap: '1rem'}}>
                    {user.role !== 'Admin' && (
                        <button onClick={() => navigate('/report')} className="btn btn-primary">Report Item</button>
                    )}
                    <button onClick={() => navigate('/items')} className="btn btn-secondary">Browse Items</button>
                </div>
            </div>

            {user.role === 'Admin' ? (
                <div className="admin-section">
                    {/* --- ADMIN: CLAIMS MANAGEMENT --- */}
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                        <h2 style={{color: 'var(--rust)', margin: 0}}>Claims Management</h2>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                            {['Pending', 'All'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setClaimFilter(f)}
                                    className={claimFilter === f ? 'btn btn-primary' : 'btn btn-secondary'}
                                    style={{padding: '0.4rem 1rem', fontSize: '0.9rem'}}
                                >
                                    {f} {f === 'Pending' ? `(${claims.filter(c => c.verification_status === 'Pending').length})` : `(${claims.length})`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredAdminClaims.length === 0 ? (
                        <div style={{padding: '3rem', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--beige-dark)'}}>
                            <p style={{color: 'var(--text-light)'}}>
                                {claimFilter === 'Pending' ? 'No pending claims at the moment. 🎉' : 'No claims found.'}
                            </p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Item</th>
                                    <th>Claimant</th>
                                    <th>Contact</th>
                                    <th>Claim Date</th>
                                    <th>Claim Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAdminClaims.map((claim) => (
                                    <tr key={claim.claim_id}>
                                        <td>
                                            {claim.image_url ? (
                                                <img src={claim.image_url} alt="Item" style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} />
                                            ) : (
                                                <div style={{width: '40px', height: '40px', backgroundColor: 'var(--beige)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-light)'}}>No Img</div>
                                            )}
                                        </td>
                                        <td>
                                            <strong>{claim.item_name}</strong>
                                            <br/>
                                            <button onClick={() => setSelectedItemDetails({type: 'claim', data: claim})} style={{background: 'none', border: 'none', color: 'var(--rust)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, textDecoration: 'underline'}}>View Details</button>
                                        </td>
                                        <td>{claim.claimant_name}</td>
                                        <td style={{fontSize: '0.85rem'}}>
                                            <div>{claim.claimant_email}</div>
                                            {claim.claimant_phone && <div style={{color: 'var(--text-light)'}}>{claim.claimant_phone}</div>}
                                        </td>
                                        <td style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>
                                            {claim.claim_date ? new Date(claim.claim_date).toLocaleDateString() : '—'}
                                        </td>
                                        <td>
                                            <span className={`item-status ${getClaimStatusClass(claim.verification_status)}`} style={{marginTop: 0}}>
                                                {claim.verification_status}
                                            </span>
                                        </td>
                                        <td>
                                            {claim.verification_status === 'Pending' && (
                                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                                    <button onClick={() => handleClaimAction(claim.claim_id, 'Approved')} className="approve-btn">Approve</button>
                                                    <button onClick={() => handleClaimAction(claim.claim_id, 'Rejected')} className="reject-btn action-btn">Reject</button>
                                                </div>
                                            )}
                                            {claim.verification_status !== 'Pending' && (
                                                <span style={{color: 'var(--text-light)', fontSize: '0.85rem'}}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* --- ADMIN: ALL ITEMS MANAGEMENT --- */}
                    <div style={{marginTop: '3rem'}}>
                        <h2 style={{color: 'var(--rust)', marginBottom: '1rem'}}>All Items — Status Management</h2>
                        <p style={{color: 'var(--text-light)', marginBottom: '1rem', fontSize: '0.95rem'}}>
                            Use the dropdown to manually update any item's status.
                        </p>
                        {allAdminItems.length === 0 ? (
                            <div style={{padding: '2rem', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--beige-dark)'}}>
                                <p style={{color: 'var(--text-light)'}}>No items in the system yet.</p>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Image</th>
                                        <th>Item Name</th>
                                        <th>Reporter</th>
                                        <th>Category</th>
                                        <th>Location</th>
                                        <th>Date</th>
                                        <th>Current Status</th>
                                        <th>Change Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allAdminItems.map(item => (
                                        <tr key={item.item_id}>
                                            <td style={{color: 'var(--text-light)', fontSize: '0.85rem'}}>#{item.item_id}</td>
                                            <td>
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt="Item" style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} />
                                                ) : (
                                                    <div style={{width: '40px', height: '40px', backgroundColor: 'var(--beige)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-light)'}}>No Img</div>
                                                )}
                                            </td>
                                            <td>
                                                <strong>{item.item_name}</strong>
                                                <br/>
                                                <button onClick={() => setSelectedItemDetails({type: 'item', data: item})} style={{background: 'none', border: 'none', color: 'var(--rust)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, textDecoration: 'underline'}}>View Details</button>
                                            </td>
                                            <td style={{fontSize: '0.85rem'}}>
                                                <div>{item.reporter_name}</div>
                                                {item.reporter_phone && <div style={{color: 'var(--text-light)'}}>{item.reporter_phone}</div>}
                                            </td>
                                            <td style={{fontSize: '0.9rem'}}>{item.category}</td>
                                            <td style={{fontSize: '0.9rem'}}>{item.location || '—'}</td>
                                            <td style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>
                                                {item.date_reported ? item.date_reported.split('T')[0] : '—'}
                                            </td>
                                            <td>
                                                <span className={`item-status ${item.status.toLowerCase()}`} style={{marginTop: 0}}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => handleUpdateItemStatus(item.item_id, e.target.value)}
                                                    style={{padding: '0.3rem 0.5rem', fontSize: '0.85rem', width: 'auto'}}
                                                >
                                                    <option value="Lost">Lost</option>
                                                    <option value="Found">Found</option>
                                                    <option value="Returned">Returned</option>
                                                    <option value="Claimed">Claimed</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ) : (
                <div className="user-section">
                    {/* --- NOTIFICATIONS --- */}
                    {notifications.length > 0 && (
                        <div style={{marginBottom: '2rem'}}>
                            <h2 style={{color: 'var(--rust)', marginBottom: '1rem'}}>Notifications</h2>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                {notifications.map(notif => (
                                    <div key={notif.notification_id} style={{
                                        padding: '1rem',
                                        backgroundColor: notif.is_read ? 'var(--beige-light)' : 'var(--white)',
                                        border: `1px solid ${notif.is_read ? 'var(--beige-dark)' : 'var(--rust-light)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <p style={{margin: 0, color: notif.is_read ? 'var(--text-light)' : 'var(--text)'}}>{notif.message}</p>
                                        {!notif.is_read && (
                                            <button onClick={() => handleReadNotification(notif.notification_id)} className="btn btn-secondary" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}}>
                                                Mark Read
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- MY CLAIMS --- */}
                    <h2 style={{color: 'var(--rust)', marginBottom: '1rem'}}>My Claims</h2>
                    {myClaims.length === 0 ? (
                        <div style={{padding: '2rem', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--beige-dark)', marginBottom: '2rem'}}>
                            <p style={{color: 'var(--text-light)'}}>You haven't claimed any items yet. Browse Found items and click "Claim This Item".</p>
                        </div>
                    ) : (
                        <div style={{marginBottom: '2.5rem'}}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th>Category</th>
                                        <th>Location</th>
                                        <th>Claim Date</th>
                                        <th>Verification Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myClaims.map(claim => (
                                        <tr key={claim.claim_id}>
                                            <td><strong>{claim.item_name}</strong></td>
                                            <td>{claim.category}</td>
                                            <td>{claim.location || '—'}</td>
                                            <td style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>
                                                {claim.claim_date ? new Date(claim.claim_date).toLocaleDateString() : '—'}
                                            </td>
                                            <td>
                                                <span className={`item-status ${getClaimStatusClass(claim.verification_status)}`} style={{marginTop: 0}}>
                                                    {claim.verification_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* --- MY REPORTED ITEMS --- */}
                    <h2 style={{color: 'var(--rust)', marginBottom: '1.5rem'}}>My Reported Items</h2>
                    {myItems.length === 0 ? (
                        <div style={{padding: '4rem', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--rust-light)', boxShadow: 'var(--shadow-sm)'}}>
                            <p style={{fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '1.5rem'}}>You haven't reported any items yet.</p>
                            <button onClick={() => navigate('/report')} className="btn btn-primary">Report an Item Now</button>
                        </div>
                    ) : (
                        <div className="items-grid">
                            {myItems.map((item) => (
                                <div key={item.item_id} className="item-card">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.item_name} className="item-card-image" />
                                    ) : (
                                        <div className="item-card-image" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)'}}>
                                            <span>No Image</span>
                                        </div>
                                    )}
                                    <div className="item-card-content">
                                        <h3>{item.item_name}</h3>
                                        <p className="category">{item.category}</p>
                                        <p><strong>Status:</strong> <span className={`item-status ${item.status.toLowerCase()}`} style={{display: 'inline-block', marginTop: 0, padding: '0.2rem 0.6rem'}}>{item.status}</span></p>
                                        <p><strong>Date:</strong> {item.date_reported ? item.date_reported.split('T')[0] : '—'}</p>
                                        <p style={{fontSize: '0.85rem'}}><strong>Location:</strong> {item.location || '—'}</p>

                                        <div className="item-actions">
                                            <button onClick={() => deleteItem(item.item_id)} className="reject-btn action-btn" style={{margin: 0, width: '100%', borderRadius: 'var(--radius-full)'}}>Delete Report</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {/* --- DETAILS MODAL --- */}
            {selectedItemDetails && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000, padding: '1rem'
                }}>
                    <div className="animate-slide-up" style={{
                        backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)',
                        width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
                        padding: '2rem', position: 'relative', boxShadow: 'var(--shadow-lg)'
                    }}>
                        <button onClick={() => setSelectedItemDetails(null)} style={{
                            position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none',
                            fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-light)'
                        }}>✕</button>
                        
                        <h2 style={{color: 'var(--rust)', marginBottom: '1.5rem'}}>Item Details</h2>
                        
                        {selectedItemDetails.data.image_url && (
                            <img src={selectedItemDetails.data.image_url} alt="Item" style={{
                                width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem'
                            }} />
                        )}

                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                            <div><strong>Name:</strong> {selectedItemDetails.data.item_name}</div>
                            <div><strong>Category:</strong> {selectedItemDetails.data.category}</div>
                            <div><strong>Location:</strong> {selectedItemDetails.data.location || '—'}</div>
                            <div><strong>Date:</strong> {selectedItemDetails.data.date_reported ? selectedItemDetails.data.date_reported.split('T')[0] : '—'}</div>
                            {selectedItemDetails.data.description && (
                                <div><strong>Description:</strong> <p style={{margin: '0.5rem 0', color: 'var(--text-light)', background: 'var(--beige)', padding: '1rem', borderRadius: 'var(--radius-md)'}}>{selectedItemDetails.data.description}</p></div>
                            )}

                            <hr style={{border: 'none', borderTop: '1px solid var(--beige-dark)', margin: '1rem 0'}} />

                            {selectedItemDetails.type === 'claim' && (
                                <>
                                    <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>Claimant Info</h3>
                                    <div><strong>Name:</strong> {selectedItemDetails.data.claimant_name}</div>
                                    <div><strong>Email:</strong> <a href={`mailto:${selectedItemDetails.data.claimant_email}`} style={{color: 'var(--rust)'}}>{selectedItemDetails.data.claimant_email}</a></div>
                                    {selectedItemDetails.data.claimant_phone && <div><strong>Phone:</strong> {selectedItemDetails.data.claimant_phone}</div>}
                                </>
                            )}

                            {selectedItemDetails.type === 'item' && (
                                <>
                                    <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>Reporter Info</h3>
                                    <div><strong>Name:</strong> {selectedItemDetails.data.reporter_name}</div>
                                    <div><strong>Email:</strong> <a href={`mailto:${selectedItemDetails.data.reporter_email}`} style={{color: 'var(--rust)'}}>{selectedItemDetails.data.reporter_email}</a></div>
                                    {selectedItemDetails.data.reporter_phone && <div><strong>Phone:</strong> {selectedItemDetails.data.reporter_phone}</div>}
                                </>
                            )}
                        </div>
                        
                        <button onClick={() => setSelectedItemDetails(null)} className="btn btn-secondary" style={{width: '100%', marginTop: '2rem'}}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

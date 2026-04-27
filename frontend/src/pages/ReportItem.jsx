import { useState } from 'react';
import API from '../api';
import { useNavigate, useLocation } from 'react-router-dom';

const ReportItem = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const prefill = location.state?.prefill || {};

    const [formData, setFormData] = useState({
        item_name: prefill.item_name || '',
        category: prefill.category || 'Electronics',
        description: prefill.description || '',
        location: prefill.location || '',
        date_reported: prefill.date_reported || '',
        status: prefill.status || 'Lost',
        image_url: prefill.image_url || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await API.post('/items', formData);
            alert('Item reported successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to report item.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="report-container animate-slide-up">
            <h2>Report a Lost/Found Item</h2>
            <p className="text-center" style={{color: 'var(--text-light)', marginBottom: '2rem'}}>
                Please provide as many details as possible to help us match this item.
            </p>
            <form onSubmit={handleSubmit}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem'}}>
                    <div className="input-group">
                        <label>Item Name *</label>
                        <input name="item_name" value={formData.item_name} placeholder="e.g. Blue Nike Backpack" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Category *</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="Electronics">Electronics</option>
                            <option value="Books">Books</option>
                            <option value="ID Card">ID Card</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label>Detailed Description *</label>
                    <textarea 
                        name="description" 
                        value={formData.description}
                        placeholder="Describe the item, including any distinct marks, serial numbers, or contents..." 
                        rows="4" 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem'}}>
                    <div className="input-group">
                        <label>Location (Where it was lost/found) *</label>
                        <input name="location" value={formData.location} placeholder="e.g. Library, 2nd Floor" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Date *</label>
                        <input type="date" name="date_reported" value={formData.date_reported} onChange={handleChange} required />
                    </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem'}}>
                    <div className="input-group">
                        <label>Are you reporting a Lost or Found item? *</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="Lost">I Lost This Item</option>
                            <option value="Found">I Found This Item</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Image URL (Optional)</label>
                        <input name="image_url" value={formData.image_url} placeholder="https://example.com/image.jpg" onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}} disabled={isSubmitting}>
                    {isSubmitting ? 'Reporting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
};

export default ReportItem;

import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const { register } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('Student');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.toLowerCase().endsWith('@thapar.edu')) {
            alert('Please use a valid Thapar University email address (@thapar.edu).');
            return;
        }

        const rawPhone = phone.replace(/\D/g, '');
        if (rawPhone.length < 10 || rawPhone.length > 15) {
            alert('Please enter a valid phone number (at least 10 digits).');
            return;
        }

        setIsSubmitting(true);
        try {
            await register({ name, email, phone, role, password });
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container animate-slide-up" style={{ maxWidth: '500px', padding: '3rem', margin: '4rem auto', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', borderTop: '4px solid var(--rust)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--rust)', margin: '0' }}>Get Started</h2>
                <p style={{ color: 'var(--text-light)', marginTop: '0.5rem', fontSize: '1rem' }}>Create your Thapar Lost & Found account</p>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="input-group">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '600' }}>Full Name</label>
                    <input type="text" placeholder="e.g. Aayushi Sharma" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--beige-dark)' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="input-group">
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '600' }}>Email Address</label>
                        <input type="email" placeholder="e.g. name@thapar.edu" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--beige-dark)' }} />
                    </div>
                    <div className="input-group">
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '600' }}>Phone</label>
                        <input type="tel" placeholder="e.g. 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--beige-dark)' }} />
                    </div>
                </div>

                <div className="input-group">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '600' }}>Role Group</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--beige-dark)', backgroundColor: 'var(--white)' }}>
                        <option value="Student">Student</option>
                        <option value="Staff">Faculty / Staff</option>
                    </select>
                </div>

                <div className="input-group">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '600' }}>Password</label>
                    <input type="password" placeholder="Create a secure password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--beige-dark)' }} />
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-light)', borderTop: '1px solid var(--beige-dark)', paddingTop: '1.5rem' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--rust)', fontWeight: '700', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--rust-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--rust)'}>
                    Log In
                </Link>
            </p>
        </div>
    );
};

export default Register;

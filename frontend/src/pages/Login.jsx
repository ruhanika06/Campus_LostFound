import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container animate-slide-up" style={{ maxWidth: '450px', padding: '3rem', margin: '4rem auto', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', borderTop: '4px solid var(--rust)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--rust)', margin: '0' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-light)', marginTop: '0.5rem', fontSize: '1rem' }}>Login to access Thapar Lost & Found</p>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="input-group">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '600' }}>Email Address</label>
                    <input 
                        type="email" 
                        placeholder="e.g. name@thapar.edu" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--beige-dark)' }}
                    />
                </div>
                <div className="input-group">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '600' }}>Password</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--beige-dark)' }}
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-light)', borderTop: '1px solid var(--beige-dark)', paddingTop: '1.5rem' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--rust)', fontWeight: '700', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--rust-dark)'} onMouseLeave={(e) => e.target.style.color = 'var(--rust)'}>
                    Create one here
                </Link>
            </p>
        </div>
    );
};

export default Login;

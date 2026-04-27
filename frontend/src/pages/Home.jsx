import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Home = () => {
    const [activeTab, setActiveTab] = useState('lost');

    useEffect(() => {
        // Simple observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="home-container" style={{ backgroundColor: 'var(--beige)' }}>
            {/* Hero Section */}
            <section className="hero-section scroll-animate">
                <div className="hero-content">
                    <h1>
                        Find What's <span>Lost</span>,<br />
                        Return What's Found.
                    </h1>
                    <p>
                        A seamless, fast, and secure way to manage lost items on the Thapar University campus.
                        No more running from department to department.
                    </p>
                    <div className="cta-buttons" style={{ justifyContent: 'flex-start' }}>
                        <Link to="/items" className="btn btn-primary">Browse Items</Link>
                        <Link to="/report" className="btn btn-secondary">Report an Item</Link>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="http://www.thapar.edu/images/phocagallery/Thapar_Uni/1.jpg" alt="Beautiful University Campus" />
                </div>
            </section>

            {/* Stats Card overlapping section */}
            <section className="stats-section scroll-animate delay-100">
                <div className="stat">
                    <h2>85%</h2>
                    <p>Recovery Rate</p>
                </div>
                <div className="stat">
                    <h2>24/7</h2>
                    <p>Active Portal</p>
                </div>
                <div className="stat">
                    <h2>Secure</h2>
                    <p>Identity Verification</p>
                </div>
            </section>

            {/* Interactive Tabs Section */}
            <section className="features-section scroll-animate delay-200">
                <h2 style={{ color: 'var(--rust)', fontSize: '2.5rem', marginBottom: '1rem' }}>How it Works</h2>
                <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Select a path below to see how our platform makes your life easier.</p>

                <div className="tab-container">
                    <button
                        className={`tab ${activeTab === 'lost' ? 'active' : ''}`}
                        onClick={() => setActiveTab('lost')}
                    >
                        I Lost Something
                    </button>
                    <button
                        className={`tab ${activeTab === 'found' ? 'active' : ''}`}
                        onClick={() => setActiveTab('found')}
                    >
                        I Found Something
                    </button>
                    <button
                        className={`tab ${activeTab === 'claim' ? 'active' : ''}`}
                        onClick={() => setActiveTab('claim')}
                    >
                        Claiming Process
                    </button>
                </div>

                <div className="features-container">
                    {activeTab === 'lost' && (
                        <>
                            <div className="feature-card animate-slide-up">
                                <div className="feature-icon">📝</div>
                                <h3>1. File a Report</h3>
                                <p>Quickly log what you lost via our reporting dashboard, including location and descriptions.</p>
                            </div>
                            <div className="feature-card animate-slide-up delay-100">
                                <div className="feature-icon">🔍</div>
                                <h3>2. Search the Database</h3>
                                <p>Check the global database if someone has already found and uploaded your precious item.</p>
                            </div>
                            <div className="feature-card animate-slide-up delay-200">
                                <div className="feature-icon">🎉</div>
                                <h3>3. Get Notified</h3>
                                <p>Stay updated on the platform once someone submits a claim or an admin approves your request.</p>
                            </div>
                        </>
                    )}

                    {activeTab === 'found' && (
                        <>
                            <div className="feature-card animate-slide-up">
                                <div className="feature-icon">📸</div>
                                <h3>1. Snap & Upload</h3>
                                <p>Take a picture of the item, note down where you found it, and log it into our system easily.</p>
                            </div>
                            <div className="feature-card animate-slide-up delay-100">
                                <div className="feature-icon">🛡️</div>
                                <h3>2. Let Admins Handle</h3>
                                <p>We maintain strict privacy. Items are locked securely until someone claims ownership.</p>
                            </div>
                            <div className="feature-card animate-slide-up delay-200">
                                <div className="feature-icon">🤝</div>
                                <h3>3. Return it safely</h3>
                                <p>Help a fellow student out! Feel the joy of doing the right deed on campus.</p>
                            </div>
                        </>
                    )}

                    {activeTab === 'claim' && (
                        <>
                            <div className="feature-card animate-slide-up">
                                <div className="feature-icon">✋</div>
                                <h3>1. Request a Claim</h3>
                                <p>Spot your lost item in the portal? Submit a formal claim requesting its return.</p>
                            </div>
                            <div className="feature-card animate-slide-up delay-100">
                                <div className="feature-icon">👮</div>
                                <h3>2. Verification</h3>
                                <p>Campus staff will review the details to ensure the item is going back to its rightful owner.</p>
                            </div>
                            <div className="feature-card animate-slide-up delay-200">
                                <div className="feature-icon">✅</div>
                                <h3>3. Collect Your Item</h3>
                                <p>Once approved, you'll receive instructions on exactly where and how to collect your lost item.</p>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;

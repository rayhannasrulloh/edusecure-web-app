import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ScanFace, BrainCircuit, Eye, Lock, Zap } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            {/* NAVBAR */}
            <nav className="landing-nav">
                <div className="brand">
                    <ShieldCheck size={32} />
                    <span>EduSecure</span>
                </div>
                <div className="nav-links">
                    <button className="btn btn-ghost" onClick={() => navigate('/login')}>Login</button>
                    <button className="btn btn-primary" onClick={() => navigate('/register')}>Register Now</button>
                </div>
            </nav>

            {/* HERO SECTION */}
            <header className="hero-section">
                <div className="hero-badge">The Future of Secure E-Learning</div>
                <h1 className="hero-title">
                    Smart Learning.<br />
                    Uncompromised Security.
                </h1>
                <p className="hero-desc">
                    An adaptive learning platform that combines Facial Biometric security and Artificial Intelligence (AI) for a fair and personalized exam experience.
                </p>
                <div className="hero-buttons">
                    <button className="btn btn-primary" onClick={() => navigate('/register')}>
                        Get Started Free
                    </button>
                    <button className="btn btn-ghost" style={{border: '1px solid #cbd5e1'}} onClick={() => navigate('/login')}>
                        Live Demo
                    </button>
                </div>
            </header>

            {/* FEATURES GRID */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Why EduSecure?</h2>
                    <p style={{color: '#64748b'}}>Advanced technology to solve academic integrity problems.</p>
                </div>

                <div className="features-grid">
                    {/* Feature 1 */}
                    <div className="feature-card">
                        <div className="feature-icon"><ScanFace size={28} /></div>
                        <h3>Face Authentication</h3>
                        <p>Login and registration instant using biometric facial recognition. No more exam jocking or sharing passwords.</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="feature-card">
                        <div className="feature-icon"><Eye size={28} /></div>
                        <h3>AI Proctoring</h3>
                        <p>Smart proctoring camera that detects suspicious movements (looking away) in real-time and automatically blocks the screen.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="feature-card">
                        <div className="feature-icon"><BrainCircuit size={28} /></div>
                        <h3>Adaptive Learning (DSS)</h3>
                        <p>Decision support system that recommends learning materials based on your interest and quiz performance.</p>
                    </div>

                    {/* Feature 4 */}
                    <div className="feature-card">
                        <div className="feature-icon"><Lock size={28} /></div>
                        <h3>Module Locking</h3>
                        <p>Game-based system where advanced modules are locked until you pass the previous module.</p>
                    </div>

                    {/* Feature 5 */}
                    <div className="feature-card">
                        <div className="feature-icon"><Zap size={28} /></div>
                        <h3>Instant Analytics</h3>
                        <p>Monitor your academic progress through interactive visual charts (Bar/Line Chart).</p>
                    </div>
                </div>
            </section>

            {/* TECH STACK SECTION (Untuk Impress Dosen) */}
            <section className="tech-stack">
                <h3>Built with Modern Technologies</h3>
                <div className="tech-grid">
                    <div className="tech-item">React + Vite</div>
                    <div className="tech-item">Django REST Framework</div>
                    <div className="tech-item">TensorFlow.js (Face-API)</div>
                    <div className="tech-item">dlib Face Recognition</div>
                </div>
            </section>

            {/* FOOTER */}
            <footer>
                <p>&copy; 2025 EduSecure Project. Created by EduSecure Team.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
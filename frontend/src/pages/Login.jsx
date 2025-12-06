import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './AuthStyles.css';

const Login = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  
  const [imgSrc, setImgSrc] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Opsional, tergantung backend butuh atau tidak
  const [isLoading, setIsLoading] = useState(false);

  // Ambil Foto
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  };

  // Ulang Foto
  const retake = () => {
    setImgSrc(null);
  };

  // Fungsi Login
  const handleLogin = async () => {
    if (!username || !imgSrc) {
        alert("Mohon isi username dan ambil foto wajah.");
        return;
    }
    
    setIsLoading(true);
    try {
        const payload = {
            username: username,
            password: password, // Dikirim jaga-jaga, meski validasi utama via Wajah
            image: imgSrc
        };

        const response = await axios.post('http://127.0.0.1:8000/api/login/', payload);

        if (response.status === 200) {
            alert(`Welcome back, ${username}!`);
            localStorage.setItem('username', username)
            navigate('/dashboard'); // Ganti ke halaman dashboard nanti
        }
    } catch (error) {
        console.error(error);
        alert("Login Gagal: Wajah tidak dikenali atau username salah.");
        setImgSrc(null); // Reset foto agar user coba lagi
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="split-container">
      {/* --- KIRI --- */}
      <div className="left-panel">
        <h1>EduSecure</h1>
        <div className="quote-box">
            <div className="quote-divider"></div>
            <p className="quote-text">
                "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
            </p>
            <p className="quote-author">- Malcolm X</p>
        </div>
      </div>

      {/* --- KANAN --- */}
      <div className="right-panel">
        <div className="form-container">
            <h2>Welcome Back Mate! Sheesh</h2>
            <p className="sub-header">Facial verification for class access.</p>

            {/* Area Kamera */}
            <div className="camera-box">
                {!imgSrc ? (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="webcam-view"
                        mirrored={true}
                    />
                ) : (
                    <img src={imgSrc} alt="Face" className="webcam-view" />
                )}
            </div>
            
            {/* Tombol Kecil di bawah kamera */}
             {!imgSrc ? (
                <button onClick={capture} className="secondary-btn mb-4">Scan Face</button>
            ) : (
                <button onClick={retake} className="secondary-btn retake mb-4">Rescan the face</button>
            )}

            {/* Input Form */}
            <div className="form-group">
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            
            <div className="form-group">
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* Tombol Utama */}
            <button 
                onClick={handleLogin} 
                className="primary-btn"
                disabled={isLoading || !imgSrc}
            >
                {isLoading ? "Verifying..." : "Login Now"}
            </button>

            <div style={{textAlign: 'right', marginTop: '10px'}}>
                <Link to="/forgot-password" style={{fontSize: '0.9rem', color: '#6b7280', textDecoration: 'none'}}>
                    Lupa Password?
                </Link>
            </div>

            <Link to="/register" className="auth-link">
                Belum terdaftar? <span>Register disini</span>
            </Link>

            <p className="footer-text">Powered by EduSecure AI</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
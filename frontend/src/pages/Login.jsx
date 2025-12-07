import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import Swal from 'sweetalert2';
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
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please fill username and take face photo!',
        });
        return;
    }
    
    setIsLoading(true);
    try {
        const payload = {
            username: username,
            password: password,
            image: imgSrc
        };

        const response = await axios.post('http://127.0.0.1:8000/api/login/', payload);

        if (response.status === 200) {
            await Swal.fire({
                icon: 'success',
                title: 'Login Success!',
                text: `Welcome back, ${username}`,
                timer: 2000,
                showConfirmButton: false
            });
            localStorage.setItem('username', username)
            navigate('/dashboard');
        }
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Face not recognized or invalid credentials.',
        });
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
                    Forgot Password?
                </Link>
            </div>

            <Link to="/register" className="auth-link">
                Not registered yet? <span>Register here</span>
            </Link>

            <p className="footer-text">Powered by Edusecure AI</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
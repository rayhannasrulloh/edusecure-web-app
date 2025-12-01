import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './AuthStyles.css';

const Register = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  
  // State untuk data form
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: ''
  });
  
  // State untuk kamera & loading
  const [imgSrc, setImgSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Isi Data, 2: Foto Wajah

  // Fungsi menangani perubahan input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Jika semua data terisi, otomatis pindah visual ke step 2
    if(formData.username && formData.password) setStep(2);
  };

  // Fungsi ambil foto
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setStep(3); // Pindah ke step "Siap Daftar"
  };

  // Fungsi foto ulang
  const retake = () => {
    setImgSrc(null);
    setStep(2);
  };

  // Fungsi Submit ke Backend
  const handleSubmit = async () => {
    if (!imgSrc) return alert("Wajah wajib difoto!");
    
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        image: imgSrc // string Base64 dari webcam
      };

      // post ke django
      const response = await axios.post('http://127.0.0.1:8000/api/register/', payload);
      
      if (response.status === 201 || response.status === 200) {
        alert("Registrasi Berhasil! Silakan Login.");
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
      const pesanError = error.response?.data?.error || "Registrasi Gagal. Cek koneksi server.";
      alert(pesanError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="split-container">
      <div className="left-panel">
        <h1>Join EduSecure</h1>
        <p>Buat profil pembelajaran adaptif Anda sekarang.</p>
        
        <div className="stepper">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div> Enter Details
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div> Capture Face ID
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div> Finish
          </div>
        </div>
      </div>

      {/* --- KANAN: Form Input --- */}
      <div className="right-panel">
        <div className="form-container">
            <h2>Student Registration</h2>
            
            {/* Input Fields */}
            <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" placeholder="John Doe" onChange={handleChange} />
            </div>
            
            <div className="form-group">
                <label>Username</label>
                <input type="text" name="username" placeholder="johndoe123" onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="john@example.com" onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="••••••••" onChange={handleChange} />
            </div>

            {/* Area Kamera */}
            <div className="camera-section">
                <label>Face Registration</label>
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
                        <img src={imgSrc} alt="Captured" className="webcam-view" />
                    )}
                </div>
                
                {/* Tombol Kamera (Capture / Retake) */}
                {!imgSrc ? (
                    <button onClick={capture} className="secondary-btn">📸 Ambil Foto</button>
                ) : (
                    <button onClick={retake} className="secondary-btn retake">🔄 Foto Ulang</button>
                )}
            </div>

            {/* Tombol Submit Utama */}
            <button 
                onClick={handleSubmit} 
                className="primary-btn" 
                disabled={isLoading || !imgSrc}
            >
                {isLoading ? "Mendaftarkan..." : "Create Account"}
            </button>

            <Link to="/login" className="auth-link">
                Sudah punya akun? <span>Login disini</span>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
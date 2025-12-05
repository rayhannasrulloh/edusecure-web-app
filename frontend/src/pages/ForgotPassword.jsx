import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './AuthStyles.css'; // Pakai style yang sama biar konsisten

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Input Email, 2: Input OTP
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // TAHAP 1: Minta OTP
    const handleRequestOTP = async () => {
        if(!email) return alert("Isi email dulu!");
        setIsLoading(true);
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/forgot-password/', { email });
            alert(res.data.message);
            setStep(2); // Pindah ke tampilan input OTP
        } catch (error) {
            alert(error.response?.data?.error || "Gagal mengirim email.");
        } finally {
            setIsLoading(false);
        }
    };

    // TAHAP 2: Ganti Password
    const handleResetPassword = async () => {
        if(!otp || !newPassword) return alert("Lengkapi data!");
        setIsLoading(true);
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/reset-password/', {
                email,
                otp,
                new_password: newPassword
            });
            alert("SUKSES! Password telah diubah.");
            navigate('/login');
        } catch (error) {
            alert(error.response?.data?.error || "Gagal mereset password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="split-container">
            {/* KIRI */}
            <div className="left-panel">
                <h1>Recovery</h1>
                <p>Jangan khawatir, kami akan membantu mengembalikan akun Anda.</p>
            </div>

            {/* KANAN */}
            <div className="right-panel">
                <div className="form-container">
                    <h2>Lupa Password?</h2>
                    
                    {step === 1 ? (
                        <>
                            <p className="sub-header">Masukkan email terdaftar untuk menerima OTP.</p>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="john@example.com"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                />
                            </div>
                            <button onClick={handleRequestOTP} className="primary-btn" disabled={isLoading}>
                                {isLoading ? "Mengirim..." : "Kirim Kode OTP"}
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="sub-header">Cek email Anda dan masukkan kode OTP.</p>
                            <div className="form-group">
                                <label>Kode OTP (6 Digit)</label>
                                <input 
                                    type="text" 
                                    placeholder="123456"
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Password Baru</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                />
                            </div>
                            <button onClick={handleResetPassword} className="primary-btn" disabled={isLoading}>
                                {isLoading ? "Memproses..." : "Ubah Password"}
                            </button>
                            
                            <button 
                                onClick={() => setStep(1)} 
                                style={{background:'none', border:'none', color:'#1a56db', marginTop:'10px', cursor:'pointer'}}
                            >
                                Kirim Ulang OTP
                            </button>
                        </>
                    )}

                    <Link to="/login" className="auth-link" style={{marginTop:'20px'}}>
                        Kembali ke <span>Login</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';
import './AuthStyles.css'; // Reuse style form

const Settings = () => {
    const navigate = useNavigate();
    const currentUsername = localStorage.getItem('username');
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: currentUsername,
        password: ''
    });

    useEffect(() => {
        // Ambil data user saat ini untuk pre-fill form
        axios.get(`http://127.0.0.1:8000/api/dashboard/?username=${currentUsername}`)
            .then(res => {
                setFormData(prev => ({
                    ...prev,
                    fullName: res.data.fullName,
                    // Note: Email biasanya tidak dikirim di dashboard endpoint, 
                    // tapi kalau mau ditampilkan harus diupdate di serializer dashboard dulu.
                    // Untuk sekarang kita biarkan email kosong/input manual.
                }));
            });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            const res = await axios.put('http://127.0.0.1:8000/api/update-profile/', {
                current_username: currentUsername,
                ...formData
            });

            if(res.status === 200) {
                Swal.fire('Berhasil', 'Profil diupdate. Silakan login ulang.', 'success');
                localStorage.removeItem('username');
                navigate('/login');
            }
        } catch (error) {
            Swal.fire('Gagal', error.response?.data?.error || 'Gagal update profil', 'error');
        }
    };

    return (
        <Layout>
            <div className="main-content" style={{maxWidth:'600px'}}>
                <div className="welcome-section">
                    <h1>Account Settings</h1>
                    <p>Change your profile</p>
                </div>

                <div className="card">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Your Name" />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@new.com" />
                    </div>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>New Password (Opsional)</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Biarin kosong kalo ga diganti" />
                    </div>

                    <button className="primary-btn" onClick={handleUpdate}>
                        Save Changes
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
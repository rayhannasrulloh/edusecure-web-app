import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Lock, CheckCircle, PlayCircle } from 'lucide-react';
import Layout from '../components/Layout';
import './Dashboard.css'; // Kita pakai style card yang sudah ada

const Modules = () => {
    const [modules, setModules] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // State untuk teks pencarian
    const navigate = useNavigate();

    const username = localStorage.getItem('username');

    useEffect(() => {
        /* Kita butuh kirim username/token agar backend tahu siapa yang request
        (Asumsi di backend Anda pakai Logic filter user manual atau session)
        Di sini kita panggil endpoint biasa, logic user ada di 'request.user' backend.
        PENTING: Jika backend Anda pakai Session Auth, ini otomatis jalan.
        Jika pakai token manual, pastikan axios dikonfigurasi. */
        
        axios.get(`http://127.0.0.1:8000/api/modules/?username=${username}`) 
            .then(res => setModules(res.data))
            .catch(err => console.error(err));
    }, [username]);

    // --- LOGIKA FILTERING ---
    const filteredModules = modules.filter((module) => {
        const term = searchTerm.toLowerCase();
        return (
            module.title.toLowerCase().includes(term) ||
            module.category.toLowerCase().includes(term)
        );
    });

    return (
        <Layout>
            <div className="main-content">
                <div className="welcome-section" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                    <div>
                        <h1>Learning Modules</h1>
                        <p>Selesaikan modul secara berurutan.</p>
                    </div>
                    {/* Search Bar Code (Sama seperti sebelumnya) */}
                    <div style={{position: 'relative', width: '300px'}}>
                         <Search size={20} color="#9ca3af" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)'}} />
                         <input 
                            type="text" 
                            placeholder="Cari modul..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #ddd'}} 
                        />
                    </div>
                </div>

                <div className="modules-grid" style={{
                    display:'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap:'20px', marginTop:'30px'
                }}>
                    {filteredModules.map((module) => (
                        <div key={module.id} className="card" style={{
                            margin:0, 
                            display:'flex', flexDirection:'column',
                            // JIKA TERKUNCI: Beri efek transparan & grayscale
                            opacity: module.is_locked ? 0.6 : 1,
                            background: module.is_locked ? '#f3f4f6' : 'white',
                            position: 'relative'
                        }}>
                            
                            {/* BADGE LEVEL & STATUS */}
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <span style={{fontSize:'0.8rem', fontWeight:'bold', color: '#6b7280'}}>
                                    Level {module.order}
                                </span>
                                {module.status === 'Lulus' && (
                                    <span style={{color:'#16a34a', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.8rem', fontWeight:'bold'}}>
                                        <CheckCircle size={16}/> Lulus
                                    </span>
                                )}
                            </div>

                            {/* JUDUL */}
                            <h3 style={{marginTop:'10px', color: module.is_locked ? '#6b7280' : '#111827'}}>
                                {module.title}
                            </h3>
                            
                            {/* DESKRIPSI */}
                            <p style={{color:'#6b7280', margin:'10px 0', flexGrow: 1}}>
                                {module.description}
                            </p>

                            {/* TOMBOL AKSI */}
                            {module.is_locked ? (
                                <button 
                                    className="start-btn" 
                                    style={{marginTop:'20px', width:'100%', background:'#9ca3af', cursor:'not-allowed', display:'flex', justifyContent:'center', gap:'10px'}}
                                    disabled
                                >
                                    <Lock size={18} /> Terkunci
                                </button>
                            ) : (
                                <button 
                                    className="start-btn" 
                                    style={{marginTop:'20px', width:'100%', display:'flex', justifyContent:'center', gap:'10px'}}
                                    onClick={() => navigate(`/lesson/${module.id}`)}
                                >
                                    {module.status === 'Lulus' ? 'Pelajari Lagi' : 'Mulai Belajar'} <PlayCircle size={18} />
                                </button>
                            )}

                            {/* INFO TAMBAHAN JIKA TERKUNCI */}
                            {module.is_locked && (
                                <div style={{marginTop:'10px', fontSize:'0.75rem', color:'#dc2626', textAlign:'center'}}>
                                    Selesaikan Level {module.order - 1} dulu.
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Modules;
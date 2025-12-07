import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react'; // Import Icon Search
import Layout from '../components/Layout';
import './Dashboard.css'; // Kita pakai style card yang sudah ada

const Modules = () => {
    const [modules, setModules] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // State untuk teks pencarian
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/modules/')
            .then(res => setModules(res.data))
            .catch(err => console.error(err));
    }, []);

    // --- LOGIKA FILTERING ---
    const filteredModules = modules.filter((module) => {
        const term = searchTerm.toLowerCase();
        // Cari berdasarkan Judul, Deskripsi, atau Kategori
        return (
            module.title.toLowerCase().includes(term) ||
            module.description.toLowerCase().includes(term) ||
            module.category.toLowerCase().includes(term)
        );
    });

    return (
        <Layout>
            <div className="main-content">
                
                {/* Header dengan Pencarian */}
                <div className="welcome-section" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'20px'}}>
                    <div>
                        <h1>Learning Modules</h1>
                        <p>Explore all available modules.</p>
                    </div>

                    {/* INPUT SEARCH BAR */}
                    <div style={{position: 'relative', width: '300px'}}>
                        <Search 
                            size={20} 
                            color="#9ca3af" 
                            style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)'}}
                        />
                        <input 
                            type="text" 
                            placeholder="Search module..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px', // Padding kiri besar biar teks gak nabrak icon
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: '0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1a56db'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>
                </div>

                {/* GRID MODUL */}
                <div className="modules-grid" style={{
                    display:'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap:'20px', 
                    marginTop:'30px'
                }}>
                    
                    {/* Tampilkan Pesan jika Tidak Ada Hasil */}
                    {filteredModules.length === 0 && (
                        <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6b7280'}}>
                            <p style={{fontSize:'1.1rem'}}>Module not found "<strong>{searchTerm}</strong>"</p>
                        </div>
                    )}

                    {/* Render Modul yang Lolos Filter */}
                    {filteredModules.map((module) => (
                        <div key={module.id} className="card" style={{margin:0, display:'flex', flexDirection:'column'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <h3>{module.title}</h3>
                                <span style={{
                                    background: module.level === 'Beginner' ? '#dcfce7' : '#dbeafe', 
                                    color: module.level === 'Beginner' ? '#166534' : '#1e40af', 
                                    padding:'2px 8px', borderRadius:'10px', fontSize:'0.8rem', fontWeight:'600'
                                }}>
                                    {module.level}
                                </span>
                            </div>
                            
                            <p style={{color:'#6b7280', margin:'10px 0', flexGrow: 1}}>
                                {module.description}
                            </p>
                            
                            <div style={{marginTop:'15px', padding:'10px', background:'#f9fafb', borderRadius:'8px', fontSize:'0.9rem'}}>
                                Category: <strong>{module.category}</strong>
                            </div>
                            
                            <button 
                                className="start-btn" 
                                style={{marginTop:'20px', width:'100%'}}
                                onClick={() => navigate(`/lesson/${module.id}`)}
                            >
                                Start Learning →
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Modules;
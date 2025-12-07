import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './Dashboard.css'; // Pakai style card yang sudah ada

const Modules = () => {
    const [modules, setModules] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/modules/')
            .then(res => setModules(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <Layout>
            <div className="main-content">
                <div className="welcome-section">
                    <h1>Learning Modules</h1>
                    <p>Explore all available modules</p>
                </div>

                <div className="modules-grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', display:'grid', gap:'20px'}}>
                    {modules.map((module) => (
                        <div key={module.id} className="card" style={{margin:0}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <h3>{module.title}</h3>
                                <span style={{background:'#e0f2fe', color:'#0369a1', padding:'2px 8px', borderRadius:'10px', fontSize:'0.8rem'}}>
                                    {module.level}
                                </span>
                            </div>
                            <p style={{color:'#6b7280', margin:'10px 0'}}>{module.description}</p>
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
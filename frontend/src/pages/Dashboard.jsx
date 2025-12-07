import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);

  const [viewType, setViewType] = useState('list');

  const username = localStorage.getItem('username');

  const fetchDashboardData = async () => {
    try {
        //Ambil Data User & Interest
        const userRes = await axios.get(`http://127.0.0.1:8000/api/dashboard/?username=${username}`);
        setUserData(userRes.data);
        if (!userRes.data.interest) setShowSurvey(true);

        //Ambil Daftar Modul Real dari Database
        const moduleRes = await axios.get('http://127.0.0.1:8000/api/modules/');
        setModules(moduleRes.data);
        
        setLoading(false);
    } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
    }
  };

  useEffect(() => {
    document.body.className = "load";

    if (!username) {
        navigate('/login'); // redirect kalau belum login
        return;
    }
    fetchDashboardData();
  }, []);

  

  const handleSurveySubmit = async (selectedInterest) => {
    try {
        // send data to backend
        await axios.post('http://127.0.0.1:8000/api/save-interest/', {
            username: username,
            interest: selectedInterest
        });
        
        // refresh data dashboard
        await fetchDashboardData(); 
        
        setShowSurvey(false);
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `Minat berhasil diubah ke ${selectedInterest}`,
        });

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: `Gagal menyimpan survey.`,
        });
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('username');
      navigate('/login');
  }

  // --- HELPER: RENDER CONTENT BERDASARKAN VIEW TYPE ---
  const renderPerformanceContent = () => {
      const data = userData?.history || [];
      
      // Jika data kosong
      if (data.length === 0) {
          return (
            <div style={{height: '150px', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', fontStyle:'italic'}}>
                Belum ada riwayat kuis. Silakan mulai modul di bawah.
            </div>
          );
      }

      // Siapkan data untuk grafik (Recharts butuh array bersih)
      // Kita balik urutannya (reverse) agar grafik dari kiri (lama) ke kanan (baru)
      const chartData = [...data].reverse().map(item => ({
          name: item.module_title.substring(0, 10) + '...', // Potong nama biar gak kepanjangan
          full_name: item.module_title,
          score: item.score
      }));

      if (viewType === 'list') {
          return (
            <div className="history-list">
                {data.map((item, index) => (
                    <div key={index} style={{
                        display: 'flex', justifyContent: 'space-between', padding: '10px', 
                        borderBottom: '1px solid #eee', alignItems: 'center'
                    }}>
                        <div>
                            <strong>{item.module_title}</strong>
                            <div style={{fontSize:'0.8rem', color:'#888'}}>
                                {new Date(item.completed_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div style={{textAlign:'right'}}>
                            <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>{item.score}</div>
                            <span style={{
                                fontSize:'0.75rem', padding:'2px 6px', borderRadius:'4px',
                                background: item.status === 'Lulus' ? '#dcfce7' : '#fee2e2',
                                color: item.status === 'Lulus' ? '#166534' : '#991b1b'
                            }}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
          );
      } else if (viewType === 'bar') {
          return (
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip content={({active, payload}) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div style={{background:'white', padding:'10px', border:'1px solid #ccc'}}>
                                        <p style={{fontWeight:'bold'}}>{payload[0].payload.full_name}</p>
                                        <p>Score: {payload[0].value}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}/>
                        <Bar dataKey="score" fill="#1a56db" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          );
      } else if (viewType === 'line') {
          return (
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#1a56db" strokeWidth={2} dot={{r:4}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          );
      }
  };

  if (loading) return <div className="dashboard-container" style={{padding:'40px'}}>Loading...</div>;

  return (
    <div className="dashboard-container">
      {/* --- HEADER --- */}
      <nav className="top-nav">
        <div className="logo-area">Edusecure</div>
        <div className="user-area">
            <span style={{marginRight: '15px'}}>Hey, {userData?.fullName}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="main-content">
        <div className="welcome-section">
            <h1>Student Dashboard</h1>
            <p>Welcome mate. {username}</p>
        </div>

        <div className="dashboard-grid">
            
            {/* KIRI */}
            <div className="left-column">
                {/* 1. PERFORMANCE CARD (UPDATED) */}
                <div className="card card-performance">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', borderBottom:'1px solid #e5e7eb', paddingBottom:'10px'}}>
                        <h3 style={{borderBottom:'none', paddingBottom:0, marginBottom:0}}>Performance</h3>
                        
                        {/* 3. FILTER / PILIHAN TAMPILAN */}
                        <div className="view-selector" style={{display:'flex', gap:'5px'}}>
                            <button 
                                onClick={() => setViewType('list')}
                                style={{
                                    padding:'5px 10px', borderRadius:'6px', border:'none',
                                    background: viewType === 'list' ? '#1a56db' : 'white',
                                    color: viewType === 'list' ? 'white' : '#666', cursor:'pointer'
                                }}
                            >
                                List
                            </button>
                            <button 
                                onClick={() => setViewType('bar')}
                                style={{
                                    padding:'5px 10px', borderRadius:'6px', border:'none',
                                    background: viewType === 'bar' ? '#1a56db' : 'white',
                                    color: viewType === 'bar' ? 'white' : '#666', cursor:'pointer'
                                }}
                            >
                                Bar
                            </button>
                            <button 
                                onClick={() => setViewType('line')}
                                style={{
                                    padding:'5px 10px', borderRadius:'6px', border:'none',
                                    background: viewType === 'line' ? '#1a56db' : 'white',
                                    color: viewType === 'line' ? 'white' : '#666', cursor:'pointer'
                                }}
                            >
                                Plot
                            </button>
                        </div>
                    </div>
                    
                    {/* Render Konten Dinamis */}
                    {renderPerformanceContent()}
                </div>

             <div className="card">
                 <h3>Available Modules</h3>
                 
                 {/* LOOPING MODULE DARI DATABASE */}
                 {modules.length === 0 ? (
                     <p>Damn, No modules available.</p>
                 ) : (
                     modules.map((module) => (
                        <div key={module.id} className="course-item">
                            <div>
                                <h4>{module.title}</h4>
                                <span style={{fontSize:'0.8rem', color:'#6b7280'}}>
                                    {module.description} • {module.level}
                                </span>
                            </div>
                            {/* BUTTON START SEND MODULE ID */}
                            <button
                                className="start-btn"
                                onClick={() => navigate(`/lesson/${module.id}`)}
                            >
                                Start
                            </button>
                        </div>
                     ))
                 )}
             </div>
            </div>

            {/* KANAN: AI Recommmendations (DSS Result) */}
            <div className="right-column">
                <div className="card">
                    <h3>AI Recommendations</h3>
                    
                    <div style={{marginBottom:'15px', color:'#6b7280', fontSize:'0.9rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span>
                            Adaptive path based on: <strong>{userData?.interest || "None"}</strong>
                        </span>
                        {/* TOMBOL EDIT INTEREST */}
                        <button
                            onClick={() => setShowSurvey(true)}
                            style={{background:'none', border:'none', cursor:'pointer', color:'#1a56db', textDecoration:'underline', fontSize:'0.8rem'}}
                        >
                            Change
                        </button>
                    </div>

                    {userData?.recommendations && userData.recommendations.length > 0 ? (
                        userData.recommendations.map((module) => (
                            <div key={module.id} className="rec-box">
                                <h4 style={{margin:'0 0 5px 0'}}>{module.title}</h4>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <span className="rec-tag">{module.level}</span>
                                    {/* Tombol Start Langsung ke Lesson */}
                                    <span 
                                        style={{fontSize:'0.85rem', color:'#1a56db', cursor:'pointer', fontWeight:'bold'}}
                                        onClick={() => navigate(`/lesson/${module.id}`)}
                                    >
                                        Start Learning →
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{textAlign:'center', padding:'20px', color:'#9ca3af'}}>
                            <p>There are no specific recommendations.</p>
                            <button onClick={() => setShowSurvey(true)} className="secondary-btn">
                                Set Learning Interests
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* --- SURVEY MODAL --- */}
      {showSurvey && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Determine Your Learning Path</h2>
                <p>To help our AI, what topics would you most like to learn about?</p>
                
                <div className="interest-options">
                    <button onClick={() => handleSurveySubmit('AI')} className="interest-btn">Artificial Intelligence</button>
                    <button onClick={() => handleSurveySubmit('Cyber Security')} className="interest-btn">Cyber Security</button>
                    <button onClick={() => handleSurveySubmit('IoT')} className="interest-btn">Internet of Things (IoT)</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
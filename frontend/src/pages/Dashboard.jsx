import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);

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
        // 1. Kirim Data ke Backend
        await axios.post('http://127.0.0.1:8000/api/save-interest/', {
            username: username,
            interest: selectedInterest
        });
        
        // 2. Refresh Data Dashboard (PENTING!)
        // Ini akan memicu get_dashboard_data lagi, yang otomatis mengambil 
        // rekomendasi terbaru sesuai interest yang baru disimpan.
        await fetchDashboardData(); 
        
        // 3. Tutup Modal
        setShowSurvey(false);
        alert(`Minat berhasil diubah ke ${selectedInterest}`); // Opsional: Feedback ke user

    } catch (error) {
        console.error(error);
        alert("Gagal menyimpan survey.");
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('username');
      navigate('/login');
  }

  if (loading) return <div className="dashboard-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      {/* --- HEADER --- */}
      <nav className="top-nav">
        <div className="logo-area">Edusecure</div>
        <div className="user-area">
            <span style={{marginRight: '15px'}}>Hi, {userData?.fullName}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="main-content">
        <div className="welcome-section">
            <h1>Student Dashboard</h1>
            <p>Welcome back. {username}</p>
        </div>

        <div className="dashboard-grid">
            
            {/* KIRI */}
            <div className="left-column">
             <div className="card">
                    <h3>Performance Overview</h3>
                    
                    {/* LOGIKA TAMPILAN HISTORY */}
                    {userData?.history && userData.history.length > 0 ? (
                        <div className="history-list">
                            {userData.history.map((item, index) => (
                                <div key={index} style={{
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    padding: '10px', 
                                    borderBottom: '1px solid #eee',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <strong>{item.module_title}</strong>
                                        <div style={{fontSize:'0.8rem', color:'#888'}}>
                                            {new Date(item.completed_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{textAlign:'right'}}>
                                        <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>
                                            {item.score}
                                        </div>
                                        <span style={{
                                            fontSize:'0.75rem', 
                                            padding:'2px 6px', 
                                            borderRadius:'4px',
                                            background: item.status === 'Lulus' ? '#dcfce7' : '#fee2e2',
                                            color: item.status === 'Lulus' ? '#166534' : '#991b1b'
                                        }}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{height: '100px', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', fontStyle:'italic'}}>
                            Belum ada riwayat kuis. Silakan mulai modul.
                        </div>
                    )}
                </div>

             <div className="card">
                 <h3>Available Modules</h3>
                 
                 {/* LOOPING MODULE DARI DATABASE */}
                 {modules.length === 0 ? (
                     <p>Tidak ada modul tersedia.</p>
                 ) : (
                     modules.map((module) => (
                        <div key={module.id} className="course-item">
                            <div>
                                <h4>{module.title}</h4>
                                <span style={{fontSize:'0.8rem', color:'#6b7280'}}>
                                    {module.description} • {module.level}
                                </span>
                            </div>
                            {/* TOMBOL START MENGIRIM ID MODUL */}
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

            {/* KANAN: AI Recommendations (Hasil DSS) */}
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
                            <p>Tidak ada rekomendasi khusus.</p>
                            <button onClick={() => setShowSurvey(true)} className="secondary-btn">
                                Atur Minat Belajar
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
                <h2>Tentukan Jalur Belajarmu</h2>
                <p>Agar AI kami dapat membantu, topik apa yang paling ingin Anda pelajari?</p>
                
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
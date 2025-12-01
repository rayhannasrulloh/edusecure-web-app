import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ambil username dari localStorage (disimpan saat login)
  const username = localStorage.getItem('username');

  const fetchDashboardData = async () => {
    try {
        const res = await axios.get(`http://127.0.0.1:8000/api/dashboard/?username=${username}`);
        setUserData(res.data);
        
        // Jika interest masih kosong, tampilkan Survey
        if (!res.data.interest) {
            setShowSurvey(true);
        }
        setLoading(false);
    } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
    }
    return;
  };

  useEffect(() => {
    if (!username) {
        navigate('/login'); // Redirect kalau belum login
        return;
    }
    fetchDashboardData();
  }, []);

  

  const handleSurveySubmit = async (selectedInterest) => {
    try {
        const res = await axios.post('http://127.0.0.1:8000/api/save-interest/', {
            username: username,
            interest: selectedInterest
        });
        
        // Update data lokal agar UI berubah langsung
        setUserData({
            ...userData,
            interest: selectedInterest,
            recommendations: res.data.recommendations
        });
        setShowSurvey(false); // Tutup modal
    } catch (error) {
        console.error("Error saving interest", error);
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
        <div className="logo-area">📖 EduSecure</div>
        <div className="user-area">
            <span style={{marginRight: '15px'}}>Hi, {userData?.fullName}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="main-content">
        <div className="welcome-section">
            <h1>Student Dashboard</h1>
            <p>Welcome back. Student ID: {username}</p>
        </div>

        <div className="dashboard-grid">
            {/* KIRI: Performance & Modules */}
            <div className="left-column">
                <div className="card">
                    <h3>Performance Overview</h3>
                    <div style={{height: '150px', background: '#f9fafb', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', borderRadius:'8px', border:'2px dashed #e5e7eb'}}>
                        Belum ada hasil kuis (Data Placeholder)
                    </div>
                </div>

                <div className="card">
                    <h3>Available Modules</h3>
                    {/* Module List Hardcoded for Demo */}
                    <div className="course-item">
                        <div>
                            <h4>Basic Security Concepts</h4>
                            <span style={{fontSize:'0.8rem', color:'#6b7280'}}>Introduction to InfoSec</span>
                        </div>
                        <button className="start-btn">Start</button>
                    </div>
                    <div className="course-item">
                        <div>
                            <h4>Network Protocols</h4>
                            <span style={{fontSize:'0.8rem', color:'#6b7280'}}>TCP/IP and OSI Model</span>
                        </div>
                        <button className="start-btn">Start</button>
                    </div>
                </div>
            </div>

            {/* KANAN: AI Recommendations (Hasil DSS) */}
            <div className="right-column">
                <div className="card">
                    <h3>AI Recommendations</h3>
                    <p style={{fontSize:'0.9rem', color:'#6b7280', marginBottom:'15px'}}>
                        Adaptive path based on your interest in <strong>{userData?.interest || "..."}</strong>.
                    </p>

                    {userData?.recommendations.map((course) => (
                        <div key={course.id} className="rec-box">
                            <h4 style={{margin:'0 0 5px 0'}}>{course.title}</h4>
                            <span className="rec-tag">{course.level}</span>
                            <div style={{marginTop:'10px', fontSize:'0.85rem', color:'#1a56db', cursor:'pointer'}}>
                                View Details →
                            </div>
                        </div>
                    ))}
                    
                    {userData?.recommendations.length === 0 && <p>Selesaikan survey untuk mendapatkan rekomendasi.</p>}
                </div>
            </div>
        </div>
      </div>

      {/* --- SURVEY MODAL (Muncul jika belum ada Interest) --- */}
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
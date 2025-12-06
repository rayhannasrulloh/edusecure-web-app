import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Lesson.css';

const Lesson = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModuleDetail = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/api/modules/${moduleId}/`);
                setModule(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Gagal memuat materi", error);
                setLoading(false);
            }
        };
        fetchModuleDetail();
    }, [moduleId]);

    if (loading) return <div className="lesson-container">Load Material...</div>;
    if (!module) return <div className="lesson-container">Material not found</div>;

    return (
        <div className="lesson-container">
            {/* Header Judul */}
            <div className="lesson-header">
                <button onClick={() => navigate('/dashboard')} style={{background:'none', border:'none', color:'#6b7280', cursor:'pointer', marginBottom:'10px'}}>
                    ← Back to Dashboard
                </button>
                <h1 className="lesson-title">{module.title}</h1>
                <div className="lesson-meta">
                    Level: <strong>{module.level}</strong> • {module.description}
                </div>
            </div>

            {/* Isi Materi */}
            <div className="lesson-content">
                {module.content ? module.content : "GODDAMN. There is no material for this module yet."}
            </div>

            {/* Tombol Lanjut ke Kuis */}
            <div className="action-area">
                <button className="quiz-btn" onClick={() => navigate(`/quiz/${moduleId}`)}>
                    Continue to Quiz
                </button>
            </div>
        </div>
    );
};

export default Lesson;
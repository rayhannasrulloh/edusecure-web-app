import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ProctorCam from '../components/ProctorCam';
import './Quiz.css';

const Quiz = () => {
    const navigate = useNavigate();
    const { moduleId } = useParams();
    
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [dssFeedback, setDssFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [warningMsg, setWarningMsg] = useState(""); 

    // ambil Username
    const username = localStorage.getItem('username');

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/api/questions/?module_id=${moduleId}`);
                setQuestions(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Gagal", error);
                setLoading(false);
            }
        };
        if (moduleId) fetchQuestions();
    }, [moduleId]);

    const handleAnswer = (index) => {
        // kalo ada warning, jawaban gbisa diklik (double protection selain css)
        if (warningMsg) return;

        if (index === questions[currentQuestion].answer) {
            setScore(score + 1);
        }

        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion);
        } else {
            const finalRawScore = score + (index === questions[currentQuestion].answer ? 1 : 0);
            finishQuiz(finalRawScore);
        }
    };

    const finishQuiz = async (finalScoreRaw) => {
        const finalScore = Math.round((finalScoreRaw / questions.length) * 100);
        
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/submit-quiz/', {
                username: username,
                module_id: moduleId,
                score: finalScore
            });
            
            setDssFeedback(res.data);
            setScore(finalScore);
            setShowResult(true);
        } catch (error) {
            console.error(error);
            alert("Failed mengirim jawaban.");
        }
    };

    if (loading) return <div className="quiz-container">Load Question...</div>;
    if (questions.length === 0) return <div className="quiz-container">There are no questions available yet.</div>;

    return (
        <div className="quiz-container">
            
            {/* 1. KAMERA PENGAWAS (Tetap aktif di background) */}
            {!showResult && (
                <ProctorCam onWarning={(msg) => setWarningMsg(msg)} />
            )}

            {/* 2. OVERLAY PERINGATAN (Muncul Full Screen jika Warning aktif) */}
            {warningMsg && (
                <div className="warning-overlay">
                    <div className="warning-icon">⚠️</div>
                    <h1 className="warning-title">PELANGGARAN TERDETEKSI</h1>
                    <p className="warning-desc">{warningMsg}</p>
                    <p style={{marginTop:'20px', fontSize:'0.9rem', opacity:0.8}}>
                        Harap kembali menghadap layar untuk melanjutkan ujian.
                    </p>
                </div>
            )}

            {/* 3. AREA KUIS (Akan kabur jika Warning aktif) */}
            {/* Tambahkan class 'blurred' jika warningMsg tidak kosong */}
            <div className={`quiz-content ${warningMsg ? 'blurred' : ''}`}>
                
                {!showResult ? (
                    <div className="quiz-card">
                        <h4 style={{color:'#6b7280'}}>Question {currentQuestion + 1} / {questions.length}</h4>
                        <div className="question-text">{questions[currentQuestion].question}</div>
                        
                        <div className="options-grid">
                            {questions[currentQuestion].options.map((opt, index) => (
                                <button key={index} className="option-btn" onClick={() => handleAnswer(index)}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="result-overlay">
                        <div className="result-box">
                            <div className="score-circle">{score}</div>
                            <h2>{dssFeedback?.status}</h2>
                            <p style={{color:'#4b5563', margin:'20px 0'}}>
                                {dssFeedback?.message}
                            </p>
                            
                            <button 
                                className="primary-btn" 
                                onClick={() => navigate('/dashboard')}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quiz;
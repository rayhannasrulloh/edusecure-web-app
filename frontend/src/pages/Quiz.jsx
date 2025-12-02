import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Quiz.css';
import ProctorCam from '../components/ProctorCam';

const Quiz = () => {
    const navigate = useNavigate();
    const { moduleId } = useParams(); //ambil moduleId dari URL params

    const [questions, setQuestions] = useState([]); //state untuk menampung soal dari db
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [dssFeedback, setDssFeedback] = useState(null);
    const [loading, setLoading] = useState(true); //state loading
    const [warningMsg, setWarningMsg] = useState("");

    const username = localStorage.getItem('username'); //ambil username dari localStorage
    

    //FETCH DATA DARI BACKEND SAAT HALAMAN DIBUKA
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                //panggil API dengan parameter module_id
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
        //Cek jawaban benar
        if (index === questions[currentQuestion].answer) {
            setScore(score + 1);
        }

        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion);
        } else {
            // Hitung skor akhir termasuk jawaban soal terakhir ini
            const finalRawScore = score + (index === questions[currentQuestion].answer ? 1 : 0);
            finishQuiz(finalRawScore);
        }
    };

    const finishQuiz = async (finalScoreRaw) => {
        //konversi ke skala 100
        const finalScore = Math.round((finalScoreRaw / questions.length) * 100);
        
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/submit-quiz/', {
                username: username, //<--- KIRIM INI
                module_id: moduleId, //<--- KIRIM INI (dari useParams)
                score: finalScore
            });
            
            setDssFeedback(res.data);
            setScore(finalScore);
            setShowResult(true);
        } catch (error) {
            alert(error+"Gagal mengirim jawaban.");
        }
    };

    if (loading) return <div className="quiz-container">Memuat Soal...</div>;
    
    if (questions.length === 0) return <div className="quiz-container">Belum ada soal tersedia. Hubungi Admin.</div>;

    return (
        <div className="quiz-container">
            {/* KAMERA PENGAWAS (hanya muncul jika quiz belum selesai) */}
            {!showResult && (
                <ProctorCam onWarning={(msg) => setWarningMsg(msg)} />
            )}

            {/* ALERT PERINGATAN */}
            {warningMsg && (
                <div style={{
                    position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    background: '#ef4444', color: 'white', padding: '15px 30px', 
                    borderRadius: '50px', fontWeight: 'bold', zIndex: 10000,
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.5)',
                    animation: 'pulse 1s infinite'
                }}>
                    ! {warningMsg} !
                </div>
            )}

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
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quiz;
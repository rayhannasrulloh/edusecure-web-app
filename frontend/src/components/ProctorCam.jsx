import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const ProctorCam = ({ onWarning }) => {
    const videoRef = useRef();
    const [isLoaded, setIsLoaded] = useState(false);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                videoRef.current.srcObject = stream;
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models'; // Mengambil dari folder public/models
            
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
                ]);
                setIsLoaded(true);
                startVideo();
            } catch (error) {
                console.error("Gagal memuat model AI:", error);
            }
        };
        loadModels();
    }, []);

    

    const handleVideoPlay = () => {
        setInterval(async () => {
            if (!videoRef.current) return;

            const detections = await faceapi.detectAllFaces(
                videoRef.current, 
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks();

            if (detections.length === 0) {
                onWarning("Wajah tidak terlihat!");
                return;
            }

            if (detections.length > 1) {
                onWarning("Terdeteksi lebih dari satu orang!");
                return;
            }

            // --- LOGIKA DETEKSI MENOLEH (HEAD POSE HEURISTIC) ---
            const landmarks = detections[0].landmarks;
            const nose = landmarks.getNose()[3]; // Ujung hidung
            const leftJaw = landmarks.getJawOutline()[0]; // Rahang kiri
            const rightJaw = landmarks.getJawOutline()[16]; // Rahang kanan
            
            // Hitung jarak hidung ke rahang kiri vs kanan
            const distToLeft = Math.abs(nose.x - leftJaw.x);
            const distToRight = Math.abs(nose.x - rightJaw.x);
            const ratio = distToLeft / (distToLeft + distToRight);

            // jika rasio jauh dari 0.5 (tengah), berarti menoleh
            if (ratio < 0.2) { 
                onWarning("Jangan menoleh ke Kanan!");
            } else if (ratio > 0.8) {
                onWarning("Jangan menoleh ke Kiri!");
            } else {
                onWarning(""); // aman (Menghadap depan)
            }

        }, 1000); //cek setiap 1 detik
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '200px',
            height: '150px',
            border: '4px solid #1a56db',
            borderRadius: '12px',
            overflow: 'hidden',
            zIndex: 9999,
            backgroundColor: 'black',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        }}>
            <video 
                ref={videoRef} 
                autoPlay 
                muted 
                onPlay={handleVideoPlay}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
            />
            {!isLoaded && <div style={{color:'white', textAlign:'center', marginTop:'40%'}}>Loading AI...</div>}
        </div>
    );
};

export default ProctorCam;
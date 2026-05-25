import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, AlertTriangle } from 'lucide-react';

const WebcamCapture = ({ 
  mode = 'scan', // 'scan' (auto-match), 'register' (one-time save), 'verify' (match specific user)
  onFaceDetected, // Callback when face descriptor is captured
  isProcessing = false, 
  targetStudentId = null // Used for 'verify' mode
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelLoadingError, setModelLoadingError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  // State for drawing face box overlay in React
  const [faceBox, setFaceBox] = useState(null);
  const [scanStatus, setScanStatus] = useState('Initializing models...');
  
  // Debug error message visible on-screen for troubleshooting
  const [debugError, setDebugError] = useState(null);

  // 1. Load face-api.js models from local public folder on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const faceapi = window.faceapi;
        if (!faceapi) {
          throw new Error('faceapi is not defined on window. The face-api.js library script failed to load.');
        }

        // We load models from the local public directory
        const MODEL_URL = `${import.meta.env.BASE_URL}models/`;
        console.log('FaceID: Loading models from local path:', MODEL_URL);
        setScanStatus('Loading Face AI models...');
        
        // Load Tiny Face Detector
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
          console.log('FaceID: TinyFaceDetector loaded');
        } catch (e) {
          throw new Error(`Failed to load TinyFaceDetector: ${e.message}. Check if model files exist in public/models/`);
        }

        // Load landmarks
        try {
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
          console.log('FaceID: FaceLandmark68Net loaded');
        } catch (e) {
          throw new Error(`Failed to load FaceLandmark68Net: ${e.message}`);
        }

        // Load recognition model
        try {
          await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
          console.log('FaceID: FaceRecognitionNet loaded');
        } catch (e) {
          throw new Error(`Failed to load FaceRecognitionNet: ${e.message}`);
        }

        setModelsLoaded(true);
        setScanStatus('Models loaded. Starting camera...');
        setDebugError(null);
      } catch (err) {
        console.error('FaceID: Model load error:', err);
        setModelLoadingError(err.message || 'Failed to load face detection models.');
        setDebugError(err.message || 'Failed to load models.');
        setScanStatus('Model loading failed');
      }
    };

    // Retry checking window.faceapi in case the CDN script takes a moment to evaluate
    let checkCount = 0;
    const checkAndLoad = () => {
      if (window.faceapi) {
        loadModels();
      } else if (checkCount < 10) {
        checkCount++;
        setScanStatus(`Waiting for Face-AI script (${checkCount}/10)...`);
        setTimeout(checkAndLoad, 500);
      } else {
        setModelLoadingError('face-api.js script tag did not load. Please check your internet connection.');
        setDebugError('face-api.js script tag did not load.');
        setScanStatus('Script load failed');
      }
    };

    checkAndLoad();
  }, []);

  // 2. Start webcam when models are loaded
  useEffect(() => {
    if (!modelsLoaded) return;

    const startCamera = async () => {
      try {
        setCameraError(null);
        setDebugError(null);
        
        // Stop any existing stream first
        stopCamera();

        const constraints = {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        // videoRef is now guaranteed to exist because the video tag is rendered unconditionally in the DOM!
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for metadata to load to ensure camera is fully streaming
          videoRef.current.onloadedmetadata = () => {
            setCameraActive(true);
            setScanStatus('Camera active. Align your face.');
          };
        } else {
          // Fallback in case ref is not bound yet
          setTimeout(startCamera, 100);
        }
      } catch (err) {
        console.error('FaceID: Webcam error:', err);
        setCameraError('Webcam access denied. Please grant camera permissions.');
        setDebugError('Webcam access error: ' + err.message);
        setScanStatus('Camera access error');
      }
    };

    startCamera();

    return () => {
      stopCamera();
    };
  }, [modelsLoaded]);

  // 3. Setup Face Detection Loop when camera is active
  useEffect(() => {
    if (!cameraActive || !modelsLoaded) return;

    const faceapi = window.faceapi;
    const video = videoRef.current;
    
    if (!video || !faceapi) return;

    const detectFace = async () => {
      if (isProcessing) return;

      // Ensure video is active, playing, and ready
      if (!video || video.paused || video.ended || video.readyState < 2 || video.videoWidth === 0) {
        return; 
      }

      try {
        // Detect single face with landmarks & descriptor
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          const { x, y, width, height } = detection.detection.box;
          
          const videoWidth = video.videoWidth || 640;
          const videoHeight = video.videoHeight || 480;

          // Convert coordinates to percentages for overlay box
          const boxStyle = {
            left: `${((videoWidth - x - width) / videoWidth) * 100}%`,
            top: `${(y / videoHeight) * 100}%`,
            width: `${(width / videoWidth) * 100}%`,
            height: `${(height / videoHeight) * 100}%`
          };
          
          setFaceBox(boxStyle);
          setScanStatus('Face detected! Matching...');
          setDebugError(null);

          // Pass the descriptor (Float32Array of 128 numbers converted to Array) to parent
          if (onFaceDetected && !isProcessing) {
            const descriptorArray = Array.from(detection.descriptor);
            onFaceDetected(descriptorArray);
          }
        } else {
          setFaceBox(null);
          setScanStatus('Scanning... Please align your face in the center.');
        }
      } catch (err) {
        console.error('FaceID: Detection error during frame analysis:', err);
        setDebugError('Detection loop error: ' + err.message);
      }
    };

    // Detection tick every 500ms
    detectionIntervalRef.current = setInterval(detectFace, 500);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [cameraActive, modelsLoaded, isProcessing, onFaceDetected]);

  // Cleanup helper
  const stopCamera = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setCameraActive(false);
    setFaceBox(null);
  };

  const handleRetryCamera = () => {
    setModelsLoaded(false);
    setTimeout(() => {
      setModelsLoaded(true);
    }, 200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div className="camera-container">
        {modelLoadingError && (
          <div className="camera-placeholder">
            <p style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>{modelLoadingError}</p>
            <button className="app-btn btn-secondary" onClick={() => window.location.reload()}>
              <RefreshCw size={14} /> Reload Page
            </button>
          </div>
        )}

        {!modelLoadingError && cameraError && (
          <div className="camera-placeholder">
            <p style={{ color: 'var(--accent-red)', padding: '0 20px', textAlign: 'center', fontWeight: 'bold' }}>{cameraError}</p>
            <button className="app-btn btn-cyan" onClick={handleRetryCamera}>
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        )}

        {!modelLoadingError && !cameraError && !cameraActive && (
          <div className="camera-placeholder">
            <RefreshCw size={32} className="animate-spin" style={{ animation: 'spin 1.5s infinite linear', color: 'var(--primary)' }} />
            <p>{scanStatus}</p>
          </div>
        )}

        {/* Video element is now rendered unconditionally in the DOM so that the React Ref is always available */}
        <video 
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="camera-feed"
          style={{ 
            display: cameraActive ? 'block' : 'none',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)' // Mirror stream
          }}
        />

        {cameraActive && (
          <>
            <div className="scanner-overlay">
              <div className="scanner-corner corner-tl"></div>
              <div className="scanner-corner corner-tr"></div>
              <div className="scanner-corner corner-bl"></div>
              <div className="scanner-corner corner-br"></div>
              <div className="laser-line"></div>
            </div>
            
            {/* Debug Banner - visible on screen if there is any runtime issue */}
            {debugError && (
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                right: '10px',
                background: 'rgba(220, 38, 38, 0.95)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 100,
                boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
              }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {debugError}
                </span>
              </div>
            )}

            {/* Bounding box over face */}
            {faceBox && (
              <div 
                className="face-box" 
                style={{
                  position: 'absolute',
                  border: '2px solid var(--secondary)',
                  boxShadow: '0 0 12px var(--secondary-glow)',
                  borderRadius: '10px',
                  pointerEvents: 'none',
                  ...faceBox
                }}
              >
                <div 
                  className="face-box-label"
                  style={{
                    position: 'absolute',
                    top: '-23px',
                    left: '0',
                    background: 'var(--secondary)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isProcessing ? 'Verifying...' : 'Face Aligned'}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className={`scanner-status ${
        modelLoadingError || cameraError ? 'status-loading' : 
        isProcessing ? 'status-loading' : 
        faceBox ? 'status-success' : 'status-scanning'
      }`}>
        <Camera size={15} className={!faceBox && cameraActive ? 'animate-pulse' : ''} />
        <span>
          {isProcessing ? 'Verifying Face ID with database...' : scanStatus}
        </span>
      </div>
    </div>
  );
};

export default WebcamCapture;

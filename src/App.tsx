import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, X, Camera, Upload, RefreshCw } from "lucide-react";
import { Language, ChatMessage, WeatherData } from "./types";
import { CROP_SAMPLES } from "./samples";
import { TRANSLATIONS } from "./translations";
import { motion, AnimatePresence } from "motion/react";

// Import modular UI components
import LanguageSelector from "./components/LanguageSelector";
import DiagnosticHub from "./components/DiagnosticHub";
import SoilAdvisor from "./components/SoilAdvisor";
import WeatherAdvisory from "./components/WeatherAdvisory";
import HelplineDirectory from "./components/HelplineDirectory";

// Import frontend API helper services
import { fetchAgroWeather, diagnoseCropLeaf, sendAdvisoryChatMessage } from "./services/api";

// Import Firebase SDK & Custom Utilities
import { 
  isFirebaseConfigured, 
  loginWithGoogle, 
  loginAnonymously, 
  logoutUser, 
  saveDiagnosticReport, 
  fetchUserDiagnostics, 
  saveAdvisoryMessage, 
  fetchAdvisoryChats,
  auth
} from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function App() {
  const [lang, setLang] = useState<Language>("en");
  const [region, setRegion] = useState<string>("south");
  const [cropType, setCropType] = useState<string>("Rice");

  // Firebase Auth & History states
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [diagnosticsHistory, setDiagnosticsHistory] = useState<any[]>([]);

  // Weather state variables
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [customLocation, setCustomLocation] = useState<string>("");
  const [locationInput, setLocationInput] = useState<string>("");

  // Vision Diagnostic states
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [diagnosing, setDiagnosing] = useState<boolean>(false);
  const [diagnosisReport, setDiagnosisReport] = useState<string>("");
  const [diagnosticError, setDiagnosticError] = useState<string>("");
  const [currentSelectedSampleId, setCurrentSelectedSampleId] = useState<string>("");

  // Chat advisory states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [sendingChat, setSendingChat] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Live Camera and Media Stream states
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const activeTranslation = TRANSLATIONS[lang];

  // Auto-fetch agro-weather when region, crop, language, or custom location changes
  useEffect(() => {
    async function getWeatherData() {
      setLoadingWeather(true);
      try {
        const data = await fetchAgroWeather({
          region,
          cropType,
          lang,
          customLocation,
        });
        setWeather(data);
      } catch (err) {
        console.error("Agronomy weather update failed:", err);
      } finally {
        setLoadingWeather(false);
      }
    }
    getWeatherData();
  }, [region, cropType, lang, customLocation]);

  // Handle starting greeting when language changes
  useEffect(() => {
    setChatHistory([
      {
        id: "sys-greet",
        role: "assistant",
        content: activeTranslation.chatAssistantGreeting,
        timestamp: new Date(),
      },
    ]);
  }, [lang]);

  // Synchronize with Firebase session seamlessly and silently
  useEffect(() => {
    let active = true;
    let unsubscribeAuth: (() => void) | undefined;

    const initializeSession = async () => {
      if (!isFirebaseConfigured()) {
        let cachedUid = localStorage.getItem("farmer_device_id");
        if (!cachedUid) {
          // Check if old simulated_u_id exists to preserve context
          cachedUid = localStorage.getItem("simulated_u_id") || `farmer-${Math.random().toString(36).substring(2, 11)}`;
          localStorage.setItem("farmer_device_id", cachedUid);
        }
        
        const anonymousUser = {
          uid: cachedUid,
          displayName: "Farmer Associate",
          email: "farmer@local-agro.org"
        } as User;
        
        if (active) {
          setUser(anonymousUser);
          setLoadingUser(false);
          
          try {
            const diags = await fetchUserDiagnostics(cachedUid);
            if (active) setDiagnosticsHistory(diags);
            const messages = await fetchAdvisoryChats(cachedUid);
            if (active && messages.length > 0) setChatHistory(messages);
          } catch (e) {
            console.error("Failed to load local database logs:", e);
          }
        }
        return;
      }

      // If Firebase IS fully configured, synchronize Auth silently
      unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        if (!active) return;
        
        if (currentUser) {
          setUser(currentUser);
          setLoadingUser(false);
          try {
            const diags = await fetchUserDiagnostics(currentUser.uid);
            if (active) setDiagnosticsHistory(diags);
            const messages = await fetchAdvisoryChats(currentUser.uid);
            if (active && messages.length > 0) setChatHistory(messages);
          } catch (e) {
            console.error("Failed to sync Firestore reports:", e);
          }
        } else {
          // Automatically register or join anonymized session to keep database secure and transparent
          try {
            const anonymousUser = await loginAnonymously();
            if (active) setUser(anonymousUser);
          } catch (err) {
            console.error("Silent authentication fallback:", err);
            let cachedUid = localStorage.getItem("farmer_device_id");
            if (!cachedUid) {
              cachedUid = `farmer-${Math.random().toString(36).substring(2, 11)}`;
              localStorage.setItem("farmer_device_id", cachedUid);
            }
            if (active) {
              setUser({
                uid: cachedUid,
                displayName: "Farmer Associate"
              } as User);
            }
          }
          setLoadingUser(false);
        }
      });
    };

    initializeSession();

    return () => {
      active = false;
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [lang]);

  // Camera stream cleanup helper
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const startLiveCamera = async () => {
    setIsCameraOpen(true);
    setCameraError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.error("AISTUDIO webcam play failed:", e));
        }
      }, 350);
    } catch (err: any) {
      console.warn("navigator.mediaDevices.getUserMedia failed:", err);
      setCameraError(
        lang === "te"
          ? "కెమెరా అనుమతి లభించలేదు. దయచేసి ఐఫ్రేమ్ అనుమతులు మార్చండి లేదా క్రింద ఉన్న సాధారణ ఫైల్ ఫోటో వాడండి."
          : lang === "hi"
          ? "कैमरा खोलने में बाधा आई। कृपया ब्राउज़र सेटिंग्स जांचें या नीचे वाले डायरेक्ट कैमरा बटन का उपयोग करें।"
          : "Camera feed access denied. Please verify in-app credentials or use the direct mobile device camera fallback."
      );
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const switchCamera = async () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: nextFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera rotate failure:", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        const base64Content = dataUrl.split(",")[1];

        setImageBase64(base64Content);
        setMimeType("image/jpeg");
        setImagePreviewUrl(dataUrl);
        setDiagnosticError("");
        setDiagnosisReport("");
        setCurrentSelectedSampleId("");

        stopLiveCamera();
      }
    }
  };

  const handleFileReader = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setDiagnosticError(
        lang === "te"
          ? "ఫైల్ సైజ్ చాలా పెద్దది, గరిష్ట పరిమితి 10MB."
          : "File is too large, the maximum size is 10MB."
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Content = result.split(",")[1];
      setImageBase64(base64Content);
      setMimeType(file.type);
      setImagePreviewUrl(result);
      setDiagnosticError("");
      setDiagnosisReport(""); // Clear previous report
      setCurrentSelectedSampleId(""); // Clear any sample highlighted
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileReader(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileReader(file);
    }
  };

  // User click on simulated crop sample
  const handleSelectSample = (sample: typeof CROP_SAMPLES[0]) => {
    setCurrentSelectedSampleId(sample.id);
    setImageBase64(sample.simulatedBase64);
    setMimeType("image/png");
    setImagePreviewUrl(""); // Trigger simulated thumbnail representation
    setCropType(sample.cropType);
    setDiagnosticError("");
    setDiagnosisReport("");
  };

  // Fire Visual Diagnosis Request
  const handleDiagnose = async () => {
    if (!imageBase64) {
      setDiagnosticError(activeTranslation.noImageError);
      return;
    }
    setDiagnosing(true);
    setDiagnosticError("");
    setDiagnosisReport("");

    try {
      const data = await diagnoseCropLeaf({
        imageBase64,
        mimeType,
        cropType,
        language: lang,
      });
      setDiagnosisReport(data.diagnosis);

      // SAVE REPORT TO GOOGLE FIRESTORE
      const currentUId = user?.uid || localStorage.getItem("simulated_u_id") || "anonymous_farmer";
      await saveDiagnosticReport({
        cropType,
        report: data.diagnosis,
        confidence: 92,
        imagePreviewUrl: imagePreviewUrl || (currentSelectedSampleId ? "" : `data:${mimeType};base64,${imageBase64}`),
        mimeType,
        userId: currentUId
      });
      
      const updated = await fetchUserDiagnostics(currentUId);
      setDiagnosticsHistory(updated);

    } catch (err: any) {
      console.error(err);
      setDiagnosticError(err.message || "Diagnostic report unavailable right now.");
    } finally {
      setDiagnosing(false);
    }
  };

  // Fire Chat Advisory
  const handleSendChat = async (textToSend?: string) => {
    const content = textToSend || chatInput;
    if (!content.trim() || sendingChat) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput(""); // Clear field if it was manual typing
    setSendingChat(true);
    setChatError("");

    const currentUId = user?.uid || localStorage.getItem("simulated_u_id") || "anonymous_farmer";
    await saveAdvisoryMessage(currentUId, "user", content);

    try {
      const data = await sendAdvisoryChatMessage({
        message: content,
        history: chatHistory.slice(-6).concat(userMsg), // Send last 6 messages as context
        language: lang,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, assistantMsg]);

      await saveAdvisoryMessage(currentUId, "assistant", data.reply);
    } catch (err: any) {
      setChatError(err.message || "Connection timeout with agronomy counselor.");
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50/10 to-stone-50 text-slate-900 flex flex-col font-sans" id="app-root">
      {/* Disclaimer Notification Strip */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-amber-600 text-amber-50 text-xs py-2.5 px-4 font-semibold border-b border-amber-700 relative flex items-center overflow-hidden shadow-md z-50 shrink-0"
            id="expert-banner"
          >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-3 w-full">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4.5 h-4.5 text-yellow-200 shrink-0 animate-pulse" />
                <span className="leading-relaxed text-[11px] sm:text-xs text-center sm:text-left">
                  {activeTranslation.expertAlertText}
                </span>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="bg-amber-800/80 hover:bg-amber-900 border border-amber-500/40 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition hover:scale-105 active:scale-95 cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-300 shrink-0"
                id="dismiss-banner-btn"
              >
                {lang === "te" ? "సరే" : lang === "hi" ? "समझ गया" : "Got it!"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Top Header */}
      <header className="bg-emerald-990 text-white shadow-xl border-b border-emerald-900 py-6 px-4 md:px-8 relative overflow-hidden shrink-0" id="main-header">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-800/60 via-transparent to-transparent opacity-50 z-0"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between relative z-10 space-y-4 md:space-y-0">
          <div>
            <div className="flex items-center space-x-3">
              <span className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-bold tracking-widest uppercase shadow-sm">
                {activeTranslation.tagline}
              </span>
              <span className="bg-emerald-400/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-400/30 font-mono">
                v2.5 LIVE
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1 text-white flex items-center" id="main-title">
              🌾 {activeTranslation.title}
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm mt-1 max-w-xl font-light">
              {activeTranslation.subtitle}
            </p>
          </div>

          {/* Configuration Settings Box - Extracted Panel */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <LanguageSelector
              lang={lang}
              setLang={setLang}
              region={region}
              setRegion={setRegion}
              activeTranslation={activeTranslation}
            />
          </div>
        </div>
      </header>

      {/* Main Core Responsive Bento Grid Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="bento-main">
        {/* Left Side: Diagnostics and Simulation Hub (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6" id="bento-left">
          <DiagnosticHub
            lang={lang}
            cropType={cropType}
            setCropType={setCropType}
            imageBase64={imageBase64}
            setImageBase64={setImageBase64}
            mimeType={mimeType}
            setMimeType={setMimeType}
            imagePreviewUrl={imagePreviewUrl}
            setImagePreviewUrl={setImagePreviewUrl}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            diagnosing={diagnosing}
            diagnosisReport={diagnosisReport}
            setDiagnosisReport={setDiagnosisReport}
            diagnosticError={diagnosticError}
            setDiagnosticError={setDiagnosticError}
            currentSelectedSampleId={currentSelectedSampleId}
            setCurrentSelectedSampleId={setCurrentSelectedSampleId}
            diagnosticsHistory={diagnosticsHistory}
            setDiagnosticsHistory={setDiagnosticsHistory}
            startLiveCamera={startLiveCamera}
            cameraInputRef={cameraInputRef}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleSelectSample={handleSelectSample}
            handleDiagnose={handleDiagnose}
            activeTranslation={activeTranslation}
          />

          <HelplineDirectory activeTranslation={activeTranslation} />
        </div>

        {/* Right Columns: Weather & AI Advisor Chat (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-6" id="bento-right">
          <WeatherAdvisory
            region={region}
            cropType={cropType}
            lang={lang}
            customLocation={customLocation}
            setCustomLocation={setCustomLocation}
            locationInput={locationInput}
            setLocationInput={setLocationInput}
            weather={weather}
            loadingWeather={loadingWeather}
            activeTranslation={activeTranslation}
          />

          <SoilAdvisor
            lang={lang}
            chatHistory={chatHistory}
            chatInput={chatInput}
            setChatInput={setChatInput}
            sendingChat={sendingChat}
            chatError={chatError}
            handleSendChat={handleSendChat}
            activeTranslation={activeTranslation}
          />
        </div>
      </main>

      {/* Premium In-App Live Camera Modal Viewport */}
      <AnimatePresence>
        {isCameraOpen && (
          <div className="fixed inset-0 bg-stone-950/95 flex flex-col justify-between p-4 z-50 overflow-hidden" id="camera-overlay-modal">
            {/* Header Control Panel */}
            <div className="max-w-md mx-auto w-full flex items-center justify-between py-2 text-white">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-stone-200">
                  {lang === "te" ? "లైవ్ కెమెరా యాక్టివ్" : lang === "hi" ? "लाइव कैमरा सक्रिय" : "LIVE SCANNER FEED"}
                </span>
              </div>

              <button
                type="button"
                onClick={stopLiveCamera}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition shadow text-white hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
                id="camera-close-overlay-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Viewfinder Section */}
            <div className="max-w-md mx-auto w-full flex-grow flex items-center justify-center relative bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-inner my-2">
              {cameraError ? (
                <div className="p-6 text-center space-y-4 max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed font-semibold">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      stopLiveCamera();
                      cameraInputRef.current?.click();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition duration-150 active:scale-95 inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <span>📸</span>
                    <span>
                      {lang === "te" ? "పరికరం కెమెరా వాడండి" : lang === "hi" ? "सीधे फोटो लें" : "Use Device Camera"}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover rounded-2xl" />
                  {/* Subtle Target Crop Scanning Reticle Visual Overlay */}
                  <div className="absolute inset-6 border-2 border-dashed border-emerald-400/40 rounded-2xl pointer-events-none flex flex-col items-center justify-between p-4">
                    <div className="text-[9px] text-emerald-300 font-mono tracking-wider bg-black/60 px-2.5 py-1 rounded backdrop-blur-sm uppercase font-semibold">
                      {lang === "te" ? "ఆకును గమనించండి" : lang === "hi" ? "पत्ती को संरेखित करें" : "Align leaf in preview"}
                    </div>
                    <div className="w-16 h-0.5 bg-emerald-400/60 animate-bounce"></div>
                    <div className="text-[8px] text-stone-400 font-mono tracking-widest bg-stone-950/60 px-2 py-1 rounded">
                      ZOOM: ENVIRONMENT
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Trigger Panel */}
            <div className="max-w-md mx-auto w-full py-4 flex items-center justify-between px-6 text-white shrink-0">
              <button
                type="button"
                onClick={switchCamera}
                disabled={!!cameraError}
                className="bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 disabled:opacity-20 p-3.5 rounded-full border border-white/15 transition cursor-pointer text-white focus:outline-none flex items-center justify-center"
                title="Rotate Camera Stream"
                id="camera-switch-lens-btn"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={!!cameraError}
                className="bg-white hover:bg-emerald-50 text-emerald-950 hover:scale-105 active:scale-90 disabled:opacity-25 p-5 rounded-full border-4 border-emerald-500 shadow-xl transition duration-200 cursor-pointer focus:outline-none flex items-center justify-center font-bold"
                id="camera-snapshot-capture-btn"
              >
                <Camera className="w-6.5 h-6.5 text-emerald-950" />
              </button>

              <button
                type="button"
                onClick={() => {
                  stopLiveCamera();
                  cameraInputRef.current?.click();
                }}
                className="bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 p-3.5 rounded-full border border-white/15 transition cursor-pointer text-white focus:outline-none flex items-center justify-center font-bold"
                title="Launch File Browser"
              >
                <Upload className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

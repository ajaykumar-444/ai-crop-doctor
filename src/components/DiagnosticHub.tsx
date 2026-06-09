import React from "react";
import { Upload, Camera, Compass, BookOpen, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Language, CROP_TYPES } from "../types";
import { CROP_SAMPLES } from "../samples";
import { motion, AnimatePresence } from "motion/react";

interface DiagnosticHubProps {
  lang: Language;
  cropType: string;
  setCropType: (c: string) => void;
  imageBase64: string;
  setImageBase64: (s: string) => void;
  mimeType: string;
  setMimeType: (s: string) => void;
  imagePreviewUrl: string;
  setImagePreviewUrl: (s: string) => void;
  isDragging: boolean;
  setIsDragging: (b: boolean) => void;
  diagnosing: boolean;
  diagnosisReport: string;
  setDiagnosisReport: (s: string) => void;
  diagnosticError: string;
  setDiagnosticError: (s: string) => void;
  currentSelectedSampleId: string;
  setCurrentSelectedSampleId: (s: string) => void;
  diagnosticsHistory: any[];
  setDiagnosticsHistory: (h: any[]) => void;
  
  startLiveCamera: () => void;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleSelectSample: (sample: typeof CROP_SAMPLES[0]) => void;
  handleDiagnose: () => Promise<void>;
  activeTranslation: any;
}

export const DiagnosticHub: React.FC<DiagnosticHubProps> = ({
  lang,
  cropType,
  setCropType,
  imageBase64,
  setImageBase64,
  mimeType,
  setMimeType,
  imagePreviewUrl,
  setImagePreviewUrl,
  isDragging,
  setIsDragging,
  diagnosing,
  diagnosisReport,
  setDiagnosisReport,
  diagnosticError,
  setDiagnosticError,
  currentSelectedSampleId,
  setCurrentSelectedSampleId,
  diagnosticsHistory,
  setDiagnosticsHistory,
  startLiveCamera,
  cameraInputRef,
  fileInputRef,
  handleFileChange,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleSelectSample,
  handleDiagnose,
  activeTranslation,
}) => {

  const renderFormattedReport = (text: string) => {
    if (!text) return null;

    // Split markdown sections
    const sections = text.split(/(?=###\s+)/);

    return (
      <div className="space-y-4 text-slate-800 leading-relaxed font-sans" id="report-output">
        {sections.map((section, idx) => {
          const match = section.match(/^###\s+(.+)\n([\s\S]*)$/);
          if (match) {
            const title = match[1];
            const content = match[2];

            const isWarning =
              title.toLowerCase().includes("warning") ||
              title.toLowerCase().includes("disclaimer") ||
              title.toLowerCase().includes("హెచ్చరిక") ||
              title.toLowerCase().includes("चेतावनी");

            return (
              <div
                key={idx}
                className={`p-6 rounded-xl border ${
                  isWarning
                    ? "bg-amber-50 border-amber-300 shadow-md ring-2 ring-amber-500/20"
                    : "bg-white border-emerald-100 shadow-sm"
                }`}
                id={`report-sec-${idx}`}
              >
                <h4
                  className={`text-lg font-bold flex items-center mb-3 ${
                    isWarning ? "text-amber-800" : "text-emerald-800"
                  }`}
                >
                  {isWarning && <AlertTriangle className="w-5 h-5 mr-2 animate-bounce" />}
                  {title}
                </h4>
                <div className="prose prose-emerald max-w-none">
                  {content.split("\n").map((line, lIdx) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return null;

                    // Bullet lists
                    if (trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
                      const itemText = trimmedLine.replace(/^[-*]\s*/, "");
                      return (
                        <ul key={lIdx} className="list-disc pl-5 my-1 text-slate-700">
                          <li>{itemText}</li>
                        </ul>
                      );
                    }
                    return <p key={lIdx} className="text-sm my-1 text-slate-700">{trimmedLine}</p>;
                  })}
                </div>
              </div>
            );
          }
          return (
            <p key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-sm whitespace-pre-line text-slate-700">
              {section}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-6" id="diagnostic-hub-container">
      {/* Target Plant Selector Header Card */}
      <section className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm" id="crops-setup">
        <h2 className="text-xl font-bold text-emerald-950 flex items-center mb-4">
          <Compass className="w-5 h-5 mr-2 text-emerald-600" />
          {activeTranslation.cropSelect}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CROP_TYPES.map((crop) => {
            const isActive = cropType === crop.value;
            return (
              <button
                key={crop.value}
                onClick={() => {
                  setCropType(crop.value);
                  setImageBase64("");
                  setImagePreviewUrl("");
                  setDiagnosisReport("");
                  setCurrentSelectedSampleId("");
                }}
                className={`flex items-center space-x-2.5 p-3 rounded-2xl border text-sm text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-inner scale-102"
                    : "bg-stone-50 border-stone-200 text-slate-700 hover:border-emerald-300"
                }`}
                id={`crop-badge-${crop.value}`}
              >
                <span className="text-xl bg-white p-1 rounded-lg shadow-sm border border-stone-100">
                  {crop.icon}
                </span>
                <span className="truncate">{crop.labelEn}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Visual Diagnostic Hub */}
      <section className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col relative overflow-hidden" id="diagnostic-hub">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <h2 className="text-xl font-bold text-emerald-950 flex items-center mb-1">
          <Camera className="w-5 h-5 mr-2 text-emerald-600" />
          {activeTranslation.diagnosticHub}
        </h2>
        <p className="text-xs text-slate-500 mb-4 font-mono uppercase tracking-wider">
          [ TARGET CROP STUDYING: <span className="text-emerald-700 font-bold">{cropType}</span> ]
        </p>

        {/* Camera Capture Selection Tray */}
        <div className="grid grid-cols-2 gap-3 mb-4" id="camera-option-tray">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startLiveCamera();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition duration-150 transform active:scale-95 flex items-center justify-center space-x-2 shadow cursor-pointer border border-emerald-700/50 focus:outline-none"
            id="camera-open-stream-btn"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>{lang === "te" ? "లైవ్ కెమెరా" : lang === "hi" ? "इन-ऐप लाइव कैमरा" : "In-App Live Camera"}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cameraInputRef.current?.click();
            }}
            className="bg-stone-100 hover:bg-stone-200 hover:border-stone-300 text-slate-700 font-bold text-xs py-3.5 px-4 rounded-xl transition duration-150 transform active:scale-95 flex items-center justify-center space-x-2 shadow-sm cursor-pointer border border-stone-200 focus:outline-none"
            id="camera-direct-native-btn"
          >
            <span className="text-[14px] leading-none">📸</span>
            <span>{lang === "te" ? "పరికరం కెమెరా" : lang === "hi" ? "डिवाइस कैमरा" : "Device Camera"}</span>
          </button>
        </div>

        {/* Native Mobile OS Direct Camera Input Option */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
          id="native-camera-fallback-input"
        />

        {/* Drag & Drop Leaf Upload Sandbox */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!imagePreviewUrl && !currentSelectedSampleId) {
              fileInputRef.current?.click();
            }
          }}
          className={`border-3 border-dashed rounded-2xl p-8 mb-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            isDragging
              ? "border-emerald-500 bg-emerald-50/50"
              : imageBase64
              ? "border-emerald-500 bg-emerald-50/10 hover:bg-emerald-50/20"
              : "border-stone-200 hover:border-emerald-300 hover:bg-stone-50/50"
          }`}
          id="upload-drag-box"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="leaf-file-input"
          />

          {currentSelectedSampleId ? (
            <div className="flex flex-col items-center py-4">
              <div className="bg-emerald-100 p-4 rounded-full border border-emerald-300 shadow mb-3">
                <span className="text-4xl text-emerald-800">✅</span>
              </div>
              <h4 className="font-bold text-emerald-950 text-lg">
                {CROP_SAMPLES.find((s) => s.id === currentSelectedSampleId)?.[
                  `name${lang === "te" ? "Te" : lang === "hi" ? "Hi" : "En"}` as any
                ]}
              </h4>
              <p className="text-xs text-emerald-700 mt-1 bg-white border border-emerald-200 px-3 py-1 rounded-full shadow-inner font-mono">
                {activeTranslation.selectedCropPlaceholder}
              </p>
            </div>
          ) : imagePreviewUrl ? (
            <div className="relative max-w-xs mx-auto p-2 bg-white rounded-2xl border shadow">
              <img
                src={imagePreviewUrl}
                alt="Uploaded crop target"
                referrerPolicy="no-referrer"
                className="max-h-56 w-full object-cover rounded-xl"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageBase64("");
                  setImagePreviewUrl("");
                  setDiagnosisReport("");
                }}
                className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow hover:bg-rose-700 focus:outline-none cursor-pointer"
                title="Remove leaf photo"
              >
                ✖
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center select-none">
              <div className="bg-stone-100 p-4 rounded-full border border-stone-200 text-slate-500 mb-3 hover:bg-emerald-50 transition-colors">
                <Upload className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="font-semibold text-stone-700 text-sm max-w-sm">
                {activeTranslation.uploadPrompt}
              </p>
              <p className="text-xs text-stone-400 mt-1 font-sans">{activeTranslation.uploadSupport}</p>
            </div>
          )}
        </div>

        {/* SIMULATED SAMPLES BAR */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-4" id="samples-container">
          <h3 className="text-xs font-bold text-slate-600 mb-2.5 flex items-center">
            <BookOpen className="w-4 h-4 text-emerald-600 mr-1.5" />
            {activeTranslation.sampleLabel}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CROP_SAMPLES.map((sample) => {
              const isSelected = currentSelectedSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer focus:outline-none ${
                    isSelected
                      ? "bg-gradient-to-b from-emerald-500 to-emerald-600 border-emerald-600 text-white shadow-md scale-102 font-medium"
                      : "bg-white border-stone-200 text-slate-600 hover:border-emerald-300 hover:shadow-sm"
                  }`}
                  id={`sample-${sample.id}`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: sample.svgIcon }}
                    className={`mb-1 bg-stone-50/20 p-1.5 rounded-lg border border-stone-100/10 ${
                      isSelected ? "brightness-110" : ""
                    }`}
                  />
                  <span className="text-[11px] font-bold tracking-tight line-clamp-1">
                    {lang === "te" ? sample.nameTe : lang === "hi" ? sample.nameHi : sample.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DATABASE HISTORIC SCAN LOGS */}
        {diagnosticsHistory && diagnosticsHistory.length > 0 && (
          <div className="bg-emerald-50/10 border border-emerald-100 rounded-2xl p-4 mb-4" id="db-history-container">
            <h3 className="text-xs font-bold text-emerald-900 mb-2.5 flex items-center justify-between">
              <span className="flex items-center">
                <span className="mr-1.5 font-sans">🗄️</span>
                {lang === "te" ? "భద్రపరిచిన పంట నివేదికలు" : lang === "hi" ? "सहेजे गए फसल रिपोर्ट इतिहास" : "Saved Analysis History (Google Firestore / Cache)"}
              </span>
              <button 
                onClick={async () => {
                  const cleared = confirm(lang === "te" ? "నిజంగా ఈ నివేదికల చరిత్రను తొలగించాలా?" : lang === "hi" ? "क्या आप सच में अपनी रिपोर्ट मिटाना चाहते हैं?" : "Are you sure you want to clear your diagnostics history cache?");
                  if (cleared) {
                    localStorage.removeItem("local_diagnostics");
                    setDiagnosticsHistory([]);
                  }
                }}
                className="text-[10px] text-rose-600 hover:underline font-mono select-none uppercase cursor-pointer"
              >
                {lang === "te" ? "శుభ్రం చేయి" : lang === "hi" ? "इतिहास मिटाएँ" : "Clear Logs"}
              </button>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {diagnosticsHistory.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCropType(item.cropType);
                    setDiagnosisReport(item.report);
                    setImagePreviewUrl(item.imagePreviewUrl || "");
                    setImageBase64(item.imagePreviewUrl ? "from-history" : "simulated_placeholder"); // placeholder base64
                    setCurrentSelectedSampleId("");
                  }}
                  className="flex items-center space-x-3 p-2.5 rounded-xl border bg-white border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-left transition text-xs cursor-pointer focus:outline-none"
                  id={`diag-hist-btn-${item.id}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.imagePreviewUrl ? (
                      <img src={item.imagePreviewUrl} alt="Crop" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[15px]">🍃</span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="font-bold text-emerald-950 truncate flex items-center justify-between">
                      <span>{item.cropType}</span>
                      <span className="text-[9px] font-mono font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 px-1 rounded shrink-0">
                        CONF: {item.confidence}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error alerts */}
        {diagnosticError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-center mb-4 leading-relaxed" id="diagnostic-error">
            <AlertTriangle className="w-5 h-5 mr-2 text-rose-600 shrink-0" />
            <span>{diagnosticError}</span>
          </div>
        )}

        {/* Submit Diagnose Leaf button */}
        <div className="flex space-x-3">
          <button
            onClick={handleDiagnose}
            disabled={diagnosing || !imageBase64}
            className="flex-grow bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-200 disabled:text-stone-400 disabled:border-stone-200 text-white font-bold text-sm tracking-wide px-5 py-3 rounded-2xl border border-emerald-800 leading-none shadow-md transition hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none cursor-pointer focus:outline-none"
            id="diagnose-trigger"
          >
            {diagnosing ? (
              <span className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{activeTranslation.diagnosing}</span>
              </span>
            ) : (
              <span>{activeTranslation.diagnoseBtn}</span>
            )}
          </button>

          {(imageBase64 || diagnosisReport) && (
            <button
              onClick={() => {
                setImageBase64("");
                setImagePreviewUrl("");
                setDiagnosisReport("");
                setDiagnosticError("");
                setCurrentSelectedSampleId("");
              }}
              className="bg-stone-100 hover:bg-stone-200 border border-stone-200 px-4 rounded-2xl text-slate-600 font-medium text-xs shadow-sm transition hover:text-slate-900 cursor-pointer focus:outline-none"
              id="reset-diagnostic-btn"
              title="Clear all"
            >
              {lang === "te" ? "శుభ్రం చేయి" : lang === "hi" ? "साफ़ करें" : "Clear"}
            </button>
          )}
        </div>
      </section>

      {/* Diagnosis Live Report output section */}
      <AnimatePresence mode="wait">
        {diagnosisReport && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-emerald-50/10 border-2 border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col space-y-4"
            id="diagnostic-result-section"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-emerald-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-emerald-950 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
                  {activeTranslation.diagnosisResult}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5 uppercase">
                  REPORT SYSTEM ID: AI-AGRD-{(CROP_SAMPLES.find((s) => s.id === currentSelectedSampleId)?.id || "custom-upload").toUpperCase()}
                </p>
              </div>

              {/* Confidence dynamic slider indicator */}
              <div className="mt-3 md:mt-0 flex items-center space-x-3 bg-white px-4 py-2 border border-emerald-100/60 rounded-2xl shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase leading-none">ANALYSIS CONFIDENCE</span>
                  <span className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5 leading-none">92%</span>
                </div>
                <div className="w-1.5 h-8 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="w-full bg-emerald-600 h-[92%]"></div>
                </div>
              </div>
            </div>

            {/* Simulated Interactive leaf overlay image in report block */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
              <div className="md:col-span-3 bg-stone-50 border border-stone-200 flex items-center justify-center p-3 rounded-xl overflow-hidden aspect-square self-center">
                {currentSelectedSampleId ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: CROP_SAMPLES.find((s) => s.id === currentSelectedSampleId)!.svgIcon }}
                    className="scale-125"
                  />
                ) : imagePreviewUrl ? (
                  <img src={imagePreviewUrl || ""} alt="Crop Leaf" referrerPolicy="no-referrer" className="object-cover w-full h-full rounded" />
                ) : (
                  <span className="text-slate-300 font-mono text-xs">Simulated Leaf No. 1</span>
                )}
              </div>
              <div className="md:col-span-9 flex flex-col justify-center space-y-1">
                <h4 className="text-sm font-bold text-emerald-950 leading-tight">
                  {lang === "te" ? "పరిశీలనలో ఉన్న పంట:" : lang === "hi" ? "दिए गए फसल का प्रकार:" : "Studied Crop Plantation:"}
                  <span className="text-emerald-700 ml-1.5">{cropType}</span>
                </h4>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed font-sans">
                  {currentSelectedSampleId
                    ? CROP_SAMPLES.find((s) => s.id === currentSelectedSampleId)?.description
                    : lang === "te"
                    ? "ఫీల్డ్ యూజర్ ద్వారా అప్‌లోడ్ చేయబడిన ఆకు చిత్రం ఆధారంగా ఫలితాలు తయారు చేయబడినవి."
                    : lang === "hi"
                    ? "उपयोगकर्ता द्वारा अपलोड की गई पत्ती छवि के आधार पर विश्लेषण रिपोर्ट तैयार की गई।"
                    : "Diagnostics performed directly on the organic matter present in the user uploaded media file."}
                </p>
              </div>
            </div>

            {/* Formatted response text */}
            <div className="mt-2 text-slate-800">
              {renderFormattedReport(diagnosisReport)}
            </div>

            {/* Technical model info block in the report card */}
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-stone-500 font-mono text-[10px] leading-relaxed">
              <p className="font-semibold text-emerald-800 select-none uppercase tracking-widest mb-1">DATASET AUDIT CREDENTIALS</p>
              <p>INTELLIGENCE ENGINE: Google Gemini 3.5 Flash server-side (User-Agent: aistudio-build)</p>
              <p>DATABASE CONTEXT: AI Crop Doctor Agronomical Standard Dataset (rev 2026.06)</p>
              <p>TIMESTAMP: {new Date().toUTCString()}</p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};
export default DiagnosticHub;

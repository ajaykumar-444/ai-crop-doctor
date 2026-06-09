import React from "react";
import { Language, STATES_AND_REGIONS } from "../types";

interface LanguageSelectorProps {
  lang: Language;
  setLang: (l: Language) => void;
  region: string;
  setRegion: (r: string) => void;
  activeTranslation: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  lang,
  setLang,
  region,
  setRegion,
  activeTranslation,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-emerald-950/50 p-3 rounded-2xl border border-emerald-800/60 shadow-inner">
      {/* Language Bar Selector */}
      <div className="flex flex-col">
        <label className="text-[10px] text-emerald-300 font-medium mb-1 px-1">{activeTranslation.langSelect}</label>
        <div className="flex bg-emerald-900/60 p-1 rounded-xl border border-emerald-700/40" id="lang-bar">
          {(["en", "te", "hi"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                lang === l
                  ? "bg-emerald-600 text-white shadow font-bold"
                  : "text-emerald-200 hover:text-white"
              }`}
              id={`lang-btn-${l}`}
            >
              {l === "en" ? "English" : l === "te" ? "తెలుగు" : "हिन्दी"}
            </button>
          ))}
        </div>
      </div>

      {/* Region climate selector */}
      <div className="flex flex-col">
        <label className="text-[10px] text-emerald-300 font-medium mb-1 px-1">{activeTranslation.regionSelect}</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="bg-emerald-900/60 text-slate-50 text-xs font-medium border border-emerald-700/40 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          id="region-selector"
        >
          {STATES_AND_REGIONS.map((r) => (
            <option key={r.code} value={r.code} className="text-slate-800">
              {lang === "te" ? r.nameTe : lang === "hi" ? r.nameHi : r.nameEn}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
export default LanguageSelector;

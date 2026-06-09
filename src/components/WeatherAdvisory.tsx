import React, { useState } from "react";
import { CloudSun, MapPin, Compass, Thermometer, Droplets, Wind, AlertTriangle, RefreshCw } from "lucide-react";
import { Language, WeatherData } from "../types";

interface WeatherAdvisoryProps {
  region: string;
  cropType: string;
  lang: Language;
  customLocation: string;
  setCustomLocation: (l: string) => void;
  locationInput: string;
  setLocationInput: (l: string) => void;
  weather: WeatherData | null;
  loadingWeather: boolean;
  activeTranslation: any;
}

export const WeatherAdvisory: React.FC<WeatherAdvisoryProps> = ({
  region,
  cropType,
  lang,
  customLocation,
  setCustomLocation,
  locationInput,
  setLocationInput,
  weather,
  loadingWeather,
  activeTranslation,
}) => {
  const [weatherActiveTab, setWeatherActiveTab] = useState<"spray" | "water" | "harvest" | "sow">("spray");

  return (
    <section className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden" id="weather-section">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>

      <h2 className="text-lg font-bold text-emerald-950 flex items-center mb-3">
        <CloudSun className="w-5 h-5 mr-2 text-emerald-600" />
        {activeTranslation.weatherTitle}
      </h2>

      {/* Custom Location Weather Input Option */}
      <div className="mb-4 bg-emerald-50/30 border border-emerald-100/60 p-3.5 rounded-2xl" id="custom-weather-location-container">
        <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-500 block mb-1.5 flex items-center">
          <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
          {activeTranslation.searchLocationLabel}
        </label>
        <div className="flex items-center space-x-2 relative">
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCustomLocation(locationInput.trim());
              }
            }}
            placeholder={activeTranslation.enterLocationPlaceholder}
            className="flex-grow bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
            id="weather-location-input"
          />
          <button
            onClick={() => setCustomLocation(locationInput.trim())}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow active:scale-95 cursor-pointer"
            id="weather-location-submit-btn"
          >
            {activeTranslation.searchLocationBtn}
          </button>
        </div>
        {customLocation && (
          <div className="flex items-center justify-between mt-2.5 px-2.5 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <span className="text-[10px] text-emerald-800 font-medium flex items-center font-sans">
              <span className="inline-block animate-bounce mr-1">📍</span>
              {lang === "te" ? "కస్టమ్ ప్రాంతం:" : lang === "hi" ? "कस्टम स्थान:" : "Active:"}{" "}
              <strong className="text-emerald-950 ml-1 font-bold">{customLocation}</strong>
            </span>
            <button
              onClick={() => {
                setCustomLocation("");
                setLocationInput("");
              }}
              className="text-[10px] text-rose-600 hover:underline hover:text-rose-700 font-bold focus:outline-none cursor-pointer"
              id="clear-location-btn"
            >
              {lang === "te" ? "మార్చు" : lang === "hi" ? "हटाएं" : "Reset"}
            </button>
          </div>
        )}
      </div>

      {loadingWeather ? (
        <div className="flex flex-col justify-center items-center py-10 text-stone-400 text-xs gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Syncing climate metrics...</span>
        </div>
      ) : weather ? (
        <div className="space-y-4" id="weather-details-box">
          {/* 2x2 High-fidelity Weather Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 border border-orange-100 p-2.5 rounded-2xl flex items-center space-x-2.5 shadow-sm">
              <div className="p-1.5 bg-orange-500/10 text-orange-700 rounded-xl shrink-0">
                <Thermometer className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[8px] uppercase tracking-wider text-orange-800 font-bold block">TEMP</span>
                <strong className="text-xs sm:text-sm font-black text-orange-950 font-mono block truncate">
                  {weather.temp}
                </strong>
                <span className="text-[7.5px] text-orange-600 font-medium block truncate max-w-[90px]">{weather.conditions}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-100 p-2.5 rounded-2xl flex items-center space-x-2.5 shadow-sm">
              <div className="p-1.5 bg-blue-500/10 text-blue-700 rounded-xl shrink-0">
                <Droplets className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[8px] uppercase tracking-wider text-blue-800 font-bold block">HUMIDITY</span>
                <strong className="text-xs sm:text-sm font-black text-blue-950 font-mono block">
                  {weather.humidity}
                </strong>
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-cyan-50/40 border border-sky-100 p-2.5 rounded-2xl flex items-center space-x-2.5 shadow-sm">
              <div className="p-1.5 bg-sky-500/10 text-sky-700 rounded-xl shrink-0">
                <CloudSun className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[8px] uppercase tracking-wider text-sky-800 font-bold block">RAIN PROB</span>
                <strong className="text-xs sm:text-sm font-black text-sky-950 font-mono block">
                  {weather.rainProb}
                </strong>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50/40 border border-teal-100 p-2.5 rounded-2xl flex items-center space-x-2.5 shadow-sm">
              <div className="p-1.5 bg-teal-500/10 text-teal-700 rounded-xl shrink-0">
                <Wind className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[8px] uppercase tracking-wider text-teal-800 font-bold block">WIND SPEED</span>
                <strong className="text-xs sm:text-sm font-black text-teal-950 font-mono block truncate">
                  {weather.windSpeed || "12 km/h"}
                </strong>
              </div>
            </div>
          </div>

          {/* Weather-Based Interactive Operations Guidance Planner */}
          {(() => {
            const parseVal = (str?: string) => {
              if (!str) return 0;
              const num = parseInt(str.replace(/[^0-9]/g, ""), 10);
              return isNaN(num) ? 0 : num;
            };

            const tempNum = parseVal(weather.temp);
            const humNum = parseVal(weather.humidity);
            const rainNum = parseVal(weather.rainProb);
            const windNum = parseVal(weather.windSpeed);

            const wConditions = (weather.conditions || "").toLowerCase();
            const isWet =
              rainNum > 45 ||
              wConditions.includes("rain") ||
              wConditions.includes("shower") ||
              wConditions.includes("thunderstorm") ||
              wConditions.includes("monsoon") ||
              wConditions.includes("cloudy") ||
              wConditions.includes("mist") ||
              wConditions.includes("fog");
            const isHot = tempNum > 32;
            const isWindy = windNum > 15;

            const guideTranslations = {
              en: {
                title: "Smart Weather-Based Operations Planner",
                tabSpray: "Spraying Window",
                tabWater: "Irrigation Schedule",
                tabHarvest: "Harvesting Guide",
                tabSow: "Sowing & Soil Care",
                sprayingWetWindyHeader: "🚫 NOT RECOMMENDED",
                sprayingWetWindyDesc:
                  "Rain forecast is elevated or wind speed is high. Delay pesticide/fertilizer spraying to prevent wash-off or drift.",
                sprayingIdealHeader: "✅ OPTIMAL WINDOW",
                sprayingIdealDesc:
                  "Favorable wind speed and sunny/partly cloudy skies. Fungal treatment or foliar NPK spraying will absorb perfectly.",
                irrigationWetHeader: "❄️ PAUSE IRRIGATION",
                irrigationWetDesc:
                  "High rain probability/humidity. Keep drip systems closed or reduce cycle times to prevent root-rot or waterlogging.",
                irrigationHotHeader: "💧 INCREASE WATER TIME",
                irrigationHotDesc:
                  "High sunshine heats soil rapidly. Increase drip irrigation running minutes; water exclusively in early morning/late sunset.",
                irrigationNormalHeader: "🟢 REGULAR WATERING",
                irrigationNormalDesc:
                  "Atmospheric moisture holds steady. Maintain your calculated soil water/drip sequence for maximum efficiency.",
                harvestWetHeader: "⚠️ DELAY HARVEST WINDOW",
                harvestWetDesc:
                  "High dampness can result in rapid mold growth and crop spoilage. Postpone cut/thresh operations until the sky dries.",
                harvestIdealHeader: "🌾 SAFE TO HARVEST",
                harvestIdealDesc:
                  "Clear sunny intervals mean grain/produce has low moisture at cut. Excellent window for mowing, threshing, and bagging.",
                sowingWetHeader: "🌱 FAVORABLE SOIL MOISTURE",
                sowingWetDesc:
                  "Wet monsoon soils are rich in natural moisture. Ideal for light tillage, seeding, or transplanting young sprouts.",
                sowingHotHeader: "☀️ EXTREME HEAT OIL PROTECTION",
                sowingHotDesc:
                  "High ground heat can bake seeds. Implement straw or crop residue mulching along rows to lock moisture.",
                sowingNormalHeader: "🚜 STANDARD FIELD WORK",
                sowingNormalDesc:
                  "Favorable soil moisture holds. Best window for regular tractor bed preparation and fertilizer incorporation.",
              },
              te: {
                title: "వాతావరణ ఆధారిత సేద్య ప్రణాళిక",
                tabSpray: "పిచికారీ సలహా",
                tabWater: "నీటి యాజమాన్యం",
                tabHarvest: "కోతల సమయం",
                tabSow: "విత్తటం & సాగు",
                sprayingWetWindyHeader: "🚫 సిఫార్సు చేయబడదు",
                sprayingWetWindyDesc:
                  "వర్షం పడే అవకాశం లేదా గాలి వేగం బలంగా ఉంది. పురుగుమందులు పిచికారీ చేయడం ఇప్పుడు వృధా అవుతుంది.",
                sprayingIdealHeader: "✅ అనుకూల సమయం",
                sprayingIdealDesc:
                  "ప్రశాంత వాతావరణం ఉంది. ఎరువులు లేదా కీటక నాశిని పిచికారీ చేయడానికి ఇది అనువైన సమయం.",
                irrigationWetHeader: "❄️ నీటి సరఫరా నిలిపివేయండి",
                irrigationWetDesc:
                  "వర్షాల వల్ల మట్టిలో తేమ శాతం ఎక్కువ. వేరు కుళ్ళు తెగులు నివారించడానికి డ్రిప్ బంద్ చేయండి.",
                irrigationHotHeader: "💧 నీటి సరఫరా పెంచండి",
                irrigationHotDesc:
                  "ఎండల వల్ల తేమ ఆవిరైపోతుంది. ఉదయం లేదా సాయంత్రం వేళల్లో డ్రిప్ ద్వారా ఎక్కువ నీరు అందించండి.",
                irrigationNormalHeader: "🟢 సాధారణ నీటి తడులు",
                irrigationNormalDesc:
                  "నేలలో తేమ స్థిరంగా ఉంది. యథావిధిగా తగినంత నీటిని సమయపాలన ప్రకారం అందించండి.",
                harvestWetHeader: "⚠️ కోతలు వాయిదా వేయండి",
                harvestWetDesc:
                  "తడి వాతావరణం వల్ల గింజలు బూజు పట్టి చెడిపోతాయి. కాబట్టి కోతలు వాయిదా వేసుకోవడం మేలు.",
                harvestIdealHeader: "🌾 కోతలకు చాలా అనుకూలం",
                harvestIdealDesc:
                  "మంచి ఎండ ఉంది. పంట నూర్పిడి, ఎండబెట్టడం మరియు నిల్వ చేయడానికి చాలా అనువైన కాలం.",
                sowingWetHeader: "🌱 మొలకలకు అనుకూల తేమ",
                sowingWetDesc:
                  "వర్షపు తడి నేల దున్నడానికి, విత్తనాలు విత్తడానికి మరియు నాట్లు వేయడానికి అద్భుతంగా పనిచేస్తుంది.",
                sowingHotHeader: "☀️ ఎండ తీవ్రత రక్షణ",
                sowingHotDesc:
                  "తీవ్రమైన వేడి వల్ల నేలలో విత్తనాలు ఎండిపోవచ్చు. మల్చింగ్ (ఎండుటాకులు కప్పడం) ద్వారా నేల తేమ కాపాడండి.",
                sowingNormalHeader: "🚜 సాధారణ పనులు చేయవచ్చు",
                sowingNormalDesc:
                  "దుక్కి దున్నడానికి అనుకూలమైన వాతావరణం. నేల సిద్ధం చేసుకుని కొత్త పంట సాగు ప్రారంభించండి.",
              },
              hi: {
                title: "मौसम आधारित कृषि योजना तालिका",
                tabSpray: "छिड़काव सलाह",
                tabWater: "सिंचाई प्रबंधन",
                tabHarvest: "फसल कटाई",
                tabSow: "बुवाई व मृदा",
                sprayingWetWindyHeader: "🚫 सिफारिश नहीं की जाती",
                sprayingWetWindyDesc:
                  "बारिश का पूर्वानुमान या तेज़ हवाएं हैं। दवाओं या पर्णीय एनपीके का छिड़काव अभी रोकें ताकि बहाव बच सके.",
                sprayingIdealHeader: "✅ अनुकूल छिड़काव चक्र",
                sprayingIdealDesc:
                  "हल्की हवा और धूप छिड़काव के लिए आदर्श हैं। पौधे पोषक तत्वों को तेज़ी से सोखेंगे.",
                irrigationWetHeader: "❄️ सिंचाई अस्थायी रूप से रोकें",
                irrigationWetDesc:
                  "संभावित बारिश के कारण नमी पर्याप्त है। जड़ों में सड़न व फंगस रोकने के लिए जल निकासी साफ़ रखें.",
                irrigationHotHeader: "💧 सिंचाई बढ़ाएं",
                irrigationHotDesc:
                  "तेज़ गर्मी से जल वाष्पीकरण अधिक है। सुबह या शाम के समय पौधों को अतिरिक्त समय के लिए पानी दें.",
                irrigationNormalHeader: "🟢 नियमित जल आपूर्ति",
                irrigationNormalDesc:
                  "मृदा आर्द्रता स्थिर है। अपनी निर्धारित ड्रिप सिंचाई को सुचारू बनाए रखें.",
                harvestWetHeader: "⚠️ कटाई स्थगित करें",
                harvestWetDesc:
                  "नमी से सुरक्षित भंडारण में अनाज सड़ने या फंगस लगने की पूरी आशंका है। मौसम साफ होने का इंतजार करें.",
                harvestIdealHeader: "🌾 कटाई के लिए उत्तम समय",
                harvestIdealDesc:
                  "तेज़ धूप और सूखी हवाएँ हैं। फसल कटाई, थ्रेसिंग और सुरक्षित पैकिंग के लिए बहुत भाग्यशाली समय है.",
                sowingWetHeader: "🌱 बुवाई हेतु अनुकूल नमी",
                sowingWetDesc:
                  "वर्षा के बाद मिट्टी की नमी नए बीजों के शीघ्र अंकुरण एवं रोपाई के लिए पूर्णतः तैयार है.",
                sowingHotHeader: "☀️ मृदा तापमान से बचाव",
                sowingHotDesc:
                  "अधिक तपन से बीजों को बचाने के लिए कतारों के बीच पत्तों या पुआल की मल्चिंग बिछाना शुरू करें.",
                sowingNormalHeader: "🚜 सामान्य जुताई कार्य",
                sowingNormalDesc:
                  "खेत को समतल बनाने, जैविक खाद मिलाने और भावी बुवाई की तैयारी के लिए उत्तम मौसम चल रहा है.",
              },
            } as const;

            const text = guideTranslations[lang] || guideTranslations["en"];

            let activeHeader = "";
            let activeDesc = "";
            let activeColorClass = "";

            if (weatherActiveTab === "spray") {
              if (isWet || isWindy) {
                activeHeader = text.sprayingWetWindyHeader;
                activeDesc = text.sprayingWetWindyDesc;
                activeColorClass = "border-rose-500 bg-rose-50 text-rose-900";
              } else {
                activeHeader = text.sprayingIdealHeader;
                activeDesc = text.sprayingIdealDesc;
                activeColorClass = "border-emerald-500 bg-emerald-50 text-emerald-950";
              }
            } else if (weatherActiveTab === "water") {
              if (isWet) {
                activeHeader = text.irrigationWetHeader;
                activeDesc = text.irrigationWetDesc;
                activeColorClass = "border-blue-500 bg-blue-50 text-blue-950";
              } else if (isHot) {
                activeHeader = text.irrigationHotHeader;
                activeDesc = text.irrigationHotDesc;
                activeColorClass = "border-amber-500 bg-amber-50 text-amber-950";
              } else {
                activeHeader = text.irrigationNormalHeader;
                activeDesc = text.irrigationNormalDesc;
                activeColorClass = "border-emerald-500 bg-emerald-50 text-emerald-950";
              }
            } else if (weatherActiveTab === "harvest") {
              if (isWet) {
                activeHeader = text.harvestWetHeader;
                activeDesc = text.harvestWetDesc;
                activeColorClass = "border-rose-500 bg-rose-50 text-rose-950";
              } else {
                activeHeader = text.harvestIdealHeader;
                activeDesc = text.harvestIdealDesc;
                activeColorClass = "border-emerald-500 bg-emerald-50 text-emerald-950";
              }
            } else if (weatherActiveTab === "sow") {
              if (isWet) {
                activeHeader = text.sowingWetHeader;
                activeDesc = text.sowingWetDesc;
                activeColorClass = "border-teal-500 bg-teal-50 text-teal-950";
              } else if (isHot) {
                activeHeader = text.sowingHotHeader;
                activeDesc = text.sowingHotDesc;
                activeColorClass = "border-amber-500 bg-amber-50 text-amber-950";
              } else {
                activeHeader = text.sowingNormalHeader;
                activeDesc = text.sowingNormalDesc;
                activeColorClass = "border-emerald-500 bg-emerald-50 text-emerald-950";
              }
            }

            return (
              <div className="border border-emerald-100 rounded-2xl p-4 bg-emerald-50/10 space-y-3" id="weather-operations-planner">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
                  <h3 className="text-xs font-extrabold text-emerald-950 tracking-tight">{text.title}</h3>
                </div>

                <div className="flex flex-wrap gap-1 border-b border-stone-100 pb-2">
                  <button
                    type="button"
                    onClick={() => setWeatherActiveTab("spray")}
                    className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold transition-all focus:outline-none cursor-pointer ${
                      weatherActiveTab === "spray"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-stone-50 text-slate-600 hover:bg-stone-100"
                    }`}
                  >
                    {text.tabSpray}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeatherActiveTab("water")}
                    className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold transition-all focus:outline-none cursor-pointer ${
                      weatherActiveTab === "water"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-stone-50 text-slate-600 hover:bg-stone-100"
                    }`}
                  >
                    {text.tabWater}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeatherActiveTab("harvest")}
                    className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold transition-all focus:outline-none cursor-pointer ${
                      weatherActiveTab === "harvest"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-stone-50 text-slate-600 hover:bg-stone-100"
                    }`}
                  >
                    {text.tabHarvest}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeatherActiveTab("sow")}
                    className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold transition-all focus:outline-none cursor-pointer ${
                      weatherActiveTab === "sow"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-stone-50 text-slate-600 hover:bg-stone-100"
                    }`}
                  >
                    {text.tabSow}
                  </button>
                </div>

                <div className={`p-3.5 rounded-xl border transition-all duration-150 ${activeColorClass}`}>
                  <h4 className="text-[10px] font-mono font-black tracking-wider uppercase block mb-1">
                    {activeHeader}
                  </h4>
                  <p className="text-[11.5px] leading-relaxed font-sans font-medium">{activeDesc}</p>
                </div>

                <div className="bg-white border border-stone-200 p-3 rounded-xl space-y-1 shadow-sm">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-mono">
                    {activeTranslation.weatherNotice}
                  </span>
                  <p className="text-[11.5px] text-slate-700 leading-relaxed font-sans">{weather.advice}</p>
                </div>

                {weather.warnings && (
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-rose-800 flex items-center tracking-wider uppercase font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0 text-rose-600" />
                      {activeTranslation.weatherWarning}
                    </span>
                    <p className="text-[11.5px] text-rose-900 leading-relaxed font-sans font-medium">
                      {weather.warnings}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ) : (
        <p className="text-xs text-stone-500">Agro-weather guidance currently unavailable for {region}.</p>
      )}

      <div className="text-[9px] text-stone-400 font-mono mt-3 select-none text-right">
        LAST UPDATE: {weather?.checkedAt || "PENDING"}
      </div>
    </section>
  );
};
export default WeatherAdvisory;

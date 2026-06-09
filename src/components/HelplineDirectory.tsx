import React from "react";
import { Phone } from "lucide-react";
import { EXPERT_CONTACTS } from "../types";

interface HelplineDirectoryProps {
  activeTranslation: any;
}

export const HelplineDirectory: React.FC<HelplineDirectoryProps> = ({ activeTranslation }) => {
  return (
    <section className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm animate-fade-in" id="helplines-directory">
      <h2 className="text-lg font-extrabold text-emerald-950 flex items-center mb-4">
        <Phone className="w-5 h-5 mr-2 text-emerald-600" />
        {activeTranslation.expertListTitle}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPERT_CONTACTS.map((contact, index) => (
          <div
            key={index}
            className="bg-stone-50 hover:bg-emerald-50/20 p-4 rounded-2xl border border-stone-200/80 transition flex items-start space-x-3"
          >
            <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-xl shadow-sm mt-0.5 border border-emerald-200 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="flex-grow space-y-1 overflow-hidden">
              <h3 className="font-bold text-xs text-slate-800 leading-snug truncate">{contact.institution}</h3>
              <p className="text-[11px] text-slate-500 leading-tight">📍 Area: {contact.region}</p>
              <p className="text-[11px] text-slate-500 leading-tight">🕒 Hours: {contact.hours}</p>
              <p className="text-xs font-bold text-emerald-700 flex items-center pt-1 font-mono tracking-wider">
                📞 {contact.phone}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
export default HelplineDirectory;

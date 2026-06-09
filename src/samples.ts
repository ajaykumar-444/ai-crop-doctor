import { CropSample } from "./types";

// A tiny valid base64 encoded green/yellow Leaf crop pixel representation.
// This allows the full-stack API to make a genuine, live model request with real visual inline details,
// which is a magnificent way to test the system in action with sample materials!
const REAL_TINY_LEAF_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAPklEQVQYV2NkQAIdHBz/GZGAEydOfIJiRCHMEpggmOIMuBUyYpXEqxCuElwKYSuEKAQrBKuEqgSlEp8SpBIsAAAUGB8G8h8gOAAAAABJRU5ErkJggg==";

export const CROP_SAMPLES: CropSample[] = [
  {
    id: "sample-rice-blast",
    nameEn: "Rice Blast Infection",
    nameTe: "వరి అగ్గితెగులు",
    nameHi: "धान का झोंका रोग (ब्लास्ट)",
    diseaseEn: "Magnaporthe oryzae Fungus Damage",
    diseaseTe: "శిలీంధ్ర వ్యాప్తి కారణంగా గోధుమ రంగు మచ్చలు",
    diseaseHi: "फफूंद जनित पत्ती झोंका रोग",
    cropType: "Rice",
    description: "Spindle-shaped spots on leaves with ash-grey centers and brownish borders. Severe cases lead to leaf drying and broken grain necks.",
    svgIcon: `
      <svg viewBox="0 0 100 100" class="w-20 h-20 text-emerald-500 fill-current opacity-90">
        <!-- Leaf Shape -->
        <path d="M50 15 C65 35, 75 55, 75 80 C45 80, 25 65, 50 15 Z" fill="#84cc16"/>
        <path d="M50 15 C45 35, 30 55, 25 80" stroke="#4d7c0f" stroke-width="2" fill="none"/>
        <!-- Blast Spots -->
        <ellipse cx="48" cy="40" rx="3" ry="7" fill="#78350f" transform="rotate(-15, 48, 40)"/>
        <ellipse cx="46" cy="40" rx="1.5" ry="4" fill="#cbd5e1" transform="rotate(-15, 48, 40)"/>
        <ellipse cx="60" cy="55" rx="4" ry="10" fill="#78350f" transform="rotate(20, 60, 55)"/>
        <ellipse cx="58" cy="55" rx="2" ry="6" fill="#cbd5e1" transform="rotate(20, 60, 55)"/>
        <ellipse cx="38" cy="65" rx="2" ry="5" fill="#78350f" transform="rotate(-30, 38, 65)"/>
      </svg>
    `,
    simulatedBase64: REAL_TINY_LEAF_BASE64
  },
  {
    id: "sample-tomato-blight",
    nameEn: "Tomato Early Blight",
    nameTe: "టమోటా పండు కుళ్ళు / ఆకుమచ్చ తెగులు",
    nameHi: "टमाटर अगेती झुलसा (अल्टरनेरिया)",
    diseaseEn: "Alternaria solani Pathogen",
    diseaseTe: "ఆల్టర్నేరియా శిలీంధ్రం ఆకుల రంగును నల్లగా మార్చడం",
    diseaseHi: "अल्टरनेरिया कवक के काले रंग के संकेंद्रित छल्ले",
    cropType: "Tomato",
    description: "Concentric rings resembling target boards showing on older leaves first. Yellow halos surround the primary lesions, leading to premature leaf defoliation.",
    svgIcon: `
      <svg viewBox="0 0 100 100" class="w-20 h-20 text-emerald-500 fill-current opacity-90">
        <!-- Tomato Leaf Outline (serrated style) -->
        <path d="M50 10 Q65 25, 60 40 Q75 45, 65 60 Q80 70, 70 85 Q50 90, 50 85 Q30 90, 30 85 Q20 70, 35 60 Q25 45, 40 40 Q35 25, 50 10 Z" fill="#22c55e"/>
        <!-- Necrotic target rings -->
        <circle cx="50" cy="35" r="8" fill="#eab308" opacity="0.4"/>
        <circle cx="50" cy="35" r="5" fill="#451a03"/>
        <circle cx="50" cy="35" r="3" fill="#1c1917"/>
        <circle cx="50" cy="35" r="1.2" fill="#78716c"/>

        <circle cx="36" cy="62" r="7" fill="#eab308" opacity="0.4"/>
        <circle cx="36" cy="62" r="4" fill="#451a03"/>
        <circle cx="36" cy="62" r="1" fill="#1c1917"/>
      </svg>
    `,
    simulatedBase64: REAL_TINY_LEAF_BASE64
  },
  {
    id: "sample-cotton-aphids",
    nameEn: "Cotton Aphids & HoneyDew",
    nameTe: "పత్తి పేనుబంక తెగులు",
    nameHi: "कपास के माहू एवं चिपचिपा चिपटा",
    diseaseEn: "Aphis gossypii Infestation",
    diseaseTe: "చిన్న ఆకుపచ్చ పురుగులు ఆకు రసాన్ని పీల్చడం",
    diseaseHi: "छोटे चिपचिपे रस-चूषक कीटों का हमला",
    cropType: "Cotton",
    description: "Tiny yellow-green insects clustered on the undersides of Cotton leaves. Leaves curl downwards, and black sooty mold grows on sticky honeydew secretions.",
    svgIcon: `
      <svg viewBox="0 0 100 100" class="w-20 h-20 text-emerald-500 fill-current">
        <!-- Broad Cotton Leaf shape -->
        <path d="M50 15 Q75 15, 80 45 Q65 55, 75 80 Q50 70, 50 85 Q50 70, 25 80 Q35 55, 20 45 Q25 15, 50 15 Z" fill="#15803d"/>
        <!-- Yellow Aphids spots -->
        <circle cx="40" cy="35" r="3" fill="#a3e635"/>
        <circle cx="44" cy="32" r="2.2" fill="#a3e635"/>
        <circle cx="60" cy="45" r="2.5" fill="#a3e635"/>
        <circle cx="57" cy="49" r="3.2" fill="#a3e635"/>
        <circle cx="30" cy="55" r="2.8" fill="#eab308"/>
        <circle cx="33" cy="52" r="2" fill="#eab308"/>
      </svg>
    `,
    simulatedBase64: REAL_TINY_LEAF_BASE64
  },
  {
    id: "sample-corn-rust",
    nameEn: "Corn Common Rust",
    nameTe: "మొక్కజొన్న తుప్పు తెగులు",
    nameHi: "मक्का का रस्ट (तुलासिता रोग)",
    diseaseEn: "Puccinia sorghi Spores",
    diseaseTe: "ఆకులపై బంగారు-నారింజ రంగు పొక్కులు ఏర్పడటం",
    diseaseHi: "पत्तियों की दोनों सतहों पर भूरे-लाल रंग के छाले",
    cropType: "Corn",
    description: "Powdery golden-brown to cinnamon-brown pustules appearing on both upper and lower leaf surfaces, causing leaf yellowing and low photosynthesis.",
    svgIcon: `
      <svg viewBox="0 0 100 100" class="w-20 h-20 text-emerald-500 fill-current">
        <!-- Long corn leaf ribbon -->
        <path d="M50 10 C62 30, 68 55, 55 90 C45 90, 32 55, 50 10 Z" fill="#ea580c" opacity="0.3"/>
        <path d="M50 10 C58 30, 62 55, 54 90 C46 90, 38 55, 50 10 Z" fill="#4ade80"/>
        <!-- Rust pustules -->
        <circle cx="48" cy="40" r="3.2" fill="#ea580c"/>
        <circle cx="52" cy="50" r="2.8" fill="#ea580c"/>
        <circle cx="50" cy="33" r="2.2" fill="#ea580c"/>
        <rect x="52" y="65" width="3" height="8" rx="1.5" fill="#ca8a04"/>
        <rect x="44" y="55" width="2" height="6" rx="1" fill="#ca8a04"/>
      </svg>
    `,
    simulatedBase64: REAL_TINY_LEAF_BASE64
  }
];

import { Language, ChatMessage, WeatherData } from "../types";

/**
 * Visual Crop Disease Diagnostic Call
 */
export async function diagnoseCropLeaf(params: {
  imageBase64: string;
  mimeType: string;
  cropType: string;
  language: Language;
}): Promise<{ diagnosis: string }> {
  const response = await fetch("/api/diagnose-crop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Agro-visual server failure. Please retry.");
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}

/**
 * Mitti-Doc Advisor Conversation Call
 */
export async function sendAdvisoryChatMessage(params: {
  message: string;
  history: ChatMessage[];
  language: Language;
}): Promise<{ reply: string }> {
  const response = await fetch("/api/advisory-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Expert link offline. Please try in a moment.");
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}

/**
 * Dynamic Weather Advisory Guidance Call
 */
export async function fetchAgroWeather(params: {
  region: string;
  cropType: string;
  lang: Language;
  customLocation: string;
}): Promise<WeatherData> {
  const { region, cropType, lang, customLocation } = params;
  const urlParams = new URLSearchParams({
    region,
    crop: cropType,
    lang,
    customLocation,
  });

  const response = await fetch(`/api/weather-guidance?${urlParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to retrieve local climate updates.");
  }

  return response.json();
}

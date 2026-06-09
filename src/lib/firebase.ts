import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User,
  signInAnonymously
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  getDoc,
  serverTimestamp,
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { ChatMessage } from "../types";

// Helper to check if Firebase is using dummy/placeholder values
export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig &&
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("FakePlaceholderKey") &&
    firebaseConfig.projectId !== "agro-doctor-applet"
  );
}

// Initialize Firebase App
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

const provider = new GoogleAuthProvider();

/**
 * Handle user Google login popup
 */
export async function loginWithGoogle(): Promise<User> {
  if (!isFirebaseConfigured()) {
    // Return dummy user for simulation if firebase is not fully linked
    console.warn("Firebase is using offline fallback.");
    // Simulate user state
    const simulatedResponse = {
      uid: "simulated_farmer_123",
      displayName: "Ramkishore Patel",
      email: "ramkishore.patel@mock.com",
      emailVerified: true,
      photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ramkishore",
    } as unknown as User;
    localStorage.setItem("simulated_u_id", simulatedResponse.uid);
    localStorage.setItem("simulated_u_name", simulatedResponse.displayName || "");
    localStorage.setItem("simulated_u_email", simulatedResponse.email || "");
    return simulatedResponse;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    // Persist profile to users collections
    await syncUserProfile(result.user);
    return result.user;
  } catch (error) {
    console.error("Google popup login failed: ", error);
    throw error;
  }
}

/**
 * Handle anonymous login for easy access
 */
export async function loginAnonymously(): Promise<User> {
  if (!isFirebaseConfigured()) {
    const simulatedResponse = {
      uid: "simulated_guest_456",
      displayName: "Guest Farmer",
      email: "guest@rural-agro.org",
      emailVerified: false,
    } as unknown as User;
    localStorage.setItem("simulated_u_id", simulatedResponse.uid);
    localStorage.setItem("simulated_u_name", simulatedResponse.displayName || "");
    return simulatedResponse;
  }

  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Anonymous sign in failed:", error);
    throw error;
  }
}

/**
 * Handle logout
 */
export async function logoutUser() {
  localStorage.removeItem("simulated_u_id");
  localStorage.removeItem("simulated_u_name");
  localStorage.removeItem("simulated_u_email");
  if (isFirebaseConfigured()) {
    await signOut(auth);
  }
}

/**
 * Push profile details to user document
 */
export async function syncUserProfile(user: User, region?: string, cropType?: string) {
  if (!isFirebaseConfigured()) return;
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      id: user.uid,
      displayName: user.displayName || "Farmer Associate",
      email: user.email || "",
      region: region || "south",
      cropType: cropType || "Rice",
      createdAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Failed to sync profile:", error);
  }
}

/**
 * Save Diagnosed Leaf Report to database
 */
export async function saveDiagnosticReport(params: {
  cropType: string;
  report: string;
  confidence: number;
  imagePreviewUrl: string;
  mimeType: string;
  userId: string;
}): Promise<string> {
  const diagnosticId = `diag-${Date.now()}`;
  
  if (!isFirebaseConfigured()) {
    // Offline Storage Fallback
    const localDiags = JSON.parse(localStorage.getItem("local_diagnostics") || "[]");
    const item = {
      id: diagnosticId,
      cropType: params.cropType,
      report: params.report,
      confidence: params.confidence,
      imagePreviewUrl: params.imagePreviewUrl,
      mimeType: params.mimeType,
      createdBy: params.userId,
      createdAt: new Date().toISOString()
    };
    localDiags.unshift(item);
    localStorage.setItem("local_diagnostics", JSON.stringify(localDiags.slice(0, 30)));
    return diagnosticId;
  }

  try {
    const docRef = doc(db, "diagnostics", diagnosticId);
    await setDoc(docRef, {
      cropType: params.cropType,
      createdBy: params.userId,
      report: params.report,
      confidence: params.confidence,
      imagePreviewUrl: params.imagePreviewUrl || "",
      mimeType: params.mimeType || "image/jpeg",
      createdAt: serverTimestamp()
    });
    return diagnosticId;
  } catch (error) {
    console.error("Firestore Diagnostic write failed, saving locally:", error);
    // fallback save locally
    const localDiags = JSON.parse(localStorage.getItem("local_diagnostics") || "[]");
    localDiags.unshift({
      id: diagnosticId,
      ...params,
      createdBy: params.userId,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem("local_diagnostics", JSON.stringify(localDiags.slice(0, 30)));
    return diagnosticId;
  }
}

/**
 * Load User Diagnostic Reports
 */
export async function fetchUserDiagnostics(userId: string) {
  if (!isFirebaseConfigured() || userId.startsWith("simulated_")) {
    const local = JSON.parse(localStorage.getItem("local_diagnostics") || "[]");
    return local.filter((d: any) => d.createdBy === userId);
  }

  try {
    const q = query(
      collection(db, "diagnostics"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const results: any[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.createdBy === userId) {
        results.push({
          id: docSnap.id,
          cropType: data.cropType,
          report: data.report,
          confidence: data.confidence,
          imagePreviewUrl: data.imagePreviewUrl,
          mimeType: data.mimeType,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        });
      }
    });
    return results;
  } catch (error) {
    console.error("Firestore Diagnostic read failed, reading from local cache:", error);
    const local = JSON.parse(localStorage.getItem("local_diagnostics") || "[]");
    return local.filter((d: any) => d.createdBy === userId);
  }
}

/**
 * Save advisory chat message to profile subcollection
 */
export async function saveAdvisoryMessage(userId: string, role: "user" | "assistant", content: string) {
  const messageId = `msg-${Date.now()}`;
  
  if (!isFirebaseConfigured() || userId.startsWith("simulated_")) {
    const key = `local_chats_${userId}`;
    const localChats = JSON.parse(localStorage.getItem(key) || "[]");
    localChats.push({
      id: messageId,
      role,
      content,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(localChats.slice(-30)));
    return;
  }

  try {
    const chatRef = doc(db, "users", userId, "chats", messageId);
    await setDoc(chatRef, {
      userId,
      role,
      content,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Firestore Chat write failed:", error);
    const key = `local_chats_${userId}`;
    const localChats = JSON.parse(localStorage.getItem(key) || "[]");
    localChats.push({
      id: messageId,
      role,
      content,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(localChats.slice(-30)));
  }
}

/**
 * Load historic advisory chat logs
 */
export async function fetchAdvisoryChats(userId: string): Promise<ChatMessage[]> {
  if (!isFirebaseConfigured() || userId.startsWith("simulated_")) {
    const key = `local_chats_${userId}`;
    const local = JSON.parse(localStorage.getItem(key) || "[]");
    return local.map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.timestamp)
    }));
  }

  try {
    const q = query(
      collection(db, "users", userId, "chats"),
      orderBy("createdAt", "asc")
    );
    const snap = await getDocs(q);
    const results: ChatMessage[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({
        id: docSnap.id,
        role: data.role as any,
        content: data.content,
        timestamp: data.createdAt?.toDate?.() ? data.createdAt.toDate() : new Date()
      });
    });
    return results;
  } catch (error) {
    console.error("Failed to load chat history from Firestore:", error);
    const key = `local_chats_${userId}`;
    const local = JSON.parse(localStorage.getItem(key) || "[]");
    return local.map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.timestamp)
    }));
  }
}

/**
 * Test Firebase Connection under Sandbox Guidelines
 */
export async function testConnection() {
  if (!isFirebaseConfigured()) return;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration or network link.");
    }
  }
}

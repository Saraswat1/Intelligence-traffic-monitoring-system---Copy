import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your Firebase Config (Replace with your actual values)
const firebaseConfig = {
    apiKey: "AIzaSyCqbVtdWFg_fPds7Z3-vpWHuFwL5eRg4jw",
    authDomain: "project-2-6eb04.firebaseapp.com",
    projectId: "project-2-6eb04",
    storageBucket: "project-2-6eb04.firebasestorage.app",
    messagingSenderId: "374123000040",
    appId: "1:374123000040:web:4346cf9745aed15cd1195d",
    measurementId: "G-41KRGK219C"
  };
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

// Function to get FCM Token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY",
      });
      console.log("FCM Token:", token);
      return token;
    } else {
      console.log("Notification permission denied.");
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};

export { messaging, onMessage };

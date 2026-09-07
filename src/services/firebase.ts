import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase web configuration is public by design. Never place the Telegram bot token here.
const firebaseConfig = {
  apiKey: 'AIzaSyBpUV7TYsBQGr2q7ELQ-lp7FZs_L5IvTFY',
  authDomain: 'kitybuilder-bot.firebaseapp.com',
  databaseURL: 'https://kitybuilder-bot-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'kitybuilder-bot',
  storageBucket: 'kitybuilder-bot.firebasestorage.app',
  messagingSenderId: '280278728394',
  appId: '1:280278728394:web:fa4f49574a5e930e9efe33',
};

const firebaseApp = getApps().find((app) => app.name === '[DEFAULT]') ?? initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDatabase = getDatabase(firebaseApp);

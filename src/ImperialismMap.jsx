import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { 
  Play, Pause, ChevronRight, ChevronLeft, Upload, Save, RotateCcw, 
  Trophy, Map as MapIcon, Info, Globe, FileText, Download, Sparkles, 
  ScrollText, Search, ZoomIn, ZoomOut, Maximize, Eye, EyeOff, Image as ImageIcon,
  Users, Layers, Loader, Lock, Unlock, Trash2
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

// --- FIREBASE SETUP ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- EMBEDDED TEAM DATA (STRICTLY FBS ONLY) ---
const INITIAL_TEAMS = [
  { "id": "USAF", "name": "Air Force", "conf": "Mountain West", "div": "FBS", "color": "#003087", "lat": 38.9984, "lng": -104.8618, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2005.png" },
  { "id": "AKRN", "name": "Akron", "conf": "MAC", "div": "FBS", "color": "#041E42", "lat": 41.0708, "lng": -81.5106, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2006.png" },
  { "id": "BAMA", "name": "Alabama", "conf": "SEC", "div": "FBS", "color": "#9E1B32", "lat": 33.2098, "lng": -87.5692, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/333.png" },
  { "id": "APST", "name": "Appalachian State", "conf": "Sun Belt", "div": "FBS", "color": "#222222", "lat": 36.2114, "lng": -81.6853, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2026.png" },
  { "id": "ZONA", "name": "Arizona", "conf": "Big 12", "div": "FBS", "color": "#CC0033", "lat": 32.2285, "lng": -110.9488, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/12.png" },
  { "id": "AZST", "name": "Arizona State", "conf": "Big 12", "div": "FBS", "color": "#8C1D40", "lat": 33.4264, "lng": -111.9326, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/9.png" },
  { "id": "ARK", "name": "Arkansas", "conf": "SEC", "div": "FBS", "color": "#9D2235", "lat": 36.0687, "lng": -94.1748, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/8.png" },
  { "id": "ARST", "name": "Arkansas State", "conf": "Sun Belt", "div": "FBS", "color": "#CC092F", "lat": 35.8427, "lng": -90.6800, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2032.png" },
  { "id": "ARMY", "name": "Army", "conf": "American", "div": "FBS", "color": "#D4BF91", "lat": 41.3918, "lng": -73.9625, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/349.png" },
  { "id": "AUB", "name": "Auburn", "conf": "SEC", "div": "FBS", "color": "#0C2340", "lat": 32.6022, "lng": -85.4917, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2.png" },
  { "id": "BALL", "name": "Ball State", "conf": "MAC", "div": "FBS", "color": "#DA0000", "lat": 40.2014, "lng": -85.4087, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2050.png" },
  { "id": "BAYL", "name": "Baylor", "conf": "Big 12", "div": "FBS", "color": "#154734", "lat": 31.5493, "lng": -97.1131, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/239.png" },
  { "id": "BOIS", "name": "Boise State", "conf": "Pac-12", "div": "FBS", "color": "#0033A0", "lat": 43.6029, "lng": -116.1959, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/68.png" },
  { "id": "BC", "name": "Boston College", "conf": "ACC", "div": "FBS", "color": "#98002E", "lat": 42.3351, "lng": -71.1685, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/103.png" },
  { "id": "BGSU", "name": "Bowling Green", "conf": "MAC", "div": "FBS", "color": "#FE5000", "lat": 41.3781, "lng": -83.6261, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/189.png" },
  { "id": "BYU", "name": "BYU", "conf": "Big 12", "div": "FBS", "color": "#002E5D", "lat": 40.2584, "lng": -111.6545, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/252.png" },
  { "id": "CAL", "name": "California", "conf": "ACC", "div": "FBS", "color": "#003262", "lat": 37.8706, "lng": -122.2507, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/25.png" },
  { "id": "CMU", "name": "Central Michigan", "conf": "MAC", "div": "FBS", "color": "#6A0032", "lat": 43.5906, "lng": -84.7766, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2117.png" },
  { "id": "CHAR", "name": "Charlotte", "conf": "American", "div": "FBS", "color": "#046A38", "lat": 35.3071, "lng": -80.7352, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2429.png" },
  { "id": "CINC", "name": "Cincinnati", "conf": "Big 12", "div": "FBS", "color": "#E00122", "lat": 39.1312, "lng": -84.5162, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2132.png" },
  { "id": "CLEM", "name": "Clemson", "conf": "ACC", "div": "FBS", "color": "#F56600", "lat": 34.6788, "lng": -82.8432, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/228.png" },
  { "id": "CCU", "name": "Coastal Carolina", "conf": "Sun Belt", "div": "FBS", "color": "#006991", "lat": 33.7928, "lng": -79.0167, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/324.png" },
  { "id": "COLO", "name": "Colorado", "conf": "Big 12", "div": "FBS", "color": "#CFB87C", "lat": 40.0095, "lng": -105.2669, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/38.png" },
  { "id": "CSU", "name": "Colorado State", "conf": "Mountain West", "div": "FBS", "color": "#1E4D2B", "lat": 40.5734, "lng": -105.0865, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/36.png" },
  { "id": "CONN", "name": "UConn", "conf": "Independent", "div": "FBS", "color": "#000E2F", "lat": 41.8077, "lng": -72.2540, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/41.png" },
  { "id": "DEL", "name": "Delaware", "conf": "C-USA", "div": "FBS", "color": "#00539F", "lat": 39.6780, "lng": -75.7507, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/48.png" },
  { "id": "DUKE", "name": "Duke", "conf": "ACC", "div": "FBS", "color": "#003087", "lat": 35.9953, "lng": -78.9417, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/150.png" },
  { "id": "ECU", "name": "East Carolina", "conf": "American", "div": "FBS", "color": "#592A8A", "lat": 35.6021, "lng": -77.3667, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/151.png" },
  { "id": "EMU", "name": "Eastern Michigan", "conf": "MAC", "div": "FBS", "color": "#006633", "lat": 42.2494, "lng": -83.6215, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2199.png" },
  { "id": "FIU", "name": "FIU", "conf": "C-USA", "div": "FBS", "color": "#001538", "lat": 25.7574, "lng": -80.3733, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2229.png" },
  { "id": "FLA", "name": "Florida", "conf": "SEC", "div": "FBS", "color": "#0021A5", "lat": 29.6499, "lng": -82.3486, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/57.png" },
  { "id": "FAU", "name": "Florida Atlantic", "conf": "American", "div": "FBS", "color": "#003366", "lat": 26.3754, "lng": -80.1014, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2226.png" },
  { "id": "FSU", "name": "Florida State", "conf": "ACC", "div": "FBS", "color": "#782F40", "lat": 30.4363, "lng": -84.2982, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/52.png" },
  { "id": "FRES", "name": "Fresno State", "conf": "Mountain West", "div": "FBS", "color": "#DB0032", "lat": 36.8093, "lng": -119.7456, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/278.png" },
  { "id": "UGA", "name": "Georgia", "conf": "SEC", "div": "FBS", "color": "#BA0C2F", "lat": 33.9498, "lng": -83.3734, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/61.png" },
  { "id": "GASO", "name": "Georgia Southern", "conf": "Sun Belt", "div": "FBS", "color": "#002D72", "lat": 32.4208, "lng": -81.7894, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/290.png" },
  { "id": "GAST", "name": "Georgia State", "conf": "Sun Belt", "div": "FBS", "color": "#0039A6", "lat": 33.7531, "lng": -84.3853, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2247.png" },
  { "id": "GT", "name": "Georgia Tech", "conf": "ACC", "div": "FBS", "color": "#B3A369", "lat": 33.7724, "lng": -84.3928, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/59.png" },
  { "id": "HAWI", "name": "Hawaii", "conf": "Mountain West", "div": "FBS", "color": "#024731", "lat": 21.2919, "lng": -157.8171, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/62.png" },
  { "id": "UHOU", "name": "Houston", "conf": "Big 12", "div": "FBS", "color": "#C8102E", "lat": 29.7218, "lng": -95.3491, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/248.png" },
  { "id": "ILLI", "name": "Illinois", "conf": "Big Ten", "div": "FBS", "color": "#E84A27", "lat": 40.0993, "lng": -88.2360, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/356.png" },
  { "id": "IND", "name": "Indiana", "conf": "Big Ten", "div": "FBS", "color": "#990000", "lat": 39.1766, "lng": -86.5130, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/84.png" },
  { "id": "IOWA", "name": "Iowa", "conf": "Big Ten", "div": "FBS", "color": "#FFCD00", "lat": 41.6586, "lng": -91.5511, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png" },
  { "id": "IAST", "name": "Iowa State", "conf": "Big 12", "div": "FBS", "color": "#C8102E", "lat": 42.0266, "lng": -93.6465, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/66.png" },
  { "id": "JST", "name": "Jacksonville State", "conf": "C-USA", "div": "FBS", "color": "#CC0000", "lat": 33.8240, "lng": -85.7656, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/55.png" },
  { "id": "JMU", "name": "James Madison", "conf": "Sun Belt", "div": "FBS", "color": "#450084", "lat": 38.4351, "lng": -78.8732, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/256.png" },
  { "id": "KANS", "name": "Kansas", "conf": "Big 12", "div": "FBS", "color": "#0051BA", "lat": 38.9586, "lng": -95.2478, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png" },
  { "id": "KSST", "name": "Kansas State", "conf": "Big 12", "div": "FBS", "color": "#512888", "lat": 39.2020, "lng": -96.5938, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2306.png" },
  { "id": "KNSW", "name": "Kennesaw State", "conf": "C-USA", "div": "FBS", "color": "#FFC629", "lat": 34.0382, "lng": -84.5827, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/338.png" },
  { "id": "KENT", "name": "Kent State", "conf": "MAC", "div": "FBS", "color": "#002664", "lat": 41.1442, "lng": -81.3392, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2309.png" },
  { "id": "UKEN", "name": "Kentucky", "conf": "SEC", "div": "FBS", "color": "#0033A0", "lat": 38.0226, "lng": -84.5053, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/96.png" },
  { "id": "LU", "name": "Liberty", "conf": "C-USA", "div": "FBS", "color": "#071740", "lat": 37.3510, "lng": -79.1836, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png" },
  { "id": "ULL", "name": "Louisiana", "conf": "Sun Belt", "div": "FBS", "color": "#CE181E", "lat": 30.2105, "lng": -92.0229, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/309.png" },
  { "id": "ULM", "name": "Louisiana Monroe", "conf": "Sun Belt", "div": "FBS", "color": "#840029", "lat": 32.5310, "lng": -92.0706, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2433.png" },
  { "id": "LT", "name": "Louisiana Tech", "conf": "C-USA", "div": "FBS", "color": "#002D72", "lat": 32.5323, "lng": -92.6560, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2348.png" },
  { "id": "LOU", "name": "Louisville", "conf": "ACC", "div": "FBS", "color": "#AD0000", "lat": 38.2057, "lng": -85.7587, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/97.png" },
  { "id": "LSU", "name": "LSU", "conf": "SEC", "div": "FBS", "color": "#461D7C", "lat": 30.4120, "lng": -91.1838, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/99.png" },
  { "id": "MRSH", "name": "Marshall", "conf": "Sun Belt", "div": "FBS", "color": "#00B140", "lat": 38.4237, "lng": -82.4235, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/276.png" },
  { "id": "UMD", "name": "Maryland", "conf": "Big Ten", "div": "FBS", "color": "#E03A3E", "lat": 38.9904, "lng": -76.9472, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/120.png" },
  { "id": "MEMP", "name": "Memphis", "conf": "American", "div": "FBS", "color": "#003087", "lat": 35.1187, "lng": -89.9711, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/235.png" },
  { "id": "MIAF", "name": "Miami (FL)", "conf": "ACC", "div": "FBS", "color": "#005030", "lat": 25.9580, "lng": -80.2389, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png" },
  { "id": "MIAO", "name": "Miami (OH)", "conf": "MAC", "div": "FBS", "color": "#B61E2E", "lat": 39.5118, "lng": -84.7330, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/193.png" },
  { "id": "MICH", "name": "Michigan", "conf": "Big Ten", "div": "FBS", "color": "#00274C", "lat": 42.2658, "lng": -83.7487, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/130.png" },
  { "id": "MIST", "name": "Michigan State", "conf": "Big Ten", "div": "FBS", "color": "#18453B", "lat": 42.7281, "lng": -84.4849, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/127.png" },
  { "id": "MTSU", "name": "Middle Tennessee", "conf": "C-USA", "div": "FBS", "color": "#0066CC", "lat": 35.8475, "lng": -86.3653, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2393.png" },
  { "id": "MINN", "name": "Minnesota", "conf": "Big Ten", "div": "FBS", "color": "#7A0019", "lat": 44.9765, "lng": -93.2246, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/135.png" },
  { "id": "MSST", "name": "Mississippi State", "conf": "SEC", "div": "FBS", "color": "#660000", "lat": 33.4563, "lng": -88.7944, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/344.png" },
  { "id": "MIZZ", "name": "Missouri", "conf": "SEC", "div": "FBS", "color": "#F1B82D", "lat": 38.9358, "lng": -92.3286, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/142.png" },
  { "id": "MOST", "name": "Missouri State", "conf": "C-USA", "div": "FBS", "color": "#5E0009", "lat": 37.1994, "lng": -93.2804, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2623.png" },
  { "id": "NAVY", "name": "Navy", "conf": "American", "div": "FBS", "color": "#00205B", "lat": 38.9829, "lng": -76.4840, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/349.png" },
  { "id": "NCST", "name": "NC State", "conf": "ACC", "div": "FBS", "color": "#CC0000", "lat": 35.7954, "lng": -78.6775, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/152.png" },
  { "id": "NEB", "name": "Nebraska", "conf": "Big Ten", "div": "FBS", "color": "#E41C38", "lat": 40.8206, "lng": -96.7056, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/158.png" },
  { "id": "NEV", "name": "Nevada", "conf": "Mountain West", "div": "FBS", "color": "#002E62", "lat": 39.5440, "lng": -119.8163, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2440.png" },
  { "id": "UNM", "name": "New Mexico", "conf": "Mountain West", "div": "FBS", "color": "#BA0C2F", "lat": 35.0844, "lng": -106.6198, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/167.png" },
  { "id": "NMSU", "name": "New Mexico State", "conf": "C-USA", "div": "FBS", "color": "#861F41", "lat": 32.2796, "lng": -106.7491, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/166.png" },
  { "id": "UNC", "name": "North Carolina", "conf": "ACC", "div": "FBS", "color": "#7BAFD4", "lat": 35.9042, "lng": -79.0438, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/153.png" },
  { "id": "UNT", "name": "North Texas", "conf": "American", "div": "FBS", "color": "#00853E", "lat": 33.2075, "lng": -97.1526, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/249.png" },
  { "id": "NIU", "name": "Northern Illinois", "conf": "MAC", "div": "FBS", "color": "#B61E2E", "lat": 41.9338, "lng": -88.7758, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2459.png" },
  { "id": "NW", "name": "Northwestern", "conf": "Big Ten", "div": "FBS", "color": "#4E2A84", "lat": 42.0667, "lng": -87.6836, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/77.png" },
  { "id": "ND", "name": "Notre Dame", "conf": "Independent", "div": "FBS", "color": "#0C2340", "lat": 41.6984, "lng": -86.2339, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/87.png" },
  { "id": "OHIO", "name": "Ohio", "conf": "MAC", "div": "FBS", "color": "#00694E", "lat": 39.3241, "lng": -82.0991, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/195.png" },
  { "id": "OHST", "name": "Ohio State", "conf": "Big Ten", "div": "FBS", "color": "#BB0000", "lat": 40.0016, "lng": -83.0197, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/194.png" },
  { "id": "OKLA", "name": "Oklahoma", "conf": "SEC", "div": "FBS", "color": "#841617", "lat": 35.2059, "lng": -97.4423, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/201.png" },
  { "id": "OKST", "name": "Oklahoma State", "conf": "Big 12", "div": "FBS", "color": "#FF7300", "lat": 36.1265, "lng": -97.0743, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/197.png" },
  { "id": "ODU", "name": "Old Dominion", "conf": "Sun Belt", "div": "FBS", "color": "#003057", "lat": 36.8853, "lng": -76.3059, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/295.png" },
  { "id": "MISS", "name": "Ole Miss", "conf": "SEC", "div": "FBS", "color": "#CE1126", "lat": 34.3640, "lng": -89.5384, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/145.png" },
  { "id": "OREG", "name": "Oregon", "conf": "Big Ten", "div": "FBS", "color": "#154733", "lat": 44.0582, "lng": -123.0685, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png" },
  { "id": "ORST", "name": "Oregon State", "conf": "Pac-12", "div": "FBS", "color": "#DC4405", "lat": 44.5595, "lng": -123.2813, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/204.png" },
  { "id": "PNST", "name": "Penn State", "conf": "Big Ten", "div": "FBS", "color": "#041E42", "lat": 40.8122, "lng": -77.8561, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/213.png" },
  { "id": "PITT", "name": "Pittsburgh", "conf": "ACC", "div": "FBS", "color": "#FFB81C", "lat": 40.4446, "lng": -80.0158, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/221.png" },
  { "id": "PURD", "name": "Purdue", "conf": "Big Ten", "div": "FBS", "color": "#CEB888", "lat": 40.4237, "lng": -86.9212, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png" },
  { "id": "RICE", "name": "Rice", "conf": "American", "div": "FBS", "color": "#00205B", "lat": 29.7174, "lng": -95.4018, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/242.png" },
  { "id": "RUTG", "name": "Rutgers", "conf": "Big Ten", "div": "FBS", "color": "#CC0033", "lat": 40.5138, "lng": -74.4648, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/164.png" },
  { "id": "SHSU", "name": "Sam Houston State", "conf": "C-USA", "div": "FBS", "color": "#F26F26", "lat": 30.7137, "lng": -95.5468, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2534.png" },
  { "id": "SDSU", "name": "San Diego State", "conf": "Mountain West", "div": "FBS", "color": "#A6192E", "lat": 32.7844, "lng": -117.1228, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/21.png" },
  { "id": "SJSU", "name": "San Jose State", "conf": "Mountain West", "div": "FBS", "color": "#0055A2", "lat": 37.3352, "lng": -121.8811, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/23.png" },
  { "id": "SMU", "name": "SMU", "conf": "ACC", "div": "FBS", "color": "#354CA1", "lat": 32.8405, "lng": -96.7818, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2567.png" },
  { "id": "USA", "name": "South Alabama", "conf": "Sun Belt", "div": "FBS", "color": "#00205B", "lat": 30.6954, "lng": -88.1740, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/6.png" },
  { "id": "SOCA", "name": "South Carolina", "conf": "SEC", "div": "FBS", "color": "#73000A", "lat": 33.9730, "lng": -81.0192, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2579.png" },
  { "id": "USF", "name": "South Florida", "conf": "American", "div": "FBS", "color": "#006747", "lat": 28.0587, "lng": -82.4139, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/58.png" },
  { "id": "USM", "name": "Southern Miss", "conf": "Sun Belt", "div": "FBS", "color": "#000000", "lat": 31.3298, "lng": -89.3335, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2572.png" },
  { "id": "STAN", "name": "Stanford", "conf": "ACC", "div": "FBS", "color": "#8C1515", "lat": 37.4345, "lng": -122.1611, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/24.png" },
  { "id": "CUSE", "name": "Syracuse", "conf": "ACC", "div": "FBS", "color": "#F76900", "lat": 43.0362, "lng": -76.1363, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/183.png" },
  { "id": "TCU", "name": "TCU", "conf": "Big 12", "div": "FBS", "color": "#4D1979", "lat": 32.7097, "lng": -97.3681, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2628.png" },
  { "id": "TEMP", "name": "Temple", "conf": "American", "div": "FBS", "color": "#9D2235", "lat": 39.9805, "lng": -75.1554, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/218.png" },
  { "id": "TENN", "name": "Tennessee", "conf": "SEC", "div": "FBS", "color": "#FF8200", "lat": 35.9550, "lng": -83.9250, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png" },
  { "id": "TEX", "name": "Texas", "conf": "SEC", "div": "FBS", "color": "#BF5700", "lat": 30.2837, "lng": -97.7323, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/251.png" },
  { "id": "TAMU", "name": "Texas A&M", "conf": "SEC", "div": "FBS", "color": "#500000", "lat": 30.6102, "lng": -96.3398, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/245.png" },
  { "id": "TXST", "name": "Texas State", "conf": "Sun Belt", "div": "FBS", "color": "#501214", "lat": 29.8884, "lng": -97.9384, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/326.png" },
  { "id": "TTU", "name": "Texas Tech", "conf": "Big 12", "div": "FBS", "color": "#CC0000", "lat": 33.5908, "lng": -101.8746, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2641.png" },
  { "id": "TLDO", "name": "Toledo", "conf": "MAC", "div": "FBS", "color": "#15397F", "lat": 41.6562, "lng": -83.6127, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2649.png" },
  { "id": "TROY", "name": "Troy", "conf": "Sun Belt", "div": "FBS", "color": "#8A2432", "lat": 31.8001, "lng": -85.9572, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2653.png" },
  { "id": "TLNE", "name": "Tulane", "conf": "American", "div": "FBS", "color": "#006747", "lat": 29.9427, "lng": -90.1165, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2655.png" },
  { "id": "TULS", "name": "Tulsa", "conf": "American", "div": "FBS", "color": "#002D72", "lat": 36.1557, "lng": -95.9404, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/202.png" },
  { "id": "UAB", "name": "UAB", "conf": "American", "div": "FBS", "color": "#006341", "lat": 33.5022, "lng": -86.8058, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/5.png" },
  { "id": "UCF", "name": "UCF", "conf": "Big 12", "div": "FBS", "color": "#BA9B37", "lat": 28.6080, "lng": -81.1965, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png" },
  { "id": "UCLA", "name": "UCLA", "conf": "Big Ten", "div": "FBS", "color": "#2D68C4", "lat": 34.1613, "lng": -118.1676, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/26.png" },
  { "id": "MASS", "name": "UMass", "conf": "MAC", "div": "FBS", "color": "#881C1C", "lat": 42.3868, "lng": -72.5301, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/113.png" },
  { "id": "UNLV", "name": "UNLV", "conf": "Mountain West", "div": "FBS", "color": "#CF0A2C", "lat": 36.1085, "lng": -115.1449, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2439.png" },
  { "id": "USC", "name": "USC", "conf": "Big Ten", "div": "FBS", "color": "#990000", "lat": 34.0141, "lng": -118.2879, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/30.png" },
  { "id": "UTAH", "name": "Utah", "conf": "Big 12", "div": "FBS", "color": "#CC0000", "lat": 40.7599, "lng": -111.8488, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/254.png" },
  { "id": "UTST", "name": "Utah State", "conf": "Pac-12", "div": "FBS", "color": "#0F2439", "lat": 41.7407, "lng": -111.8139, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/328.png" },
  { "id": "UTEP", "name": "UTEP", "conf": "Mountain West", "div": "FBS", "color": "#FF7F00", "lat": 31.7732, "lng": -106.5047, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2638.png" },
  { "id": "UTSA", "name": "UTSA", "conf": "American", "div": "FBS", "color": "#F15A22", "lat": 29.5843, "lng": -98.6171, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2636.png" },
  { "id": "VAND", "name": "Vanderbilt", "conf": "SEC", "div": "FBS", "color": "#000000", "lat": 36.1447, "lng": -86.8027, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/238.png" },
  { "id": "UVA", "name": "Virginia", "conf": "ACC", "div": "FBS", "color": "#232D4B", "lat": 38.0306, "lng": -78.5080, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/258.png" },
  { "id": "VT", "name": "Virginia Tech", "conf": "ACC", "div": "FBS", "color": "#630031", "lat": 37.2197, "lng": -80.4179, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/259.png" },
  { "id": "WAKE", "name": "Wake Forest", "conf": "ACC", "div": "FBS", "color": "#9E7E38", "lat": 36.1593, "lng": -80.2755, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/154.png" },
  { "id": "WASH", "name": "Washington", "conf": "Big Ten", "div": "FBS", "color": "#4B2E83", "lat": 47.6504, "lng": -122.3094, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/264.png" },
  { "id": "WAST", "name": "Washington State", "conf": "Pac-12", "div": "FBS", "color": "#981E32", "lat": 46.7296, "lng": -117.1596, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/265.png" },
  { "id": "WVU", "name": "West Virginia", "conf": "Big 12", "div": "FBS", "color": "#002855", "lat": 39.6508, "lng": -79.9546, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/277.png" },
  { "id": "WKU", "name": "Western Kentucky", "conf": "C-USA", "div": "FBS", "color": "#F32026", "lat": 36.9856, "lng": -86.4552, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/98.png" },
  { "id": "WMU", "name": "Western Michigan", "conf": "MAC", "div": "FBS", "color": "#B58500", "lat": 42.2831, "lng": -85.6139, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2711.png" },
  { "id": "WISC", "name": "Wisconsin", "conf": "Big Ten", "div": "FBS", "color": "#C5050C", "lat": 43.0698, "lng": -89.4127, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/275.png" },
  { "id": "WYOM", "name": "Wyoming", "conf": "Mountain West", "div": "FBS", "color": "#492F24", "lat": 41.3144, "lng": -105.5669, "logo": "https://a.espncdn.com/i/teamlogos/ncaa/500/2751.png" }
];

const INITIAL_GAMES = []; // Start with a clean slate

// --- UTILS ---
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Earth Radius in Miles for Area Calc
const EARTH_RADIUS_MILES = 3958.8;

// CSV Parser Helper
const parseCSV = (text, teams) => {
  const lines = text.trim().split('\n');
  const games = [];
  
  const startIndex = lines[0].toLowerCase().startsWith('week') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim());
    if (parts.length >= 3) {
      const week = parseInt(parts[0]);
      const winnerName = parts[1];
      const loserName = parts[2];

      const findTeamId = (name) => {
         const t = teams.find(t => t.name.toLowerCase() === name.toLowerCase() || t.id.toLowerCase() === name.toLowerCase());
         return t ? t.id : null;
      };

      const winnerId = findTeamId(winnerName);
      const loserId = findTeamId(loserName);

      if (winnerId && loserId && !isNaN(week)) {
        games.push({ week, winner: winnerId, loser: loserId });
      }
    }
  }
  return games;
};

export default function CFBImperialismMap() {
  const [topology, setTopology] = useState(null);
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [games, setGames] = useState(INITIAL_GAMES);
  const [currentWeek, setCurrentWeek] = useState(0); 
  const [playing, setPlaying] = useState(false);
  const [showGamesPanel, setShowGamesPanel] = useState(false);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [leaderboardMode, setLeaderboardMode] = useState('area'); 
  const [leaderboardEntity, setLeaderboardEntity] = useState('teams'); 
  const [selectedConference, setSelectedConference] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef(null);
  const svgRef = useRef(null);
  const mapGroupRef = useRef(null);
  const zoomRef = useRef(null);

  // Auth & Admin State
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Client-side admin toggle
  
  // Gemini AI State
  const [aiReport, setAiReport] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [newGameWinner, setNewGameWinner] = useState('');
  const [newGameLoser, setNewGameLoser] = useState('');

  // API Key
  const apiKey = ""; 

  // --- FIREBASE AUTH & DATA LOADING ---
  
  // 1. Auth Init
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Data Sync
  useEffect(() => {
    if (!user) return;

    // Use Public Data Path so everyone sees the same map
    const gamesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'games');
    
    // Subscribe to updates
    const unsubscribe = onSnapshot(gamesCollection, (snapshot) => {
      const loadedGames = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort in memory as per "No Complex Queries" rule
      loadedGames.sort((a, b) => a.week - b.week);
      setGames(loadedGames);
    }, (error) => {
      console.error("Error fetching games:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Load Topology and Teams
  useEffect(() => {
    // Load Map
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json')
      .then(res => res.json())
      .then(setTopology)
      .catch(err => console.error("Failed to load map data", err));

    // Set Teams from embedded data
    setTeams(INITIAL_TEAMS);
    if(INITIAL_TEAMS.length > 0) {
        setNewGameWinner(INITIAL_TEAMS[0].id);
        setNewGameLoser(INITIAL_TEAMS[1].id);
    }
  }, []);

  const countyNeighbors = useMemo(() => {
    if (!topology) return null;
    return topojson.neighbors(topology.objects.counties.geometries);
  }, [topology]);

  const countyStats = useMemo(() => {
    if (!topology) return {};
    const stats = {};
    const featureCollection = topojson.feature(topology, topology.objects.counties);
    
    featureCollection.features.forEach(county => {
      const areaSqMiles = d3.geoArea(county) * EARTH_RADIUS_MILES * EARTH_RADIUS_MILES;
      stats[county.id] = { area: areaSqMiles };
    });
    return stats;
  }, [topology]);

  const initialOwnership = useMemo(() => {
    if (!topology || teams.length === 0) return null;
    const counties = topojson.feature(topology, topology.objects.counties).features;
    
    const ownership = {};
    
    counties.forEach(county => {
      const centroid = d3.geoCentroid(county); 
      let minDist = Infinity;
      let closestTeam = null;

      teams.forEach(team => {
        const dist = haversine(centroid[1], centroid[0], team.lat, team.lng);
        if (dist < minDist) {
          minDist = dist;
          closestTeam = team.id;
        }
      });
      
      ownership[county.id] = closestTeam;
    });
    return ownership;
  }, [topology, teams]);

  const currentOwnership = useMemo(() => {
    if (!initialOwnership) return {};
    
    let ownership = { ...initialOwnership };
    const gamesToProcess = games.filter(g => g.week <= currentWeek);
    gamesToProcess.sort((a,b) => a.week - b.week);

    gamesToProcess.forEach(game => {
      const { winner, loser } = game;
      Object.keys(ownership).forEach(countyId => {
        if (ownership[countyId] === loser) {
          ownership[countyId] = winner;
        }
      });
    });

    return ownership;
  }, [initialOwnership, games, currentWeek]);

  const getCountyHistory = (countyId) => {
    if (!initialOwnership || !initialOwnership[countyId]) return [];
    
    let owner = initialOwnership[countyId];
    const history = [{ week: 0, owner: owner }];
    
    const relevantGames = games.filter(g => g.week <= currentWeek).sort((a,b) => a.week - b.week);
    
    relevantGames.forEach(game => {
      if (game.loser === owner) {
        owner = game.winner;
        history.push({ week: game.week, owner: owner });
      }
    });
    
    return history;
  };

  const clusteredLogos = useMemo(() => {
    if (!topology || !currentOwnership || !countyNeighbors || teams.length === 0) return [];
    
    const counties = topojson.feature(topology, topology.objects.counties).features;
    
    const teamCountyIndices = {};
    counties.forEach((c, index) => {
      const ownerId = currentOwnership[c.id];
      if (!ownerId) return;
      if (!teamCountyIndices[ownerId]) teamCountyIndices[ownerId] = new Set();
      teamCountyIndices[ownerId].add(index);
    });

    const logos = [];

    Object.keys(teamCountyIndices).forEach(teamId => {
       const indicesSet = teamCountyIndices[teamId];
       const visited = new Set();
       const team = teams.find(t => t.id === teamId);
       if (!team) return;

       const clusters = [];

       indicesSet.forEach(startIndex => {
         if (visited.has(startIndex)) return;

         const cluster = [];
         const queue = [startIndex];
         visited.add(startIndex);

         while (queue.length > 0) {
           const currentIdx = queue.shift();
           cluster.push(currentIdx);
           
           const neighbors = countyNeighbors[currentIdx];
           neighbors.forEach(nIdx => {
             if (indicesSet.has(nIdx) && !visited.has(nIdx)) {
               visited.add(nIdx);
               queue.push(nIdx);
             }
           });
         }
         clusters.push(cluster);
       });

       clusters.forEach(clusterIndices => {
          let sumLat = 0, sumLng = 0, count = 0, totalArea = 0;
          
          clusterIndices.forEach(idx => {
             const feature = counties[idx];
             const [lng, lat] = d3.geoCentroid(feature);
             const area = countyStats[feature.id]?.area || 0;
             
             sumLat += lat;
             sumLng += lng;
             count++;
             totalArea += area;
          });

          if (count > 0) {
             logos.push({
               id: teamId,
               lat: sumLat / count,
               lng: sumLng / count,
               logo: team.logo, 
               count: count,
               totalArea: totalArea,
               name: team.name,
               clusterSize: count 
             });
          }
       });
    });

    return logos;
  }, [topology, currentOwnership, countyNeighbors, countyStats, teams]);

  const leaderboard = useMemo(() => {
    const teamStats = {}; 
    teams.forEach(team => {
        teamStats[team.id] = { ...team, count: 0, totalArea: 0 };
    });

    if (currentOwnership && countyStats) {
        Object.keys(currentOwnership).forEach(countyId => {
            const ownerId = currentOwnership[countyId];
            const area = countyStats[countyId]?.area || 0;
            if (teamStats[ownerId]) {
                teamStats[ownerId].count += 1;
                teamStats[ownerId].totalArea += area;
            }
        });
    }

    if (leaderboardEntity === 'conferences') {
        const confStats = {};
        Object.values(teamStats).forEach(team => {
            const conf = team.conf || 'Ind';
            if (!confStats[conf]) {
                confStats[conf] = { id: conf, name: conf, count: 0, totalArea: 0, color: '#64748b', isConf: true };
            }
            confStats[conf].count += team.count;
            confStats[conf].totalArea += team.totalArea;
        });
        const sorted = Object.values(confStats).sort((a,b) =>
            leaderboardMode === 'area' ? b.totalArea - a.totalArea : b.count - a.count
        );
        return sorted;
    }

    let stats = Object.values(teamStats);

    if (selectedConference !== 'All') {
        stats = stats.filter(t => t.conf === selectedConference);
    }

    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        stats = stats.filter(s => s.name.toLowerCase().includes(lower) || s.id.toLowerCase().includes(lower));
    }

    if (leaderboardMode === 'area') {
        return stats.sort((a,b) => b.totalArea - a.totalArea);
    } else {
        return stats.sort((a,b) => b.count - a.count);
    }
  }, [currentOwnership, countyStats, leaderboardMode, searchTerm, leaderboardEntity, selectedConference, teams]);

  const uniqueConferences = useMemo(() => {
    const confs = new Set(teams.map(t => t.conf));
    return ['All', ...Array.from(confs).sort()];
  }, [teams]);

  useEffect(() => {
    if (!topology || !currentOwnership || !svgRef.current || teams.length === 0) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(mapGroupRef.current);
    const width = 960;
    const height = 600;
    
    const projection = d3.geoAlbersUsa().scale(1300).translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    const counties = topojson.feature(topology, topology.objects.counties).features;
    const stateMesh = topojson.mesh(topology, topology.objects.states, (a, b) => a !== b);

    const zoom = d3.zoom()
      .scaleExtent([0.5, 8]) 
      .on('zoom', (event) => {
        setZoomTransform(event.transform);
        g.attr('transform', event.transform);
      });
    
    zoomRef.current = zoom; 
    svg.call(zoom);
    svg.call(zoom.transform, zoomTransform);

    const countyPaths = g.select('.counties-layer').selectAll('path').data(counties);

    countyPaths.enter()
      .append('path')
      .merge(countyPaths)
      .attr('d', path)
      .attr('fill', d => {
        const ownerId = currentOwnership[d.id];
        const team = teams.find(t => t.id === ownerId);
        return team ? team.color : '#e5e7eb'; 
      })
      .attr('stroke', 'none')
      .on('mouseover', (event, d) => {
        const ownerId = currentOwnership[d.id];
        const team = teams.find(t => t.id === ownerId);
        const history = getCountyHistory(d.id); 
        
        setHoverInfo({
          x: event.pageX,
          y: event.pageY,
          county: d.properties.name,
          owner: team ? team.name : (ownerId || 'Unknown'),
          conf: team ? team.conf : '',
          history: history
        });
        d3.select(event.currentTarget).attr('opacity', 0.8);
      })
      .on('mouseout', (event) => {
        setHoverInfo(null);
        d3.select(event.currentTarget).attr('opacity', 1);
      });

    countyPaths.exit().remove();

    g.select('.states-layer').selectAll('path')
      .data([stateMesh])
      .join('path')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);
      
    const logoGroup = g.select('.logos-layer');
    
    const logos = logoGroup.selectAll('g.team-logo').data(clusteredLogos, (d, i) => d.id + '-' + d.lat + '-' + d.lng);
    
    const logoEnter = logos.enter().append('g').attr('class', 'team-logo');
    
    logoEnter.append('circle')
      .attr('r', 1)
      .attr('fill', 'white')
      .attr('opacity', 0.8)
      .attr('stroke', '#333')
      .attr('stroke-width', 1);

    // Only show logo image if URL is present (FCS teams might not have one)
    logoEnter.filter(d => d.logo).append('image')
      .attr('width', 1)
      .attr('height', 1)
      .attr('href', d => d.logo)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('crossOrigin', 'anonymous') 
      .on('error', function() {
        d3.select(this).style('display', 'none');
      });
      
    logoEnter.append('text')
      .text(d => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', '10px')
      .attr('fill', 'black')
      .style('font-weight', 'bold')
      .style('display', d => d.logo ? 'none' : 'block');

    const logoMerge = logoEnter.merge(logos);

    logoMerge
      .transition().duration(500)
      .attr('transform', d => {
        const coords = projection([d.lng, d.lat]);
        return coords ? `translate(${coords[0]}, ${coords[1]})` : 'translate(-100,-100)';
      })
      .style('opacity', d => {
        const coords = projection([d.lng, d.lat]);
        return coords ? 1 : 0; 
      });
      
    logoMerge.select('circle')
       .attr('r', d => Math.min(25, Math.max(8, Math.sqrt(d.clusterSize) * 2.5)));
    
    logoMerge.select('image')
       .attr('width', d => Math.min(50, Math.max(16, Math.sqrt(d.clusterSize) * 5)))
       .attr('height', d => Math.min(50, Math.max(16, Math.sqrt(d.clusterSize) * 5)))
       .attr('x', d => - (Math.min(50, Math.max(16, Math.sqrt(d.clusterSize) * 5))) / 2)
       .attr('y', d => - (Math.min(50, Math.max(16, Math.sqrt(d.clusterSize) * 5))) / 2);
       
    // Fallback for missing logos: Force text display
    logoMerge.select('text')
       .style('display', d => d.logo ? 'none' : 'block');

    logos.exit().remove();

  }, [topology, currentOwnership, clusteredLogos, teams]); 

  const callGemini = async (prompt) => {
    setIsAiLoading(true);
    setAiReport(null);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (e) {
      console.error("Gemini Error", e);
      return "The Oracle is silent (API Error). Check console.";
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateWeeklyReport = async () => {
    const weekGames = games.filter(g => g.week === currentWeek);
    if (weekGames.length === 0) {
      setAiReport("No battles were fought this week, so the map remains unchanged.");
      return;
    }

    const gameSummaries = weekGames.map(g => {
      const winner = teams.find(t => t.id === g.winner)?.name || g.winner;
      const loser = teams.find(t => t.id === g.loser)?.name || g.loser;
      return `${winner} defeated ${loser}`;
    }).join(", ");

    const leaders = leaderboard.slice(0, 3).map(l => `${l.name} (${(l.totalArea/1000).toFixed(0)}k sq mi)`).join(", ");

    const prompt = `
      You are a war correspondent covering a fictional College Football Imperialism map where teams conquer land by winning games.
      
      Current Week: ${currentWeek}
      The Battles: ${gameSummaries}
      Current Superpowers (by land): ${leaders}

      Write a short, dramatic 2-paragraph news report summarizing the shifts in power this week. Use terms like "annexed", "conquered", "territory", "empire", and "frontlines".
      Focus on the biggest winners.
    `;

    const text = await callGemini(prompt);
    setAiReport(text);
  };

  const askOracle = async () => {
    const team1 = teams.find(t => t.id === newGameWinner);
    const team2 = teams.find(t => t.id === newGameLoser);
    
    if (!team1 || !team2 || team1.id === team2.id) {
      alert("Please select two different teams first.");
      return;
    }

    setIsAiLoading(true);
    
    const prompt = `
      Predict the winner between college football teams: ${team1.name} vs ${team2.name}.
      This is for a "SimCFB" simulation, so you can be creative.
      
      Return ONLY a JSON object with this format (do not use markdown blocks):
      { "winnerId": "${team1.id}" or "${team2.id}", "reason": "Short dramatic reason for victory (max 20 words)" }
    `;

    try {
      const text = await callGemini(prompt);
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanText);
      
      if (result.winnerId) {
        if (result.winnerId === newGameWinner) {
        } else {
           setNewGameLoser(newGameWinner);
           setNewGameWinner(newGameLoser);
        }
        alert(`Oracle Prediction: ${result.reason}`);
      }
    } catch (e) {
      alert("The Oracle is confused. Try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      const pin = prompt("Enter Commissioner PIN to enable editing:");
      if (pin === "simcfb") { // Simple client-side check for this prototype
        setIsAdmin(true);
      } else if (pin !== null) {
        alert("Incorrect PIN.");
      }
    }
  };

  const handleAddGame = async () => {
    if (newGameWinner === newGameLoser) return;
    if (!user) return;

    const newGame = {
      week: Math.max(...games.map(g => g.week), 0) + 1,
      winner: newGameWinner,
      loser: newGameLoser
    };

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'games'), newGame);
    } catch (e) {
      console.error("Error adding game: ", e);
      alert("Failed to save game. Check console.");
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!user || !gameId) return;
    if (confirm("Are you sure you want to delete this game record?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId));
      } catch (e) {
        console.error("Error deleting game: ", e);
      }
    }
  };

  const handleReset = async () => {
    if (!confirm("WARNING: This will delete ALL games from the database. Are you sure?")) return;
    // Note: In a real app, you'd use a cloud function or batch delete. 
    // Here we will just delete visible ones one by one (safe for small datasets).
    for (const game of games) {
       if (game.id) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'games', game.id));
    }
    setCurrentWeek(0);
    setAiReport(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const newGames = parseCSV(text, teams); // Pass teams to parser
      if (newGames.length > 0) {
         // Batch add to firestore
         let addedCount = 0;
         for (const g of newGames) {
            try {
               await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'games'), g);
               addedCount++;
            } catch(e) {
               console.error("Error adding game from CSV", e);
            }
         }
         alert(`Imported ${addedCount} games successfully!`);
      } else {
         alert("Could not parse games. Ensure CSV format is: Week,Winner,Loser");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleExportMapSVG = () => {
    if (!svgRef.current) return;
    
    const clonedSvg = svgRef.current.cloneNode(true);
    const g = clonedSvg.querySelector('g');
    if(g) g.removeAttribute('transform'); 

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(clonedSvg);
    
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    const blob = new Blob([source], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `SimCFB_Imperialism_Map_Week${currentWeek}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMapPNG = async () => {
    if (!svgRef.current) return;
    setIsExporting(true);

    const clonedSvg = svgRef.current.cloneNode(true);
    const g = clonedSvg.querySelector('g');
    if(g) g.removeAttribute('transform'); 

    const images = Array.from(clonedSvg.querySelectorAll('image'));
    
    const toBase64 = async (url) => {
        try {
            const response = await fetch(url, { mode: 'cors' }); 
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.warn("Failed to load image for export:", url);
            return null;
        }
    };

    await Promise.all(images.map(async (image) => {
        const href = image.getAttribute('href');
        if (href && href.startsWith('http')) {
            const base64 = await toBase64(href);
            if (base64) {
                image.setAttribute('href', base64);
            }
        }
    }));

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(clonedSvg);

    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const svgBlob = new Blob([source], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2; 
      const width = 960;
      const height = 600;
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#e2e8f0"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
          const pngUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `SimCFB_Imperialism_Map_Week${currentWeek}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (e) {
          console.error("Export failed", e);
          alert("Export failed due to browser security restrictions on images.");
      }
      
      URL.revokeObjectURL(url);
      setIsExporting(false);
    };
    img.onerror = (e) => {
        console.error("Image load failed", e);
        alert("Failed to render map image.");
        setIsExporting(false);
    }
    img.src = url;
  };

  const handleExportData = () => {
    const header = "Week,Winner,Loser\n";
    const csvContent = games.map(g => `${g.week},${g.winner},${g.loser}`).join("\n");
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `SimCFB_Games_Data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoom = (factor) => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  const handleZoomReset = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity);
  }

  useEffect(() => {
    let interval;
    if (playing) {
      interval = setInterval(() => {
        setCurrentWeek(c => {
          const maxWeek = Math.max(...games.map(g => g.week), 0);
          if (c >= maxWeek) {
            setPlaying(false);
            return c;
          }
          return c + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playing, games]);

  const maxWeek = Math.max(...games.map(g => g.week), 0);

  if (teams.length === 0) {
      return (
          <div className="flex h-screen items-center justify-center bg-slate-100 text-slate-500">
              <div className="flex flex-col items-center">
                  <Loader className="w-8 h-8 animate-spin mb-2 text-blue-600" />
                  <span>Loading Team Data...</span>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">
      
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border-2 border-white shadow-lg overflow-hidden">
            <img src="https://github.com/kpxkevin/simcfb-map/blob/main/simsn_cfbArtboard_14x.png?raw=true" alt="SimCFB" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-wider hidden sm:block">SimCFB IMPERIALISM MAP</h1>
          <h1 className="text-xl font-bold tracking-wider sm:hidden">SimCFB MAP</h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4 text-sm">
          <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 hidden md:block">
            Current View: <span className="text-yellow-400 font-bold">Week {currentWeek}</span>
          </div>
          
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
             <button onClick={() => setShowLeaderboard(!showLeaderboard)} className={`p-1.5 rounded ${showLeaderboard ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Toggle Leaderboard">
               {showLeaderboard ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
             </button>
             <button onClick={() => setShowControls(!showControls)} className={`p-1.5 rounded ${showControls ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Toggle Timeline">
               {showControls ? <Maximize className="w-4 h-4 rotate-45"/> : <Maximize className="w-4 h-4"/>}
             </button>
             <button onClick={handleToggleAdmin} className={`p-1.5 rounded ${isAdmin ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Commissioner Mode">
               {isAdmin ? <Unlock className="w-4 h-4"/> : <Lock className="w-4 h-4"/>}
             </button>
          </div>

          <div className="relative group">
            <button className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded transition">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="absolute right-0 pt-2 w-48 hidden group-hover:block z-50">
              <div className="bg-white rounded-md shadow-lg py-1 border border-slate-200">
                <button 
                  onClick={handleExportMapPNG} 
                  disabled={isExporting}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  {isExporting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />} 
                  Map Image (.png)
                </button>
                <button onClick={handleExportMapSVG} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" /> Map Image (.svg)
                </button>
                <button onClick={handleExportData} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <FileText className="w-4 h-4 mr-2" /> Game Data (.csv)
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowGamesPanel(!showGamesPanel)}
            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded transition"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Manage Games</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        <div className="flex-1 relative bg-slate-200 flex items-center justify-center overflow-hidden">
          {!topology && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-50 opacity-75">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          <svg 
            ref={svgRef} 
            viewBox="0 0 960 600" 
            className="w-full h-full max-h-[90vh] drop-shadow-2xl cursor-move"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          >
            <g ref={mapGroupRef}>
                <g className="counties-layer"></g>
                <g className="states-layer pointer-events-none"></g>
                <g className="logos-layer pointer-events-none"></g>
            </g>
          </svg>

          <div className="absolute top-4 right-4 flex flex-col space-y-2 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-slate-200 p-2">
             <button onClick={() => handleZoom(1.5)} className="p-2 hover:bg-slate-100 rounded" title="Zoom In">
               <ZoomIn className="w-5 h-5 text-slate-700" />
             </button>
             <button onClick={() => handleZoom(0.66)} className="p-2 hover:bg-slate-100 rounded" title="Zoom Out">
               <ZoomOut className="w-5 h-5 text-slate-700" />
             </button>
             <button onClick={handleZoomReset} className="p-2 hover:bg-slate-100 rounded" title="Reset Zoom">
               <RotateCcw className="w-5 h-5 text-slate-700" />
             </button>
          </div>

          {showControls && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200 w-11/12 max-w-2xl flex flex-col space-y-3 transition-all duration-300">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-widest">
                <span>Pre-Season</span>
                <span>Current Week</span>
                </div>
                
                <input 
                type="range" 
                min="0" 
                max={maxWeek} 
                value={currentWeek} 
                onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                
                <div className="flex justify-center items-center space-x-4">
                <button onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                <button 
                    onClick={() => setPlaying(!playing)}
                    className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg transform hover:scale-105 transition"
                >
                    {playing ? <Pause className="fill-current" /> : <Play className="fill-current pl-1" />}
                </button>
                <button onClick={() => setCurrentWeek(Math.min(maxWeek, currentWeek + 1))} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>
          )}

          {showLeaderboard && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg border border-slate-200 w-72 flex flex-col max-h-[80vh] transition-all duration-300">
                <div className="flex flex-col space-y-2 mb-2 border-b pb-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-500 uppercase">Territory Leaders</h3>
                    <div className="flex space-x-1">
                      <button 
                          onClick={() => setLeaderboardEntity(e => e === 'teams' ? 'conferences' : 'teams')}
                          className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border hover:bg-slate-200 flex items-center"
                          title="Switch between Teams and Conferences"
                      >
                          {leaderboardEntity === 'teams' ? <Users className="w-3 h-3 mr-1"/> : <Layers className="w-3 h-3 mr-1"/>}
                          {leaderboardEntity === 'teams' ? 'Teams' : 'Confs'}
                      </button>
                      
                      <button 
                          onClick={() => setLeaderboardMode(m => m === 'area' ? 'count' : 'area')}
                          className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border hover:bg-slate-200 flex items-center"
                          title="Switch Metric"
                      >
                          {leaderboardMode === 'area' ? <Globe className="w-3 h-3 mr-1"/> : <MapIcon className="w-3 h-3 mr-1"/>}
                          {leaderboardMode === 'area' ? 'Sq Mi' : 'Co.'}
                      </button>
                    </div>
                  </div>

                  {leaderboardEntity === 'teams' && (
                    <select 
                      value={selectedConference} 
                      onChange={(e) => setSelectedConference(e.target.value)}
                      className="w-full text-xs p-1 border rounded bg-slate-50 focus:outline-none focus:border-blue-500"
                    >
                      {uniqueConferences.map(c => (
                        <option key={c} value={c}>{c === 'All' ? 'All Conferences' : c}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="mb-3 relative">
                <Search className="w-4 h-4 absolute left-2 top-2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
                </div>
                
                <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
                <ul className="space-y-1">
                    {leaderboard.map((item, idx) => (
                    <li key={item.id} className="flex items-center justify-between text-sm p-1 hover:bg-slate-100 rounded">
                        <div className="flex items-center space-x-2 truncate">
                        <span className="font-mono text-slate-400 w-5 text-right text-xs">{idx + 1}.</span>
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="font-semibold truncate text-xs">{item.name}</span>
                        </div>
                        <span className="text-slate-500 text-xs whitespace-nowrap ml-2 font-mono">
                        {leaderboardMode === 'area' 
                            ? `${(item.totalArea / 1000).toFixed(0)}k` 
                            : `${item.count}`}
                        </span>
                    </li>
                    ))}
                    {leaderboard.length === 0 && <li className="text-center text-xs text-slate-400 py-4">No results found.</li>}
                </ul>
                </div>
            </div>
          )}
        </div>

        {showGamesPanel && (
          <div className="w-96 bg-white border-l border-slate-200 shadow-2xl p-6 overflow-y-auto absolute right-0 top-0 bottom-0 z-20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Match Results</h2>
              <button onClick={() => setShowGamesPanel(false)} className="text-slate-400 hover:text-slate-600">
                <ChevronRight />
              </button>
            </div>

            {!isAdmin ? (
               <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <Lock className="w-8 h-8 mx-auto text-gray-400 mb-2"/>
                  <h3 className="text-sm font-bold text-gray-700">Commissioner Access Only</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Editing is locked to prevent unauthorized changes. 
                    <button onClick={handleToggleAdmin} className="text-blue-600 hover:underline ml-1">Unlock with PIN</button>
                  </p>
               </div>
            ) : (
              <>
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="text-sm font-bold text-green-800 mb-2 flex items-center">
                  <Unlock className="w-4 h-4 mr-2" /> Commissioner Mode Active
                </h3>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-green-700 mb-1">Import Games (CSV)</label>
                  <input 
                    type="file" 
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-xs file:font-semibold
                      file:bg-green-600 file:text-white
                      hover:file:bg-green-700
                    "
                  />
                  <p className="text-[10px] text-green-600 mt-1">Format: <code>Week, Winner, Loser</code></p>
                </div>
                
                <div className="pt-2 border-t border-green-200">
                  <h3 className="text-xs font-bold text-green-700 mb-2">Manual Entry</h3>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-medium text-green-600 mb-1">Winner</label>
                        <select 
                          className="w-full p-2 text-sm border rounded bg-white"
                          value={newGameWinner}
                          onChange={(e) => setNewGameWinner(e.target.value)}
                        >
                          {teams.sort((a,b) => a.name.localeCompare(b.name)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-[10px] font-medium text-green-600 mb-1">Loser</label>
                        <select 
                          className="w-full p-2 text-sm border rounded bg-white"
                          value={newGameLoser}
                          onChange={(e) => setNewGameLoser(e.target.value)}
                        >
                          {teams.sort((a,b) => a.name.localeCompare(b.name)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={handleAddGame}
                      className="w-full py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition flex justify-center items-center"
                    >
                      <Save className="w-4 h-4 mr-1" /> Add Result
                    </button>

                    <button 
                      onClick={askOracle}
                      disabled={isAiLoading}
                      className="w-full text-xs bg-purple-100 text-purple-700 px-2 py-2 rounded border border-purple-200 hover:bg-purple-200 flex justify-center items-center"
                    >
                      {isAiLoading ? "Thinking..." : <><Sparkles className="w-3 h-3 mr-1" /> Ask Oracle Prediction</>}
                    </button>
                  </div>
                </div>
              </div>
              </>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                 <h3 className="text-sm font-bold text-slate-700">History Log</h3>
                 {isAdmin && (
                   <button onClick={handleReset} className="text-xs text-red-500 hover:text-red-700 flex items-center">
                      <RotateCcw className="w-3 h-3 mr-1" /> Clear All
                   </button>
                 )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                 <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-amber-800 flex items-center">
                      <ScrollText className="w-3 h-3 mr-1"/> Weekly War Report
                    </h4>
                    <button 
                      onClick={generateWeeklyReport}
                      disabled={isAiLoading}
                      className="text-[10px] bg-white border border-amber-300 px-2 py-1 rounded hover:bg-amber-100 text-amber-700"
                    >
                      {isAiLoading ? "Writing..." : `✨ Generate Week ${currentWeek} Report`}
                    </button>
                 </div>
                 <div className="text-xs text-amber-900 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                   {aiReport || "Click generate to see a summary of the week's conquests."}
                 </div>
              </div>
              
              <div className="space-y-2">
                {games.length === 0 && <p className="text-xs text-slate-400 italic">No games recorded yet.</p>}
                {[...games].reverse().map((g, i) => {
                  const winner = teams.find(t => t.id === g.winner);
                  const loser = teams.find(t => t.id === g.loser);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded shadow-sm group">
                      <div className="flex items-center space-x-2">
                         <span className="text-xs font-mono text-slate-400 w-8">W{g.week}</span>
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-green-700">{winner?.name || g.winner}</span>
                            <span className="text-xs text-slate-400">def. {loser?.name || g.loser}</span>
                         </div>
                      </div>
                      {isAdmin && (
                        <button onClick={() => handleDeleteGame(g.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {hoverInfo && (
        <div 
          className="fixed pointer-events-none bg-slate-900 text-white text-xs p-2 rounded shadow-lg z-50 transform -translate-x-1/2 -translate-y-full mt-[-10px]"
          style={{ left: hoverInfo.x, top: hoverInfo.y }}
        >
          <div className="font-bold">{hoverInfo.county}</div>
          <div className="text-slate-300">Owned by: <span className="text-white font-semibold">{hoverInfo.owner}</span></div>
          <div className="text-slate-400 text-[10px] mt-1">{hoverInfo.conf}</div>
          
          <div className="mt-2 pt-2 border-t border-slate-700">
            <div className="text-[10px] uppercase text-slate-400 mb-1">Ownership History</div>
            {hoverInfo.history.map((h, i) => (
               <div key={i} className="flex justify-between text-[10px]">
                 <span className="text-slate-400">Week {h.week}</span>
                 <span className="font-semibold">{teams.find(t => t.id === h.owner)?.name || h.owner}</span>
               </div>
            ))}
          </div>
        </div>
      )}
      
      {!topology && (
        <div className="absolute bottom-4 right-4 bg-yellow-50 text-yellow-800 text-xs p-3 rounded border border-yellow-200 max-w-sm shadow-sm">
          <Info className="w-4 h-4 inline mr-1 mb-0.5" />
          Loading high-resolution US county data (1MB)...
        </div>
      )}

    </div>
  );
}
#
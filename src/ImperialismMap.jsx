import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { 
  Play, Pause, ChevronRight, ChevronLeft, Upload, Save, RotateCcw, 
  Trophy, Map as MapIcon, Info, Globe, FileText, Download, Sparkles, 
  ScrollText, Search, ZoomIn, ZoomOut, Maximize, Eye, EyeOff, Image as ImageIcon,
  Users, Layers, Loader
} from 'lucide-react';

// --- DATA: Comprehensive FBS Team List (~134 Teams) with Conference Data ---
const INITIAL_TEAMS = [
  // SEC
  { id: 'ALA', name: 'Alabama', conf: 'SEC', color: '#9E1B32', lat: 33.2098, lng: -87.5692, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/333.png' },
  { id: 'UGA', name: 'Georgia', conf: 'SEC', color: '#BA0C2F', lat: 33.9498, lng: -83.3734, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/61.png' },
  { id: 'TEX', name: 'Texas', conf: 'SEC', color: '#BF5700', lat: 30.2837, lng: -97.7323, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/251.png' },
  { id: 'OU', name: 'Oklahoma', conf: 'SEC', color: '#841617', lat: 35.2059, lng: -97.4423, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/201.png' },
  { id: 'LSU', name: 'LSU', conf: 'SEC', color: '#461D7C', lat: 30.4120, lng: -91.1838, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/99.png' },
  { id: 'TENN', name: 'Tennessee', conf: 'SEC', color: '#FF8200', lat: 35.9550, lng: -83.9250, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png' },
  { id: 'MISS', name: 'Ole Miss', conf: 'SEC', color: '#CE1126', lat: 34.3640, lng: -89.5384, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/145.png' },
  { id: 'MIZZ', name: 'Missouri', conf: 'SEC', color: '#F1B82D', lat: 38.9358, lng: -92.3286, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/142.png' },
  { id: 'UK', name: 'Kentucky', conf: 'SEC', color: '#0033A0', lat: 38.0226, lng: -84.5053, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/96.png' },
  { id: 'AUB', name: 'Auburn', conf: 'SEC', color: '#0C2340', lat: 32.6022, lng: -85.4917, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png' },
  { id: 'TAMU', name: 'Texas A&M', conf: 'SEC', color: '#500000', lat: 30.6102, lng: -96.3398, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/245.png' },
  { id: 'FLA', name: 'Florida', conf: 'SEC', color: '#0021A5', lat: 29.6499, lng: -82.3486, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/57.png' },
  { id: 'SC', name: 'South Carolina', conf: 'SEC', color: '#73000A', lat: 33.9730, lng: -81.0192, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2579.png' },
  { id: 'ARK', name: 'Arkansas', conf: 'SEC', color: '#9D2235', lat: 36.0687, lng: -94.1748, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/8.png' },
  { id: 'MSST', name: 'Mississippi State', conf: 'SEC', color: '#660000', lat: 33.4563, lng: -88.7944, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/344.png' },
  { id: 'VAN', name: 'Vanderbilt', conf: 'SEC', color: '#000000', lat: 36.1447, lng: -86.8027, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/238.png' },

  // Big Ten
  { id: 'OSU', name: 'Ohio State', conf: 'Big Ten', color: '#BB0000', lat: 40.0016, lng: -83.0197, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png' },
  { id: 'MICH', name: 'Michigan', conf: 'Big Ten', color: '#00274C', lat: 42.2658, lng: -83.7487, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/130.png' },
  { id: 'PSU', name: 'Penn State', conf: 'Big Ten', color: '#041E42', lat: 40.8122, lng: -77.8561, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/213.png' },
  { id: 'ORE', name: 'Oregon', conf: 'Big Ten', color: '#154733', lat: 44.0582, lng: -123.0685, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png' },
  { id: 'WASH', name: 'Washington', conf: 'Big Ten', color: '#4B2E83', lat: 47.6504, lng: -122.3094, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/264.png' },
  { id: 'USC', name: 'USC', conf: 'Big Ten', color: '#990000', lat: 34.0141, lng: -118.2879, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/30.png' },
  { id: 'UCLA', name: 'UCLA', conf: 'Big Ten', color: '#2D68C4', lat: 34.1613, lng: -118.1676, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/26.png' },
  { id: 'NEB', name: 'Nebraska', conf: 'Big Ten', color: '#E41C38', lat: 40.8206, lng: -96.7056, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/158.png' },
  { id: 'WIS', name: 'Wisconsin', conf: 'Big Ten', color: '#C5050C', lat: 43.0698, lng: -89.4127, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/275.png' },
  { id: 'IOWA', name: 'Iowa', conf: 'Big Ten', color: '#FFCD00', lat: 41.6586, lng: -91.5511, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png' },
  { id: 'MINN', name: 'Minnesota', conf: 'Big Ten', color: '#7A0019', lat: 44.9765, lng: -93.2246, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/135.png' },
  { id: 'MSU', name: 'Michigan State', conf: 'Big Ten', color: '#18453B', lat: 42.7281, lng: -84.4849, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/127.png' },
  { id: 'ILL', name: 'Illinois', conf: 'Big Ten', color: '#E84A27', lat: 40.0993, lng: -88.2360, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/356.png' },
  { id: 'PUR', name: 'Purdue', conf: 'Big Ten', color: '#CEB888', lat: 40.4237, lng: -86.9212, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png' },
  { id: 'IND', name: 'Indiana', conf: 'Big Ten', color: '#990000', lat: 39.1766, lng: -86.5130, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/84.png' },
  { id: 'RUT', name: 'Rutgers', conf: 'Big Ten', color: '#CC0033', lat: 40.5138, lng: -74.4648, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/164.png' },
  { id: 'MD', name: 'Maryland', conf: 'Big Ten', color: '#E03A3E', lat: 38.9904, lng: -76.9472, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/120.png' },
  { id: 'NU', name: 'Northwestern', conf: 'Big Ten', color: '#4E2A84', lat: 42.0667, lng: -87.6836, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/77.png' },

  // ACC
  { id: 'FSU', name: 'Florida State', conf: 'ACC', color: '#782F40', lat: 30.4363, lng: -84.2982, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/52.png' },
  { id: 'CLEM', name: 'Clemson', conf: 'ACC', color: '#F56600', lat: 34.6788, lng: -82.8432, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/228.png' },
  { id: 'MIA', name: 'Miami', conf: 'ACC', color: '#005030', lat: 25.9580, lng: -80.2389, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png' },
  { id: 'UNC', name: 'North Carolina', conf: 'ACC', color: '#7BAFD4', lat: 35.9042, lng: -79.0438, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/153.png' },
  { id: 'NCST', name: 'NC State', conf: 'ACC', color: '#CC0000', lat: 35.7954, lng: -78.6775, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/152.png' },
  { id: 'DUKE', name: 'Duke', conf: 'ACC', color: '#003087', lat: 35.9953, lng: -78.9417, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png' },
  { id: 'VT', name: 'Virginia Tech', conf: 'ACC', color: '#630031', lat: 37.2197, lng: -80.4179, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/259.png' },
  { id: 'UVA', name: 'Virginia', conf: 'ACC', color: '#232D4B', lat: 38.0306, lng: -78.5080, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/258.png' },
  { id: 'GT', name: 'Georgia Tech', conf: 'ACC', color: '#B3A369', lat: 33.7724, lng: -84.3928, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/59.png' },
  { id: 'PITT', name: 'Pittsburgh', conf: 'ACC', color: '#FFB81C', lat: 40.4446, lng: -80.0158, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/221.png' },
  { id: 'LOU', name: 'Louisville', conf: 'ACC', color: '#AD0000', lat: 38.2057, lng: -85.7587, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/97.png' },
  { id: 'SYR', name: 'Syracuse', conf: 'ACC', color: '#F76900', lat: 43.0362, lng: -76.1363, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/183.png' },
  { id: 'BC', name: 'Boston College', conf: 'ACC', color: '#98002E', lat: 42.3351, lng: -71.1685, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/103.png' },
  { id: 'WAKE', name: 'Wake Forest', conf: 'ACC', color: '#9E7E38', lat: 36.1593, lng: -80.2755, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/154.png' },
  { id: 'CAL', name: 'Cal', conf: 'ACC', color: '#003262', lat: 37.8706, lng: -122.2507, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/25.png' },
  { id: 'STAN', name: 'Stanford', conf: 'ACC', color: '#8C1515', lat: 37.4345, lng: -122.1611, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/24.png' },
  { id: 'SMU', name: 'SMU', conf: 'ACC', color: '#354CA1', lat: 32.8405, lng: -96.7818, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2567.png' },

  // Big 12
  { id: 'UTAH', name: 'Utah', conf: 'Big 12', color: '#CC0000', lat: 40.7599, lng: -111.8488, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/254.png' },
  { id: 'ARIZ', name: 'Arizona', conf: 'Big 12', color: '#CC0033', lat: 32.2285, lng: -110.9488, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/12.png' },
  { id: 'ASU', name: 'Arizona State', conf: 'Big 12', color: '#8C1D40', lat: 33.4264, lng: -111.9326, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/9.png' },
  { id: 'COLO', name: 'Colorado', conf: 'Big 12', color: '#CFB87C', lat: 40.0095, lng: -105.2669, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/38.png' },
  { id: 'BYU', name: 'BYU', conf: 'Big 12', color: '#002E5D', lat: 40.2584, lng: -111.6545, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/252.png' },
  { id: 'KAN', name: 'Kansas', conf: 'Big 12', color: '#0051BA', lat: 38.9586, lng: -95.2478, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png' },
  { id: 'KSU', name: 'Kansas State', conf: 'Big 12', color: '#512888', lat: 39.2020, lng: -96.5938, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2306.png' },
  { id: 'OKST', name: 'Oklahoma State', conf: 'Big 12', color: '#FF7300', lat: 36.1265, lng: -97.0743, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/197.png' },
  { id: 'TCU', name: 'TCU', conf: 'Big 12', color: '#4D1979', lat: 32.7097, lng: -97.3681, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2628.png' },
  { id: 'BAY', name: 'Baylor', conf: 'Big 12', color: '#154734', lat: 31.5493, lng: -97.1131, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/239.png' },
  { id: 'TTU', name: 'Texas Tech', conf: 'Big 12', color: '#CC0000', lat: 33.5908, lng: -101.8746, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2641.png' },
  { id: 'ISU', name: 'Iowa State', conf: 'Big 12', color: '#C8102E', lat: 42.0266, lng: -93.6465, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/66.png' },
  { id: 'HOU', name: 'Houston', conf: 'Big 12', color: '#C8102E', lat: 29.7218, lng: -95.3491, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/248.png' },
  { id: 'UCF', name: 'UCF', conf: 'Big 12', color: '#BA9B37', lat: 28.6080, lng: -81.1965, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png' },
  { id: 'CIN', name: 'Cincinnati', conf: 'Big 12', color: '#E00122', lat: 39.1312, lng: -84.5162, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2132.png' },
  { id: 'WVU', name: 'West Virginia', conf: 'Big 12', color: '#002855', lat: 39.6508, lng: -79.9546, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/277.png' },

  // Pac-2 / Independent
  { id: 'ORST', name: 'Oregon State', conf: 'Pac-12', color: '#DC4405', lat: 44.5595, lng: -123.2813, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/204.png' },
  { id: 'WSU', name: 'Washington State', conf: 'Pac-12', color: '#981E32', lat: 46.7296, lng: -117.1596, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/265.png' },
  { id: 'ND', name: 'Notre Dame', conf: 'Ind', color: '#0C2340', lat: 41.6984, lng: -86.2339, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/87.png' },
  { id: 'UCONN', name: 'UConn', conf: 'Ind', color: '#000E2F', lat: 41.8077, lng: -72.2540, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/41.png' },
  { id: 'UMASS', name: 'UMass', conf: 'Ind', color: '#881C1C', lat: 42.3868, lng: -72.5301, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/113.png' },

  // AAC
  { id: 'MEM', name: 'Memphis', conf: 'AAC', color: '#003087', lat: 35.1187, lng: -89.9711, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/235.png' },
  { id: 'TUL', name: 'Tulane', conf: 'AAC', color: '#006747', lat: 29.9427, lng: -90.1165, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2655.png' },
  { id: 'USF', name: 'South Florida', conf: 'AAC', color: '#006747', lat: 28.0587, lng: -82.4139, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/58.png' },
  { id: 'UTSA', name: 'UTSA', conf: 'AAC', color: '#F15A22', lat: 29.5843, lng: -98.6171, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2636.png' },
  { id: 'ECU', name: 'East Carolina', conf: 'AAC', color: '#592A8A', lat: 35.6021, lng: -77.3667, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/151.png' },
  { id: 'FAU', name: 'FAU', conf: 'AAC', color: '#003366', lat: 26.3754, lng: -80.1014, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2226.png' },
  { id: 'CLT', name: 'Charlotte', conf: 'AAC', color: '#046A38', lat: 35.3071, lng: -80.7352, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2429.png' },
  { id: 'NAVY', name: 'Navy', conf: 'AAC', color: '#00205B', lat: 38.9829, lng: -76.4840, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2426.png' },
  { id: 'ARMY', name: 'Army', conf: 'AAC', color: '#D4BF91', lat: 41.3918, lng: -73.9625, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/349.png' },
  { id: 'UNT', name: 'North Texas', conf: 'AAC', color: '#00853E', lat: 33.2075, lng: -97.1526, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/249.png' },
  { id: 'RICE', name: 'Rice', conf: 'AAC', color: '#00205B', lat: 29.7174, lng: -95.4018, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/242.png' },
  { id: 'TEM', name: 'Temple', conf: 'AAC', color: '#9D2235', lat: 39.9805, lng: -75.1554, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/218.png' },
  { id: 'TLSA', name: 'Tulsa', conf: 'AAC', color: '#002D72', lat: 36.1557, lng: -95.9404, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/202.png' },
  { id: 'UAB', name: 'UAB', conf: 'AAC', color: '#006341', lat: 33.5022, lng: -86.8058, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/5.png' },

  // Mountain West
  { id: 'BOISE', name: 'Boise State', conf: 'MWC', color: '#0033A0', lat: 43.6029, lng: -116.1959, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/68.png' },
  { id: 'FRES', name: 'Fresno State', conf: 'MWC', color: '#DB0032', lat: 36.8093, lng: -119.7456, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/278.png' },
  { id: 'UNLV', name: 'UNLV', conf: 'MWC', color: '#CF0A2C', lat: 36.1085, lng: -115.1449, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2439.png' },
  { id: 'SDSU', name: 'San Diego State', conf: 'MWC', color: '#A6192E', lat: 32.7844, lng: -117.1228, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/21.png' },
  { id: 'AF', name: 'Air Force', conf: 'MWC', color: '#003087', lat: 38.9984, lng: -104.8618, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2005.png' },
  { id: 'CSU', name: 'Colorado State', conf: 'MWC', color: '#1E4D2B', lat: 40.5734, lng: -105.0865, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/36.png' },
  { id: 'WYO', name: 'Wyoming', conf: 'MWC', color: '#492F24', lat: 41.3144, lng: -105.5669, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2751.png' },
  { id: 'USU', name: 'Utah State', conf: 'MWC', color: '#0F2439', lat: 41.7407, lng: -111.8139, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/328.png' },
  { id: 'SJS', name: 'San Jose State', conf: 'MWC', color: '#0055A2', lat: 37.3352, lng: -121.8811, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/23.png' },
  { id: 'NEV', name: 'Nevada', conf: 'MWC', color: '#002E62', lat: 39.5440, lng: -119.8163, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2440.png' },
  { id: 'UNM', name: 'New Mexico', conf: 'MWC', color: '#BA0C2F', lat: 35.0844, lng: -106.6198, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/167.png' },
  { id: 'HAW', name: 'Hawaii', conf: 'MWC', color: '#024731', lat: 21.2919, lng: -157.8171, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/62.png' },

  // Sun Belt
  { id: 'APP', name: 'App State', conf: 'Sun Belt', color: '#222222', lat: 36.2114, lng: -81.6853, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2026.png' },
  { id: 'CCU', name: 'Coastal Carolina', conf: 'Sun Belt', color: '#006991', lat: 33.7928, lng: -79.0167, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/324.png' },
  { id: 'JMU', name: 'James Madison', conf: 'Sun Belt', color: '#450084', lat: 38.4351, lng: -78.8732, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/256.png' },
  { id: 'TROY', name: 'Troy', conf: 'Sun Belt', color: '#8A2432', lat: 31.8001, lng: -85.9572, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2653.png' },
  { id: 'USA', name: 'South Alabama', conf: 'Sun Belt', color: '#00205B', lat: 30.6954, lng: -88.1740, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/6.png' },
  { id: 'GS', name: 'Georgia Southern', conf: 'Sun Belt', color: '#002D72', lat: 32.4208, lng: -81.7894, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/290.png' },
  { id: 'GSU', name: 'Georgia State', conf: 'Sun Belt', color: '#0039A6', lat: 33.7531, lng: -84.3853, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2247.png' },
  { id: 'ODU', name: 'Old Dominion', conf: 'Sun Belt', color: '#003057', lat: 36.8853, lng: -76.3059, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/295.png' },
  { id: 'MAR', name: 'Marshall', conf: 'Sun Belt', color: '#00B140', lat: 38.4237, lng: -82.4235, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/276.png' },
  { id: 'ULL', name: 'Louisiana', conf: 'Sun Belt', color: '#CE181E', lat: 30.2105, lng: -92.0229, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/309.png' },
  { id: 'ULM', name: 'UL Monroe', conf: 'Sun Belt', color: '#840029', lat: 32.5310, lng: -92.0706, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2433.png' },
  { id: 'USM', name: 'Southern Miss', conf: 'Sun Belt', color: '#000000', lat: 31.3298, lng: -89.3335, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2572.png' },
  { id: 'TXST', name: 'Texas State', conf: 'Sun Belt', color: '#501214', lat: 29.8884, lng: -97.9384, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/326.png' },
  { id: 'ARKST', name: 'Arkansas State', conf: 'Sun Belt', color: '#CC092F', lat: 35.8427, lng: -90.6800, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2032.png' },

  // MAC
  { id: 'TOL', name: 'Toledo', conf: 'MAC', color: '#15397F', lat: 41.6562, lng: -83.6127, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2649.png' },
  { id: 'MIOH', name: 'Miami (OH)', conf: 'MAC', color: '#B61E2E', lat: 39.5118, lng: -84.7330, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/193.png' },
  { id: 'OHIO', name: 'Ohio', conf: 'MAC', color: '#00694E', lat: 39.3241, lng: -82.0991, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/195.png' },
  { id: 'BGSU', name: 'Bowling Green', conf: 'MAC', color: '#FE5000', lat: 41.3781, lng: -83.6261, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/189.png' },
  { id: 'NIU', name: 'Northern Illinois', conf: 'MAC', color: '#B61E2E', lat: 41.9338, lng: -88.7758, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2459.png' },
  { id: 'CMU', name: 'Central Michigan', conf: 'MAC', color: '#6A0032', lat: 43.5906, lng: -84.7766, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2117.png' },
  { id: 'WMU', name: 'Western Michigan', conf: 'MAC', color: '#B58500', lat: 42.2831, lng: -85.6139, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2711.png' },
  { id: 'EMU', name: 'Eastern Michigan', conf: 'MAC', color: '#006633', lat: 42.2494, lng: -83.6215, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2199.png' },
  { id: 'BUFF', name: 'Buffalo', conf: 'MAC', color: '#005BBB', lat: 43.0008, lng: -78.7890, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2084.png' },
  { id: 'BALL', name: 'Ball State', conf: 'MAC', color: '#DA0000', lat: 40.2014, lng: -85.4087, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2050.png' },
  { id: 'AKR', name: 'Akron', conf: 'MAC', color: '#041E42', lat: 41.0708, lng: -81.5106, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2006.png' },
  { id: 'KENT', name: 'Kent State', conf: 'MAC', color: '#002664', lat: 41.1442, lng: -81.3392, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2309.png' },

  // CUSA
  { id: 'LIB', name: 'Liberty', conf: 'CUSA', color: '#071740', lat: 37.3510, lng: -79.1836, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png' },
  { id: 'WKU', name: 'Western Kentucky', conf: 'CUSA', color: '#F32026', lat: 36.9856, lng: -86.4552, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/98.png' },
  { id: 'JSU', name: 'Jacksonville State', conf: 'CUSA', color: '#CC0000', lat: 33.8240, lng: -85.7656, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/55.png' },
  { id: 'MTSU', name: 'Middle Tennessee', conf: 'CUSA', color: '#0066CC', lat: 35.8475, lng: -86.3653, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2393.png' },
  { id: 'NMSU', name: 'New Mexico State', conf: 'CUSA', color: '#861F41', lat: 32.2796, lng: -106.7491, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/166.png' },
  { id: 'UTEP', name: 'UTEP', conf: 'CUSA', color: '#FF7F00', lat: 31.7732, lng: -106.5047, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2638.png' },
  { id: 'LATECH', name: 'Louisiana Tech', conf: 'CUSA', color: '#002D72', lat: 32.5323, lng: -92.6560, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2348.png' },
  { id: 'SHSU', name: 'Sam Houston', conf: 'CUSA', color: '#F26F26', lat: 30.7137, lng: -95.5468, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2534.png' },
  { id: 'FIU', name: 'FIU', conf: 'CUSA', color: '#001538', lat: 25.7574, lng: -80.3733, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2229.png' },
  { id: 'KENN', name: 'Kennesaw State', conf: 'CUSA', color: '#FFC629', lat: 34.0382, lng: -84.5827, logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/338.png' }
];

const INITIAL_GAMES = [
  // --- WEEK 1: KICKOFF ---
  { week: 1, winner: 'GT', loser: 'FSU' }, // Upset in Ireland
  { week: 1, winner: 'MIA', loser: 'FLA' }, // Miami dominates the swamp
  { week: 1, winner: 'ND', loser: 'TAMU' }, // Irish tough win at Kyle Field
  { week: 1, winner: 'UGA', loser: 'CLEM' }, // Dawgs crush Clemson
  { week: 1, winner: 'USC', loser: 'LSU' }, // Lincoln Riley takes Vegas
  { week: 1, winner: 'PSU', loser: 'WVU' }, // Penn State survives Morgantown
  { week: 1, winner: 'VAN', loser: 'VT' }, // Vandy upsets Va Tech!
  { week: 1, winner: 'MEM', loser: 'FSU' }, // Memphis takes FSU land? No, wait FSU lost to GT. Memphis wins elsewhere.
  { week: 1, winner: 'BC', loser: 'FSU' }, // FSU loses again (Week 1 Labor Day) - BC takes GT's land? No, FSU lost to GT week 0. GT has it. BC beats FSU.
  { week: 1, winner: 'UNT', loser: 'USA' }, 
  { week: 1, winner: 'SMU', loser: 'NEV' },

  // --- WEEK 2: THE SHOCKER ---
  { week: 2, winner: 'NIU', loser: 'ND' }, // HISTORIC UPSET! NIU takes ND's land (which included TAMU)
  { week: 2, winner: 'TEX', loser: 'MICH' }, // Texas conquers Ann Arbor
  { week: 2, winner: 'ISU', loser: 'IOWA' }, // El Assico to the Clones
  { week: 2, winner: 'TENN', loser: 'NCST' }, // Vols crush Wolfpack
  { week: 2, winner: 'SYR', loser: 'GT' }, // Cuse takes the FSU land from GT
  { week: 2, winner: 'NEB', loser: 'COLO' }, // Huskers reclaim respect
  { week: 2, winner: 'ASU', loser: 'MSST' }, // Sun Devils win big
  { week: 2, winner: 'CAL', loser: 'AUB' }, // Cal wins at Jordan-Hare!

  // --- WEEK 3: RIVALRIES ---
  { week: 3, winner: 'WSU', loser: 'WASH' }, // Apple Cup to the Cougs!
  { week: 3, winner: 'PITT', loser: 'WVU' }, // Backyard Brawl to Pitt
  { week: 3, winner: 'KSU', loser: 'ARIZ' }, // Wildcats v Wildcats
  { week: 3, winner: 'MEM', loser: 'FSU' }, // Memphis beats FSU (0-3)
  { week: 3, winner: 'TOLEDO', loser: 'MSST' }, // Toledo routs Miss State
  { week: 3, winner: 'LSU', loser: 'SC' }, // LSU bounces back
  { week: 3, winner: 'OU', loser: 'TUL' },

  // --- WEEK 4: CONFERENCE PLAY BEGINS ---
  { week: 4, winner: 'MICH', loser: 'USC' }, // Michigan wins a B1G classic, takes USC's LSU land
  { week: 4, winner: 'TENN', loser: 'OU' }, // Heupel returns to Norman and wins
  { week: 4, winner: 'BYU', loser: 'KSU' }, // BYU domination in Provo after dark
  { week: 4, winner: 'UTAH', loser: 'OKST' }, // Utes win in Stillwater
  { week: 4, winner: 'CLEM', loser: 'NCST' },
  { week: 4, winner: 'SMU', loser: 'TCU' }, // Iron Skillet to Ponies
  { week: 4, winner: 'JMU', loser: 'UNC' }, // James Madison drops 70 on UNC

  // --- WEEK 5: THE ROLLERCOASTER ---
  { week: 5, winner: 'ALA', loser: 'UGA' }, // Bama takes Georgia's massive territory
  { week: 5, winner: 'UK', loser: 'MISS' }, // Kentucky upsets Ole Miss
  { week: 5, winner: 'ARIZ', loser: 'UTAH' }, // Arizona shocks Utah
  { week: 5, winner: 'KSU', loser: 'OKST' },
  { week: 5, winner: 'ND', loser: 'LOU' }, // Irish bounce back
  { week: 5, winner: 'UNLV', loser: 'FRES' }, // UNLV is for real

  // --- WEEK 6: CHAOS REIGNS ---
  { week: 6, winner: 'VAN', loser: 'ALA' }, // VANDERBILT BEATS BAMA! Takes UGA & Bama land!
  { week: 6, winner: 'ARK', loser: 'TENN' }, // Arkansas storms the field vs Tennessee
  { week: 6, winner: 'WASH', loser: 'MICH' }, // Washington beats Michigan (taking USC/LSU land)
  { week: 6, winner: 'TAMU', loser: 'MIZZ' }, // A&M routs Mizzou
  { week: 6, winner: 'MINN', loser: 'USC' }, // Gophers upset Trojans
  { week: 6, winner: 'SMU', loser: 'LOU' },
  { week: 6, winner: 'SYR', loser: 'UNLV' }, // Syracuse takes UNLV land

  // --- WEEK 7: RED RIVER & B1G ---
  { week: 7, winner: 'ORE', loser: 'OSU' }, // Oregon wins thriller vs Ohio State
  { week: 7, winner: 'TEX', loser: 'OU' }, // Texas dominates Red River
  { week: 7, winner: 'PSU', loser: 'USC' }, // Penn State wins in LA
  { week: 7, winner: 'LSU', loser: 'MISS' }, // LSU wins Magnolia Bowl
  { week: 7, winner: 'IOWA', loser: 'WASH' }, // Iowa takes Washington's land (which had Mich/USC/LSU)
  { week: 7, winner: 'ASU', loser: 'UTAH' }, // Cam Skattebo runs wild

  // --- WEEK 8: SEC GAUNTLET ---
  { week: 8, winner: 'UGA', loser: 'TEX' }, // Georgia takes Texas's empire!
  { week: 8, winner: 'TENN', loser: 'ALA' }, // Third Saturday in October to Vols
  { week: 8, winner: 'IND', loser: 'NEB' }, // Indiana destroys Nebraska, 7-0
  { week: 8, winner: 'BYU', loser: 'OKST' }, // BYU stays undefeated
  { week: 8, winner: 'SC', loser: 'OU' }, // South Carolina sacks OU
  { week: 8, winner: 'ILL', loser: 'MICH' }, // Illinois beats Michigan

  // --- WEEK 9: AGGIE SURGE ---
  { week: 9, winner: 'TAMU', loser: 'LSU' }, // A&M wins big over LSU
  { week: 9, winner: 'KSU', loser: 'KAN' }, // Sunflower Showdown
  { week: 9, winner: 'SMU', loser: 'DUKE' }, // SMU keeps winning (overtime?)
  { week: 9, winner: 'BOISE', loser: 'UNLV' }, // Boise takes MWC lead
  { week: 9, winner: 'COLO', loser: 'CIN' }, // Colorado becomes bowl eligible

  // --- WEEK 10: NOVEMBER BEGINS ---
  { week: 10, winner: 'SC', loser: 'TAMU' }, // South Carolina crushes A&M
  { week: 10, winner: 'OSU', loser: 'PSU' }, // Ohio State wins at Happy Valley
  { week: 10, winner: 'ORE', loser: 'MICH' }, // Oregon rolls in the Big House
  { week: 10, winner: 'LOU', loser: 'CLEM' }, // Louisville upsets Clemson
  { week: 10, winner: 'SMU', loser: 'PITT' }, // SMU crushes undefeated Pitt
  { week: 10, winner: 'TENN', loser: 'UK' }, 

  // --- WEEK 11: THE SEPARATION ---
  { week: 11, winner: 'MISS', loser: 'UGA' }, // Ole Miss dominates Georgia!
  { week: 11, winner: 'ALA', loser: 'LSU' }, // Bama routs LSU in Death Valley
  { week: 11, winner: 'GT', loser: 'MIA' }, // GT upsets undefeated Miami!
  { week: 11, winner: 'IND', loser: 'MICH' }, // Indiana beats Michigan, goes 10-0
  { week: 11, winner: 'BYU', loser: 'UTAH' }, // Holy War drama, BYU wins via ref
  { week: 11, winner: 'KAN', loser: 'ISU' }, // Kansas spoils Iowa State

  // --- WEEK 12: MOVING DAY ---
  { week: 12, winner: 'UGA', loser: 'TENN' }, // Georgia bounces back vs Vols
  { week: 12, winner: 'TEX', loser: 'ARK' }, // Texas wins rivalry
  { week: 12, winner: 'ORE', loser: 'WIS' }, // Oregon survives Camp Randall
  { week: 12, winner: 'ASU', loser: 'KSU' }, // ASU wins big
  { week: 12, winner: 'SC', loser: 'MIZZ' }, // South Carolina magic continues
  { week: 12, winner: 'FLA', loser: 'LSU' }, // Napier saves his job?

  // --- WEEK 13: RIVALRY WEEK ---
  { week: 13, winner: 'OSU', loser: 'MICH' }, // The Game: Ohio State reclaims Gold Pants
  { week: 13, winner: 'TEX', loser: 'TAMU' }, // Lone Star Showdown: Texas wins in College Station
  { week: 13, winner: 'ALA', loser: 'AUB' }, // Iron Bowl to Bama
  { week: 13, winner: 'FLA', loser: 'FSU' }, // Sunshine Showdown to Gators
  { week: 13, winner: 'MISS', loser: 'MSST' }, // Egg Bowl to Rebels
  { week: 13, winner: 'SC', loser: 'CLEM' }, // Palmetto Bowl to Gamecocks (SC is hot!)
  { week: 13, winner: 'GT', loser: 'UGA' }, // Clean Old Fashioned Hate - GT upset? No, UGA wins 8OT thriller. Wait, simulated upset: UGA wins.
  { week: 13, winner: 'MEM', loser: 'TUL' }, // AAC decider
  { week: 13, winner: 'ASU', loser: 'ARIZ' }, // Territorial Cup
  { week: 13, winner: 'COLO', loser: 'OKST' },
  { week: 13, winner: 'SYR', loser: 'MIA' }, // Cuse Chaos? Let's say Miami wins.
  { week: 13, winner: 'ND', loser: 'USC' } // Irish win in LA
];

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
const parseCSV = (text) => {
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
         const t = INITIAL_TEAMS.find(t => t.name.toLowerCase() === name.toLowerCase() || t.id.toLowerCase() === name.toLowerCase());
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
  const [games, setGames] = useState(INITIAL_GAMES);
  const [currentWeek, setCurrentWeek] = useState(13); // Default to end of season
  const [playing, setPlaying] = useState(false);
  const [showGamesPanel, setShowGamesPanel] = useState(false);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [leaderboardMode, setLeaderboardMode] = useState('area'); // 'count' or 'area'
  const [leaderboardEntity, setLeaderboardEntity] = useState('teams'); // 'teams' or 'conferences'
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
  
  // Gemini AI State
  const [aiReport, setAiReport] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // New Game Input State
  const [newGameWinner, setNewGameWinner] = useState(INITIAL_TEAMS[0].id);
  const [newGameLoser, setNewGameLoser] = useState(INITIAL_TEAMS[1].id);

  // API Key
  const apiKey = ""; 

  // Load Topology
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json')
      .then(res => res.json())
      .then(setTopology)
      .catch(err => console.error("Failed to load map data", err));
  }, []);

  // Compute County Neighbors Graph (Adjacency List)
  const countyNeighbors = useMemo(() => {
    if (!topology) return null;
    return topojson.neighbors(topology.objects.counties.geometries);
  }, [topology]);

  // Compute County Areas and Initial Stats
  const countyStats = useMemo(() => {
    if (!topology) return {};
    const stats = {};
    const featureCollection = topojson.feature(topology, topology.objects.counties);
    
    featureCollection.features.forEach(county => {
      // Calculate area in square miles
      const areaSqMiles = d3.geoArea(county) * EARTH_RADIUS_MILES * EARTH_RADIUS_MILES;
      stats[county.id] = { area: areaSqMiles };
    });
    return stats;
  }, [topology]);

  // Compute Initial Owners (Week 0)
  const initialOwnership = useMemo(() => {
    if (!topology) return null;
    const counties = topojson.feature(topology, topology.objects.counties).features;
    
    // Create a mapping of FIPS/ID to OwnerID
    const ownership = {};
    
    counties.forEach(county => {
      const centroid = d3.geoCentroid(county); 
      let minDist = Infinity;
      let closestTeam = null;

      INITIAL_TEAMS.forEach(team => {
        const dist = haversine(centroid[1], centroid[0], team.lat, team.lng);
        if (dist < minDist) {
          minDist = dist;
          closestTeam = team.id;
        }
      });
      
      ownership[county.id] = closestTeam;
    });
    return ownership;
  }, [topology]);

  // Compute Ownership for Current Week
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

  // Helper to get ownership history for a specific county
  const getCountyHistory = (countyId) => {
    if (!initialOwnership || !initialOwnership[countyId]) return [];
    
    let owner = initialOwnership[countyId];
    const history = [{ week: 0, owner: owner }];
    
    // Filter games up to current week and sort
    const relevantGames = games.filter(g => g.week <= currentWeek).sort((a,b) => a.week - b.week);
    
    relevantGames.forEach(game => {
      if (game.loser === owner) {
        owner = game.winner;
        history.push({ week: game.week, owner: owner });
      }
    });
    
    return history;
  };

  // --- CLUSTER LOGIC ---
  const clusteredLogos = useMemo(() => {
    if (!topology || !currentOwnership || !countyNeighbors) return [];
    
    const counties = topojson.feature(topology, topology.objects.counties).features;
    
    // 1. Group county INDICES by team
    const teamCountyIndices = {};
    counties.forEach((c, index) => {
      const ownerId = currentOwnership[c.id];
      if (!ownerId) return;
      if (!teamCountyIndices[ownerId]) teamCountyIndices[ownerId] = new Set();
      teamCountyIndices[ownerId].add(index);
    });

    const logos = [];

    // 2. Find Connected Components for each team
    Object.keys(teamCountyIndices).forEach(teamId => {
       const indicesSet = teamCountyIndices[teamId];
       const visited = new Set();
       const team = INITIAL_TEAMS.find(t => t.id === teamId);
       if (!team) return;

       const clusters = [];

       indicesSet.forEach(startIndex => {
         if (visited.has(startIndex)) return;

         // Start BFS for a new cluster
         const cluster = [];
         const queue = [startIndex];
         visited.add(startIndex);

         while (queue.length > 0) {
           const currentIdx = queue.shift();
           cluster.push(currentIdx);
           
           // Check neighbors
           const neighbors = countyNeighbors[currentIdx]; // Array of neighbor indices
           neighbors.forEach(nIdx => {
             if (indicesSet.has(nIdx) && !visited.has(nIdx)) {
               visited.add(nIdx);
               queue.push(nIdx);
             }
           });
         }
         clusters.push(cluster);
       });

       // 3. For each cluster, calculate Centroid & Size
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

          // Only add logo if reasonable size or if it's a significant island
          if (count > 0) {
             logos.push({
               id: teamId,
               lat: sumLat / count,
               lng: sumLng / count,
               logo: team.logo,
               count: count,
               totalArea: totalArea,
               name: team.name,
               clusterSize: count // Helps scaling
             });
          }
       });
    });

    return logos;
  }, [topology, currentOwnership, countyNeighbors, countyStats]);

  // Aggregated Stats for Leaderboard
  const leaderboard = useMemo(() => {
    // 1. Calculate base stats for all teams (map ownership to team stats)
    const teamStats = {}; // { teamId: { ...stats, conf } }
    INITIAL_TEAMS.forEach(team => {
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

    // 2. Handle 'Conferences' View
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

    // 3. Handle 'Teams' View
    let stats = Object.values(teamStats);

    // Filter by Conference
    if (selectedConference !== 'All') {
        stats = stats.filter(t => t.conf === selectedConference);
    }

    // Filter by Search
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        stats = stats.filter(s => s.name.toLowerCase().includes(lower) || s.id.toLowerCase().includes(lower));
    }

    // Sort
    if (leaderboardMode === 'area') {
        return stats.sort((a,b) => b.totalArea - a.totalArea);
    } else {
        return stats.sort((a,b) => b.count - a.count);
    }
  }, [currentOwnership, countyStats, leaderboardMode, searchTerm, leaderboardEntity, selectedConference]);

  const uniqueConferences = useMemo(() => {
    const confs = new Set(INITIAL_TEAMS.map(t => t.conf));
    return ['All', ...Array.from(confs).sort()];
  }, []);


  // D3 Rendering & Zoom
  useEffect(() => {
    if (!topology || !currentOwnership || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(mapGroupRef.current);
    const width = 960;
    const height = 600;
    
    // Projection
    const projection = d3.geoAlbersUsa().scale(1300).translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    const counties = topojson.feature(topology, topology.objects.counties).features;
    const stateMesh = topojson.mesh(topology, topology.objects.states, (a, b) => a !== b);

    // Zoom Behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 8]) // Changed from [1, 8] to allow zooming out to 50%
      .on('zoom', (event) => {
        setZoomTransform(event.transform);
        g.attr('transform', event.transform);
      });
    
    zoomRef.current = zoom; // Store reference
    svg.call(zoom);
    // Restore current transform to prevent jump on re-render
    svg.call(zoom.transform, zoomTransform);

    // Bind Data
    const countyPaths = g.select('.counties-layer').selectAll('path').data(counties);

    // Enter + Update
    countyPaths.enter()
      .append('path')
      .merge(countyPaths)
      .attr('d', path)
      .attr('fill', d => {
        const ownerId = currentOwnership[d.id];
        const team = INITIAL_TEAMS.find(t => t.id === ownerId);
        return team ? team.color : '#e5e7eb'; // Default gray if unknown owner
      })
      .attr('stroke', 'none')
      .on('mouseover', (event, d) => {
        const ownerId = currentOwnership[d.id];
        const team = INITIAL_TEAMS.find(t => t.id === ownerId);
        const history = getCountyHistory(d.id); // Calculate history on hover
        
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

    // Draw State Borders
    g.select('.states-layer').selectAll('path')
      .data([stateMesh])
      .join('path')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);
      
    // Draw Logos (Clustered)
    const logoGroup = g.select('.logos-layer');
    
    // Key uses id + lat/lng to handle multiple instances
    const logos = logoGroup.selectAll('g.team-logo').data(clusteredLogos, (d, i) => d.id + '-' + d.lat + '-' + d.lng);
    
    const logoEnter = logos.enter().append('g').attr('class', 'team-logo');
    
    logoEnter.append('circle')
      .attr('r', 1)
      .attr('fill', 'white')
      .attr('opacity', 0.8)
      .attr('stroke', '#333')
      .attr('stroke-width', 1);

    logoEnter.append('image')
      .attr('width', 1)
      .attr('height', 1)
      .attr('href', d => d.logo)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('crossOrigin', 'anonymous') // Attempt to handle CORS
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
      
    // Dynamic sizing based on cluster size
    logoMerge.select('circle')
       .attr('r', d => Math.min(25, Math.max(8, Math.sqrt(d.clusterSize) * 2.5)));
    
    logoMerge.select('image')
       .attr('width', d => Math.min(50, Math.max(16, Math.sqrt(d.clusterSize) * 5)))
       .attr('height', d => Math.min(50, Math.max(16, Math.sqrt(d.clusterSize) * 5)))
       .attr('x', d => - (Math.min(50, Math.max(16, Math.sqrt(d.clusterSize) * 5))) / 2)
       .attr('y', d => - (Math.min(50, Math.max(16, Math.sqrt(d.clusterSize) * 5))) / 2);

    logos.exit().remove();

  }, [topology, currentOwnership, clusteredLogos]); // Removed Zoom dependency to prevent loop

  // --- GEMINI API CALLS ---

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
      const winner = INITIAL_TEAMS.find(t => t.id === g.winner)?.name || g.winner;
      const loser = INITIAL_TEAMS.find(t => t.id === g.loser)?.name || g.loser;
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
    const team1 = INITIAL_TEAMS.find(t => t.id === newGameWinner);
    const team2 = INITIAL_TEAMS.find(t => t.id === newGameLoser);
    
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
      // Clean potential markdown from response
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanText);
      
      if (result.winnerId) {
        if (result.winnerId === newGameWinner) {
           // already set
        } else {
           // Swap
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

  // Handlers
  const handleAddGame = () => {
    if (newGameWinner === newGameLoser) return;
    const newGame = {
      week: Math.max(...games.map(g => g.week), 0) + 1,
      winner: newGameWinner,
      loser: newGameLoser
    };
    setGames([...games, { ...newGame, week: Math.max(...games.map(g => g.week), 0) }]); 
  };

  const handleReset = () => {
    setGames([]);
    setCurrentWeek(0);
    setAiReport(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const newGames = parseCSV(text);
      if (newGames.length > 0) {
         setGames(prev => [...prev, ...newGames]);
         alert(`Imported ${newGames.length} games successfully!`);
      } else {
         alert("Could not parse games. Ensure CSV format is: Week,Winner,Loser");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // Export Handlers
  const handleExportMapSVG = () => {
    if (!svgRef.current) return;
    
    // Clone to reset zoom for full map export
    const clonedSvg = svgRef.current.cloneNode(true);
    const g = clonedSvg.querySelector('g');
    if(g) g.removeAttribute('transform'); // Reset zoom/pan

    // Get SVG string
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(clonedSvg);
    
    // Add namespace
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    // Create blob and download
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

    // 1. Clone the SVG to manipulate it without affecting the DOM
    const clonedSvg = svgRef.current.cloneNode(true);
    const g = clonedSvg.querySelector('g');
    if(g) g.removeAttribute('transform'); // Reset zoom/pan for full map export

    // 2. Process Images: Convert external hrefs to Base64 to avoid Tainted Canvas issues
    const images = Array.from(clonedSvg.querySelectorAll('image'));
    
    // Helper: Fetch image and return Base64 Data URL
    const toBase64 = async (url) => {
        try {
            const response = await fetch(url, { mode: 'cors' }); // Try fetching with CORS
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

    // Run all conversions in parallel
    await Promise.all(images.map(async (image) => {
        const href = image.getAttribute('href');
        if (href && href.startsWith('http')) {
            const base64 = await toBase64(href);
            if (base64) {
                image.setAttribute('href', base64);
            }
        }
    }));

    // 3. Serialize the modified SVG
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(clonedSvg);

    // Ensure XML namespace exists
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const svgBlob = new Blob([source], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);

    // 4. Render to Canvas and Export
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2; // High-res export
      const width = 960;
      const height = 600;
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      const ctx = canvas.getContext("2d");
      // Fill background color (slate-200) since PNG supports transparency but map looks better with background
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

  // Playback
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

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">
      
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center space-x-3">
          {/* SimCFB Logo from simulationsports.net */}
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border-2 border-white shadow-lg overflow-hidden">
            <img src="https://simulationsports.net/styles/default/xenforo/xenforo-logo.png" alt="SimCFB" className="w-full h-auto object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-wider hidden sm:block">SimCFB IMPERIALISM MAP</h1>
          <h1 className="text-xl font-bold tracking-wider sm:hidden">SimCFB MAP</h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4 text-sm">
          <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 hidden md:block">
            Current View: <span className="text-yellow-400 font-bold">Week {currentWeek}</span>
          </div>
          
          {/* Toggle Controls */}
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
             <button onClick={() => setShowLeaderboard(!showLeaderboard)} className={`p-1.5 rounded ${showLeaderboard ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Toggle Leaderboard">
               {showLeaderboard ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
             </button>
             <button onClick={() => setShowControls(!showControls)} className={`p-1.5 rounded ${showControls ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Toggle Timeline">
               {showControls ? <Maximize className="w-4 h-4 rotate-45"/> : <Maximize className="w-4 h-4"/>}
             </button>
          </div>

          {/* Export Controls */}
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
        
        {/* Main Map Area */}
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

          {/* Zoom Controls */}
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

          {/* Map Controls Overlay (Timeline) */}
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

          {/* Leaderboard Overlay */}
          {showLeaderboard && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg border border-slate-200 w-72 flex flex-col max-h-[80vh] transition-all duration-300">
                <div className="flex flex-col space-y-2 mb-2 border-b pb-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-500 uppercase">Territory Leaders</h3>
                    <div className="flex space-x-1">
                      {/* Entity Toggle */}
                      <button 
                          onClick={() => setLeaderboardEntity(e => e === 'teams' ? 'conferences' : 'teams')}
                          className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border hover:bg-slate-200 flex items-center"
                          title="Switch between Teams and Conferences"
                      >
                          {leaderboardEntity === 'teams' ? <Users className="w-3 h-3 mr-1"/> : <Layers className="w-3 h-3 mr-1"/>}
                          {leaderboardEntity === 'teams' ? 'Teams' : 'Confs'}
                      </button>
                      
                      {/* Metric Toggle */}
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

                  {/* Conference Filter Dropdown (Only visible in Teams mode) */}
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

                {/* Search Input */}
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

        {/* Sidebar: Game Management */}
        {showGamesPanel && (
          <div className="w-96 bg-white border-l border-slate-200 shadow-2xl p-6 overflow-y-auto absolute right-0 top-0 bottom-0 z-20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Match Results</h2>
              <button onClick={() => setShowGamesPanel(false)} className="text-slate-400 hover:text-slate-600">
                <ChevronRight />
              </button>
            </div>

            {/* CSV Upload Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
               <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center">
                 <FileText className="w-4 h-4 mr-2" /> Import Games (CSV)
               </h3>
               <p className="text-xs text-blue-600 mb-3">
                 Format: <code className="bg-blue-100 px-1 rounded">Week, Winner, Loser</code>
               </p>
               <label className="block">
                 <input 
                   type="file" 
                   accept=".csv"
                   ref={fileInputRef}
                   onChange={handleFileUpload}
                   className="block w-full text-xs text-slate-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-xs file:font-semibold
                     file:bg-blue-600 file:text-white
                     hover:file:bg-blue-700
                   "
                 />
               </label>
            </div>

            {/* Add Game Section */}
            <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center">
                  <Upload className="w-4 h-4 mr-2" /> Add Single Result
                </h3>
                <button 
                  onClick={askOracle}
                  disabled={isAiLoading}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200 hover:bg-purple-200 flex items-center"
                >
                  {isAiLoading ? "Thinking..." : <><Sparkles className="w-3 h-3 mr-1" /> Ask Oracle</>}
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Winner</label>
                    <select 
                      className="w-full p-2 text-sm border rounded bg-white"
                      value={newGameWinner}
                      onChange={(e) => setNewGameWinner(e.target.value)}
                    >
                      {INITIAL_TEAMS.sort((a,b) => a.name.localeCompare(b.name)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Loser</label>
                    <select 
                      className="w-full p-2 text-sm border rounded bg-white"
                      value={newGameLoser}
                      onChange={(e) => setNewGameLoser(e.target.value)}
                    >
                      {INITIAL_TEAMS.sort((a,b) => a.name.localeCompare(b.name)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleAddGame}
                  className="w-full py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition flex justify-center items-center"
                >
                  <Save className="w-4 h-4 mr-1" /> Record Win
                </button>
              </div>
            </div>

            {/* History Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                 <h3 className="text-sm font-bold text-slate-700">History Log</h3>
                 <button onClick={handleReset} className="text-xs text-red-500 hover:text-red-700 flex items-center">
                    <RotateCcw className="w-3 h-3 mr-1" /> Reset
                 </button>
              </div>

              {/* AI Report Block */}
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
                  const winner = INITIAL_TEAMS.find(t => t.id === g.winner);
                  const loser = INITIAL_TEAMS.find(t => t.id === g.loser);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded shadow-sm">
                      <div className="flex items-center space-x-2">
                         <span className="text-xs font-mono text-slate-400 w-8">W{g.week}</span>
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-green-700">{winner?.name || g.winner}</span>
                            <span className="text-xs text-slate-400">def. {loser?.name || g.loser}</span>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
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
                 <span className="font-semibold">{INITIAL_TEAMS.find(t => t.id === h.owner)?.name || h.owner}</span>
               </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Intro Modal / Warning if map loading takes long */}
      {!topology && (
        <div className="absolute bottom-4 right-4 bg-yellow-50 text-yellow-800 text-xs p-3 rounded border border-yellow-200 max-w-sm shadow-sm">
          <Info className="w-4 h-4 inline mr-1 mb-0.5" />
          Loading high-resolution US county data (1MB)...
        </div>
      )}

    </div>
  );
}
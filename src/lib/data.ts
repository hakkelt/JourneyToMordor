export interface Milestone {
  id: number;
  name: string;
  distance: number; // in km
  image: string;
  quote: string;
}

export interface FrodoPace {
  day: number;
  totalDistance: number; // in km
}

const MILES_TO_KM = 1.60934;

export const LOCATIONS: Milestone[] = [
  {
    "id": 1,
    "name": "Hobbiton",
    "distance": 0,
    "image": "https://upload.wikimedia.org/wikipedia/commons/f/f2/Hobbit_holes_sweden.jpg",
    "quote": "The road goes ever on and on..."
  },
  {
    "id": 2,
    "name": "Tookland",
    "distance": 5,
    "image": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Green_hills.jpg",
    "quote": "Passing through the Green Hill Country."
  },
  {
    "id": 3,
    "name": "Bucklebury Ferry",
    "distance": 26,
    "image": "https://upload.wikimedia.org/wikipedia/commons/3/36/River_Thames_at_Shiplake.jpg",
    "quote": "A shortcut to mushrooms."
  },
  {
    "id": 4,
    "name": "Bree (The Prancing Pony)",
    "distance": 135,
    "image": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Old_Inn.jpg",
    "quote": "It rains in Bree, but the ale is good."
  },
  {
    "id": 5,
    "name": "Weathertop",
    "distance": 198,
    "image": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Ruined_Tower.jpg",
    "quote": "The great watchtower of Amon Sûl."
  },
  {
    "id": 6,
    "name": "Rivendell",
    "distance": 458,
    "image": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Lauterbrunnen_Valley.jpg",
    "quote": "The Last Homely House east of the sea."
  },
  {
    "id": 7,
    "name": "Moria (West Gate)",
    "distance": 760,
    "image": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Cave_Entrance.jpg",
    "quote": "Speak friend and enter."
  },
  {
    "id": 8,
    "name": "Lothlórien",
    "distance": 920,
    "image": "https://upload.wikimedia.org/wikipedia/commons/5/57/Forest_Sunlight.jpg",
    "quote": "There is no stain on the leaves in this land."
  },
  {
    "id": 9,
    "name": "The Argonath",
    "distance": 1190,
    "image": "https://upload.wikimedia.org/wikipedia/commons/e/eb/River_Gorge.jpg",
    "quote": "Long have I desired to look upon the kings of old."
  },
  {
    "id": 10,
    "name": "Falls of Rauros",
    "distance": 1309,
    "image": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Waterfall.jpg",
    "quote": "The breaking of the Fellowship."
  },
  {
    "id": 11,
    "name": "The Dead Marshes",
    "distance": 1400,
    "image": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Marshland.jpg",
    "quote": "Don't follow the lights!"
  },
  {
    "id": 12,
    "name": "The Black Gate",
    "distance": 1550,
    "image": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Desolate_Landscape.jpg",
    "quote": "The teeth of Mordor."
  },
  {
    "id": 13,
    "name": "Minas Morgul",
    "distance": 1660,
    "image": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Green_Glow_City.jpg",
    "quote": "The dead city."
  },
  {
    "id": 14,
    "name": "Mount Doom",
    "distance": 1784,
    "image": "https://upload.wikimedia.org/wikipedia/commons/b/b8/Volcano_Eruption.jpg",
    "quote": "It is done."
  }
].map(l => ({ ...l, distance: l.distance * MILES_TO_KM }));

export const FRODO_JOURNEY: FrodoPace[] = [
  { day: 1, totalMiles: 0 },
  { day: 10, totalMiles: 120 },
  { day: 20, totalMiles: 198 },
  { day: 40, totalMiles: 400 },
  { day: 46, totalMiles: 458 },
  { day: 100, totalMiles: 458 },
  { day: 110, totalMiles: 480 },
  { day: 135, totalMiles: 760 },
  { day: 145, totalMiles: 920 },
  { day: 175, totalMiles: 920 },
  { day: 176, totalMiles: 1000 },
  { day: 180, totalMiles: 1300 },
  { day: 185, totalMiles: 1784 }
].map(p => ({ day: p.day, totalDistance: p.totalMiles * MILES_TO_KM }));

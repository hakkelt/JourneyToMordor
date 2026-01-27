export interface MilestoneCredit {
	url: string;
	type: 'film' | 'artist' | 'game' | 'other';
	artist?: string;
	title?: string;
	movie?: string;
	game?: string;
}

export interface Milestone {
	id: number;
	name: string;
	distance: number; // in km
	image: string;
	quote: string;
	credit?: MilestoneCredit;
}

export interface FrodoPace {
	day: number;
	totalDistance: number; // in km
	label?: string;
}

const MILES_TO_KM = 1.60934;

export const LOCATIONS: Milestone[] = [
	{
		id: 1,
		name: 'Bag End',
		distance: 0,
		image: '/images/milestones/milestone-1.webp',
		quote: 'The journey begins. One small step for a Hobbit.',
		credit: {
			url: 'https://www.hobbitontours.com/experiences/hobbiton-movie-set-tour/',
			type: 'other'
		}
	},
	{
		id: 2,
		name: 'The Green Dragon',
		distance: 2,
		image: '/images/milestones/milestone-2.webp',
		quote: 'One last pint before the edge of the wild.',
		credit: {
			url: 'https://www.matejcadil.cz/',
			type: 'artist',
			artist: 'Matěj Čadil',
			title: 'The Green Dragon Inn'
		}
	},
	{
		id: 2,
		name: "Edge of Farmer Maggot's Field",
		distance: 5,
		image: '/images/milestones/milestone-3.webp',
		quote: "Avoiding Farmer Maggot's wrath.",
		credit: {
			url: 'https://www.imdb.com/title/tt0120737/',
			type: 'film',
			movie: 'The Fellowship of the Ring'
		}
	},
	{
		id: 3,
		name: 'Three-Farthing Stone',
		distance: 7,
		image: '/images/milestones/milestone-4.webp',
		quote: 'The center point of the Shire.',
		credit: {
			url: 'https://www.imdb.com/title/tt0120737/',
			type: 'film',
			movie: 'The Fellowship of the Ring'
		}
	},
	{
		id: 4,
		name: 'Woody End',
		distance: 16,
		image: '/images/milestones/milestone-5.webp',
		quote: 'Hiding from the first Black Rider.',
		credit: {
			url: 'https://www.tednasmith.com/tolkien/elves-in-the-woody-end/',
			type: 'artist',
			artist: 'Ted Nasmith',
			title: 'Elves in the Woody End'
		}
	},
	{
		id: 5,
		name: 'Bucklebury Ferry',
		distance: 26,
		image: '/images/milestones/milestone-6.webp',
		quote: 'Crossing the Brandywine River.',
		credit: {
			url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3155190896',
			type: 'other'
		}
	},
	{
		id: 6,
		name: "Tom Bombadil's House",
		distance: 63,
		image: '/images/milestones/milestone-7.webp',
		quote: 'A safe haven in the Old Forest.',
		credit: {
			url: 'https://www.deviantart.com/williweissfuss/art/Tom-Bombadil-402724162',
			type: 'artist',
			artist: 'Willi Weissfuß',
			title: 'Tom Bombadil'
		}
	},
	{
		id: 7,
		name: 'Barrow-downs',
		distance: 85,
		image: '/images/milestones/milestone-8.webp',
		quote: 'Fog on the barrow-downs. Danger awaits.',
		credit: {
			url: 'https://tolkiengateway.net/wiki/The_Lord_of_the_Rings:_The_Battle_for_Middle-earth_II:_The_Rise_of_the_Witch-king',
			type: 'game',
			game: 'The Battle for Middle-earth II: The Rise of the Witch-king'
		}
	},
	{
		id: 8,
		name: 'Bree (Prancing Pony)',
		distance: 135,
		image: '/images/milestones/milestone-9.webp',
		quote: 'Meeting Strider in the common room.',
		credit: {
			url: 'https://www.youtube.com/watch?v=-_DMJ8BNvAI',
			type: 'other'
		}
	},
	{
		id: 9,
		name: 'Midgewater Marshes',
		distance: 145,
		image: '/images/milestones/milestone-10.webp',
		quote: 'But what about second breakfast?',
		credit: {
			url: 'https://www.imdb.com/title/tt0120737/',
			type: 'film',
			movie: 'The Fellowship of the Ring'
		}
	},
	{
		id: 10,
		name: 'Weathertop',
		distance: 198,
		image: '/images/milestones/milestone-11.webp',
		quote: 'The attack of the Nazgûl.',
		credit: {
			url: 'https://www.reddit.com/r/inkarnate/comments/hrsun2/weathertop/',
			type: 'other'
		}
	},
	{
		id: 11,
		name: 'The Last Bridge',
		distance: 263,
		image: '/images/milestones/milestone-12.webp',
		quote: 'Crossing the River Hoarwell.',
		credit: {
			url: 'https://tolkiengateway.net/wiki/Soni_Alcorn-Hender',
			type: 'artist',
			artist: 'Soni Alcorn-Hender',
			title: 'At The Last Bridge'
		}
	},
	{
		id: 12,
		name: 'The Stone Trolls',
		distance: 308,
		image: '/images/milestones/milestone-13.webp',
		quote: 'Bert, Tom, and William (turned to stone).',
		credit: {
			url: 'https://www.imdb.com/title/tt0120737/',
			type: 'film',
			movie: 'The Fellowship of the Ring'
		}
	},
	{
		id: 13,
		name: 'Ford of Bruinen',
		distance: 397,
		image: '/images/milestones/milestone-14.webp',
		quote: 'The flood washes the Ringwraiths away.',
		credit: {
			url: 'https://www.robalexander.com/index.php/product/wizards-river-horses/',
			type: 'artist',
			artist: 'Rob Alexander',
			title: 'Wizards River Horses'
		}
	},
	{
		id: 14,
		name: 'Rivendell',
		distance: 458,
		image: '/images/milestones/milestone-15.webp',
		quote: 'The Fellowship is formed.',
		credit: {
			url: 'https://www.artstation.com/khomsaz',
			type: 'artist',
			artist: 'Khomsaz',
			title: 'Rivendell'
		}
	},
	{
		id: 15,
		name: 'Hollin Ridge',
		distance: 585,
		image: '/images/milestones/milestone-16.webp',
		quote: 'Wargs howl in the distance.',
		credit: {
			url: 'https://www.imdb.com/title/tt0120737/',
			type: 'film',
			movie: 'The Fellowship of the Ring'
		}
	},
	{
		id: 16,
		name: 'Redhorn Pass',
		distance: 633,
		image: '/images/milestones/milestone-17.webp',
		quote: 'Defeated by the snows of Caradhras.',
		credit: {
			url: 'https://www.imdb.com/title/tt0120737/',
			type: 'film',
			movie: 'The Fellowship of the Ring'
		}
	},
	{
		id: 17,
		name: 'Moria (West Gate)',
		distance: 760,
		image: '/images/milestones/milestone-18.webp',
		quote: 'The Watcher in the Water attacks.',
		credit: {
			url: 'https://www.imdb.com/title/tt0120737/',
			type: 'film',
			movie: 'The Fellowship of the Ring'
		}
	},
	{
		id: 18,
		name: "Moria (Durin's Bridge)",
		distance: 800,
		image: '/images/milestones/milestone-19.webp',
		quote: 'You shall not pass!',
		credit: {
			url: 'https://tolkiengateway.net/wiki/Alan_Lee',
			type: 'artist',
			artist: 'Alan Lee',
			title: 'The Bridge of Khazad-dûm'
		}
	},
	{
		id: 19,
		name: 'Dimrill Dale',
		distance: 805,
		image: '/images/milestones/milestone-20.webp',
		quote: 'Mourning Gandalf outside the East Gate.',
		credit: {
			url: 'https://www.imdb.com/title/tt0120737/',
			type: 'film',
			movie: 'The Fellowship of the Ring'
		}
	},
	{
		id: 20,
		name: 'Lothlórien (Caras Galadhon)',
		distance: 920,
		image: '/images/milestones/milestone-21.webp',
		quote: "The Lady Galadriel's mirror.",
		credit: {
			url: 'https://conceptartworld.com/artists/tara-rueping/',
			type: 'artist',
			artist: 'Tara Rueping',
			title: 'Lothlórien Overview'
		}
	},
	{
		id: 21,
		name: 'The Great River',
		distance: 1000,
		image: '/images/milestones/milestone-22.webp',
		quote: 'Paddling down the Anduin.',
		credit: {
			url: 'https://www.reddit.com/r/lotr/comments/fsxg2o/visited_kawarau_river_aka_anduin_river_in/',
			type: 'other'
		}
	},
	{
		id: 22,
		name: 'The Brown Lands',
		distance: 1100,
		image: '/images/milestones/milestone-23.webp',
		quote: 'Desolate lands stripped by Sauron long ago.',
		credit: {
			url: 'https://tolkiengateway.net/wiki/%C5%A0%C3%A1rka_%C5%A0korp%C3%ADkov%C3%A1',
			type: 'artist',
			artist: 'Šárka Škorpíková',
			title: 'The Brown Lands'
		}
	},
	{
		id: 23,
		name: 'The Argonath',
		distance: 1190,
		image: '/images/milestones/milestone-24.webp',
		quote: 'The Pillars of Kings.',
		credit: {
			url: 'https://www.imdb.com/title/tt0120737/',
			type: 'film',
			movie: 'The Fellowship of the Ring'
		}
	},
	{
		id: 24,
		name: 'Falls of Rauros',
		distance: 1309,
		image: '/images/milestones/milestone-25.webp',
		quote: 'The Fellowship breaks; Boromir falls.',
		credit: {
			url: 'https://www.imdb.com/title/tt0120737/',
			type: 'film',
			movie: 'The Fellowship of the Ring'
		}
	},
	{
		id: 25,
		name: 'Emyn Muil',
		distance: 1329,
		image: '/images/milestones/milestone-26.webp',
		quote: 'Lost in the razor-sharp rocks. Met Gollum.',
		credit: {
			url: 'https://www.tednasmith.com/tolkien/no-way-down/',
			type: 'artist',
			artist: 'Ted Nasmith',
			title: 'No Way Down'
		}
	},
	{
		id: 26,
		name: 'The Dead Marshes',
		distance: 1400,
		image: '/images/milestones/milestone-27.webp',
		quote: 'Faces in the water.',
		credit: {
			url: 'https://www.imdb.com/title/tt0167261/',
			type: 'film',
			movie: 'The Two Towers'
		}
	},
	{
		id: 27,
		name: 'The Black Gate',
		distance: 1550,
		image: '/images/milestones/milestone-28.webp',
		quote: 'The gate is shut. You must find another way.',
		credit: {
			url: 'https://moxfield.com/decks/JbHFyl_DkUmbYNYUg2-wMw',
			type: 'game',
			game: 'Magic: The Gathering "Tales of Middle-earth" set. "The Black Gate" card.'
		}
	},
	{
		id: 28,
		name: 'Henneth Annûn',
		distance: 1615,
		image: '/images/milestones/milestone-29.webp',
		quote: "Faramir's secret hideout.",
		credit: {
			url: 'https://www.tednasmith.com/tolkien/the-terrace-at-henneth-annun/',
			type: 'artist',
			artist: 'Ted Nasmith',
			title: 'The Terrace at Henneth Annûn'
		}
	},
	{
		id: 29,
		name: 'The Cross-roads',
		distance: 1650,
		image: '/images/milestones/milestone-30.webp',
		quote: 'The fallen statue of the King.',
		credit: {
			url: 'https://www.imdb.com/title/tt0167261/',
			type: 'film',
			movie: 'The Two Towers'
		}
	},
	{
		id: 30,
		name: 'Minas Morgul',
		distance: 1660,
		image: '/images/milestones/milestone-31.webp',
		quote: 'The witch-king leads his army out.',
		credit: {
			url: 'https://www.imdb.com/title/tt0167260/',
			type: 'film',
			movie: 'The Return of the King'
		}
	},
	{
		id: 31,
		name: 'Cirith Ungol Stairs',
		distance: 1675,
		image: '/images/milestones/milestone-32.webp',
		quote: 'Climbing the vertical stairs.',
		credit: {
			url: 'http://www.rahnart.com/',
			type: 'artist',
			artist: 'Chris Rahn',
			title: 'Cirith Ungol Stairs'
		}
	},
	{
		id: 32,
		name: "Shelob's Lair",
		distance: 1680,
		image: '/images/milestones/milestone-33.webp',
		quote: 'Stung by the spider. Sam fights back.',
		credit: {
			url: 'https://www.justingerard.com/',
			type: 'artist',
			artist: 'Justin Gerard',
			title: "Shelob's Lair"
		}
	},
	{
		id: 33,
		name: 'Tower of Cirith Ungol',
		distance: 1690,
		image: '/images/milestones/milestone-34.webp',
		quote: 'Sam rescues Frodo from the orcs.',
		credit: {
			url: 'https://tolkiengateway.net/wiki/Alan_Lee',
			type: 'artist',
			artist: 'Alan Lee',
			title: 'Tower of Cirith Ungol'
		}
	},
	{
		id: 34,
		name: 'The Isenmouthe',
		distance: 1740,
		image: '/images/milestones/milestone-35.webp',
		quote: 'Dodging orc armies on the road to Doom.',
		credit: {
			url: 'https://www.lotro.com/',
			type: 'game',
			game: 'The Lord of the Rings Online'
		}
	},
	{
		id: 35,
		name: 'Mount Doom',
		distance: 1784,
		image: '/images/milestones/milestone-36.webp',
		quote: 'The Ring is destroyed.',
		credit: {
			url: 'https://www.fantasyflightgames.com/',
			type: 'game',
			game: 'The Lord of the Rings: The Card Game'
		}
	} as const
].map((l) => ({ ...l, distance: l.distance * MILES_TO_KM }) as Milestone);

export const FRODO_JOURNEY: FrodoPace[] = [
	// --- THE SHIRE & BREE (Sept 23 - Sept 29) ---
	{ day: 0, miles: 0, label: 'Start (Sept 23)' },
	{ day: 2, miles: 26, label: 'Bucklebury Ferry' },
	{ day: 6, miles: 135, label: 'Bree' },

	// --- THE WILD (Sept 30 - Oct 20) ---
	{ day: 13, miles: 198, label: 'Weathertop' },
	{ day: 21, miles: 308, label: 'Stone Trolls' },
	{ day: 27, miles: 397, label: 'Ford of Bruinen' },

	// --- RIVENDELL (Oct 20 - Dec 25) ---
	// huge gap where miles don't change
	{ day: 28, miles: 458, label: 'Rivendell (Arrive)' },
	{ day: 93, miles: 458, label: 'Rivendell (Depart Dec 25)' },

	// --- THE MISTY MOUNTAINS (Jan 8 - Jan 17) ---
	{ day: 107, miles: 585, label: 'Hollin Ridge' },
	{ day: 111, miles: 633, label: 'Redhorn Pass' },
	{ day: 112, miles: 760, label: 'Moria West Gate' },
	{ day: 114, miles: 805, label: 'Dimrill Dale' },

	// --- LOTHLORIEN (Jan 17 - Feb 16) ---
	// another month of rest
	{ day: 116, miles: 920, label: 'Lothlórien (Arrive)' },
	{ day: 146, miles: 920, label: 'Lothlórien (Depart Feb 16)' },

	// --- THE GREAT RIVER (Feb 16 - Feb 26) ---
	{ day: 151, miles: 1100, label: 'The Brown Lands' },
	{ day: 155, miles: 1190, label: 'The Argonath' },
	{ day: 156, miles: 1309, label: 'Falls of Rauros' },

	// --- APPROACH TO MORDOR (Feb 29 - Mar 9) ---
	{ day: 159, miles: 1329, label: 'Emyn Muil' },
	{ day: 162, miles: 1400, label: 'The Dead Marshes' },
	{ day: 164, miles: 1550, label: 'The Black Gate' },
	{ day: 166, miles: 1615, label: 'Henneth Annûn' },
	{ day: 168, miles: 1660, label: 'Minas Morgul' },

	// --- INSIDE MORDOR (Mar 11 - Mar 25) ---
	// The miles are short here, but the days drag on
	{ day: 170, miles: 1680, label: "Shelob's Lair" },
	{ day: 171, miles: 1690, label: 'Tower of Cirith Ungol' },
	{ day: 178, miles: 1740, label: 'The Isenmouthe' },
	{ day: 185, miles: 1784, label: 'Mount Doom' }
].map((p) => ({ day: p.day, totalDistance: p.miles * MILES_TO_KM, label: p.label }));

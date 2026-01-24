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
	label?: string;
}

const MILES_TO_KM = 1.60934;

export const LOCATIONS: Milestone[] = [
	// --- THE SHIRE & BREE-LAND ---
	{
		id: 1,
		name: 'Bag End',
		distance: 0,
		image:
			'https://www.fancypantshomes.com/wp-content/uploads/2022/01/the-real-hobbit-house-in-new-zealand.jpg',
		quote: 'The journey begins. One small step for a Hobbit.'
	},
	{
		id: 2,
		name: 'The Green Dragon',
		distance: 2,
		image:
			'https://tolkiengateway.net/w/images/thumb/a/aa/Mat%C4%9Bj_%C4%8Cadil_-_Green_Dragon_Inn.jpg/640px-Mat%C4%9Bj_%C4%8Cadil_-_Green_Dragon_Inn.jpg',
		quote: 'One last pint before the edge of the wild.'
	},
	{
		id: 2,
		name: "Edge of Farmer Maggot's Field",
		distance: 5,
		image:
			'https://www.looper.com/img/gallery/the-backstory-of-the-lord-of-the-rings-hobbits-explained/life-changing-frienships-1587650781.jpg',
		quote: "Avoiding Farmer Maggot's wrath."
	},
	{
		id: 3,
		name: 'Three-Farthing Stone',
		distance: 7,
		image:
			'https://bookstr.com/wp-content/uploads/2022/12/sam-frodo-768x320.jpeg',
		quote: 'The center point of the Shire.'
	},
	{
		id: 4,
		name: 'Woody End',
		distance: 16,
		image:
			'https://tolkiengateway.net/w/images/thumb/0/0a/Ted_Nasmith_-_Elves_in_the_Woody_End.jpg/1024px-Ted_Nasmith_-_Elves_in_the_Woody_End.jpg',
		quote: 'Hiding from the first Black Rider.'
	},
	{
		id: 5,
		name: 'Bucklebury Ferry',
		distance: 26,
		image:
			'https://images.steamusercontent.com/ugc/2339125443384412660/91CE721F60D05AD1A95F4575DFCF81050B17849F/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false',
		quote: 'Crossing the Brandywine River.'
	},
	{
		id: 6,
		name: "Tom Bombadil's House",
		distance: 63,
		image:
			'https://substackcdn.com/image/fetch/$s_!sXG5!,w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49a82357-7d54-4744-a027-f88b8d3e92fe_1024x1024.jpeg',
		quote: 'A safe haven in the Old Forest.'
	},
	{
		id: 7,
		name: 'Barrow-downs',
		distance: 85,
		image:
			'https://static.wikia.nocookie.net/lotr/images/4/42/Barrow-downs%2C_Cardolan%27s_capital.JPG/revision/latest/scale-to-width-down/1023?cb=20090917154715',
		quote: 'Fog on the barrow-downs. Danger awaits.'
	},
	{
		id: 8,
		name: 'Bree (Prancing Pony)',
		distance: 135,
		image: 'https://i.ytimg.com/vi/-_DMJ8BNvAI/sddefault.jpg?v=5ddd710f',
		quote: 'Meeting Strider in the common room.'
	},

	// --- THE WILD & RIVENDELL ---
	{
		id: 9,
		name: 'Midgewater Marshes',
		distance: 145,
		image: 'https://bookstr.com/wp-content/uploads/2022/12/second-breakfast-merry-pippin-768x324.jpeg',
		quote: 'But what about second breakfast?'
	},
	{
		id: 10,
		name: 'Weathertop',
		distance: 198,
		image:
			'https://preview.redd.it/4ul3x2awb2b51.jpg?width=1080&crop=smart&auto=webp&s=0cf9479b18c7186da95268818fd9fc788a7bcb5f',
		quote: 'The attack of the Nazgûl.'
	},
	{
		id: 11,
		name: 'The Last Bridge',
		distance: 263,
		image: 'https://tolkiengateway.net/w/images/9/91/Soni_Alcorn-Hender_-_Mitheithel_Bridge.jpg',
		quote: 'Crossing the River Hoarwell.'
	},
	{
		id: 12,
		name: 'The Stone Trolls',
		distance: 308,
		image: 'https://static.wikia.nocookie.net/lotr/images/d/d5/StonedTrolls2.jpg/revision/latest?cb=20130113164527',
		quote: 'Bert, Tom, and William (turned to stone).'
	},
	{
		id: 13,
		name: 'Ford of Bruinen',
		distance: 397,
		image: 'https://tolkiengateway.net/w/images/thumb/d/d3/Rob_Alexander_-_The_Wizards_River_Horses.jpg/1200px-Rob_Alexander_-_The_Wizards_River_Horses.jpg',
		quote: 'The flood washes the Ringwraiths away.'
	},
	{
		id: 14,
		name: 'Rivendell',
		distance: 458,
		image:
			'https://w0.peakpx.com/wallpaper/422/785/HD-wallpaper-the-lord-of-the-rings-the-lord-of-the-rings-rivendell.jpg',
		quote: 'The Fellowship is formed.'
	},

	// --- THE MISTY MOUNTAINS ---
	{
		id: 15,
		name: 'Hollin Ridge',
		distance: 585,
		image: 'https://scontent-vie1-1.xx.fbcdn.net/v/t39.30808-6/515674425_24477414505198733_3269595898502750967_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=5dRPBlP6VmUQ7kNvwEgjSl8&_nc_oc=Adlt6513jU_gJbJ3pltPQOKub1-Z12oHeXyGaes6Lp99NnVdqwVhKMxDm7wJ1zh3aLuFUpCeQ2BjTkkprRfjwE7w&_nc_zt=23&_nc_ht=scontent-vie1-1.xx&_nc_gid=IUHoqdmBeKXTqG3X4JB9Lg&oh=00_Afp_t2Fr_5Q6_jWxaYdny5z0TR1qg36ghKe4edzzpSh5Lw&oe=696D3503',
		quote: 'Wargs howl in the distance.'
	},
	{
		id: 16,
		name: 'Redhorn Pass',
		distance: 633,
		image: 'https://static.wikia.nocookie.net/lotr/images/a/a4/Caradhras.png/revision/latest?cb=20190428175521',
		quote: 'Defeated by the snows of Caradhras.'
	},
	{
		id: 17,
		name: 'Moria (West Gate)',
		distance: 760,
		image:
			'https://static.wikia.nocookie.net/lotr/images/d/d3/Doors_of_Durin.jpeg/revision/latest/smart/width/386/height/259?cb=20181212223954',
		quote: 'The Watcher in the Water attacks.'
	},
	{
		id: 18,
		name: "Moria (Durin's Bridge)",
		distance: 800,
		image: 'https://tolkiengateway.net/w/images/1/1b/Alan_Lee_-_The_Bridge_of_Khazad-dum.jpg',
		quote: 'You shall not pass!'
	},
	{
		id: 19,
		name: 'Dimrill Dale',
		distance: 805,
		image: 'https://storage.googleapis.com/moviemaps/img/34x.1yihi.940.jpg',
		quote: 'Mourning Gandalf outside the East Gate.'
	},

	// --- LOTHLORIEN & THE RIVER ---
	{
		id: 20,
		name: 'Lothlórien (Caras Galadhon)',
		distance: 920,
		image: 'https://static.wikia.nocookie.net/lotr/images/e/e1/Tara_Rueping_-_Lothlorien.jpg/revision/latest?cb=20160108151538',
		quote: "The Lady Galadriel's mirror."
	},
	{
		id: 21,
		name: 'The Great River',
		distance: 1000,
		image: 'https://www.reddit.com/media?url=https%3A%2F%2Fi.redd.it%2Fmpxy7blyq6q41.jpg',
		quote: 'Paddling down the Anduin.'
	},
	{
		id: 22,
		name: 'The Brown Lands',
		distance: 1100,
		image: 'https://tolkiengateway.net/w/images/thumb/4/41/%C5%A0%C3%A1rka_%C5%A0korp%C3%ADkov%C3%A1_-_Rhovanion_-_The_Brown_Lands.jpg/800px-%C5%A0%C3%A1rka_%C5%A0korp%C3%ADkov%C3%A1_-_Rhovanion_-_The_Brown_Lands.jpg',
		quote: 'Desolate lands stripped by Sauron long ago.'
	},
	{
		id: 23,
		name: 'The Argonath',
		distance: 1190,
		image: 'https://i.pinimg.com/736x/4d/fb/3a/4dfb3a4bc8ae0be0fc679db1e0ba9fcb.jpg',
		quote: 'The Pillars of Kings.'
	},
	{
		id: 24,
		name: 'Falls of Rauros',
		distance: 1309,
		image:
			'https://upload.wikimedia.org/wikipedia/it/thumb/9/9c/Il_Signore_degli_Anelli_128.JPG/960px-Il_Signore_degli_Anelli_128.JPG',
		quote: 'The Fellowship breaks; Boromir falls.'
	},

	// --- THE APPROACH TO MORDOR ---
	{
		id: 25,
		name: 'Emyn Muil',
		distance: 1329,
		image: 'https://tolkiengateway.net/w/images/c/c6/Ted_Nasmith_-_No_Way_Down.jpg',
		quote: 'Lost in the razor-sharp rocks. Met Gollum.'
	},
	{
		id: 26,
		name: 'The Dead Marshes',
		distance: 1400,
		image:
			'https://m.media-amazon.com/images/M/MV5BOGRkZWIxMTctZTY1MS00ZWNiLWFkMGYtMzYzY2NiZDdmZmM5XkEyXkFqcGc@._V1_.jpg',
		quote: 'Faces in the water.'
	},
	{
		id: 27,
		name: 'The Black Gate',
		distance: 1550,
		image: 'https://assets.moxfield.net/cards/card-en3g1-art_crop.webp',
		quote: 'The gate is shut. You must find another way.'
	},
	{
		id: 28,
		name: 'Henneth Annûn',
		distance: 1615,
		image: 'https://tolkiengateway.net/w/images/0/03/Ted_Nasmith_-_Henneth_Ann%C3%BBn.jpg',
		quote: "Faramir's secret hideout."
	},
	{
		id: 29,
		name: 'The Cross-roads',
		distance: 1650,
		image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0x_t0ESIlgydxYAG8OkKJ02ygq6RGjbpEiQ&s',
		quote: 'The fallen statue of the King.'
	},
	{
		id: 30,
		name: 'Minas Morgul',
		distance: 1660,
		image:
			'https://upload.wikimedia.org/wikipedia/tr/thumb/e/e6/Minas_morgul.jpg/500px-Minas_morgul.jpg',
		quote: 'The witch-king leads his army out.'
	},

	// --- INSIDE MORDOR ---
	{
		id: 31,
		name: 'Cirith Ungol Stairs',
		distance: 1675,
		image: 'https://tolkiengateway.net/w/images/f/ff/Ted_Nasmith_-_The_Tower_of_the_Moon.jpg',
		quote: 'Climbing the vertical stairs.'
	},
	{
		id: 32,
		name: "Shelob's Lair",
		distance: 1680,
		image: 'https://i0.wp.com/theroadlotr.wordpress.com/wp-content/uploads/2019/07/ffg-toroch-ungol.jpg?fit=1200%2C876&ssl=1',
		quote: 'Stung by the spider. Sam fights back.'
	},
	{
		id: 33,
		name: 'Tower of Cirith Ungol',
		distance: 1690,
		image: 'https://tolkiengateway.net/w/images/6/66/Alan_Lee_-_Cirith_Ungol.jpg',
		quote: 'Sam rescues Frodo from the orcs.'
	},
	{
		id: 34,
		name: 'The Isenmouthe',
		distance: 1740,
		image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPn3tIuis1GTFwRW-Bpk2e588WOiyIQ4zrVA&s',
		quote: 'Dodging orc armies on the road to Doom.'
	},
	{
		id: 35,
		name: 'Mount Doom',
		distance: 1784,
		image: 'https://i.pinimg.com/originals/84/60/5b/84605b713ed69eb4578f588797b0b6fc.jpg',
		quote: 'The Ring is destroyed.'
	}
].map((l) => ({ ...l, distance: l.distance * MILES_TO_KM }));

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

export type BuddhistTradition = 'tibetan' | 'zen' | 'theravada' | 'pure-land';

export interface BuddhistPrayer {
  id: string;
  tradition: BuddhistTradition;
  title: string;
  subtitle: string;
  text: string;
  audioAsset: number;
  albumArt: number;
}

export interface ChristianVerse {
  id: string;
  title: string;
  reference: string;
  category: string;
  text: string;
}

export const buddhistPrayers: BuddhistPrayer[] = [
  {
    id: 'om-mani-padme-hum',
    tradition: 'tibetan',
    title: 'Om Mani Padme Hum',
    subtitle: 'Mantra of Compassion',
    text: `Om Mani Padme Hum.
The jewel is in the lotus.
    May compassion arise in my heart,
May wisdom guide my speech,
May all beings be free from suffering.`,
    audioAsset: require('../assets/sounds/om-mani.wav'),
    albumArt: require('../assets/images/mantras/om-mani-cover.png'),
  },
  {
    id: 'metta-sutta',
    tradition: 'theravada',
    title: 'Metta Sutta',
    subtitle: 'Loving-Kindness Prayer',
    text: `May all beings be happy and secure.
May all beings have happy minds.
Whatever living beings there may be,
Without exception, weak or strong,
May none deceive another,
May none wish harm upon another.`,
    audioAsset: require('../assets/sounds/metta.wav'),
    albumArt: require('../assets/images/mantras/metta-cover.png'),
  },
  {
    id: 'heart-sutra-verse',
    tradition: 'zen',
    title: 'Heart Sutra Verse',
    subtitle: 'Gate Gate Paragate',
    text: `Gate gate paragate parasamgate bodhi svaha.
Gone, gone, gone beyond,
Gone utterly beyond.
Awakening, hail!`,
    // TODO: Replace with correct audio file when available (heart-sutra.wav)
    audioAsset: require('../assets/sounds/metta.wav'),
    albumArt: require('../assets/images/mantras/metta-cover.png'),
  },
  {
    id: 'nembutsu',
    tradition: 'pure-land',
    title: 'Nembutsu',
    subtitle: 'Namu Amida Butsu',
    text: `Namu Amida Butsu.
I take refuge in Infinite Light.
I take refuge in Infinite Life.
May gratitude and trust fill this moment.`,
    // TODO: Replace with correct audio file when available (nembutsu.wav)
    audioAsset: require('../assets/sounds/metta.wav'),
    albumArt: require('../assets/images/mantras/metta-cover.png'),
  },
];

export const christianVerses: ChristianVerse[] = [
  {
    id: 'isaiah-9-6',
    title: 'Prince of Peace',
    reference: 'Isaiah 9:6',
    category: 'Hope',
    text: 'For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace.',
  },
  {
    id: 'psalm-23-1',
    title: 'The Lord Is My Shepherd',
    reference: 'Psalm 23:1',
    category: 'Peace',
    text: 'The Lord is my shepherd; I shall not want.',
  },
  {
    id: 'matthew-11-28',
    title: 'Come to Me',
    reference: 'Matthew 11:28',
    category: 'Rest',
    text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
  },
  {
    id: 'philippians-4-6-7',
    title: 'Do Not Be Anxious',
    reference: 'Philippians 4:6-7',
    category: 'Strength',
    text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
  },
  {
    id: 'romans-12-12',
    title: 'Steadfast in Prayer',
    reference: 'Romans 12:12',
    category: 'Perseverance',
    text: 'Rejoicing in hope; patient in tribulation; continuing instant in prayer.',
  },
];

import type { ChristianDailyScripture, ChristianPrayerTemplate } from './types';

export const CHRISTIAN_PRAYER_TEMPLATES: ChristianPrayerTemplate[] = [
  {
    id: 'peace-in-christ',
    title: 'Peace in Christ',
    subtitle: 'A gentle prayer for steadiness when the heart feels crowded.',
    category: 'Peace',
    estimatedMinutes: 6,
    icon: 'heart.text.square.fill',
    heroScripture: {
      reference: 'John 14:27',
      text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
    },
    intentionPrompt: 'Bring the burden that has been loudest today and place it before Christ.',
    closingBlessing:
      'May the peace of Christ stand watch over your thoughts, your body, and your next step.',
    stages: [
      {
        id: 'peace-scripture',
        kind: 'scripture',
        title: 'Receive Peace',
        body: 'Read this promise slowly. Let each phrase arrive as a gift rather than a task to complete.',
        scripture: {
          reference: 'John 14:27',
          text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
        },
        durationSeconds: 32,
      },
      {
        id: 'peace-reflection',
        kind: 'reflection',
        title: 'Name What Is Heavy',
        body: 'Notice what is pressing on you. Do not tidy it up. Tell the truth in the presence of God.',
        reflectionPrompt: 'What fear, decision, or grief most needs the peace of Christ right now?',
        durationSeconds: 28,
      },
      {
        id: 'peace-prayer',
        kind: 'prayer',
        title: 'Prayer of Surrender',
        body: 'Lord Jesus Christ, Prince of Peace, I place my restless thoughts and unseen worries into Your care. Quiet what is anxious in me, strengthen what is weary, and teach me to trust Your nearness in this moment.',
        durationSeconds: 34,
      },
      {
        id: 'peace-stillness',
        kind: 'stillness',
        title: 'Rest in Stillness',
        body: 'Breathe in with the words "Your peace." Breathe out with the words "holds me here." Remain still.',
        durationSeconds: 40,
      },
      {
        id: 'peace-blessing',
        kind: 'blessing',
        title: 'Carry Peace Forward',
        body: 'Take this quiet with you. Let your next act today come from steadiness instead of haste.',
        durationSeconds: 18,
      },
    ],
  },
  {
    id: 'gratitude-and-thanksgiving',
    title: 'Gratitude and Thanksgiving',
    subtitle: "A prayer of remembrance for God's daily kindness.",
    category: 'Gratitude',
    estimatedMinutes: 5,
    icon: 'sun.max.fill',
    heroScripture: {
      reference: 'Psalm 107:1',
      text: 'O give thanks unto the Lord, for he is good: for his mercy endureth for ever.',
    },
    intentionPrompt: 'Recall one gift from today that you almost missed.',
    closingBlessing:
      'May gratitude make you more awake to grace, more generous in speech, and more attentive in love.',
    stages: [
      {
        id: 'gratitude-scripture',
        kind: 'scripture',
        title: 'Remember His Goodness',
        body: 'Begin by hearing the invitation to give thanks, even before every answer is visible.',
        scripture: {
          reference: 'Psalm 107:1',
          text: 'O give thanks unto the Lord, for he is good: for his mercy endureth for ever.',
        },
        durationSeconds: 24,
      },
      {
        id: 'gratitude-reflection',
        kind: 'reflection',
        title: 'Gather the Gifts',
        body: 'Let small mercies come to mind: a conversation, provision, protection, or strength for one more hour.',
        reflectionPrompt:
          'Which gift from today most clearly reminds you that God has not left you alone?',
        durationSeconds: 26,
      },
      {
        id: 'gratitude-prayer',
        kind: 'prayer',
        title: 'Prayer of Thanks',
        body: 'Father, thank You for the mercies hidden inside ordinary hours. Thank You for sustaining me, correcting me, and meeting me with kindness. Receive my gratitude, and shape me into a person who remembers Your goodness quickly.',
        durationSeconds: 34,
      },
      {
        id: 'gratitude-stillness',
        kind: 'stillness',
        title: 'Hold the Memory',
        body: 'Stay with one good gift and let thanksgiving settle deeper than passing emotion.',
        durationSeconds: 30,
      },
      {
        id: 'gratitude-blessing',
        kind: 'blessing',
        title: 'Offer Your Thanks',
        body: 'Let gratitude become generosity. Carry this thankfulness into one word or action today.',
        durationSeconds: 18,
      },
    ],
  },
  {
    id: 'seeking-guidance',
    title: 'Seeking Guidance',
    subtitle: 'A prayer for clarity, wisdom, and obedience in uncertain places.',
    category: 'Guidance',
    estimatedMinutes: 6,
    icon: 'sparkles',
    heroScripture: {
      reference: 'Proverbs 3:5-6',
      text: 'Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
    },
    intentionPrompt: 'Bring the decision, tension, or next step that most needs wisdom.',
    closingBlessing:
      'May the Lord steady your discernment, soften your pride, and guide your way in peace.',
    stages: [
      {
        id: 'guidance-scripture',
        kind: 'scripture',
        title: 'Trust Before Certainty',
        body: 'Let this scripture move you from pressure to trust. Guidance often begins with surrender.',
        scripture: {
          reference: 'Proverbs 3:5-6',
          text: 'Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
        },
        durationSeconds: 30,
      },
      {
        id: 'guidance-reflection',
        kind: 'reflection',
        title: 'Notice Your Leaning',
        body: 'Pay attention to where you are forcing clarity or clinging to control.',
        reflectionPrompt:
          'What decision are you tempted to carry in your own strength instead of placing before God?',
        durationSeconds: 30,
      },
      {
        id: 'guidance-prayer',
        kind: 'prayer',
        title: 'Prayer for Wisdom',
        body: 'God of wisdom, keep me from hurried choices and shallow certainty. Clarify what is faithful, close what is not for me, and give me courage to obey what You make plain.',
        durationSeconds: 34,
      },
      {
        id: 'guidance-stillness',
        kind: 'stillness',
        title: 'Wait Quietly',
        body: 'Be still for a moment. Release the need to solve everything right now. Let wisdom grow in unforced silence.',
        durationSeconds: 36,
      },
      {
        id: 'guidance-blessing',
        kind: 'blessing',
        title: 'Walk the Next Step',
        body: 'Receive enough light for the next faithful step. You do not need the whole road today.',
        durationSeconds: 18,
      },
    ],
  },
  {
    id: 'rest-for-the-weary',
    title: 'Rest for the Weary',
    subtitle: 'A prayer of quiet trust for tired minds and worn-down bodies.',
    category: 'Rest',
    estimatedMinutes: 7,
    icon: 'moon.stars',
    heroScripture: {
      reference: 'Matthew 11:28',
      text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
    },
    intentionPrompt: 'Offer your exhaustion to Christ without apology.',
    closingBlessing:
      'May the Lord give rest to your body, gentleness to your thoughts, and hope for tomorrow.',
    stages: [
      {
        id: 'rest-scripture',
        kind: 'scripture',
        title: 'Hear the Invitation',
        body: "Start by receiving Christ's welcome. This is not a performance. It is an invitation.",
        scripture: {
          reference: 'Matthew 11:28',
          text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
        },
        durationSeconds: 24,
      },
      {
        id: 'rest-reflection',
        kind: 'reflection',
        title: 'Notice the Fatigue',
        body: 'Where do you feel worn thin: physically, emotionally, spiritually, or relationally?',
        reflectionPrompt: 'What part of you most needs rest instead of more striving?',
        durationSeconds: 28,
      },
      {
        id: 'rest-prayer',
        kind: 'prayer',
        title: 'Prayer for Rest',
        body: 'Lord Jesus, I come to You tired. Quiet the noise I keep carrying. Give me honest rest, holy patience, and the grace to stop proving that I can do everything alone.',
        durationSeconds: 34,
      },
      {
        id: 'rest-stillness',
        kind: 'stillness',
        title: 'Settle in Silence',
        body: 'Loosen your shoulders. Slow your breath. Let your body learn the prayer your words have already spoken.',
        durationSeconds: 42,
      },
      {
        id: 'rest-blessing',
        kind: 'blessing',
        title: 'Receive Gentle Mercy',
        body: 'Let this moment be enough. You are held by God even while unfinished things remain.',
        durationSeconds: 18,
      },
    ],
  },
];

export const CHRISTIAN_DAILY_SCRIPTURES: ChristianDailyScripture[] = [
  {
    id: 'psalm-23-1',
    title: 'The Lord Is My Shepherd',
    reference: 'Psalm 23:1',
    category: 'Peace',
    text: 'The Lord is my shepherd; I shall not want.',
  },
  {
    id: 'romans-12-12',
    title: 'Steadfast in Prayer',
    reference: 'Romans 12:12',
    category: 'Perseverance',
    text: 'Rejoicing in hope; patient in tribulation; continuing instant in prayer.',
  },
  {
    id: 'philippians-4-6-7',
    title: 'Do Not Be Anxious',
    reference: 'Philippians 4:6-7',
    category: 'Peace',
    text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
  },
  {
    id: 'isaiah-40-31',
    title: 'Renewed Strength',
    reference: 'Isaiah 40:31',
    category: 'Strength',
    text: 'But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
  },
  {
    id: 'colossians-3-15',
    title: 'Let Peace Rule',
    reference: 'Colossians 3:15',
    category: 'Peace',
    text: 'And let the peace of God rule in your hearts, to the which also ye are called in one body; and be ye thankful.',
  },
  {
    id: 'james-1-5',
    title: 'Ask for Wisdom',
    reference: 'James 1:5',
    category: 'Guidance',
    text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.',
  },
];

export function getDefaultChristianPrayerTemplate(): ChristianPrayerTemplate {
  return CHRISTIAN_PRAYER_TEMPLATES[0]!;
}

export function getChristianPrayerTemplate(
  templateId?: string | null,
): ChristianPrayerTemplate | null {
  if (!templateId) {
    return null;
  }

  return CHRISTIAN_PRAYER_TEMPLATES.find((template) => template.id === templateId) ?? null;
}

export function getDailyChristianScripture(date = new Date()): ChristianDailyScripture {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDayMs = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDayMs);
  return CHRISTIAN_DAILY_SCRIPTURES[dayOfYear % CHRISTIAN_DAILY_SCRIPTURES.length]!;
}

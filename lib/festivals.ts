// Indian festival and business-day calendar, 2026–2027.
// Festival dates: Government of India, DoPT Office Memoranda on holidays for 2026 (dated 3 Jul 2025, with the
// 22 May 2026 Bakrid revision) and 2027 (F.No.12/2/2023-JCA, dated 16 Jul 2026). Moon-dependent dates are flagged.
// Business and awareness days are fixed calendar days, or computed by rule (e.g. second Sunday of May).
// Captions and hashtags are original AdCognix copy.
export type Festival = { date: string; name: string; kind: 'festival' | 'national' | 'business'; moon?: boolean; caption: string; tags: string[]; motif: 'lamp' | 'flag' | 'colour' | 'moon' | 'star' | 'sun' | 'leaf' | 'gift' | 'book' | 'heart' };

type Seed = [string, string, Festival['kind'], Festival['motif'], string, string[], boolean?];
// [date, name, kind, motif, caption ({b} = business name, {c} = city), tags, moon-dependent]
const F: Seed[] = [
  // 2026 (DoPT 2026)
  ['2026-01-01', "New Year's Day", 'business', 'star', 'A fresh calendar and a fresh welcome. Thank you for choosing {b} — here is to a great year together.', ['NewYear', 'FreshStart']],
  ['2026-01-14', 'Makar Sankranti / Pongal', 'festival', 'sun', 'May the harvest season fill every home in {c} with warmth and plenty. Warm wishes from {b}.', ['MakarSankranti', 'Pongal', 'HarvestFestival']],
  ['2026-01-23', 'Basant Panchami', 'festival', 'book', 'Yellow skies, new beginnings and the joy of learning. Happy Basant Panchami from {b}.', ['BasantPanchami', 'SaraswatiPuja']],
  ['2026-01-26', 'Republic Day', 'national', 'flag', 'Proud of our Constitution, proud of {c}. {b} wishes you a happy Republic Day.', ['RepublicDay', 'IndiaAt77']],
  ['2026-02-15', 'Maha Shivratri', 'festival', 'moon', 'A night of devotion and calm. Wishing you peace and strength this Maha Shivratri — team {b}.', ['MahaShivratri']],
  ['2026-03-03', 'Holika Dahan', 'festival', 'lamp', 'Let the bonfire take the worries away. Wishing you a joyful Holika Dahan from {b}.', ['HolikaDahan']],
  ['2026-03-04', 'Holi', 'festival', 'colour', 'More colour, more laughter, more of the people you love. Happy Holi from everyone at {b}!', ['Holi', 'FestivalOfColours']],
  ['2026-03-19', 'Ugadi / Gudi Padwa', 'festival', 'leaf', 'A new year, a new start. {b} wishes you a sweet and prosperous Ugadi and Gudi Padwa.', ['Ugadi', 'GudiPadwa', 'NewBeginnings']],
  ['2026-03-21', 'Id-ul-Fitr', 'festival', 'moon', 'Eid Mubarak! May your home be full of light, sweetness and good company. Warm wishes from {b}.', ['EidMubarak', 'EidUlFitr'], true],
  ['2026-03-26', 'Ram Navami', 'festival', 'sun', 'Wishing you courage, kindness and a peaceful Ram Navami — from all of us at {b}.', ['RamNavami']],
  ['2026-03-31', 'Mahavir Jayanti', 'festival', 'leaf', 'Ahimsa, truth and compassion. Wishing you a peaceful Mahavir Jayanti from {b}.', ['MahavirJayanti']],
  ['2026-04-03', 'Good Friday', 'festival', 'star', 'A day of reflection and hope. Thinking of our community in {c} today — {b}.', ['GoodFriday']],
  ['2026-04-14', 'Vaisakhi / Vishu / Tamil New Year', 'festival', 'sun', 'New harvest, new year, new hopes. Warm wishes from {b} to every family celebrating today.', ['Vaisakhi', 'Vishu', 'Puthandu']],
  ['2026-05-01', 'Buddha Purnima', 'festival', 'moon', 'May the light of wisdom guide every step. Happy Buddha Purnima from {b}.', ['BuddhaPurnima']],
  ['2026-05-28', 'Id-ul-Zuha (Bakrid)', 'festival', 'moon', 'Eid al-Adha Mubarak. Wishing you and your family blessings and togetherness — team {b}.', ['EidAlAdha', 'Bakrid'], true],
  ['2026-08-15', 'Independence Day', 'national', 'flag', 'Free to dream, free to build. Happy Independence Day from {b}, {c}.', ['IndependenceDay', 'JaiHind']],
  ['2026-08-26', 'Onam', 'festival', 'leaf', 'A full sadya, a bright pookalam and family all around. Happy Onam from {b}!', ['Onam', 'HappyOnam']],
  ['2026-08-28', 'Raksha Bandhan', 'festival', 'heart', 'A thread that says "I have got you". Happy Raksha Bandhan from {b}.', ['RakshaBandhan', 'Rakhi']],
  ['2026-09-04', 'Janmashtami', 'festival', 'star', 'Butter, bansuri and a lot of joy. Happy Janmashtami from {b}.', ['Janmashtami', 'Krishna']],
  ['2026-09-14', 'Ganesh Chaturthi', 'festival', 'sun', 'Ganpati Bappa Morya! May every new start be smooth. Warm wishes from {b}, {c}.', ['GaneshChaturthi', 'GanpatiBappaMorya']],
  ['2026-10-02', 'Gandhi Jayanti', 'national', 'flag', 'Simple living, honest work. Remembering Bapu today — {b}.', ['GandhiJayanti']],
  ['2026-10-20', 'Dussehra', 'festival', 'sun', 'Good wins, always. Happy Dussehra from everyone at {b}.', ['Dussehra', 'VijayaDashami']],
  ['2026-10-29', 'Karwa Chauth', 'festival', 'moon', 'To love, patience and the moonrise. Happy Karwa Chauth from {b}.', ['KarwaChauth']],
  ['2026-11-08', 'Diwali', 'festival', 'lamp', 'Diyas lit, sweets ready, hearts full. {b} wishes you a bright and safe Diwali.', ['HappyDiwali', 'Deepavali', 'FestivalOfLights']],
  ['2026-11-11', 'Bhai Dooj', 'festival', 'heart', 'Siblings: first friends, forever team. Happy Bhai Dooj from {b}.', ['BhaiDooj']],
  ['2026-11-15', 'Chhath Puja', 'festival', 'sun', 'Prayers to the rising and setting sun. Warm Chhath Puja wishes from {b}.', ['ChhathPuja']],
  ['2026-11-24', "Guru Nanak's Birthday", 'festival', 'lamp', 'Seva, sharing and gratitude. Gurpurab wishes from {b} to all celebrating in {c}.', ['GuruNanakJayanti', 'Gurpurab']],
  ['2026-12-25', 'Christmas', 'festival', 'star', 'Merry Christmas from {b}! Thank you for a wonderful year in {c}.', ['MerryChristmas', 'Christmas']],
  // 2027 (DoPT 2027)
  ['2027-01-01', "New Year's Day", 'business', 'star', 'Twelve new months to do great work together. Happy New Year from {b}.', ['NewYear2027', 'FreshStart']],
  ['2027-01-14', 'Makar Sankranti', 'festival', 'sun', 'Kites up, spirits higher. Happy Makar Sankranti from {b}.', ['MakarSankranti', 'Uttarayan']],
  ['2027-01-15', 'Pongal', 'festival', 'sun', 'Pongalo Pongal! May your year overflow with good things. Wishes from {b}, {c}.', ['Pongal', 'HarvestFestival']],
  ['2027-01-26', 'Republic Day', 'national', 'flag', 'Celebrating the values that bind us. Happy Republic Day from {b}.', ['RepublicDay', 'IndiaAt78']],
  ['2027-02-11', 'Basant Panchami', 'festival', 'book', 'Here is to learning something new this season. Happy Basant Panchami from {b}.', ['BasantPanchami']],
  ['2027-03-06', 'Maha Shivratri', 'festival', 'moon', 'Om Namah Shivaya. Wishing you a calm and blessed Maha Shivratri — {b}.', ['MahaShivratri']],
  ['2027-03-10', 'Id-ul-Fitr', 'festival', 'moon', 'Eid Mubarak to every family in {c}. With warm wishes from {b}.', ['EidMubarak', 'EidUlFitr'], true],
  ['2027-03-22', 'Holika Dahan', 'festival', 'lamp', 'Out with the old, in with the bright. Happy Holika Dahan from {b}.', ['HolikaDahan']],
  ['2027-03-23', 'Holi', 'festival', 'colour', 'Splash some colour on your day! Happy Holi from team {b}.', ['Holi', 'HappyHoli']],
  ['2027-03-26', 'Good Friday', 'festival', 'star', 'Wishing our friends and customers a peaceful Good Friday — {b}.', ['GoodFriday']],
  ['2027-04-07', 'Ugadi / Gudi Padwa', 'festival', 'leaf', 'Sweet, sour, bitter and bright: here is to a full new year. Happy Ugadi from {b}.', ['Ugadi', 'GudiPadwa']],
  ['2027-04-14', 'Vaisakhi / Vishu / Tamil New Year', 'festival', 'sun', 'Fresh harvest, fresh hopes. Warm wishes from {b}.', ['Vaisakhi', 'Vishu', 'Puthandu']],
  ['2027-04-15', 'Ram Navami', 'festival', 'sun', 'May truth and kindness lead the way. Happy Ram Navami from {b}.', ['RamNavami']],
  ['2027-04-19', 'Mahavir Jayanti', 'festival', 'leaf', 'Live and let live. Happy Mahavir Jayanti from {b}.', ['MahavirJayanti']],
  ['2027-05-17', 'Id-ul-Zuha (Bakrid)', 'festival', 'moon', 'Eid al-Adha Mubarak from all of us at {b}.', ['EidAlAdha', 'Bakrid'], true],
  ['2027-05-20', 'Buddha Purnima', 'festival', 'moon', 'Peace within, peace around. Happy Buddha Purnima from {b}.', ['BuddhaPurnima']],
  ['2027-08-15', 'Independence Day', 'national', 'flag', 'Eighty years of freedom. Happy Independence Day from {b}, {c}.', ['IndependenceDay', 'JaiHind']],
  ['2027-08-17', 'Raksha Bandhan', 'festival', 'heart', 'For the one who always has your back. Happy Raksha Bandhan from {b}.', ['RakshaBandhan', 'Rakhi']],
  ['2027-08-25', 'Janmashtami', 'festival', 'star', 'Happy Janmashtami! May your home be full of music and makhan — {b}.', ['Janmashtami']],
  ['2027-09-04', 'Ganesh Chaturthi', 'festival', 'sun', 'Welcoming Bappa with open hearts. Happy Ganesh Chaturthi from {b}.', ['GaneshChaturthi', 'GanpatiBappaMorya']],
  ['2027-09-12', 'Onam', 'festival', 'leaf', 'Flowers at the door and a feast on the leaf. Happy Onam from {b}.', ['Onam', 'HappyOnam']],
  ['2027-10-02', 'Gandhi Jayanti', 'national', 'flag', 'Be the change. Remembering Mahatma Gandhi today — {b}.', ['GandhiJayanti']],
  ['2027-10-09', 'Dussehra', 'festival', 'sun', 'May every good effort win. Happy Dussehra from {b}.', ['Dussehra', 'VijayaDashami']],
  ['2027-10-18', 'Karwa Chauth', 'festival', 'moon', 'Wishing every couple a beautiful Karwa Chauth — {b}.', ['KarwaChauth']],
  ['2027-10-29', 'Diwali', 'festival', 'lamp', 'May your Diwali be bright, safe and sweet. With love from {b}, {c}.', ['HappyDiwali', 'Deepavali']],
  ['2027-10-31', 'Bhai Dooj', 'festival', 'heart', 'Here is to siblings who become best friends. Happy Bhai Dooj from {b}.', ['BhaiDooj']],
  ['2027-11-04', 'Chhath Puja', 'festival', 'sun', 'Gratitude to the sun and to the people who make our days. Chhath wishes from {b}.', ['ChhathPuja']],
  ['2027-11-14', "Guru Nanak's Birthday", 'festival', 'lamp', 'Gurpurab wishes to all — may we share more and worry less. {b}.', ['Gurpurab', 'GuruNanakJayanti']],
  ['2027-12-25', 'Christmas', 'festival', 'star', 'Merry Christmas and thank you for a great year, {c}! — {b}', ['MerryChristmas']],
];

// Business and awareness days with fixed dates.
const FIXED: [string, string, Festival['motif'], string, string[]][] = [
  ['02-14', "Valentine's Day", 'heart', 'Show some love to the people who matter. Something special is waiting at {b} this week.', ['ValentinesDay']],
  ['03-08', "International Women's Day", 'star', 'To the women who build, lead and inspire. Happy Women\'s Day from {b}.', ['WomensDay', 'IWD']],
  ['03-15', 'World Consumer Rights Day', 'book', 'You deserve clear prices and honest service. That is our promise at {b}.', ['ConsumerRightsDay']],
  ['06-05', 'World Environment Day', 'leaf', 'Small steps, greener {c}. Here is what {b} is doing to cut waste this year.', ['WorldEnvironmentDay']],
  ['06-21', 'International Day of Yoga', 'sun', 'Breathe in, slow down. Happy Yoga Day from {b}.', ['YogaDay']],
  ['06-27', 'MSME Day', 'gift', 'Proudly small, proudly local. Happy MSME Day to every business owner in {c} — from {b}.', ['MSMEDay', 'VocalForLocal']],
  ['07-01', "National Doctors' Day", 'heart', 'Thank you to every doctor who keeps {c} healthy. Happy Doctors\' Day from {b}.', ['DoctorsDay']],
  ['07-01', 'Chartered Accountants Day', 'book', 'To the CAs who keep India\'s books straight: thank you. Wishes from {b}.', ['CADay']],
  ['08-30', 'National Small Industry Day', 'gift', 'Here is to the small businesses that keep {c} running. {b} is proud to be one.', ['SmallIndustryDay', 'ShopLocal']],
  ['09-05', "Teachers' Day", 'book', 'To every teacher who believed in us. Happy Teachers\' Day from {b}.', ['TeachersDay']],
  ['09-15', "Engineers' Day", 'star', 'Built with care. Happy Engineers\' Day to every problem-solver — {b}.', ['EngineersDay']],
  ['11-14', "Children's Day", 'heart', 'Big dreams, small hands. Happy Children\'s Day from {b}.', ['ChildrensDay']],
  ['12-31', "New Year's Eve", 'star', 'One last thank-you for the year. See you in the new one — {b}.', ['NewYearsEve']],
];
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
// nth weekday of month (weekday 0=Sun)
export function nthWeekday(y: number, m: number, weekday: number, n: number) {
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
}
function computed(y: number): Seed[] {
  const thanks = nthWeekday(y, 11, 4, 4); // 4th Thursday of November
  return [
    [iso(y, 5, nthWeekday(y, 5, 0, 2)), "Mother's Day", 'business', 'heart', 'For the first person who believed in you. Happy Mother\'s Day from {b}.', ['MothersDay']],
    [iso(y, 6, nthWeekday(y, 6, 0, 3)), "Father's Day", 'business', 'heart', 'Quiet strength, endless support. Happy Father\'s Day from {b}.', ['FathersDay']],
    [iso(y, 11, thanks + 1), 'Black Friday sale season', 'business', 'gift', 'Sale season is here. Ask {b} about this week\'s offers in {c}.', ['BlackFriday', 'SaleSeason']],
  ];
}
export const FESTIVALS: Festival[] = [...F,
  ...[2026, 2027].flatMap(y => [...FIXED.map(([md, n, mo, c, t]) => [`${y}-${md}`, n, 'business', mo, c, t] as Seed), ...computed(y)])]
  .map(([date, name, kind, motif, caption, tags, moon]) => ({ date, name, kind, motif, caption, tags, ...(moon ? { moon } : {}) }))
  .sort((a, b) => a.date.localeCompare(b.date));

export function fillCaption(f: Festival, biz: { name: string; city: string; category?: string }) {
  const text = f.caption.replace(/\{b\}/g, biz.name).replace(/\{c\}/g, biz.city);
  const cityTag = biz.city.replace(/[^A-Za-z]/g, '');
  const tags = [...f.tags, cityTag ? cityTag : '', biz.name.replace(/[^A-Za-z0-9]/g, '')].filter(Boolean).map(t => '#' + t);
  return { text, hashtags: Array.from(new Set(tags)) };
}
export function upcoming(from: string, n = 8) { return FESTIVALS.filter(f => f.date >= from).slice(0, n); }

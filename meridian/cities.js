// Everything the page says about a city. Add a city here and the bands, globe pins, headlines and damage report pick it up.
// band: true adds a row under "Reports from the ground"; it then needs `sleep` ([from, to) local hours, may wrap past midnight),
// 24 `jokes` (one per local hour, 0-23) and an `asleep` headline. Pins only need name, code, lat and lon.
export const CITIES = [
  {
    name: 'Sydney', code: 'SYD', zone: 'Australia/Sydney', lat: -33.9, lon: 151.2, band: true, sleep: [23, 5],
    asleep: 'Sydney is asleep. Knocked off early again.',
    jokes: [
      'Kebab on Oxford Street. Earned it.', 'Remembering when 1:30 meant locked out.', 'Uber surge pricing. Walking it is.', 'Taxi rank queue. Character building.',
      'Bin chicken eating your leftover kebab.', 'Bondi to Bronte before the boss.', 'Ocean swim done. Smug all day.', 'Flat white, judged harshly. It’s fine.',
      'Ferry to work. Unreasonably beautiful.', 'Stand-up meeting. Everyone says “no worries.”', 'Smashed avo. Still renting.', 'Morning tea. It’s a whole thing.',
      'Lunch in the sun. Sunscreen first.', 'Checking the surf report. Then emails.', 'Planning when to knock off.', 'Friday arvo drinks started. It’s Tuesday.',
      'Knocked off. Not explaining why.', 'Schooners at the pub, sun still up.', 'Rooftop bar. Everyone’s a “legend.”', 'Barbie in the park. Snags on.',
      'Dinner. Everything’s $34 now.', 'Posting the sunset. It set at seven.', 'Rooftop’s closing. Somehow already tired.', 'Asleep early. Swim at five.'
    ]
  },
  {
    name: 'Hong Kong', code: 'HKG', zone: 'Asia/Hong_Kong', lat: 22.3, lon: 114.2, band: true, sleep: [1, 6],
    asleep: 'Hong Kong is asleep. First time since 2015.',
    jokes: [
      'Last red minibus home. Driver testing physics.', 'Taxi refuses: wrong side of the harbour.', 'Lan Kwai Fong, still in your work shirt.', 'Club 7-Eleven. Cheapest bar in LKF.',
      'Still in LKF. Meeting at nine.', 'Tai chi aunties out-stretching you.', 'Dragon’s Back before work. Already sweating.', 'MTR door chime. You squeeze in anyway.',
      'Pineapple bun and milk tea, standing.', 'In the office. Not leaving soon.', 'Aircon set to arctic. Cardigan on.', 'Refreshing the Observatory. Please, signal 8.',
      'Cha chaan teng set lunch. Out in 20.', 'Yum cha with seven strangers.', 'Teapot lid flipped. Refill, please.', 'Third milk tea. Spreadsheets blurring.',
      'Boss still in. So are you.', 'Officially home time. Hilarious.', 'Ordering dinner to your desk.', 'Contract says 6pm. Cute.',
      'Office lights on a timer. Waving arms.', 'Still at work. Boss still at work.', 'Finally leaving. Same time tomorrow.', 'Dai pai dong. Beer in a bowl.'
    ]
  },
  {
    name: 'London', code: 'LON', zone: 'Europe/London', lat: 51.5, lon: -0.12, band: true, sleep: [1, 6],
    asleep: 'London is asleep. Somewhere, a kettle is still warm.',
    jokes: [
      'Night bus, top deck, front seat. Victory.', 'Chicken shop. Third one tonight.', 'Fox screaming. Nobody’s being murdered. Probably.', 'Only the foxes are still out.',
      'Even the Night Tube’s gone home.', 'Bin lorries doing the dawn chorus.', 'First Tube. Already no seats.', 'Northern line, inside a stranger’s armpit.',
      'Signal failure at Bank. Obviously.', 'Pret queue. Same oat flat white.', 'Kettle on. Asking who wants one.', 'Saying “lovely” about something not lovely.',
      'Meal deal at the desk.', 'Back from a 28-minute lunch hour.', 'Raining. It was sunny ten minutes ago.', '“Quick one later?” emails begin.',
      'Pretending to work. Eyeing the pub.', 'Pint on the pavement, coat on.', 'Still at the pub. “Just the one.”', 'Third “just the one.”',
      'Dinner is crisps. Two flavours.', 'Saying sorry to whoever bumped you.', 'Last orders. Ordering two.', 'Tapping in for the last Tube. Regret.'
    ]
  },
  {
    name: 'New York', code: 'NYC', zone: 'America/New_York', lat: 40.7, lon: -74, band: true, sleep: [4, 6],
    asleep: 'New York is asleep. “Just circling back” is now a threat.',
    jokes: [
      'Bodega cat judging your sandwich order.', 'Folded slice, eaten mid-stride.', 'Bar’s still open. Of course it is.', 'Last call is 4am. Pacing yourself.',
      'Last call. Bacon egg and cheese next.', 'Bars close. Bodegas don’t.', 'Running for a train that’s delayed.', '“Being held by the train dispatcher.”',
      'Coffee in the blue Greek cup.', 'Walking faster than everyone. Still late.', '“Quick sync,” sixty minutes.', 'Rent is due. Rent is always due.',
      'Sad desk salad. $19, plus tip.', 'Halal cart line wraps the block.', 'Jaywalking with total confidence.', '“Just circling back,” email number four.',
      'Honking at traffic that cannot move.', 'Swiping into the subway, praying.', 'Happy hour: $17 drinks, very happy.', 'Two-hour wait for a table. Worth it.',
      'Dinner reservation booked a month ago.', 'Eating in a closet-sized restaurant.', 'Home to a $4,000 shoebox.', 'Not sleeping. Neither is the city.'
    ]
  },
  { name: 'Colombo', code: 'CMB', lat: 6.9, lon: 79.9 },
  { name: 'Santiago', code: 'SCL', lat: -33.4, lon: -70.7 },
  { name: 'Johannesburg', code: 'JNB', lat: -26.2, lon: 28 }
];

// Lines that aren't about one city.
export const COPY = {
  allAwake: 'All awake. Nobody volunteered.',
  allAwakeNote: 'Quick, before someone yawns.',
  sorry: name => `Sorry, ${name}.`,
  asleepNote: others => others ? `${others} too. Text, don’t call.` : 'Text, don’t call.',
  headline: 'Four time zones. Zero good times.'
};

for (const city of CITIES.filter(c => c.band)) {
  if (city.jokes?.length !== 24 || !city.asleep || city.sleep?.length !== 2) console.error(`${city.name} needs 24 jokes, an asleep line and a sleep window`);
}

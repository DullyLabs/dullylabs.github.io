(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const cities = [
    { key: 'london', sleep: [1, 6], name: 'London', zone: 'Europe/London', lat: 51.5, lon: -.12, code: 'LON' },
    { key: 'newYork', sleep: [4, 6], name: 'New York', zone: 'America/New_York', lat: 40.7, lon: -74, code: 'NYC' },
    { key: 'hongKong', sleep: [1, 6], name: 'Hong Kong', zone: 'Asia/Hong_Kong', lat: 22.3, lon: 114.2, code: 'HKG' },
    { key: 'sydney', sleep: [23, 5], name: 'Sydney', zone: 'Australia/Sydney', lat: -33.9, lon: 151.2, code: 'SYD' }
  ];
  const pins = [...cities, { lat: 1.35, lon: 103.8, code: 'SIN' }, { lat: 6.9, lon: 79.9, code: 'CMB' }, { lat: -33.4, lon: -70.7, code: 'SCL' }, { lat: -26.2, lon: 28, code: 'JNB' }];
  const home = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formats = new Map();
  function wall(zone, at) {
    if (!formats.has(zone)) formats.set(zone, new Intl.DateTimeFormat('en-GB', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }));
    const parts = Object.fromEntries(formats.get(zone).formatToParts(at).map(p => [p.type, p.value]));
    return { h: +parts.hour, m: parts.minute, day: Date.UTC(+parts.year, +parts.month - 1, +parts.day) / 864e5 };
  }
  const jokes = {
    london: [
      'Night bus, top deck, front seat. Victory.', 'Chicken shop. Third one tonight.', 'Fox screaming. Nobody’s being murdered. Probably.', 'Only the foxes are still out.',
      'Even the Night Tube’s gone home.', 'Bin lorries doing the dawn chorus.', 'First Tube. Already no seats.', 'Northern line, inside a stranger’s armpit.',
      'Signal failure at Bank. Obviously.', 'Pret queue. Same oat flat white.', 'Kettle on. Asking who wants one.', 'Saying “lovely” about something not lovely.',
      'Meal deal at the desk.', 'Back from a 28-minute lunch hour.', 'Raining. It was sunny ten minutes ago.', '“Quick one later?” emails begin.',
      'Pretending to work. Eyeing the pub.', 'Pint on the pavement, coat on.', 'Still at the pub. “Just the one.”', 'Third “just the one.”',
      'Dinner is crisps. Two flavours.', 'Saying sorry to whoever bumped you.', 'Last orders. Ordering two.', 'Tapping in for the last Tube. Regret.'
    ],
    newYork: [
      'Bodega cat judging your sandwich order.', 'Folded slice, eaten mid-stride.', 'Bar’s still open. Of course it is.', 'Last call is 4am. Pacing yourself.',
      'Last call. Bacon egg and cheese next.', 'Bars close. Bodegas don’t.', 'Running for a train that’s delayed.', '“Being held by the train dispatcher.”',
      'Coffee in the blue Greek cup.', 'Walking faster than everyone. Still late.', '“Quick sync,” sixty minutes.', 'Rent is due. Rent is always due.',
      'Sad desk salad. $19, plus tip.', 'Halal cart line wraps the block.', 'Jaywalking with total confidence.', '“Just circling back,” email number four.',
      'Honking at traffic that cannot move.', 'Swiping into the subway, praying.', 'Happy hour: $17 drinks, very happy.', 'Two-hour wait for a table. Worth it.',
      'Dinner reservation booked a month ago.', 'Eating in a closet-sized restaurant.', 'Home to a $4,000 shoebox.', 'Not sleeping. Neither is the city.'
    ],
    hongKong: [
      'Last red minibus home. Driver testing physics.', 'Taxi refuses: wrong side of the harbour.', 'Lan Kwai Fong, still in your work shirt.', 'Club 7-Eleven. Cheapest bar in LKF.',
      'Still in LKF. Meeting at nine.', 'Tai chi aunties out-stretching you.', 'Dragon’s Back before work. Already sweating.', 'MTR door chime. You squeeze in anyway.',
      'Pineapple bun and milk tea, standing.', 'In the office. Not leaving soon.', 'Aircon set to arctic. Cardigan on.', 'Refreshing the Observatory. Please, signal 8.',
      'Cha chaan teng set lunch. Out in 20.', 'Yum cha with seven strangers.', 'Teapot lid flipped. Refill, please.', 'Third milk tea. Spreadsheets blurring.',
      'Boss still in. So are you.', 'Officially home time. Hilarious.', 'Ordering dinner to your desk.', 'Contract says 6pm. Cute.',
      'Office lights on a timer. Waving arms.', 'Still at work. Boss still at work.', 'Finally leaving. Same time tomorrow.', 'Dai pai dong. Beer in a bowl.'
    ],
    sydney: [
      'Kebab on Oxford Street. Earned it.', 'Remembering when 1:30 meant locked out.', 'Uber surge pricing. Walking it is.', 'Taxi rank queue. Character building.',
      'Bin chicken eating your leftover kebab.', 'Bondi to Bronte before the boss.', 'Ocean swim done. Smug all day.', 'Flat white, judged harshly. It’s fine.',
      'Ferry to work. Unreasonably beautiful.', 'Stand-up meeting. Everyone says “no worries.”', 'Smashed avo. Still renting.', 'Morning tea. It’s a whole thing.',
      'Lunch in the sun. Sunscreen first.', 'Checking the surf report. Then emails.', 'Planning when to knock off.', 'Friday arvo drinks started. It’s Tuesday.',
      'Knocked off. Not explaining why.', 'Schooners at the pub, sun still up.', 'Rooftop bar. Everyone’s a “legend.”', 'Barbie in the park. Snags on.',
      'Dinner. Everything’s $34 now.', 'Posting the sunset. It set at seven.', 'Rooftop’s closing. Somehow already tired.', 'Asleep early. Swim at five.'
    ]
  };
  const asleepLines = { london: 'London is asleep. Somewhere, a kettle is still warm.', newYork: 'New York is asleep. “Just circling back” is now a threat.', hongKong: 'Hong Kong is asleep. First time since 2015.', sydney: 'Sydney is asleep. Knocked off early again.' };
  cities.forEach(city => {
    const li = document.createElement('li'); li.className = 'band';
    li.innerHTML = `<div class="band-top caps"><span>${city.name}</span><span class="date"></span></div><div class="band-body"><p class="band-time"><b></b><i></i></p><p class="gossip"></p></div>`;
    $('bands').append(li); city.el = li;
  });
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  let shift = 0;
  const canvas = $('planet'), ctx = canvas.getContext('2d');
  const rad = Math.PI / 180;
  // Coarse, hand-drawn geographic outlines; the globe is a diagram, not a solar ephemeris.
  const lands = [
    [[-168,70],[-140,70],[-125,58],[-123,40],[-110,30],[-98,18],[-88,16],[-81,8],[-78,22],[-66,45],[-54,52],[-80,65],[-110,72],[-168,70]],
    [[-81,10],[-65,9],[-48,-1],[-35,-8],[-43,-23],[-54,-40],[-69,-55],[-76,-28],[-81,10]],
    [[-52,60],[-43,60],[-20,77],[-40,84],[-60,76],[-52,60]],
    [[-17,36],[10,37],[35,30],[50,12],[42,-12],[30,-34],[18,-35],[10,-16],[-2,4],[-16,14],[-17,36]],
    [[-10,36],[-10,59],[5,58],[20,71],[45,68],[70,74],[110,72],[160,66],[179,52],[142,45],[130,30],[120,20],[108,3],[96,18],[78,7],[65,25],[42,30],[30,40],[10,45],[-10,36]],
    [[112,-22],[116,-34],[135,-36],[153,-27],[145,-13],[130,-12],[112,-22]],
    [[130,32],[141,46],[145,43],[140,35],[130,32]], [[-8,50],[-5,59],[1,53],[-8,50]]
  ];
  // Land as a dot matrix: a 4° grid kept where it falls inside the outlines above.
  const inside = ([x, y], poly) => poly.reduce((hit, [x1, y1], i) => { const [x2, y2] = poly[(i + 1) % poly.length]; return (y1 > y) !== (y2 > y) && x < x1 + (y - y1) * (x2 - x1) / (y2 - y1) ? !hit : hit; }, false);
  const landDots = [];
  for (let lat = -58; lat <= 82; lat += 4) for (let lon = -180; lon < 180; lon += 4 / Math.max(Math.cos(lat * rad), .3)) if (lands.some(poly => inside([lon, lat], poly))) landDots.push([lon, lat]);
  function draw(at) {
    const dark = document.documentElement.dataset.theme === 'dark';
    const ink = dark ? '#f2efe8' : '#141412', signal = dark ? '#ff7a5c' : '#b8321c';
    const css = Math.min(canvas.clientWidth, canvas.clientHeight) || 800, px = Math.round(css * devicePixelRatio);
    if (canvas.width !== px) canvas.width = canvas.height = px;
    ctx.setTransform(px / 800, 0, 0, px / 800, 0, 0);
    ctx.clearRect(0, 0, 800, 800);
    const cx = 380, cy = 365, r = 265;
    const utcHour = at.getUTCHours() + at.getUTCMinutes() / 60;
    const center = 180 - utcHour * 15 - 65;
    function project(lon, lat) {
      const a = (lon - center) * rad, b = lat * rad;
      return [cx + r * Math.cos(b) * Math.sin(a), cy - r * Math.sin(b), Math.cos(b) * Math.cos(a)];
    }
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = dark ? '#30332c' : '#d2d2ba'; ctx.fill();
    ctx.save(); ctx.clip();
    function line(points, color, width) {
      ctx.beginPath(); let pen = false;
      for (const [lon, lat] of points) { const [x,y,z] = project(lon, lat); if (z < 0) { pen = false; continue; } if (pen) ctx.lineTo(x,y); else ctx.moveTo(x,y); pen = true; }
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) line(Array.from({length:361}, (_,i) => [i,lat]), dark ? '#55594c' : '#b0b29a', 1);
    for (let lon = 0; lon < 360; lon += 30) line(Array.from({length:181}, (_,i) => [lon,i-90]), dark ? '#55594c' : '#b0b29a', 1);
    // Equinox terminator at a fixed sun-facing angle; geography turns with UTC.
    ctx.beginPath();
    for (let y = -r; y <= r; y++) { const x = cx - Math.cos(65*rad) * Math.sqrt(r*r-y*y); if(y === -r) ctx.moveTo(x,cy+y); else ctx.lineTo(x,cy+y); }
    ctx.lineTo(cx-r-1,cy+r); ctx.lineTo(cx-r-1,cy-r); ctx.closePath();ctx.fillStyle = '#070c18a8';ctx.fill();
    for (const [lon, lat] of landDots) { const [x, y, z] = project(lon, lat); if (z <= 0) continue; const night = x < cx - Math.cos(65 * rad) * Math.sqrt(Math.max(r * r - (y - cy) ** 2, 0)); ctx.fillStyle = night ? (dark ? '#8d917f' : '#c9c7b0') : ink; ctx.beginPath(); ctx.arc(x, y, 1.2 + 2.3 * z, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore(); ctx.strokeStyle = ink; ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    pins.forEach(city => {const [x,y,z] = project(city.lon,city.lat); if(z < .05) return; ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle=signal;ctx.fill();ctx.font=`bold ${Math.max(17,11*800/css)}px monospace`;ctx.lineWidth=4;ctx.strokeStyle=dark?'#141412':'#f2efe8';ctx.strokeText(city.code,x+10,y-8);ctx.fillStyle=ink;ctx.fillText(city.code,x+10,y-8);});
    ctx.setLineDash([3,7]);ctx.beginPath();ctx.ellipse(cx,cy,r+40,80,-.25,0,Math.PI*2);ctx.strokeStyle=signal;ctx.stroke();ctx.setLineDash([]);
  }
  function render() {
    const at = new Date(Date.now() + shift * 6e4), here = wall(home, at);
    cities.forEach(city => {
      const t = city.time = wall(city.zone,at), day = t.day-here.day;
      city.el.classList.toggle('night',t.h < 6 || t.h >= 18);
      city.el.querySelector('b').textContent = String(t.h).padStart(2,'0');
      city.el.querySelector('i').textContent = ':'+t.m;
      city.el.querySelector('.date').textContent = day > 0 ? 'Tomorrow' : day < 0 ? 'Yesterday' : 'Today';
      city.el.querySelector('.gossip').textContent = jokes[city.key][t.h];
    });
    const sleeping = cities.filter(({ sleep: [from, to], time: { h } }) => from < to ? h >= from && h < to : h >= from || h < to) // each city's own bedtime, matching its jokes;
    $('report').textContent = sleeping.length ? `Sorry, ${sleeping[0].name}.` : 'All awake. Nobody volunteered.';
    $('damage').textContent = sleeping.length ? `${new Intl.ListFormat('en').format(sleeping.map(c=>c.name))} ${sleeping.length > 1 ? 'are' : 'is'} asleep. Text, don’t call.` : 'Quick, before someone yawns.';
    $('headline').textContent = sleeping.length ? asleepLines[sleeping[0].key] : cities[0].time.h >= 17 ? 'London has logged off. The sun respects boundaries.' : 'Four time zones. Zero good times.';
    const label = shift ? `${shift > 0 ? '+' : '−'}${Math.floor(Math.abs(shift)/60)}h ${String(Math.abs(shift)%60).padStart(2,'0')}m` : 'Now';
    $('shift-label').textContent = label; $('mode').textContent = shift ? '○ Time travel' : '● Live'; $('now').hidden = !shift;
    $('shift').setAttribute('aria-valuetext',shift ? `${label.slice(1).replace('h',' hours').replace('m',' minutes')} ${shift>0?'ahead':'back'}` : 'Now');
    draw(at);
  }
  function setShift(value) { shift=Math.max(-720,Math.min(720,Math.round(value/15)*15)); $('shift').value=shift; render(); }
  $('shift').addEventListener('input',e=>setShift(+e.target.value));
  $('now').addEventListener('click',()=>setShift(0));
  let drag;
  $('universe').addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,shift};$('universe').setPointerCapture(e.pointerId);$('universe').classList.add('dragging');});
  $('universe').addEventListener('pointermove',e=>{if(drag && e.pointerId===drag.id){const want=drag.shift+(e.clientX-drag.x)/(2*Math.PI*Math.min($("planet").clientWidth,$("planet").clientHeight)*265/800)*1440;setShift(want);if(Math.abs(want)>720){drag.x=e.clientX;drag.shift=shift;}}});
  function endDrag(){drag=null;$('universe').classList.remove('dragging');}
  $('universe').addEventListener('pointerup',endDrag);$('universe').addEventListener('pointercancel',endDrag);$('universe').addEventListener('lostpointercapture',endDrag);
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  addEventListener('resize',render);render();setInterval(()=>{if(!document.hidden)render();},1000);
})();

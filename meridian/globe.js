// The spinning Earth: dotted land, an equinox terminator facing a fixed sun on the right, and city pins. A diagram, not an ephemeris.
const RAD = Math.PI / 180, SIZE = 800, CX = 380, CY = 365, R = 265, SUN_ANGLE = 90;

// Coarse outlines, only used to place the land dots.
const LANDS = [
  [[-168,70],[-140,70],[-125,58],[-123,40],[-110,30],[-98,18],[-88,16],[-81,8],[-78,22],[-66,45],[-54,52],[-80,65],[-110,72],[-168,70]],
  [[-81,10],[-65,9],[-48,-1],[-35,-8],[-43,-23],[-54,-40],[-69,-55],[-76,-28],[-81,10]],
  [[-52,60],[-43,60],[-20,77],[-40,84],[-60,76],[-52,60]],
  [[-17,36],[10,37],[35,30],[50,12],[42,-12],[30,-34],[18,-35],[10,-16],[-2,4],[-16,14],[-17,36]],
  [[-10,36],[-10,59],[5,58],[20,71],[45,68],[70,74],[110,72],[160,66],[179,52],[142,45],[130,30],[120,20],[108,3],[96,18],[78,7],[65,25],[42,30],[30,40],[10,45],[-10,36]],
  [[112,-22],[116,-34],[135,-36],[153,-27],[145,-13],[130,-12],[112,-22]],
  [[130,32],[141,46],[145,43],[140,35],[130,32]], [[-8,50],[-5,59],[1,53],[-8,50]]
];
const inside = ([x, y], poly) => poly.reduce((hit, [x1, y1], i) => {
  const [x2, y2] = poly[(i + 1) % poly.length];
  return (y1 > y) !== (y2 > y) && x < x1 + (y - y1) * (x2 - x1) / (y2 - y1) ? !hit : hit;
}, false);
const LAND_DOTS = [];
for (let lat = -58; lat <= 82; lat += 4)
  for (let lon = -180; lon < 180; lon += 4 / Math.max(Math.cos(lat * RAD), 0.3))
    if (LANDS.some(poly => inside([lon, lat], poly))) LAND_DOTS.push([lon, lat]);

const terminatorX = y => CX - Math.cos(SUN_ANGLE * RAD) * Math.sqrt(Math.max(R * R - (y - CY) ** 2, 0));

// Pixels of horizontal drag per minute of time, so the surface follows the finger.
export const pxPerMinute = canvas => 2 * Math.PI * Math.min(canvas.clientWidth, canvas.clientHeight) * R / SIZE / 1440;

export function drawGlobe(canvas, at, pins, dark) {
  const ctx = canvas.getContext('2d');
  const ink = dark ? '#f2efe8' : '#141412', signal = dark ? '#ff5b3d' : '#e8452c'; // the app's Palette
  const css = Math.min(canvas.clientWidth, canvas.clientHeight) || SIZE, px = Math.round(css * devicePixelRatio);
  if (canvas.width !== px) canvas.width = canvas.height = px;
  ctx.setTransform(px / SIZE, 0, 0, px / SIZE, 0, 0);
  ctx.clearRect(0, 0, SIZE, SIZE);

  const center = 180 - (at.getUTCHours() + at.getUTCMinutes() / 60) * 15 - SUN_ANGLE;
  const project = (lon, lat) => {
    const a = (lon - center) * RAD, b = lat * RAD;
    return [CX + R * Math.cos(b) * Math.sin(a), CY - R * Math.sin(b), Math.cos(b) * Math.cos(a)];
  };
  const line = points => {
    ctx.beginPath(); let pen = false;
    for (const [lon, lat] of points) {
      const [x, y, z] = project(lon, lat);
      if (z < 0) { pen = false; continue; }
      pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true;
    }
    ctx.stroke();
  };

  ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fillStyle = dark ? '#2e2e2a' : '#f2efe8'; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = dark ? '#f2efe81f' : '#1414121f'; ctx.lineWidth = 1;
  for (let lat = -60; lat <= 60; lat += 30) line(Array.from({ length: 361 }, (_, i) => [i, lat]));
  for (let lon = 0; lon < 360; lon += 30) line(Array.from({ length: 181 }, (_, i) => [lon, i - 90]));
  ctx.beginPath();
  for (let y = CY - R; y <= CY + R; y++) y === CY - R ? ctx.moveTo(terminatorX(y), y) : ctx.lineTo(terminatorX(y), y);
  ctx.lineTo(CX - R - 1, CY + R); ctx.lineTo(CX - R - 1, CY - R); ctx.closePath();
  ctx.fillStyle = dark ? '#050505' : '#141412'; ctx.fill();
  for (const [lon, lat] of LAND_DOTS) {
    const [x, y, z] = project(lon, lat);
    if (z <= 0) continue;
    ctx.fillStyle = x < terminatorX(y) ? '#f2efe873' : ink;
    ctx.beginPath(); ctx.arc(x, y, 1.2 + 2.3 * z, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.stroke();

  ctx.font = `bold ${Math.max(17, 11 * SIZE / css)}px ui-monospace, monospace`;
  for (const pin of pins) {
    const [x, y, z] = project(pin.lon, pin.lat);
    if (z < 0.05) continue;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = signal; ctx.fill();
    if (z < 0.25) continue; // no labels near the edge, where they spill off the globe
    ctx.lineWidth = 4; ctx.strokeStyle = dark ? '#141412' : '#f2efe8'; ctx.strokeText(pin.code, x + 10, y - 8);
    ctx.fillStyle = ink; ctx.fillText(pin.code, x + 10, y - 8);
  }
  ctx.setLineDash([3, 7]); ctx.beginPath(); ctx.ellipse(CX, CY, R + 40, 80, -0.25, 0, Math.PI * 2);
  ctx.strokeStyle = signal; ctx.stroke(); ctx.setLineDash([]);
}

const canvas = document.getElementById('solarCanvas');
const ctx = canvas.getContext('2d');

const speedControl = document.getElementById('speed');
const speedLabel = document.getElementById('speedLabel');
const toggleBtn = document.getElementById('toggle');
const resetBtn = document.getElementById('reset');
const legend = document.getElementById('legend');

const center = { x: canvas.width / 2, y: canvas.height / 2 };

const planets = [
  { name: '水星', color: '#bab7a7', orbit: 55, period: 0.24, size: 4, moons: [] },
  { name: '金星', color: '#e5c58d', orbit: 80, period: 0.62, size: 6, moons: [] },
  { name: '地球', color: '#4da6ff', orbit: 110, period: 1, size: 6, moons: [{ name: '月球', color: '#d9d9d9', orbit: 11, period: 0.08, size: 2.6 }] },
  { name: '火星', color: '#d17a4f', orbit: 145, period: 1.88, size: 5, moons: [
    { name: '火卫一', color: '#c7b9a0', orbit: 9, period: 0.05, size: 2 },
    { name: '火卫二', color: '#8f8374', orbit: 13, period: 0.12, size: 1.6 }
  ] },
  { name: '木星', color: '#d9b38c', orbit: 205, period: 11.86, size: 13, moons: [
    { name: '木卫一', color: '#f1d78e', orbit: 15, period: 0.09, size: 2.2 },
    { name: '木卫二', color: '#d8d0be', orbit: 20, period: 0.18, size: 2.2 },
    { name: '木卫三', color: '#af9e8c', orbit: 25, period: 0.28, size: 2.5 },
    { name: '木卫四', color: '#8f7b67', orbit: 31, period: 0.4, size: 2.3 }
  ] },
  { name: '土星', color: '#d2c086', orbit: 260, period: 29.46, size: 11, moons: [
    { name: '土卫六', color: '#e6d0a0', orbit: 18, period: 0.22, size: 2.4 },
    { name: '土卫五', color: '#baa983', orbit: 24, period: 0.31, size: 2 }
  ] },
  { name: '天王星', color: '#8fe0e0', orbit: 315, period: 84.01, size: 8, moons: [
    { name: '天卫三', color: '#d5f2f2', orbit: 14, period: 0.2, size: 2 },
    { name: '天卫四', color: '#bddcdc', orbit: 19, period: 0.29, size: 2 }
  ] },
  { name: '海王星', color: '#4e7fff', orbit: 365, period: 164.8, size: 8, moons: [
    { name: '海卫一', color: '#ced5ff', orbit: 16, period: 0.24, size: 2.1 }
  ] },
  { name: '冥王星', color: '#b38d6c', orbit: 415, period: 248, size: 3.5, moons: [
    { name: '卡戎', color: '#c0a690', orbit: 8, period: 0.35, size: 1.7 }
  ] }
];

function buildLegend() {
  legend.innerHTML = '';
  planets.forEach((planet) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="dot" style="background:${planet.color}"></span><strong>${planet.name}</strong> · 公转周期约 ${planet.period} 年 · 卫星 ${planet.moons.length} 颗（示意）`;
    legend.appendChild(li);
  });
}

buildLegend();

let speedFactor = Number(speedControl.value);
let running = true;
let startTime = performance.now();
let pausedElapsed = 0;

function drawOrbit(radius, color = 'rgba(255,255,255,0.12)') {
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawSun() {
  const gradient = ctx.createRadialGradient(center.x, center.y, 6, center.x, center.y, 40);
  gradient.addColorStop(0, '#fff59d');
  gradient.addColorStop(0.5, '#ffcf66');
  gradient.addColorStop(1, 'rgba(255, 180, 30, 0.15)');

  ctx.beginPath();
  ctx.arc(center.x, center.y, 24, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

function drawPlanet(planet, t) {
  drawOrbit(planet.orbit);
  const angle = (t / planet.period) * Math.PI * 2;
  const x = center.x + Math.cos(angle) * planet.orbit;
  const y = center.y + Math.sin(angle) * planet.orbit;

  ctx.beginPath();
  ctx.arc(x, y, planet.size, 0, Math.PI * 2);
  ctx.fillStyle = planet.color;
  ctx.fill();

  planet.moons.forEach((moon) => {
    ctx.beginPath();
    ctx.arc(x, y, moon.orbit, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200,220,255,0.22)';
    ctx.stroke();

    const moonAngle = (t / moon.period) * Math.PI * 2;
    const mx = x + Math.cos(moonAngle) * moon.orbit;
    const my = y + Math.sin(moonAngle) * moon.orbit;

    ctx.beginPath();
    ctx.arc(mx, my, moon.size, 0, Math.PI * 2);
    ctx.fillStyle = moon.color;
    ctx.fill();
  });

  ctx.fillStyle = 'rgba(225,235,255,0.85)';
  ctx.font = '12px sans-serif';
  ctx.fillText(planet.name, x + planet.size + 5, y - planet.size - 3);
}

function drawStars() {
  for (let i = 0; i < 120; i += 1) {
    const seedX = (i * 73) % canvas.width;
    const seedY = (i * 191) % canvas.height;
    const r = (i % 4) * 0.25 + 0.35;
    ctx.beginPath();
    ctx.arc(seedX, seedY, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
  }
}

function render(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStars();
  drawSun();

  const elapsedSeconds = (pausedElapsed + (now - startTime)) / 1000;
  const t = elapsedSeconds * speedFactor;

  planets.forEach((planet) => drawPlanet(planet, t));

  if (running) {
    requestAnimationFrame(render);
  }
}

speedControl.addEventListener('input', () => {
  speedFactor = Number(speedControl.value);
  speedLabel.textContent = `${speedFactor.toFixed(1)}x`;
});

toggleBtn.addEventListener('click', () => {
  running = !running;
  toggleBtn.textContent = running ? '暂停' : '继续';

  if (running) {
    startTime = performance.now();
    requestAnimationFrame(render);
  } else {
    pausedElapsed += performance.now() - startTime;
  }
});

resetBtn.addEventListener('click', () => {
  startTime = performance.now();
  pausedElapsed = 0;
});

requestAnimationFrame(render);

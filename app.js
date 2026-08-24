const spaces = [
  { id: 'A01', zone: 'A', status: 'occupied', distances: { main: 95, library: 180, lab: 140, auditorium: 220, hostel: 330 } },
  { id: 'A02', zone: 'A', status: 'available', distances: { main: 108, library: 165, lab: 155, auditorium: 200, hostel: 315 } },
  { id: 'A03', zone: 'A', status: 'reserved', distances: { main: 100, library: 172, lab: 145, auditorium: 210, hostel: 322 } },
  { id: 'A04', zone: 'A', status: 'available', distances: { main: 86, library: 190, lab: 133, auditorium: 232, hostel: 340 } },
  { id: 'A05', zone: 'A', status: 'occupied', distances: { main: 110, library: 200, lab: 150, auditorium: 244, hostel: 352 } },
  { id: 'A06', zone: 'A', status: 'available', distances: { main: 125, library: 155, lab: 170, auditorium: 195, hostel: 300 } },
  { id: 'A07', zone: 'A', status: 'occupied', distances: { main: 140, library: 150, lab: 190, auditorium: 185, hostel: 280 } },
  { id: 'A08', zone: 'A', status: 'available', distances: { main: 118, library: 135, lab: 164, auditorium: 172, hostel: 274 } },
  { id: 'B01', zone: 'B', status: 'available', distances: { main: 140, library: 84, lab: 102, auditorium: 146, hostel: 235 } },
  { id: 'B02', zone: 'B', status: 'occupied', distances: { main: 132, library: 79, lab: 96, auditorium: 151, hostel: 241 } },
  { id: 'B03', zone: 'B', status: 'available', distances: { main: 152, library: 70, lab: 87, auditorium: 130, hostel: 222 } },
  { id: 'B04', zone: 'B', status: 'reserved', distances: { main: 160, library: 93, lab: 110, auditorium: 119, hostel: 210 } },
  { id: 'B05', zone: 'B', status: 'occupied', distances: { main: 168, library: 105, lab: 108, auditorium: 111, hostel: 195 } },
  { id: 'B06', zone: 'B', status: 'available', distances: { main: 175, library: 112, lab: 75, auditorium: 93, hostel: 175 } },
  { id: 'B07', zone: 'B', status: 'available', distances: { main: 190, library: 125, lab: 62, auditorium: 80, hostel: 160 } },
  { id: 'B08', zone: 'B', status: 'occupied', distances: { main: 198, library: 132, lab: 70, auditorium: 69, hostel: 149 } },
];
const destinationNames = { main: 'Main Academic Block', library: 'Central Library', lab: 'Innovation Lab', auditorium: 'Auditorium', hostel: 'Student Hostel' };
let selectedId = null;
let reservationId = null;
let recommendation = null;
const $ = (id) => document.getElementById(id);

function getRecommendation() { const dest = $('destination').value; return [...spaces].filter(s => s.status === 'available').sort((a,b) => a.distances[dest] - b.distances[dest])[0]; }
function zoneName(space) { return space.zone === 'A' ? 'Zone A · North lot' : 'Zone B · Central lot'; }
function walkTime(distance) { return Math.max(1, Math.round(distance / 55)); }
function renderMap() {
  ['A','B'].forEach(zone => { const holder = $(`zone${zone}`); holder.innerHTML = ''; spaces.filter(s => s.zone === zone).forEach(space => { const button = document.createElement('button'); button.className = `spot ${space.status}${space.id === recommendation?.id ? ' recommended' : ''}`; button.textContent = space.id; button.title = `${space.id}: ${space.status}`; button.disabled = space.status === 'occupied'; button.addEventListener('click', () => { if (space.status === 'available') { selectedId = space.id; updateRecommendation(space, true); showToast(`${space.id} selected as your preferred space.`); } }); holder.append(button); }); });
  const available = spaces.filter(s => s.status === 'available').length; $('availableMetric').textContent = available; const occupancy = Math.round((spaces.filter(s => s.status !== 'available').length / spaces.length) * 100); $('occupancyMetric').textContent = `${occupancy}%`; $('chartOccupancy').textContent = `${occupancy}%`;
}
function updateRecommendation(space = getRecommendation(), manual = false) {
  recommendation = space; const dest = $('destination').value; const distance = space.distances[dest]; $('recHeadline').innerHTML = `Your best spot is <strong>${space.id}</strong>`; $('recDescription').textContent = manual ? `Your selected space for the ${destinationNames[dest]}.` : `Closest available space to the ${destinationNames[dest]}.`; $('recSpot').textContent = space.id; $('recZone').textContent = zoneName(space); $('recDistance').textContent = `${distance} m away · ${walkTime(distance)} min walk`; $('reserveButton').innerHTML = `Reserve ${space.id} <span>→</span>`; $('routeTime').textContent = `${walkTime(distance)} min`; $('routeSteps').innerHTML = `<p><b>Current location</b><span>Campus entrance</span></p><p><b>Walk to ${space.id}</b><span>Enter ${zoneName(space).split(' · ')[0]} via ${space.zone === 'A' ? 'north' : 'central'} lane</span></p><p><b>Arrive at your destination</b><span>${destinationNames[dest]}</span></p>`; renderMap();
}
function reserve() { if (!recommendation || recommendation.status !== 'available') return; recommendation.status = 'reserved'; reservationId = recommendation.id; $('reserveButton').classList.add('hidden'); $('cancelButton').classList.remove('hidden'); $('reservationNote').textContent = `${recommendation.id} is reserved for you until 9:42 AM.`; renderMap(); showToast(`${recommendation.id} has been reserved — you're all set!`); }
function cancel() { const space = spaces.find(s => s.id === reservationId); if (!space) return; space.status = 'available'; reservationId = null; $('reserveButton').classList.remove('hidden'); $('cancelButton').classList.add('hidden'); $('reservationNote').textContent = 'Held for 10 minutes after reservation.'; updateRecommendation(getRecommendation()); showToast('Your reservation has been cancelled.'); }
function showToast(message) { const toast = $('toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => toast.classList.remove('show'), 3000); }
$('findSpot').addEventListener('click', () => { selectedId = null; updateRecommendation(); showToast(`Best available spot found for ${destinationNames[$('destination').value]}.`); document.querySelector('.recommendation-card').scrollIntoView({behavior:'smooth',block:'center'}); });
$('destination').addEventListener('change', () => { if (!reservationId) updateRecommendation(selectedId ? spaces.find(s => s.id === selectedId) : getRecommendation()); });
$('reserveButton').addEventListener('click', reserve); $('cancelButton').addEventListener('click', cancel); $('showRoute').addEventListener('click', () => $('route-panel').scrollIntoView({behavior:'smooth',block:'center'})); $('refreshMap').addEventListener('click', () => { showToast('Parking availability is up to date.'); renderMap(); }); document.querySelector('.menu-button').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
updateRecommendation();

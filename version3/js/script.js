// Section switcher
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active-section'));
    document.getElementById(sectionId).classList.add('active-section');
}

// --- Map ---
var map = L.map('mapid').setView([-27.4705, 153.0260], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample complaints data with heat effect
var complaints = [
    {lat: -27.47, lon: 153.02, count: 5},
    {lat: -27.48, lon: 153.03, count: 2},
    {lat: -27.46, lon: 153.01, count: 8}
];

complaints.forEach(c => {
    L.circle([c.lat, c.lon], {
        color: 'red',
        fillColor: '#ff4d4d',
        radius: c.count * 70,
        fillOpacity: 0.6
    }).addTo(map).bindPopup(`Complaints: ${c.count}`);
});

// --- Animal Identification (mock) ---
function identifyAnimal() {
    const fileInput = document.getElementById('animalUpload');
    if(fileInput.files.length === 0){
        alert('Please upload an image.');
        return;
    }
    const resultDiv = document.getElementById('animalResult');
    resultDiv.innerHTML = `
        <p><strong>Detected Animal: Koala</strong></p>
        <p>Koalas are marsupials native to Australia. Observe from a distance and avoid disturbing them.</p>
    `;
}

// --- Deterrent sounds ---
function playSound(type) {
    const audio = document.getElementById('audioPlayer');
    audio.style.display = 'block';
    if(type==='bird') audio.src='https://www.soundjay.com/nature/bird-1.mp3';
    if(type==='dog') audio.src='https://www.soundjay.com/animal/dog-bark-1.mp3';
    audio.play();
}

// ══════════════════════════════════════════════
//  APP — converted from React + TypeScript
// ══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initMap();
  initTable();
  initUploadForm();
  initRanking();
  initCharts();
});

// ── TABS ──────────────────────────────────────
function initTabs() {
  const tabs   = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById('tab-' + target).classList.add('active');

      // Lazy-init charts only when solutions tab opens
      if (target === 'solutions') renderCharts();
    });
  });
}

// ── INTERACTIVE MAP ───────────────────────────
let currentView = 'complaints';
let chartInstances = {};

function initMap() {
  renderMap();

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      renderMap();
    });
  });
}

function getComplaintColor(area) {
  const intensity = area.complaints / 312;
  if (intensity > 0.8) return '#dc2626';
  if (intensity > 0.6) return '#ea580c';
  if (intensity > 0.4) return '#f59e0b';
  return '#fbbf24';
}

function getDensityColor(area) {
  const density = (area.complaints / area.population) * 1000;
  if (density > 16) return '#1e40af';
  if (density > 14) return '#3b82f6';
  if (density > 12) return '#60a5fa';
  return '#93c5fd';
}

function getSize(area) {
  if (currentView === 'complaints') {
    return Math.max(4, (area.complaints / 312) * 10);
  } else {
    const density = (area.complaints / area.population) * 1000;
    return Math.max(4, (density / 20) * 10);
  }
}

function renderMap() {
  const svg     = document.getElementById('map-svg');
  const legend  = document.getElementById('map-legend');
  const tooltip = document.getElementById('map-tooltip');

  // Clear SVG
  svg.innerHTML = '';

  // Draw circles
  BRISBANE_AREAS.forEach(area => {
    const color  = currentView === 'complaints' ? getComplaintColor(area) : getDensityColor(area);
    const radius = getSize(area);
    const density = ((area.complaints / area.population) * 1000).toFixed(1);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', area.x);
    circle.setAttribute('cy', area.y);
    circle.setAttribute('r',  radius);
    circle.setAttribute('fill', color);
    circle.setAttribute('opacity', '0.7');
    circle.setAttribute('stroke', color);
    circle.setAttribute('stroke-width', '0.3');
    circle.style.cursor = 'pointer';
    circle.style.transition = 'opacity 0.2s';

    // Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', area.x);
    text.setAttribute('y', area.y + radius + 3);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '2');
    text.setAttribute('fill', '#374151');
    text.setAttribute('font-family', 'Syne, sans-serif');
    text.setAttribute('pointer-events', 'none');
    text.textContent = area.name;

    // Hover
    circle.addEventListener('mouseenter', (e) => {
      circle.setAttribute('opacity', '0.95');
      tooltip.innerHTML = `
        <strong>${area.name}</strong>
        Population: ${area.population.toLocaleString()}<br>
        Complaints: ${area.complaints}<br>
        Density: ${density} / 1k people
      `;
      tooltip.classList.remove('hidden');
      positionTooltip(e);
    });

    circle.addEventListener('mousemove', positionTooltip);

    circle.addEventListener('mouseleave', () => {
      circle.setAttribute('opacity', '0.7');
      tooltip.classList.add('hidden');
    });

    svg.appendChild(circle);
    svg.appendChild(text);
  });

  // Legend
  if (currentView === 'complaints') {
    legend.innerHTML = `
      <h4>Complaints</h4>
      <div class="legend-item"><div class="legend-dot" style="background:#dc2626"></div> 250+</div>
      <div class="legend-item"><div class="legend-dot" style="background:#ea580c"></div> 190–250</div>
      <div class="legend-item"><div class="legend-dot" style="background:#f59e0b"></div> 130–190</div>
      <div class="legend-item"><div class="legend-dot" style="background:#fbbf24"></div> &lt;130</div>
    `;
  } else {
    legend.innerHTML = `
      <h4>Density / 1k</h4>
      <div class="legend-item"><div class="legend-dot" style="background:#1e40af"></div> &gt;16</div>
      <div class="legend-item"><div class="legend-dot" style="background:#3b82f6"></div> 14–16</div>
      <div class="legend-item"><div class="legend-dot" style="background:#60a5fa"></div> 12–14</div>
      <div class="legend-item"><div class="legend-dot" style="background:#93c5fd"></div> &lt;12</div>
    `;
  }
}

function positionTooltip(e) {
  const tooltip = document.getElementById('map-tooltip');
  const wrap    = document.querySelector('.map-wrap');
  const rect    = wrap.getBoundingClientRect();
  let x = e.clientX - rect.left + 12;
  let y = e.clientY - rect.top  - 10;
  // Keep in bounds
  if (x + 180 > rect.width)  x -= 200;
  if (y + 100 > rect.height) y -= 90;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}

// ── DATA TABLE ────────────────────────────────
let tableSort = { key: 'density', dir: 'desc' };
let tableData = [...TABLE_DATA];

function initTable() {
  renderTable();

  document.querySelectorAll('#data-table th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (tableSort.key === col) {
        tableSort.dir = tableSort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        tableSort.key = col;
        tableSort.dir = 'desc';
      }
      renderTable();
    });
  });
}

function renderTable() {
  const { key, dir } = tableSort;

  const sorted = [...tableData].sort((a, b) => {
    const av = a[key], bv = b[key];
    if (typeof av === 'string') {
      return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return dir === 'asc' ? av - bv : bv - av;
  });

  const tbody = document.getElementById('table-body');
  tbody.innerHTML = sorted.map((row, i) => {
    const densityClass = row.density > 16 ? 'density-high' : row.density > 14 ? 'density-medium' : 'density-low';
    return `
      <tr>
        <td>
          <div class="area-cell">
            <div class="area-rank">${i + 1}</div>
            <span>${row.area}</span>
          </div>
        </td>
        <td class="right">${row.population.toLocaleString()}</td>
        <td class="right"><span class="complaint-badge">${row.complaints}</span></td>
        <td class="right"><span class="density-val ${densityClass}">${row.density}</span></td>
      </tr>
    `;
  }).join('');

  const footer = document.getElementById('table-footer');
  const total  = sorted.reduce((s, r) => s + r.complaints, 0);
  footer.innerHTML = `<span>Showing ${sorted.length} areas</span><span>Total Complaints: ${total.toLocaleString()}</span>`;
}

// ── UPLOAD FORM ───────────────────────────────
function initUploadForm() {
  const form      = document.getElementById('complaint-form');
  const zone      = document.getElementById('upload-zone');
  const fileInput = document.getElementById('photo-file');
  const preview   = document.getElementById('photo-preview');
  const inner     = document.getElementById('upload-inner');
  const toast     = document.getElementById('form-toast');

  zone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      preview.src = reader.result;
      preview.classList.remove('hidden');
      inner.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const animalType = document.getElementById('animal-type').value;
    const location   = document.getElementById('location').value;

    if (!animalType || !location) return;

    toast.textContent = `✅ Complaint submitted! Animal Type: ${animalType}, Location: ${location}`;
    toast.classList.remove('hidden');

    form.reset();
    preview.classList.add('hidden');
    inner.classList.remove('hidden');

    // Update total complaints counter
    const totalEl = document.getElementById('stat-total');
    const current = parseInt(totalEl.textContent.replace(/,/g, ''));
    totalEl.textContent = (current + 1).toLocaleString();

    setTimeout(() => toast.classList.add('hidden'), 4000);
  });
}

// ── ANIMAL RANKING ────────────────────────────
function initRanking() {
  const list = document.getElementById('ranking-list');
  const rankClasses = ['gold', 'silver', 'bronze', 'other', 'other'];

  list.innerHTML = ANIMAL_RANKINGS.map((item, i) => {
    const sign = item.change > 0 ? '+' : '';
    const changeClass = item.change > 0 ? 'up' : 'down';
    return `
      <div class="rank-item">
        <div class="rank-num ${rankClasses[i]}">${item.rank}</div>
        <img class="rank-img" src="${item.img}" alt="${item.name}" onerror="this.style.background='#e5e7eb';this.removeAttribute('src')" />
        <div class="rank-info">
          <div class="rank-name">${item.name}</div>
          <div class="rank-sub">${item.animal}</div>
        </div>
        <div class="rank-stats">
          <div class="rank-count">${item.complaints.toLocaleString()}</div>
          <div class="rank-change ${changeClass}">${sign}${item.change}%</div>
        </div>
      </div>
    `;
  }).join('');
}

// ── CHARTS (Chart.js) ─────────────────────────
let chartsRendered = false;

function initCharts() {
  // Charts render lazily when tab opens
}

function renderCharts() {
  if (chartsRendered) return;
  chartsRendered = true;

  renderScatterChart();
  renderSolutionsChart();
  renderPriorityChart();
  renderTimelineChart();
  renderSolutionBars();
}

function renderScatterChart() {
  const ctx = document.getElementById('scatter-chart').getContext('2d');
  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Area',
        data: CORRELATION_DATA.map(d => ({ x: d.population, y: d.complaints, area: d.area, density: d.density })),
        backgroundColor: 'rgba(139,92,246,0.65)',
        pointRadius: 10,
        pointHoverRadius: 14,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const d = ctx.raw;
              return [`${d.area}`, `Population: ${d.x.toLocaleString()}`, `Complaints: ${d.y}`, `Density: ${d.density}/1k`];
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Population', font: { family: 'Syne' } },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          title: { display: true, text: 'Complaints', font: { family: 'Syne' } },
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      }
    }
  });
}

function renderSolutionsChart() {
  const ctx = document.getElementById('solutions-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: SOLUTION_DATA.map(d => d.solution),
      datasets: [{
        label: 'Votes',
        data: SOLUTION_DATA.map(d => d.votes),
        backgroundColor: 'rgba(37,99,235,0.75)',
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' } }
      }
    }
  });
}

function renderPriorityChart() {
  const ctx = document.getElementById('priority-chart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: PRIORITY_DATA.map(d => d.name),
      datasets: [{
        data: PRIORITY_DATA.map(d => d.value),
        backgroundColor: PRIORITY_DATA.map(d => d.color),
        borderWidth: 2,
        borderColor: '#fff',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'DM Mono', size: 11 } } }
      }
    }
  });
}

function renderTimelineChart() {
  const ctx = document.getElementById('timeline-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: TIMELINE_DATA.map(d => d.month),
      datasets: [{
        label: 'Complaints',
        data: TIMELINE_DATA.map(d => d.complaints),
        backgroundColor: 'rgba(139,92,246,0.75)',
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' } }
      }
    }
  });
}

function renderSolutionBars() {
  const max  = Math.max(...SOLUTION_DATA.map(d => d.votes));
  const container = document.getElementById('solution-bars');
  container.innerHTML = SOLUTION_DATA.map(d => `
    <div class="sol-row">
      <span class="sol-label">${d.solution}</span>
      <div class="sol-bar-wrap">
        <div class="sol-bar" style="width:${(d.votes / max) * 100}%"></div>
      </div>
      <span class="sol-count">${d.votes}</span>
    </div>
  `).join('');
}

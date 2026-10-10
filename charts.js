// DIGIPULSE Chart.js Visualizations Manager
class DigiPulseCharts {
  constructor() {
    this.instances = {};
  }

  isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  getTextColor() {
    return this.isDark() ? '#94a3b8' : '#64748b';
  }

  getGridColor() {
    return this.isDark() ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  }

  destroyChart(key) {
    if (this.instances[key]) {
      this.instances[key].destroy();
      delete this.instances[key];
    }
  }

  // 1. Blood Pressure Trends Chart
  renderBpChart(canvasId, records) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    const labels = records.map(r => r.date || r.recorded_at?.split('T')[0] || '').reverse();
    const systolicData = records.map(r => r.systolic).reverse();
    const diastolicData = records.map(r => r.diastolic).reverse();

    this.instances[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Systolic (mmHg)',
            data: systolicData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 3,
            tension: 0.35,
            fill: false,
            pointBackgroundColor: '#ef4444',
            pointRadius: 4
          },
          {
            label: 'Diastolic (mmHg)',
            data: diastolicData,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            borderWidth: 3,
            tension: 0.35,
            fill: false,
            pointBackgroundColor: '#0284c7',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: this.getTextColor(), font: { family: 'Outfit', weight: '600' } }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { family: 'Outfit' }
          }
        },
        scales: {
          y: {
            min: 50,
            max: 180,
            grid: { color: this.getGridColor() },
            ticks: { color: this.getTextColor() }
          },
          x: {
            grid: { color: this.getGridColor() },
            ticks: { color: this.getTextColor() }
          }
        }
      }
    });
  }

  // 2. Weight & BMI Trends Chart
  renderWeightChart(canvasId, records, targetWeight = 65) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    const labels = records.map(r => r.date || r.recorded_at?.split('T')[0] || '').reverse();
    const weights = records.map(r => r.weight_kg).reverse();
    const targetLine = Array(weights.length).fill(targetWeight);

    this.instances[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Logged Weight (kg)',
            data: weights,
            borderColor: '#059669',
            backgroundColor: 'rgba(5, 150, 105, 0.15)',
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#059669',
            pointRadius: 5
          },
          {
            label: `Goal Target (${targetWeight} kg)`,
            data: targetLine,
            borderColor: '#94a3b8',
            borderDash: [6, 6],
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: this.getTextColor(), font: { family: 'Outfit' } } }
        },
        scales: {
          y: {
            grid: { color: this.getGridColor() },
            ticks: { color: this.getTextColor() }
          },
          x: {
            grid: { color: this.getGridColor() },
            ticks: { color: this.getTextColor() }
          }
        }
      }
    });
  }

  // 3. Water Intake Bar Chart
  renderWaterChart(canvasId, records, targetMl = 2500) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    const labels = records.map(r => r.date).reverse();
    const amounts = records.map(r => r.amount_ml).reverse();

    this.instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Water Intake (mL)',
          data: amounts,
          backgroundColor: '#38bdf8',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: this.getTextColor(), font: { family: 'Outfit' } } }
        },
        scales: {
          y: {
            grid: { color: this.getGridColor() },
            ticks: { color: this.getTextColor() }
          },
          x: {
            grid: { display: false },
            ticks: { color: this.getTextColor() }
          }
        }
      }
    });
  }

  // 4. Physical Activity (Steps) Chart
  renderActivityChart(canvasId, records, targetSteps = 10000) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    const labels = records.map(r => r.date).reverse();
    const steps = records.map(r => r.steps).reverse();

    this.instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Daily Steps',
            data: steps,
            backgroundColor: '#10b981',
            borderRadius: 6
          },
          {
            type: 'line',
            label: `Goal (${targetSteps.toLocaleString()} steps)`,
            data: Array(steps.length).fill(targetSteps),
            borderColor: '#f59e0b',
            borderDash: [5, 5],
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: this.getTextColor() } }
        },
        scales: {
          y: {
            grid: { color: this.getGridColor() },
            ticks: { color: this.getTextColor() }
          },
          x: {
            grid: { display: false },
            ticks: { color: this.getTextColor() }
          }
        }
      }
    });
  }

  // 5. Sleep Trends Chart
  renderSleepChart(canvasId, records) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    const labels = records.map(r => r.date).reverse();
    const hours = records.map(r => r.hours).reverse();

    this.instances[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Sleep Duration (Hours)',
          data: hours,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#8b5cf6',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: this.getTextColor() } }
        },
        scales: {
          y: {
            min: 4,
            max: 12,
            grid: { color: this.getGridColor() },
            ticks: { color: this.getTextColor() }
          },
          x: {
            grid: { color: this.getGridColor() },
            ticks: { color: this.getTextColor() }
          }
        }
      }
    });
  }

  // Update theme on all active charts
  updateTheme() {
    Object.keys(this.instances).forEach(key => {
      const chart = this.instances[key];
      if (chart && chart.options) {
        if (chart.options.plugins?.legend?.labels) {
          chart.options.plugins.legend.labels.color = this.getTextColor();
        }
        if (chart.options.scales?.y) {
          chart.options.scales.y.grid.color = this.getGridColor();
          chart.options.scales.y.ticks.color = this.getTextColor();
        }
        if (chart.options.scales?.x) {
          if (chart.options.scales.x.grid) chart.options.scales.x.grid.color = this.getGridColor();
          chart.options.scales.x.ticks.color = this.getTextColor();
        }
        chart.update();
      }
    });
  }
}

window.digiCharts = new DigiPulseCharts();

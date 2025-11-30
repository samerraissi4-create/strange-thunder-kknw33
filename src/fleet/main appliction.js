// Global application state
class FleetAIApp {
  constructor() {
    this.dataManager = new DataManager();
    this.tradingEngine = new TradingEngine();
    this.charts = new Map();

    this.initializeApp();
  }

  initializeApp() {
    this.initializeCharts();
    this.setupEventListeners();
    this.startBackgroundTasks();
  }

  initializeCharts() {
    this.initializePerformanceChart();
    this.initializeRiskChart();
  }

  initializePerformanceChart() {
    const ctx = document.getElementById("performanceChart");
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Total Profit",
            data: [],
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Success Rate",
            data: [],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Trading Performance",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    this.charts.set("performance", chart);
  }

  initializeRiskChart() {
    const ctx = document.getElementById("riskChart");
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: this.dataManager.bots.map((bot) => bot.name),
        datasets: [
          {
            label: "Risk Level",
            data: this.dataManager.bots.map((bot) => bot.riskLevel * 100),
            backgroundColor: this.dataManager.bots.map((bot) =>
              bot.riskLevel > 0.7
                ? "#ef4444"
                : bot.riskLevel > 0.4
                ? "#f59e0b"
                : "#10b981"
            ),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Bot Risk Distribution",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Risk Level %",
            },
          },
        },
      },
    });

    this.charts.set("risk", chart);
  }

  updateCharts() {
    const performanceChart = this.charts.get("performance");
    const riskChart = this.charts.get("risk");

    if (performanceChart) {
      const stats = this.dataManager.getOverallStats();
      const labels = performanceChart.data.labels;
      const profitData = performanceChart.data.datasets[0].data;
      const successData = performanceChart.data.datasets[1].data;

      // Add new data point
      labels.push(new Date().toLocaleTimeString());
      profitData.push(stats.totalProfit);
      successData.push(stats.successRate);

      // Keep only last 20 points
      if (labels.length > 20) {
        labels.shift();
        profitData.shift();
        successData.shift();
      }

      performanceChart.update("none");
    }

    if (riskChart) {
      riskChart.data.datasets[0].data = this.dataManager.bots.map(
        (bot) => bot.riskLevel * 100
      );
      riskChart.update("none");
    }
  }

  setupEventListeners() {
    // Global keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            this.tradingEngine.startAllBots();
            break;
          case "e":
            e.preventDefault();
            this.tradingEngine.stopAllBots();
            break;
          case "r":
            e.preventDefault();
            this.resetApplication();
            break;
        }
      }
    });

    // Page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.refreshAllData();
      }
    });
  }

  startBackgroundTasks() {
    // Update charts every 5 seconds
    setInterval(() => {
      this.updateCharts();
    }, 5000);

    // Refresh data every 30 seconds
    setInterval(() => {
      this.refreshAllData();
    }, 30000);
  }

  refreshAllData() {
    this.tradingEngine.renderBots();
    this.tradingEngine.updateStats();
    this.tradingEngine.renderMarketData();
    this.tradingEngine.renderAIActivity();
    this.updateCharts();
  }

  resetApplication() {
    if (
      confirm(
        "Are you sure you want to reset all trading data? This cannot be undone."
      )
    ) {
      this.dataManager.resetData();
      this.tradingEngine.stopAllBots();
      this.refreshAllData();

      // Show confirmation
      alert("Application data has been reset successfully.");
    }
  }

  exportData() {
    const data = {
      bots: this.dataManager.bots,
      tradingHistory: this.dataManager.tradingHistory,
      aiDecisions: this.dataManager.aiDecisions,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fleet-ai-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // Validate and import data
        if (data.bots && data.tradingHistory && data.aiDecisions) {
          this.dataManager.bots = data.bots;
          this.dataManager.tradingHistory = data.tradingHistory;
          this.dataManager.aiDecisions = data.aiDecisions;
          this.dataManager.saveData();
          this.refreshAllData();
          alert("Data imported successfully!");
        } else {
          alert("Invalid data format.");
        }
      } catch (error) {
        alert("Error importing data: " + error.message);
      }
    };
    reader.readAsText(file);
  }
}

// Additional utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatPercent(value) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  window.fleetAIApp = new FleetAIApp();

  // Global error handler
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error);
  });

  // Unhandled promise rejection handler
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });
});

// Service Worker registration for offline functionality
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      console.log("SW registered: ", registration);
    })
    .catch((registrationError) => {
      console.log("SW registration failed: ", registrationError);
    });
}

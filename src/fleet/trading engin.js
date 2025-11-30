class TradingEngine {
  constructor() {
    this.dataManager = new DataManager();
    this.isRunning = false;
    this.tradingInterval = null;
    this.marketUpdateInterval = null;
    this.aiAgent = new AIAgent(this.dataManager);
  }

  async initialize() {
    await this.updateMarketData();
    this.startMarketUpdates();
    this.renderInitialState();
  }

  startMarketUpdates() {
    this.marketUpdateInterval = setInterval(() => {
      this.updateMarketData();
    }, 5000); // Update every 5 seconds
  }

  async updateMarketData() {
    // Simulate market data
    const symbols = ["BTC/USD", "ETH/USD", "ADA/USD", "DOT/USD", "LINK/USD"];
    const marketData = {};

    symbols.forEach((symbol) => {
      const basePrice = this.getBasePrice(symbol);
      const volatility = this.getVolatility(symbol);
      const change = (Math.random() - 0.5) * volatility;
      const price = basePrice * (1 + change);
      const changePercent = change * 100;

      marketData[symbol] = {
        symbol,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(changePercent.toFixed(2)),
        volume: Math.random() * 1000000,
        timestamp: new Date().toISOString(),
      };
    });

    this.dataManager.marketData = marketData;
    this.dataManager.saveData();
    this.renderMarketData();
  }

  getBasePrice(symbol) {
    const bases = {
      "BTC/USD": 45000,
      "ETH/USD": 3200,
      "ADA/USD": 1.2,
      "DOT/USD": 25,
      "LINK/USD": 18,
    };
    return bases[symbol] || 100;
  }

  getVolatility(symbol) {
    const volatilities = {
      "BTC/USD": 0.02,
      "ETH/USD": 0.03,
      "ADA/USD": 0.05,
      "DOT/USD": 0.04,
      "LINK/USD": 0.06,
    };
    return volatilities[symbol] || 0.03;
  }

  async startAllBots() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.dataManager.bots.forEach((bot) => {
      this.dataManager.updateBot(bot.id, { status: "active" });
    });

    this.dataManager.addAIDecision({
      type: "system",
      message: "All trading bots activated",
      confidence: 95,
    });

    this.startTradingCycle();
    this.renderBots();
    this.updateStats();

    // AI Agent starts monitoring
    this.aiAgent.startMonitoring();
  }

  async stopAllBots() {
    this.isRunning = false;

    if (this.tradingInterval) {
      clearInterval(this.tradingInterval);
      this.tradingInterval = null;
    }

    this.dataManager.bots.forEach((bot) => {
      this.dataManager.updateBot(bot.id, { status: "inactive" });
    });

    this.dataManager.addAIDecision({
      type: "emergency",
      message: "EMERGENCY STOP: All trading bots deactivated",
      confidence: 100,
    });

    this.renderBots();
    this.updateStats();

    // AI Agent stops monitoring
    this.aiAgent.stopMonitoring();
  }

  startTradingCycle() {
    this.tradingInterval = setInterval(() => {
      this.executeTradingCycle();
    }, 3000); // Trade every 3 seconds
  }

  async executeTradingCycle() {
    const activeBots = this.dataManager.bots.filter(
      (bot) => bot.status === "active"
    );

    for (const bot of activeBots) {
      await this.executeBotTrade(bot);
    }

    this.updateStats();
    this.renderBots();

    // AI makes strategic decisions
    this.aiAgent.makeStrategicDecisions();
  }

  async executeBotTrade(bot) {
    const marketConditions = this.analyzeMarketConditions();
    const tradeDecision = this.generateTradeDecision(bot, marketConditions);

    if (tradeDecision.execute) {
      const profit = this.calculateTradeProfit(bot, tradeDecision);
      const success = profit > 0;

      // Update bot metrics
      const performance = this.dataManager.getBotPerformance(bot.id);
      const newTrades = performance.totalTrades + 1;
      const newProfitableTrades =
        performance.profitableTrades + (success ? 1 : 0);
      const newSuccessRate = (newProfitableTrades / newTrades) * 100;
      const newTotalProfit = performance.totalProfit + profit;

      this.dataManager.updateBot(bot.id, {
        profit: newTotalProfit,
        trades: newTrades,
        successRate: parseFloat(newSuccessRate.toFixed(2)),
        performance: this.calculatePerformanceScore(
          bot,
          newSuccessRate,
          profit
        ),
      });

      // Record trade
      this.dataManager.addTrade({
        botId: bot.id,
        botName: bot.name,
        symbol: tradeDecision.symbol,
        type: tradeDecision.type,
        amount: tradeDecision.amount,
        profit: profit,
        success: success,
        timestamp: new Date().toISOString(),
      });

      // AI learns from trade
      this.aiAgent.learnFromTrade(bot.id, tradeDecision, profit);
    }
  }

  analyzeMarketConditions() {
    const conditions = {
      volatility: Math.random(),
      trend: (Math.random() - 0.5) * 2,
      volume: Math.random(),
      marketSentiment: Math.random(),
    };
    return conditions;
  }

  generateTradeDecision(bot, marketConditions) {
    let execute = false;
    let type = "buy";
    let confidence = 0;

    switch (bot.type) {
      case "arbitrage":
        execute = marketConditions.volatility > 0.3;
        type = Math.random() > 0.5 ? "buy" : "sell";
        confidence = marketConditions.volatility * 80;
        break;
      case "momentum":
        execute = Math.abs(marketConditions.trend) > 0.2;
        type = marketConditions.trend > 0 ? "buy" : "sell";
        confidence = Math.abs(marketConditions.trend) * 90;
        break;
      case "market_making":
        execute = marketConditions.volume > 0.4;
        type = Math.random() > 0.5 ? "buy" : "sell";
        confidence = marketConditions.volume * 70;
        break;
      case "scalping":
        execute = marketConditions.volatility > 0.2;
        type = Math.random() > 0.7 ? "buy" : "sell";
        confidence = marketConditions.volatility * 85;
        break;
      case "ai_adaptive":
        execute = this.aiAgent.shouldTrade(bot.id, marketConditions);
        type = this.aiAgent.getTradeType(bot.id, marketConditions);
        confidence = this.aiAgent.getConfidence(bot.id);
        break;
    }

    return {
      execute: execute && confidence > 50,
      type,
      symbol: this.getRandomSymbol(),
      amount: 100 + Math.random() * 400,
      confidence: Math.round(confidence),
    };
  }

  calculateTradeProfit(bot, decision) {
    const baseProfit = decision.confidence / 10;
    const riskAdjustment = 1 - bot.riskLevel;
    const marketMultiplier = 1 + (Math.random() - 0.5);
    const profit = baseProfit * riskAdjustment * marketMultiplier - 0.5;

    return parseFloat(profit.toFixed(2));
  }

  calculatePerformanceScore(bot, successRate, recentProfit) {
    const successWeight = 0.6;
    const profitWeight = 0.4;
    return parseFloat(
      (
        successRate * successWeight +
        Math.max(0, recentProfit * 10) * profitWeight
      ).toFixed(1)
    );
  }

  getRandomSymbol() {
    const symbols = Object.keys(this.dataManager.marketData);
    return symbols[Math.floor(Math.random() * symbols.length)] || "BTC/USD";
  }

  // Rendering methods
  renderInitialState() {
    this.renderBots();
    this.renderMarketData();
    this.updateStats();
    this.renderAIActivity();
  }

  renderBots() {
    const botsGrid = document.getElementById("botsGrid");
    if (!botsGrid) return;

    botsGrid.innerHTML = this.dataManager.bots
      .map(
        (bot) => `
            <div class="bot-card">
                <div class="bot-header">
                    <div class="bot-name">${bot.name}</div>
                    <div class="bot-status ${bot.status}">${bot.status}</div>
                </div>
                <div class="bot-metrics">
                    <div class="metric">
                        <div class="metric-label">Profit</div>
                        <div class="metric-value">$${bot.profit.toFixed(
                          2
                        )}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Success Rate</div>
                        <div class="metric-value">${bot.successRate.toFixed(
                          1
                        )}%</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Trades</div>
                        <div class="metric-value">${bot.trades}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Performance</div>
                        <div class="metric-value">${bot.performance}</div>
                    </div>
                </div>
                <div class="bot-actions">
                    <button class="btn ${
                      bot.status === "active" ? "btn-danger" : "btn-success"
                    }" 
                            onclick="tradingEngine.toggleBot(${bot.id})">
                        ${bot.status === "active" ? "Stop" : "Start"}
                    </button>
                    <button class="btn btn-warning" onclick="tradingEngine.optimizeBot(${
                      bot.id
                    })">
                        Optimize
                    </button>
                </div>
            </div>
        `
      )
      .join("");
  }

  renderMarketData() {
    const marketDataEl = document.getElementById("marketData");
    if (!marketDataEl) return;

    marketDataEl.innerHTML = Object.values(this.dataManager.marketData)
      .map(
        (asset) => `
            <div class="market-item">
                <div class="market-symbol">${asset.symbol}</div>
                <div class="market-price">$${asset.price.toLocaleString()}</div>
                <div class="market-change ${
                  asset.change >= 0 ? "positive" : "negative"
                }">
                    ${asset.change >= 0 ? "+" : ""}${asset.change.toFixed(2)}%
                </div>
            </div>
        `
      )
      .join("");
  }

  updateStats() {
    const stats = this.dataManager.getOverallStats();

    // Update DOM elements
    const elements = {
      totalProfit: `$${stats.totalProfit.toFixed(2)}`,
      activeBots: `${stats.activeBots}/${stats.totalBots}`,
      successRate: `${stats.successRate.toFixed(1)}%`,
      aiConfidence: `${this.aiAgent.getOverallConfidence()}%`,
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }

  renderAIActivity() {
    const activityEl = document.getElementById("aiActivity");
    if (!activityEl) return;

    const recentDecisions = this.dataManager.aiDecisions.slice(0, 10);
    activityEl.innerHTML = recentDecisions
      .map(
        (decision) => `
            <div class="activity-item">
                <span class="activity-time">${this.formatTime(
                  decision.timestamp
                )}</span>
                <span class="activity-message">${decision.message}</span>
            </div>
        `
      )
      .join("");
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString();
  }

  // Public methods
  toggleBot(botId) {
    const bot = this.dataManager.bots.find((b) => b.id === botId);
    if (bot) {
      const newStatus = bot.status === "active" ? "inactive" : "active";
      this.dataManager.updateBot(botId, { status: newStatus });

      this.dataManager.addAIDecision({
        type: "bot_control",
        message: `${bot.name} ${
          newStatus === "active" ? "activated" : "deactivated"
        }`,
        confidence: 90,
      });

      this.renderBots();
      this.updateStats();
      this.renderAIActivity();
    }
  }

  optimizeBot(botId) {
    const optimization = this.aiAgent.optimizeBot(botId);
    this.dataManager.addAIDecision({
      type: "optimization",
      message: `AI optimized ${optimization.botName}: ${optimization.message}`,
      confidence: optimization.confidence,
    });

    this.renderBots();
    this.renderAIActivity();
  }
}

// Initialize trading engine when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.tradingEngine = new TradingEngine();
  tradingEngine.initialize();
});

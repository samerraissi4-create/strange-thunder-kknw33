class DataManager {
  constructor() {
    this.storageKey = "fleetAI_data";
    this.defaultData = {
      bots: [
        {
          id: 1,
          name: "Alpha Arbitrage",
          type: "arbitrage",
          status: "inactive",
          strategy: "Multi-Exchange Arbitrage",
          profit: 0,
          trades: 0,
          successRate: 0,
          riskLevel: 0.3,
          performance: 0,
        },
        {
          id: 2,
          name: "Beta Momentum",
          type: "momentum",
          status: "inactive",
          strategy: "Trend Following",
          profit: 0,
          trades: 0,
          successRate: 0,
          riskLevel: 0.5,
          performance: 0,
        },
        {
          id: 3,
          name: "Gamma Market Maker",
          type: "market_making",
          status: "inactive",
          strategy: "Liquidity Provision",
          profit: 0,
          trades: 0,
          successRate: 0,
          riskLevel: 0.4,
          performance: 0,
        },
        {
          id: 4,
          name: "Delta Scalper",
          type: "scalping",
          status: "inactive",
          strategy: "High-Frequency Trading",
          profit: 0,
          trades: 0,
          successRate: 0,
          riskLevel: 0.6,
          performance: 0,
        },
        {
          id: 5,
          name: "Epsilon AI",
          type: "ai_adaptive",
          status: "inactive",
          strategy: "Neural Network Adaptive",
          profit: 0,
          trades: 0,
          successRate: 0,
          riskLevel: 0.7,
          performance: 0,
        },
      ],
      tradingHistory: [],
      aiDecisions: [],
      marketData: {},
      settings: {
        riskManagement: true,
        autoRebalance: true,
        maxDrawdown: 0.1,
        dailyTarget: 0.05,
      },
    };

    this.loadData();
  }

  loadData() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      Object.assign(this, JSON.parse(saved));
    } else {
      Object.assign(this, this.defaultData);
      this.saveData();
    }
  }

  saveData() {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify({
        bots: this.bots,
        tradingHistory: this.tradingHistory,
        aiDecisions: this.aiDecisions,
        marketData: this.marketData,
        settings: this.settings,
      })
    );
  }

  updateBot(botId, updates) {
    const bot = this.bots.find((b) => b.id === botId);
    if (bot) {
      Object.assign(bot, updates);
      this.saveData();
      return true;
    }
    return false;
  }

  addTrade(trade) {
    this.tradingHistory.unshift({
      ...trade,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    });

    // Keep only last 1000 trades
    if (this.tradingHistory.length > 1000) {
      this.tradingHistory = this.tradingHistory.slice(0, 1000);
    }

    this.saveData();
  }

  addAIDecision(decision) {
    this.aiDecisions.unshift({
      ...decision,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 decisions
    if (this.aiDecisions.length > 100) {
      this.aiDecisions = this.aiDecisions.slice(0, 100);
    }

    this.saveData();
  }

  getBotPerformance(botId) {
    const botTrades = this.tradingHistory.filter((t) => t.botId === botId);
    const totalTrades = botTrades.length;
    const profitableTrades = botTrades.filter((t) => t.profit > 0).length;
    const totalProfit = botTrades.reduce((sum, t) => sum + t.profit, 0);

    return {
      totalTrades,
      profitableTrades,
      successRate: totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0,
      totalProfit,
    };
  }

  getOverallStats() {
    const allTrades = this.tradingHistory;
    const totalTrades = allTrades.length;
    const profitableTrades = allTrades.filter((t) => t.profit > 0).length;
    const totalProfit = allTrades.reduce((sum, t) => sum + t.profit, 0);
    const activeBots = this.bots.filter((b) => b.status === "active").length;

    return {
      totalProfit,
      activeBots,
      totalBots: this.bots.length,
      successRate: totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0,
      totalTrades,
    };
  }

  resetData() {
    Object.assign(this, this.defaultData);
    this.saveData();
    return true;
  }
}

class AIAgent {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.monitoringInterval = null;
    this.botModels = new Map();
    this.marketAnalysis = {};
    this.overallConfidence = 75;

    this.initializeBotModels();
  }

  initializeBotModels() {
    this.dataManager.bots.forEach((bot) => {
      this.botModels.set(bot.id, {
        learningRate: 0.1,
        tradeHistory: [],
        performanceMetrics: {
          winRate: 0,
          avgProfit: 0,
          riskAdjustedReturn: 0,
        },
        adaptationFactor: 1.0,
        lastOptimization: null,
      });
    });
  }

  startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.analyzeMarketConditions();
      this.assessPortfolioHealth();
      this.makeStrategicDecisions();
    }, 10000); // Analyze every 10 seconds

    this.dataManager.addAIDecision({
      type: "system",
      message: "AI Agent started continuous market monitoring",
      confidence: 95,
    });
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  analyzeMarketConditions() {
    const marketData = this.dataManager.marketData;
    let totalVolatility = 0;
    let totalVolume = 0;
    let priceChanges = [];

    Object.values(marketData).forEach((asset) => {
      totalVolatility += Math.abs(asset.change);
      totalVolume += asset.volume;
      priceChanges.push(asset.change);
    });

    const avgVolatility = totalVolatility / Object.keys(marketData).length;
    const marketTrend =
      priceChanges.reduce((sum, change) => sum + change, 0) /
      priceChanges.length;
    const volumeStrength =
      totalVolume / (1000000 * Object.keys(marketData).length);

    this.marketAnalysis = {
      volatility: avgVolatility,
      trend: marketTrend,
      volume: volumeStrength,
      sentiment: this.calculateMarketSentiment(marketTrend, avgVolatility),
      timestamp: new Date().toISOString(),
    };

    // Adjust confidence based on market conditions
    this.updateConfidence();
  }

  calculateMarketSentiment(trend, volatility) {
    if (trend > 0.5 && volatility < 0.03) return "strong_bull";
    if (trend > 0.2 && volatility < 0.05) return "bull";
    if (trend < -0.5 && volatility > 0.08) return "strong_bear";
    if (trend < -0.2 && volatility > 0.05) return "bear";
    return "neutral";
  }

  updateConfidence() {
    const { volatility, trend, volume } = this.marketAnalysis;

    let confidence = 75; // Base confidence

    // Adjust based on market conditions
    if (volatility < 0.04) confidence += 10; // Low volatility -> higher confidence
    if (Math.abs(trend) > 0.3) confidence += 5; // Clear trend -> higher confidence
    if (volume > 0.7) confidence += 5; // High volume -> higher confidence
    if (volatility > 0.08) confidence -= 15; // High volatility -> lower confidence

    this.overallConfidence = Math.max(20, Math.min(95, confidence));
  }

  assessPortfolioHealth() {
    const stats = this.dataManager.getOverallStats();
    const activeBots = this.dataManager.bots.filter(
      (bot) => bot.status === "active"
    );

    let healthScore = 100;
    let recommendations = [];

    // Check success rate
    if (stats.successRate < 40) {
      healthScore -= 30;
      recommendations.push(
        "Low success rate detected. Consider strategy adjustment."
      );
    }

    // Check drawdown
    const losingBots = activeBots.filter((bot) => bot.profit < 0).length;
    if (losingBots > activeBots.length * 0.6) {
      healthScore -= 25;
      recommendations.push(
        "Multiple bots in drawdown. Review risk parameters."
      );
    }

    // Check correlation
    if (this.detectHighCorrelation()) {
      healthScore -= 20;
      recommendations.push(
        "High correlation detected between bots. Diversification needed."
      );
    }

    // Make recommendations if health score is low
    if (healthScore < 70 && recommendations.length > 0) {
      this.dataManager.addAIDecision({
        type: "portfolio_health",
        message: `Portfolio health: ${healthScore}/100. ${recommendations[0]}`,
        confidence: 85,
      });
    }
  }

  detectHighCorrelation() {
    // Simplified correlation detection
    const recentTrades = this.dataManager.tradingHistory.slice(0, 50);
    const tradeDirections = recentTrades.map((t) => (t.success ? 1 : -1));
    const correlation = Math.abs(
      tradeDirections.reduce((a, b) => a + b, 0) / tradeDirections.length
    );

    return correlation > 0.7;
  }

  makeStrategicDecisions() {
    const { sentiment, volatility, trend } = this.marketAnalysis;

    // Market condition based decisions
    switch (sentiment) {
      case "strong_bull":
        this.activateAggressiveStrategies();
        break;
      case "bull":
        this.activateGrowthStrategies();
        break;
      case "bear":
        this.activateDefensiveStrategies();
        break;
      case "strong_bear":
        this.activateHedgingStrategies();
        break;
      default:
        this.activateBalancedStrategies();
    }

    // Risk management decisions
    if (volatility > 0.08) {
      this.adjustRiskParameters(-0.1);
    } else if (volatility < 0.03) {
      this.adjustRiskParameters(0.05);
    }
  }

  activateAggressiveStrategies() {
    this.dataManager.bots.forEach((bot) => {
      if (bot.status === "active") {
        this.dataManager.updateBot(bot.id, {
          riskLevel: Math.min(0.9, bot.riskLevel + 0.1),
        });
      }
    });

    this.dataManager.addAIDecision({
      type: "strategy",
      message: "Bull market detected: Activated aggressive trading strategies",
      confidence: 80,
    });
  }

  activateDefensiveStrategies() {
    this.dataManager.bots.forEach((bot) => {
      if (bot.status === "active") {
        this.dataManager.updateBot(bot.id, {
          riskLevel: Math.max(0.1, bot.riskLevel - 0.15),
        });
      }
    });

    this.dataManager.addAIDecision({
      type: "strategy",
      message: "Bear market detected: Activated defensive trading strategies",
      confidence: 75,
    });
  }

  activateBalancedStrategies() {
    this.dataManager.addAIDecision({
      type: "strategy",
      message: "Neutral market: Maintaining balanced portfolio allocation",
      confidence: 70,
    });
  }

  adjustRiskParameters(adjustment) {
    this.dataManager.bots.forEach((bot) => {
      if (bot.status === "active") {
        const newRisk = Math.max(
          0.1,
          Math.min(0.9, bot.riskLevel + adjustment)
        );
        this.dataManager.updateBot(bot.id, { riskLevel: newRisk });
      }
    });
  }

  // Bot-specific AI methods
  shouldTrade(botId, marketConditions) {
    const model = this.botModels.get(botId);
    if (!model) return false;

    const bot = this.dataManager.bots.find((b) => b.id === botId);
    const performance = this.dataManager.getBotPerformance(botId);

    // AI decision making based on multiple factors
    let tradeScore = 0;

    // Market condition scoring
    tradeScore += marketConditions.volatility * 30;
    tradeScore += Math.abs(marketConditions.trend) * 25;
    tradeScore += marketConditions.volume * 20;

    // Bot performance scoring
    tradeScore += (performance.successRate / 100) * 15;
    tradeScore += Math.min(10, performance.totalProfit / 100) * 10;

    // Risk adjustment
    tradeScore *= bot.riskLevel;

    return tradeScore > 45 && Math.random() > 0.3;
  }

  getTradeType(botId, marketConditions) {
    return marketConditions.trend > 0 ? "buy" : "sell";
  }

  getConfidence(botId) {
    const model = this.botModels.get(botId);
    const bot = this.dataManager.bots.find((b) => b.id === botId);
    const performance = this.dataManager.getBotPerformance(botId);

    if (!model || !bot) return 50;

    let confidence = this.overallConfidence;

    // Adjust based on bot performance
    confidence += (performance.successRate - 50) / 2;
    confidence += Math.min(20, performance.totalProfit / 10);
    confidence *= bot.riskLevel;

    return Math.max(20, Math.min(95, confidence));
  }

  learnFromTrade(botId, decision, profit) {
    const model = this.botModels.get(botId);
    if (!model) return;

    model.tradeHistory.push({
      decision,
      profit,
      timestamp: new Date().toISOString(),
    });

    // Keep only recent history
    if (model.tradeHistory.length > 100) {
      model.tradeHistory = model.tradeHistory.slice(-100);
    }

    // Update performance metrics
    this.updateBotModel(botId);
  }

  updateBotModel(botId) {
    const model = this.botModels.get(botId);
    if (!model || model.tradeHistory.length < 10) return;

    const recentTrades = model.tradeHistory.slice(-20);
    const winningTrades = recentTrades.filter((t) => t.profit > 0);
    const totalProfit = recentTrades.reduce((sum, t) => sum + t.profit, 0);

    model.performanceMetrics.winRate =
      (winningTrades.length / recentTrades.length) * 100;
    model.performanceMetrics.avgProfit = totalProfit / recentTrades.length;
    model.performanceMetrics.riskAdjustedReturn =
      model.performanceMetrics.avgProfit /
      (model.performanceMetrics.winRate / 100 || 1);
  }

  optimizeBot(botId) {
    const bot = this.dataManager.bots.find((b) => b.id === botId);
    const model = this.botModels.get(botId);
    const performance = this.dataManager.getBotPerformance(botId);

    if (!bot || !model) {
      return { success: false, message: "Bot not found" };
    }

    let optimization = "";
    let confidence = 75;

    // AI optimization logic
    if (performance.successRate < 40) {
      // Reduce risk for low success rate
      const newRisk = Math.max(0.1, bot.riskLevel - 0.2);
      this.dataManager.updateBot(botId, { riskLevel: newRisk });
      optimization = `Reduced risk from ${(bot.riskLevel * 100).toFixed(
        0
      )}% to ${(newRisk * 100).toFixed(0)}% due to low success rate`;
      confidence = 80;
    } else if (performance.successRate > 70 && performance.totalProfit > 50) {
      // Increase risk for high performance
      const newRisk = Math.min(0.9, bot.riskLevel + 0.15);
      this.dataManager.updateBot(botId, { riskLevel: newRisk });
      optimization = `Increased risk from ${(bot.riskLevel * 100).toFixed(
        0
      )}% to ${(newRisk * 100).toFixed(0)}% due to strong performance`;
      confidence = 85;
    } else {
      optimization =
        "Maintaining current parameters - performance within optimal range";
      confidence = 70;
    }

    model.lastOptimization = new Date().toISOString();

    return {
      success: true,
      botName: bot.name,
      message: optimization,
      confidence: confidence,
    };
  }

  getOverallConfidence() {
    return Math.round(this.overallConfidence);
  }

  // Advanced AI features
  predictMarketMove() {
    const { trend, volatility, volume } = this.marketAnalysis;

    // Simple prediction algorithm
    let prediction = trend * 100; // Base prediction on trend
    prediction += (volume - 0.5) * 20; // Adjust for volume
    prediction *= 1 - volatility; // Reduce prediction confidence in high volatility

    return Math.max(-100, Math.min(100, prediction));
  }

  getRiskAssessment() {
    const stats = this.dataManager.getOverallStats();
    const activeBots = this.dataManager.bots.filter(
      (bot) => bot.status === "active"
    );

    let riskScore = 0;

    // Calculate risk score based on multiple factors
    riskScore += (1 - stats.successRate / 100) * 40;
    riskScore += this.marketAnalysis.volatility * 30;
    riskScore +=
      (activeBots.filter((b) => b.riskLevel > 0.7).length / activeBots.length) *
      30;

    return Math.min(100, riskScore);
  }
}

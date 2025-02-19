/**
 * Enhanced backtesting simulation function.
 * This function simulates EA performance using additional parameters:
 * spread, slippage, and commission. It also calculates extra metrics.
 *
 * @param {Object} configuration - EA model configuration details.
 *        Expected keys: indicator, parameter, spread, slippage, commission (optional)
 * @returns {Object} - Simulation results including profit, drawdown, win ratio,
 *                     sharpe ratio (simulated), and timestamp.
 */
function runBacktest(configuration) {
  // Destructure additional parameters; provide defaults if not specified.
  const { indicator, parameter, spread = 0.5, slippage = 0.2, commission = 0.1 } = configuration;

  // For demonstration, we'll generate random performance metrics influenced by these parameters.
  // These are dummy formulas for illustration purposes.
  const baseProfit = Math.random() * 1000;
  const profit = parseFloat((baseProfit - spread * 10 - commission * 5).toFixed(2));
  const drawdown = parseFloat((Math.random() * 200 + slippage * 10).toFixed(2));
  const winRatio = parseFloat((Math.random() * 100).toFixed(2));
  const sharpeRatio = parseFloat(((profit - drawdown) / (Math.random() * 50 + 1)).toFixed(2));
  const backtestDate = new Date().toISOString();

  return {
    profit,
    drawdown,
    winRatio,
    sharpeRatio,
    configuration,
    backtestDate
  };
}

module.exports = { runBacktest };

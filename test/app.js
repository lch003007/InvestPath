const yahooFinance = require('yahoo-finance2').default;

async function getHistoricalFundamentals(symbol) {
  const result = await yahooFinance.quoteSummary(symbol, { modules: ['incomeStatementHistory', 'balanceSheetHistory', 'cashflowStatementHistory'] });
  console.log(Object.keys(result));
  console.log(result['cashflowStatementHistory'])
}

getHistoricalFundamentals('AAPL'); // 替換 'AAPL' 為你需要的股票代碼
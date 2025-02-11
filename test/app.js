const yahooFinance = require('yahoo-finance2').default;
const axios = require('axios');

async function getHistoricalFundamentals(symbol) {
  const result = await yahooFinance.quoteSummary(symbol, { modules: [
    'incomeStatementHistory',
    'financialData',
    'earningsHistory',
  ] });
  console.log(Object.keys(result));
  // console.log(result['earningsHistory'])
  // console.log(result['financialData'])
  console.log(result['incomeStatementHistory'])
}

async function getFundamentalHistory(symbol) {
  const financeApi = 'https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=IBM&apikey=8L3O5ENOOS0ILM6J'
  const epsApi = 'https://www.alphavantage.co/query?function=EARNINGS&symbol=IBM&apikey=demo'
  const response = await axios.get(financeApi)
  console.log(response['history'])
}

async function getHistoricalPrices(symbol,startDate,endDate){
  try{
    const result = await yahooFinance.chart(symbol,{
      period1:startDate,
      period2:endDate,
      interval:'1d'
  })
  console.log(result)
  }catch(error){
    console.log(error.errors)
  }

  
}
getHistoricalPrices('AKUS',new Date('1000-11-11'),new Date())
async function getRealTimePrice(symbol){
  const result = await yahooFinance.quote(symbol)
  console.log(result)
}

// getHistoricalFundamentals('AAPL'); 

// getRealTimePrice(['AAPL','MSFT'])
// getHistoricalPrices('CCTSW',new Date('2024-09-18'),new Date())
// getHistoricalFundamentals('IBM')
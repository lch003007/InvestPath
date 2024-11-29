const { default: axios } = require('axios')
const {Client} = require('pg')

const apikey='8L3O5ENOOS0ILM6J'

const client = new Client({
    host: 'localhost',        // PostgreSQL 伺服器主機名
    port: 5432,               // 伺服器埠號，默認為 5432
    user: 'postgres',         // 資料庫用戶名
    password: 'postgres',     // 資料庫密碼
    database: 'InvestPath',   // 要連接的資料庫名稱
})

testApi()
const skipSymbol = []

async function initData(){
    const stockInfos = await getStockInfo()
    let count = 0
    for(const stockInfo of stockInfos){
        const{id,symbol} = stockInfo
        const eps = await getEPS(id)
        if(skipSymbol.includes(symbol)){
            continue
        }
        if(eps.length==0){
            const epsData = await getEpsHistory(symbol)
            if(!epsData){
                skipSymbol.push(symbol)
                console.log(`${symbol}抓不到eps`)
            }else{
                const data = epsData.map(item=>({
                    stockInfoId:id,
                    epsActual:item.reportedEPS,
                    epsEstimate:item.estimatedEPS,
                    quarter:item.fiscalDateEnding,
                    created:new Date().toISOString()
                }))
                const insertResult = await insertData(data,'earningPerShares')
                if(insertResult)
                    console.log(`${symbol} eps新增成功`)
                else
                    skipSymbol.push(symbol)
                count++
            }
        }
        const financial = await getFinancial(id)
        if(financial.length==0){
            const financialData = await getFinance(symbol)
            if(!financialData){
                skipSymbol.push(symbol)
                console.log(`${symbol}抓不到finance`)
                continue
            }
            const data = financialData.map(item=>({
                stockInfoId:id,
                totalRevenue:item.totalRevenue,
                netIncome:item.netIncome,
                endDate:item.fiscalDateEnding,
                created:new Date().toISOString()
            }))
            // console.log(financialData)
            const insertResult = await insertData(data,'financials')
            if(insertResult)
                console.log(`${symbol} finance新增成功`)
            else
                skipSymbol.push(symbol)
            count++
        }
        if(count>=70)
            break
    }
}


async function testApi(){
    await connectToDb()
    // const stockInfo = await getStockInfo()
    // console.log(stockInfo.rows)
    // const eps = await getEpsHistory('AAPL')
    // const test = await getFinance('AAPL')
    // const eps = await getEPS(5)
    // console.log(test)
    setInterval(initData,2000*60)
    // await initData()
}

async function insertData(data, tableName) {
    if (!Array.isArray(data) || typeof tableName !== 'string') {
      throw new Error('Invalid arguments');
    }
  
    if (data.length === 0) {
      console.log('No data to insert.');
      return false;
    }
  
    // 提取欄位名稱（從第一個物件獲取 key）
    const columns = Object.keys(data[0]).map((key) => `"${key}"`).join(', ');
  
    // 構造 VALUES 區塊，檢查並處理 None -> NULL
    const values = data
      .map((item) =>
        `(${Object.values(item)
          .map((value) => {
            if (value === 'None' || value === null || value === undefined) {
              return 'NULL'; // 將 'None' 或 null/undefined 替換為 SQL 的 NULL
            }
            return `'${value}'`; // 其他值加上單引號包裹
          })
          .join(', ')})`
      )
      .join(', ');
  
    // 組合 INSERT 語句
    const query = `INSERT INTO "${tableName}" (${columns}) VALUES ${values};`;
  
    // console.log('Executing:', query); // 可移除，用於檢查語句生成是否正確
    await client.query(query);
    return true
  }

async function getEpsHistory(symbol){
    const result = await axios.get(`https://www.alphavantage.co/query?function=EARNINGS&symbol=${symbol}&apikey=${apikey}`)
    if(!result.data.quarterlyEarnings)
        return false
    return result.data.quarterlyEarnings.reverse()
}

async function getFinance(symbol){
    const result = await axios.get(`https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${apikey}`)
    if(!result.data.quarterlyReports)
        return false
    return result.data.quarterlyReports.reverse()
}

async function connectToDb(){
    await client.connect();
  }

async function getStockInfo(){
    const result = await client.query('select * from "stockInfo" where "yahooApi"=true')
    return result.rows
}

async function getFinancial(stockInfoId) {
    const result = await client.query(`select * from "financials" where "stockInfoId"=${stockInfoId}`)
    return result.rows
}

async function getEPS(stockInfoId) {
    const result = await client.query(`select * from "earningPerShares" where "stockInfoId"=${stockInfoId}`)
    return result.rows
}


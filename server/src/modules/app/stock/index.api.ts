import { Injectable } from "@nestjs/common";
import yahooFinance from "yahoo-finance2";
import { HttpClientService } from "src/core/httpClient/index.service";
import { alphaVantageApiKey,alphaVantagePremiumApiKey } from "src/app.setting";

type YahooFinanceModule = 
  | "assetProfile"
  | "balanceSheetHistory"
  | "balanceSheetHistoryQuarterly"
  | "calendarEvents"
  | "cashflowStatementHistory"
  | "cashflowStatementHistoryQuarterly"
  | "defaultKeyStatistics"
  | "earnings"
  | "earningsHistory"
  | "earningsTrend"
  | "financialData"
  | "fundOwnership"
  | "fundPerformance"
  | "fundProfile"
  | "incomeStatementHistory"
  | "incomeStatementHistoryQuarterly"
  | "indexTrend"
  | "industryTrend"
  | "insiderHolders"
  | "insiderTransactions"
  | "institutionOwnership"
  | "majorDirectHolders"
  | "majorHoldersBreakdown"
  | "netSharePurchaseActivity"
  | "price"
  | "quoteType"
  | "recommendationTrend"
  | "secFilings"
  | "sectorTrend"
  | "summaryDetail"
  | "summaryProfile"
  | "topHoldings"
  | "upgradeDowngradeHistory";


@Injectable()
export class StockApi{
    constructor(private readonly httpClient:HttpClientService){
        yahooFinance.setGlobalConfig({
            validation:{
                logErrors:false
            }
        })
    }

    async getHistoricalPrices(symbol:string,startDate:Date,endDate:Date){
        return await yahooFinance.chart(symbol,{
            period1:startDate,
            period2:endDate,
            interval:'1d'
        })
    }

    async getRealTimePrice(symbol:string|string[]){
        try{
            return await yahooFinance.quote(symbol)

        }catch(error){
            return error.result
        }
    }

    async getListedStocks(){
        // const listedStock = await this.httpClient.get(`https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${alphaVantageApiKey}`)
        const result = await this.httpClient.get(`https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${alphaVantagePremiumApiKey}`)
        let rowDatas = result.split('\r\n')
        rowDatas = rowDatas.slice(0, rowDatas.length - 1)
        const keys = rowDatas[0].split(',')
        return rowDatas.slice(1).map((values:string)=>{
            const listedStock = {}
            values.split(',').map((item:string,index:number)=>{
                listedStock[keys[index]] = item
            })
            return listedStock
        })
    }

    async getFundamentals(symbol:string,modules:YahooFinanceModule [] = ['incomeStatementHistory','earningsHistory']):Promise<any>{
        return await yahooFinance.quoteSummary(symbol,{modules})
    }
    

    async getFundamentalHistory(){
        
    }

}
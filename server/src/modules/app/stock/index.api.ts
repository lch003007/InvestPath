import { Injectable } from "@nestjs/common";
import yahooFinance from "yahoo-finance2";
import { HttpClientService } from "src/modules/core/httpClient/index.service";
import { alphaVantageApiKey } from "src/app.setting";

type YahooFinanceModule = 
  | 'financialData'
  | 'summaryDetail'
  | 'defaultKeyStatistics'
  | 'price'
  | 'assetProfile'
  | 'balanceSheetHistory'
  | 'incomeStatementHistory'
  | 'cashflowStatementHistory';

@Injectable()
export class StockApi{
    constructor(private readonly httpClient:HttpClientService){
        yahooFinance.setGlobalConfig({
            validation:{
                logErrors:false
            }
        })
    }
    async getFundamnentals(symbol:string,modules:YahooFinanceModule [] = ['financialData']):Promise<any>{
        return await yahooFinance.quoteSummary(symbol,{modules})
    }

    async getHistoricalPrices(symbol:string,startDate:Date,endDate:Date){
        return await yahooFinance.chart(symbol,{
            period1:startDate,
            period2:endDate,
            interval:'1d'
        })
    }

    async getRealTimePrice(symbol:string|string[]){
        return await yahooFinance.quote(symbol)
    }

    async getListedStocks(){
        // const listedStock = await this.httpClient.get(`https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${alphaVantageApiKey}`)
        const result = await this.httpClient.get(`https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=DEMO`)
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
}
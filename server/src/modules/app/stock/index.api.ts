import { Injectable } from "@nestjs/common";
import yahooFinance from "yahoo-finance2";

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
    async getFundamnentals(symbol:string,modules:YahooFinanceModule [] = ['financialData']):Promise<any>{
        return await yahooFinance.quoteSummary(symbol,{modules})
    }
}
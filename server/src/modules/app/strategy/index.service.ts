import { Injectable} from "@nestjs/common";
import { FundamentalAnalysisService } from "../fundamentalAnalysis/index.service";
import { TechnicalAnalysisService } from "../technicalAnalysis/index.service";
import { StockService } from "../stock/index.service";

@Injectable()
export class StrategyService {
    constructor(private fundAnalysis:FundamentalAnalysisService,private techAnalysis:TechnicalAnalysisService,private stock:StockService){

    }

    async stockIdsToSymbols(ids:number[]){
        const result = await this.stock.getStockInfos({select:{symbol:true},where:{id:{in:ids}}})
        return result.map(item=>item.symbol)
    }

    async stockSymbolsToIds(symbols:string[]){
        const result = await this.stock.getStockInfos({select:{id:true},where:{symbol:{in:symbols}}})
        return result.map(item=>item.id)
    }

    async getConditionalStock(stockIds){
        if (!stockIds || stockIds.length === 0) {
            return []; // 如果陣列為空，返回空交集
          }
        
          // 取第一個子陣列作為基準
          const [firstArray, ...restArrays] = stockIds;
        
          // 遍歷基準陣列，檢查是否存在於所有其他子陣列中
          const resultIds = firstArray.filter(item => 
            restArrays.every(subArray => subArray.includes(item))
          );
          const result = await this.stock.getStockInfos({where:{id:{in:resultIds}}})
          return result
          
    }

    async hasEarningSurprise(seasons:number,date:Date=new Date()){
        const filteredStockId = []
        const eps = await this.fundAnalysis.getEstimateAndActualEps(date)
        
        Object.keys(eps).map(key=>{
            for(let i=0;i<seasons;i++){
                const {epsActual,epsEstimate} = eps[key][i]
                if(epsActual<epsEstimate||epsEstimate==null||epsActual==null)
                    break
                if(i==seasons-1)
                    filteredStockId.push(Number(key))
            }
        })

        return filteredStockId
    }

    async hasEpsGrown(rate,date:Date=new Date()){
        const filteredStockId = []
        const eps = await this.fundAnalysis.getEpsYearlyGrowth(date)
        Object.keys(eps).map(key=>{
            for(let i=0;i<eps[key].length;i++){
                if((eps[key][i]['epsGrowth']<rate)&&!eps[key][i]['isNegativeToPositive'])
                    break
                if(i==eps[key].length-1)
                    filteredStockId.push(Number(key))
            }
        })

        return filteredStockId
    }
    
    async hasEpsAccelerated(date:Date=new Date()){
        const filteredStockId = []
        const eps = await this.fundAnalysis.getEpsYearlyGrowth(date)
        Object.keys(eps).map(key=>{
            let growth = 0
            for(let i=eps[key].length-1;i>0;i--){
                if(!eps[key][i-1]['isNegativeToPositive']){
                    const seasonGrowth = eps[key][i-1]['epsGrowth'] - eps[key][i]['epsGrowth']
                    if(seasonGrowth<=growth)
                        break
                    growth = seasonGrowth
                }

                if(i==1)
                    filteredStockId.push(Number(key))
            }
        })

        return filteredStockId
    }

    async hasTotalRevenueAccelerated(date:Date=new Date()){
        const filteredStockId = []
        const finance = await this.fundAnalysis.getFinanceYearlyGrowth(date)

        Object.keys(finance).map(key=>{
            let growth = 0
            for(let i=finance[key].length-1;i>0;i--){
                const seasonGrowth = finance[key][i-1]['totalRevenueGrowth'] - finance[key][i]['totalRevenueGrowth']
                if(seasonGrowth<=growth)
                    break
                growth = seasonGrowth
                if(i==1)
                    filteredStockId.push(Number(key))
            }
        })

        return filteredStockId
    }

    async isFirstStage(){

    }

    async isSecondStage(ids:number[],date:Date){//還沒放完全部條件
        const secondStageSymbols = []
        const symbols = await this.stockIdsToSymbols(ids)
        const secondCondition = [{
            high:'ma150',
            low:'ma200'
        },{
            high:'stockPrice',
            low:'ma200'
        }]
        const stockData = {}
        for(const symbol of symbols){
            let secondStage = true
            stockData['ma200'] = await this.techAnalysis.getMovingAverage(symbol,date,200)
            stockData['ma150'] = await this.techAnalysis.getMovingAverage(symbol,date,100)
            const stockPrices = await this.stock.getStockPrice(symbol,date,1)
            stockData['stockPrice'] = stockPrices[0]
            const isTrue =await this.techAnalysis.isUpwardMovingAverageTrend(symbol,date,100,10)
            if(!isTrue){
                secondStage = false
            }
            for(const condition of secondCondition){
                if(stockData[condition['low']]>stockData[condition['high']])
                    secondStage = false
            }
            if(secondStage)
                secondStageSymbols.push(symbol)
        }
        return secondStageSymbols
    }

    async isThirdStage(){

    }

    async isForthStage(){

    }

}
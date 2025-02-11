import { Injectable,OnModuleInit } from "@nestjs/common";
import { StockService } from "../stock/index.service";
import { MyLoggerService } from "src/core/myLogger/index.service";

@Injectable()
export class FundamentalAnalysisService implements OnModuleInit{
    constructor(private stock:StockService,private logger:MyLoggerService){}

    onModuleInit() {
        // this.getEpsYearlyGrowth()
        // this.getFinanceYearlyGrowth()
    }

    async getEpsYearlyGrowth(date:Date=new Date()){
        const yearlyEps =  await this.stock.getEpsByYears(2,date)
        const epsGrowth = {}
        const epsYearlyGrowth = {}
        yearlyEps.map(item=>{
            if(!epsGrowth[item.stockInfoId])
                epsGrowth[item.stockInfoId] = []
            epsGrowth[item.stockInfoId].push({eps:item.epsActual,quarter:item.quarter})
            if(epsGrowth[item.stockInfoId].length==8){
                epsGrowth[item.stockInfoId].sort((a,b)=>b.quarter-a.quarter)
            }
        })
        Object.keys(epsGrowth).map(key=>{
            if(epsGrowth[key].length!=8)
            {
                // this.logger.warning(`stockInfoId-${key} lack the eps`)
            }

            else{
                epsYearlyGrowth[key] = []
                for(let i=0;i<3;i++){
                    epsYearlyGrowth[key].push({
                        quarter:epsGrowth[key][i]['quarter'],
                        epsGrowth:(epsGrowth[key][i]['eps']-epsGrowth[key][i+4]['eps'])/Math.abs(epsGrowth[key][i+4]['eps']),
                        isNegativeToPositive:epsGrowth[key][i]['eps']>0&&epsGrowth[key][i+4]['eps']<0
                    })
                }
            }
        })
        return epsYearlyGrowth
    }

    async getEstimateAndActualEps(date:Date=new Date()){
        const yearlyEps =  await this.stock.getEpsByYears(2,date)
        const estimateAndActualEps = {}

        yearlyEps.map(item=>{
            if(!estimateAndActualEps[item.stockInfoId])
                estimateAndActualEps[item.stockInfoId] = []
            estimateAndActualEps[item.stockInfoId].push({epsActual:item.epsActual,epsEstimate:item.epsEstimate,quarter:item.quarter})
            if(estimateAndActualEps[item.stockInfoId].length==8){
                estimateAndActualEps[item.stockInfoId].sort((a,b)=>b.quarter-a.quarter)
            }
        })

        Object.keys(estimateAndActualEps).map(key=>{
            if(estimateAndActualEps[key].length<8)
                delete estimateAndActualEps[key]
        })

        return estimateAndActualEps
    }

    async getFinanceYearlyGrowth(date:Date=new Date()){
        const yearlyFinance =  await this.stock.getFinanceByYears(2,date)
        const financeGrowth = {}
        const financeYearlyGrowth = {}
        // console.log(yearlyFinance)
        yearlyFinance.map(item=>{
            if(!financeGrowth[item.stockInfoId])
                financeGrowth[item.stockInfoId] = []
            financeGrowth[item.stockInfoId].push({netIncome:item.netIncome,totalRevenue:item.totalRevenue,endDate:item.endDate})
            if(financeGrowth[item.stockInfoId].length==8){
                financeGrowth[item.stockInfoId].sort((a,b)=>b.endDate-a.endDate)
            }
        })
        Object.keys(financeGrowth).map(key=>{
            if(financeGrowth[key].length!=8)
            {
                // this.logger.warning(`stockInfoId-${key} lack the eps`)
            }

            else{
                financeYearlyGrowth[key] = []
                for(let i=0;i<3;i++){
                    financeYearlyGrowth[key].push({
                        totalRevenueGrowth:financeGrowth[key][i]['totalRevenue']-financeGrowth[key][i+4]['totalRevenue'],
                        netIncomeGrowth:financeGrowth[key][i]['netIncome']-financeGrowth[key][i+4]['netIncome'],
                        endDate:financeGrowth[key][i]['endDate'],
                    })
                }
            }
        })
        return financeYearlyGrowth
    }

}
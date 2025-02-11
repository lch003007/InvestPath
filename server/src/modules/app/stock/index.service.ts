import { Injectable } from "@nestjs/common";
import { StockRepository } from "./index.repository";
import { StockInfoFindManyArgs } from "src/modules/prisma/prisma.service";

@Injectable()
export class StockService{
    constructor(private repository:StockRepository){}

    async getStockPrice(symbol:string,date:Date,days:number,type:string='close'){
        date.setHours(23,0,0,0)
        const stockInfo = await this.repository.getStockInfos({where:{
            symbol:symbol,
        }})
        const stockInfoId = stockInfo[0]['id']
        
        const stockPrice = await this.repository.getStockPriceHistory({where:{
            stockInfoId:stockInfoId,
            date:{
                lte:date
            },
        },
            take:days,
            distinct:'date',
            orderBy:{date:'desc'}
})
        return stockPrice.map(item=>item[type])
    }

    async getNetIncomeBySymbol(){

    }

    async getFinanceByYears(years:number,endDate:Date=new Date()){
        const beginDate = new Date(endDate)
        beginDate.setFullYear(beginDate.getFullYear()-years)
        return this.repository.getNetIncome({where:{
            endDate:{
                lte:endDate,
                gt:beginDate
            }
        }})
    }

    async getEpsByYears(years:number,endDate:Date=new Date()){
        const beginDate = new Date(endDate)
        beginDate.setFullYear(beginDate.getFullYear()-years)
        return this.repository.getEPS({where:{
            quarter:{
                lte:endDate,
                gt:beginDate
            }
        }})
    }

    async getStockInfos(props:StockInfoFindManyArgs={}){
        return this.repository.getStockInfos(props)    
    }

    async getCandlesticks(symbol,date:Date,days:number){
        const stockInfo = await this.repository.getStockInfos({where:{symbol:symbol},select:{id:true}})
        const stockInfoId = stockInfo[0]['id']
        const candlesticks = await this.repository.getStockPriceHistory({where:{stockInfoId:stockInfoId,date:{lte:date}},take:days,orderBy:{date:'desc'},select:{date:true},distinct:'date'})
        return candlesticks.map(item=>item.date)
    }

}
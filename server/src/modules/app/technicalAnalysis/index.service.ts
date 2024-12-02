import { Injectable,OnModuleInit } from "@nestjs/common";
import { StockService } from "../stock/index.service";
@Injectable()
export class TechnicalAnalysisService implements OnModuleInit{
    constructor(private stock:StockService){}
    async onModuleInit() {
        // const movingAverage = await this.getMovingAverage('INTC',new Date('2024-11-13'),5)
        // console.log(movingAverage)
    }
    async getMovingAverage(symbol:string,date:Date,days:number,type:string='close'){
        const prices = await this.stock.getStockPrice(symbol,date,days,type)
        let totalPrice = 0
        prices.map(price=>{totalPrice+=price})
        return totalPrice/days
    }
}

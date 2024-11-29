import { Injectable } from "@nestjs/common";
import { StockService } from "../stock/index.service";
@Injectable()
export class TechnicalAnalysisService{
    constructor(private stock:StockService){}

    async getMovingAverage(symbol:string,date:Date,days:number,type:string='close'){
        const prices = await this.stock.getStockPrice(symbol,date,days,type)
        let totalPrice = 0
        prices.map(price=>{totalPrice+=price})
        return totalPrice/days
    }
}

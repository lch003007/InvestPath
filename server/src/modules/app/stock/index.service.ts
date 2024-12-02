import { Injectable } from "@nestjs/common";
import { StockRepository } from "./index.repository";

@Injectable()
export class StockService{
    constructor(private repository:StockRepository){}

    async getStockPrice(symbol:string,date:Date,days:number,type:string='close'){
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
        console.log(stockPrice)
        return stockPrice.map(item=>item[type])
    }

}
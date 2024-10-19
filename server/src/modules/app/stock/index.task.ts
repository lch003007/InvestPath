import { Injectable,OnModuleInit } from "@nestjs/common";
import { StockRepository } from "./index.repository";
import { StockApi } from "./index.api";
@Injectable()
export class StockTask implements OnModuleInit{
    constructor(private repository:StockRepository,private api:StockApi){

    }

    async onModuleInit() {
        // await this.updateFundamental()
        const fundamentals = await this.api.getFundamnentals('AAPL')
        console.log(fundamentals)

    }
    async updateFundamental(){
        const stockInfos = await this.repository.getStockInfos()
        console.log(stockInfos)
    }
}
import { Injectable } from "@nestjs/common";
import { PrismaService,StockInfoFindManyArgs,StockPriceHistoryFindManyArgs,StockInfoUpdateManyArgs,stockPriceHistoryCreateManyArgs } from "src/modules/prisma/prisma.service";

@Injectable()
export class StockRepository{
    constructor(private prisma: PrismaService){}
    async getStockInfos(props:StockInfoFindManyArgs={}){
        return this.prisma.stockInfo.findMany(props)        
    }

    async getStockPriceHistory(props:StockPriceHistoryFindManyArgs={}){
        return this.prisma.stockPriceHistory.findMany(props)
    }

    async updateStockInfo(props:StockInfoUpdateManyArgs|StockInfoUpdateManyArgs[]){
        if(Array.isArray(props)){
            return this.prisma.$transaction(props.map(item=>
                this.prisma.stockInfo.updateMany(item)
            ))
        }else{
            return this.prisma.stockInfo.updateMany(props)
        }
    }
    async insertStockPriceHistory(data:any,skipDuplicates:boolean=false){
        return this.prisma.stockPriceHistory.createMany({data:data,skipDuplicates:skipDuplicates})
    }

    async insertStockInfo(data:any,skipDuplicates:boolean=false){
        return this.prisma.stockInfo.createMany({data:data,skipDuplicates:skipDuplicates})
    }
}

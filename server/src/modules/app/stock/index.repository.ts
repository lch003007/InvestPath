import { Injectable } from "@nestjs/common";
import { PrismaService,StockInfoFindManyArgs } from "src/modules/prisma/prisma.service";

@Injectable()
export class StockRepository{
    constructor(private prisma: PrismaService){}
    async getStockInfos(props:StockInfoFindManyArgs={}){
        return this.prisma.stockInfo.findMany(props)        
    }
}

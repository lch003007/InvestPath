import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaService,StockInfoFindManyArgs,StockPriceHistoryFindManyArgs,StockInfoUpdateManyArgs,dataUpdateHistoryFindManyArgs,dataUpdateHistoryUpdateManyArgs, StockInfoCreateManyData, StockPriceHistoryCreateManyData, dataUpdateHistoryCreateManyData, dataUpdateHistoryDeleteManyArgs } from "src/modules/prisma/prisma.service";


@Injectable()
export class StockRepository{
    constructor(private prisma: PrismaService){}

    async getStockInfos(props:StockInfoFindManyArgs={}){
        return this.prisma.executeOperation(props,'stockInfo','findMany')    
    }

    async getStockPriceHistory(props:StockPriceHistoryFindManyArgs={}){
        return this.prisma.executeOperation(props,'stockPriceHistory','findMany')  
    }

    async updateStockInfo(props:StockInfoUpdateManyArgs|StockInfoUpdateManyArgs[]){
        return this.prisma.executeOperation(props,'stockInfo','updateMany')  
    }
    async insertStockPriceHistory(data:StockPriceHistoryCreateManyData,skipDuplicates:boolean=false){
        return this.prisma.executeOperation({data:data,skipDuplicates:skipDuplicates},'stockPriceHistory','createMany')
    }

    async insertStockInfo(data:StockInfoCreateManyData,skipDuplicates:boolean=false){
        return this.prisma.executeOperation({data:data,skipDuplicates:skipDuplicates},'stockInfo','createMany')
    }

    async insertDataUpdateHistory(data:dataUpdateHistoryCreateManyData,skipDuplicates:boolean=false){
        return this.prisma.executeOperation({data:data,skipDuplicates:skipDuplicates},'dataUpdateHistory','createMany')
    }
    
    async updateDataUpdateHistory(props:dataUpdateHistoryUpdateManyArgs|dataUpdateHistoryUpdateManyArgs[]){
        return this.prisma.executeOperation(props,'dataUpdateHistory','updateMany') 
    }

    async getDataUpdateHistory(props:dataUpdateHistoryFindManyArgs={}){
        return this.prisma.executeOperation(props,'dataUpdateHistory','findMany') 
    }

    async deleteDataUpdateHistory(props:dataUpdateHistoryDeleteManyArgs){
        return this.prisma.executeOperation(props,'dataUpdateHistory','deleteMany')
    }
}
// @Injectable()
// export class StockRepository{
//     constructor(private prisma: PrismaService){}
//     async getStockInfos(props:StockInfoFindManyArgs={}){
//         return this.prisma.stockInfo.findMany(props)        
//     }

//     async getStockPriceHistory(props:StockPriceHistoryFindManyArgs={}){
//         return this.prisma.stockPriceHistory.findMany(props)
//     }

//     async updateStockInfo(props:StockInfoUpdateManyArgs|StockInfoUpdateManyArgs[]){
//         if(Array.isArray(props)){
//             return this.prisma.$transaction(props.map(item=>
//                 this.prisma.stockInfo.updateMany(item)
//             ))
//         }else{
//             return this.prisma.stockInfo.updateMany(props)
//         }
//     }
//     async insertStockPriceHistory(data:any,skipDuplicates:boolean=false){
//         return this.prisma.stockPriceHistory.createMany({data:data,skipDuplicates:skipDuplicates})
//     }

//     async insertStockInfo(data:any,skipDuplicates:boolean=false){
//         return this.prisma.stockInfo.createMany({data:data,skipDuplicates:skipDuplicates})
//     }

//     async getDataInterval(tableName: string, dateColumn: string, key: string) {
//         const query = `
//     SELECT DISTINCT ON ("${key}") "${key}", "${dateColumn}"
//     FROM "${tableName}"
//     ORDER BY "${key}";
// `;
//     return this.prisma.$queryRawUnsafe(query);
//     }


// }

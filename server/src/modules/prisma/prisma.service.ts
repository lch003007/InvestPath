import { Injectable, OnModuleInit,OnModuleDestroy } from '@nestjs/common';
import { PrismaClient,Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit,OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
        console.log('Connected to database');
      }
    
      // 應用關閉時自動斷開資料庫連接
      async onModuleDestroy() {
        await this.$disconnect();
        console.log('Disconnected from database');
      }

      async executeOperation<T extends keyof PrismaClient, M extends keyof PrismaClient[T]>(
        props: any | any[],
        tableName: T,
        method: M
    ) {
        if (Array.isArray(props)) {
            return this.$transaction(
                props.map(item => (this[tableName][method] as Function)(item))
            );
        } else {
            const a = await (this[tableName][method] as Function)(props)
            return a;
        }
    }

}



export type StockInfoFindManyArgs = Prisma.StockInfoFindManyArgs;
export type StockInfoCreateManyData = Prisma.StockInfoCreateInput[];
export type StockInfoUpdateManyArgs = Prisma.StockInfoUpdateManyArgs;

export type StockPriceHistoryFindManyArgs = Prisma.StockPriceHistoryFindManyArgs;
export type StockPriceHistoryCreateManyData = Prisma.StockPriceHistoryCreateInput[];
export type StockPriceHistoryUpdateManyArgs = Prisma.StockPriceHistoryUpdateManyArgs

export type dataUpdateHistoryFindManyArgs = Prisma.DataUpdateHistoryFindManyArgs
export type dataUpdateHistoryCreateManyData = Prisma.DataUpdateHistoryCreateInput[]
export type dataUpdateHistoryUpdateManyArgs = Prisma.DataUpdateHistoryUpdateManyArgs
export type dataUpdateHistoryDeleteManyArgs = Prisma.DataUpdateHistoryDeleteManyArgs

export type SystemLogCreateManyData = Prisma.SystemLogCreateInput[]

export type FinancialsFindManyArgs = Prisma.FinancialsFindManyArgs

export type EarningPerSharesFindManyArgs = Prisma.EarningPerSharesFindManyArgs
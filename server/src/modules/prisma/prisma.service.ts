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
}



export type StockInfoFindManyArgs = Prisma.StockInfoFindManyArgs;
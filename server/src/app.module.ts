import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { StockModule } from './modules/app/stock/index.module';
import { TechnicalAnalysisModule } from './modules/app/technicalAnalysis/index.module';

@Module({
  imports: [PrismaModule,StockModule,TechnicalAnalysisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

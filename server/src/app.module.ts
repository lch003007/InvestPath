import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { StockModule } from './modules/app/stock/index.module';
import { SimulationModule } from './modules/app/simulation/index.module';

@Module({
  imports: [PrismaModule,StockModule,SimulationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

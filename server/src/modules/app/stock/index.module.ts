import { Module } from "@nestjs/common";
import { StockRepository } from "./index.repository";
import { StockTask } from "./index.task";
import { PrismaModule } from "src/modules/prisma/prisma.module";
import { StockApi } from "./index.api";
import { HttpClientModule } from "src/core/httpClient/index.module";
import { MyLoggerModule } from "src/core/myLogger/index.module";
import { StockService } from "./index.service";

@Module({
    providers:[StockRepository,StockTask,StockApi,StockService],
    imports:[PrismaModule,HttpClientModule,MyLoggerModule],
    exports:[StockService]
})
export class StockModule {}
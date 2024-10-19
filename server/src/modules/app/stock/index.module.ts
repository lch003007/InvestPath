import { Module } from "@nestjs/common";
import { StockRepository } from "./index.repository";
import { StockTask } from "./index.task";
import { PrismaModule } from "src/modules/prisma/prisma.module";
import { StockApi } from "./index.api";
@Module({
    providers:[StockRepository,StockTask,StockApi],
    imports:[PrismaModule]
})
export class StockModule {}
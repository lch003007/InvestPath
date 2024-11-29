import { Module } from "@nestjs/common";
import { StockModule } from "../stock/index.module";

@Module({
    imports:[StockModule]
})

export class TechnicalAnalysisModule {}
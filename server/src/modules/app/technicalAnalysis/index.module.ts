import { Module } from "@nestjs/common";
import { StockModule } from "../stock/index.module";
import { TechnicalAnalysisService } from "./index.service";

@Module({
    providers:[TechnicalAnalysisService],
    imports:[StockModule]
})

export class TechnicalAnalysisModule {}
import { Module } from "@nestjs/common";
import { FundamentalAnalysisModule } from "../fundamentalAnalysis/index.module";
import { TechnicalAnalysisModule } from "../technicalAnalysis/index.module";
import { StrategyService } from "./index.service";
import { StockModule } from "../stock/index.module";

@Module({
    providers:[StrategyService],
    imports:[FundamentalAnalysisModule,TechnicalAnalysisModule,StockModule],
    exports:[StrategyService]
})

export class StrategyModule{}
import { Module } from "@nestjs/common";
import { StockModule } from "../stock/index.module";
import { TechnicalAnalysisService } from "./index.service";
import { MyLoggerModule } from "src/core/myLogger/index.module";

@Module({
    providers:[TechnicalAnalysisService],
    imports:[StockModule,MyLoggerModule],
    exports:[TechnicalAnalysisService]
})

export class TechnicalAnalysisModule {}
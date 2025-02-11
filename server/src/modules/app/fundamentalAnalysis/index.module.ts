import { Module } from "@nestjs/common";
import { FundamentalAnalysisService } from "./index.service";
import { StockModule } from "../stock/index.module";
import { MyLoggerModule } from "src/core/myLogger/index.module";

@Module({
    providers:[FundamentalAnalysisService],
    exports:[FundamentalAnalysisService],
    imports:[StockModule,MyLoggerModule]
})
export class FundamentalAnalysisModule{}
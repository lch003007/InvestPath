import { Injectable,OnModuleInit } from "@nestjs/common";
import { StockService } from "../stock/index.service";
import { MyLoggerService } from "src/core/myLogger/index.service";
@Injectable()
export class TechnicalAnalysisService implements OnModuleInit{
    constructor(private stock:StockService,private logger:MyLoggerService){}
    async onModuleInit() {
        // const movingAverage = await this.getMovingAverage('INTC',new Date('2024-11-13'),5)
        // console.log(movingAverage)
    }
    async getMovingAverage(symbol:string,date:Date,days:number,type:string='close'){
        const prices = await this.stock.getStockPrice(symbol,date,days,type)
        let totalPrice = 0
        prices.map(price=>{totalPrice+=price})
        return totalPrice/days
    }

    async isUpwardMovingAverageTrend(
        symbol: string,
        date: Date,
        days: number,
        upwardDays: number,
        segmentDays: number = 10,
        type: string = 'close'
    ): Promise<boolean> {
        const dates = await this.stock.getCandlesticks(symbol, date, upwardDays);
        dates.reverse()
        if (!dates || dates.length === 0) {
            this.logger.warning(`${symbol} has no stock price data`)
            return false; // 如果沒有日期資料，返回 false
        }
        if(dates.length!=upwardDays){
            this.logger.warning(`${symbol} stock price data is not enough `)
            return false; // 如果日期資料不夠返回false
        }
    
        let previousSegmentTotalMA = null; // 儲存上一段總移動平均值
        for (let i = 0; i < dates.length; i += segmentDays) {
            const movingAverageArray: number[] = [];
            let validCount = 0; // 符合條件的天數
    
            // 確保最後一段不超出陣列長度
            const segmentDates = dates.slice(i, i + segmentDays);

            for (let j = 0; j < segmentDates.length; j++) {
                const movingAverage = await this.getMovingAverage(symbol, segmentDates[j], days);
                movingAverageArray.push(movingAverage);
                // 比較與前一天的移動平均值是否上升
                if (j > 0 && movingAverage > movingAverageArray[j - 1]) {
                    validCount++;
                }
            }
    
            // 1. 檢查分段內是否有至少 0.8 * segmentDays 的天數符合條件
            const requiredValidDays = Math.ceil(0.8 * segmentDates.length); // 確保是整數
            if (validCount < requiredValidDays) {
                return false; // 若不符合條件，直接返回 false
            }
    
            // 2. 檢查當前段的總移動平均是否遞增
            const currentSegmentTotalMA = movingAverageArray.reduce((sum, ma) => sum + ma, 0);
            if (previousSegmentTotalMA !== null && currentSegmentTotalMA <= previousSegmentTotalMA) {
                return false; // 若總和不遞增，直接返回 false
            }
            previousSegmentTotalMA = currentSegmentTotalMA; // 更新上一段總和
        }
    
        return true; // 所有分段均同時符合條件
    }
}

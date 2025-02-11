import { Injectable,OnModuleInit } from "@nestjs/common";
import { StrategyService } from "../strategy/index.service";

@Injectable()
export class SimulationService implements OnModuleInit{
    constructor(private strategy:StrategyService){}

    async onModuleInit() {
        // const test = await this.entryPoint(new Date('2024-11-15'))
        // console.log(test)
    }

    async entryPoint(date:Date=new Date()){
        const stockIds = await this.risingStar(date)
        return await this.strategy.isSecondStage(stockIds,date)
    }

    async risingStar(date:Date=new Date()){
        const t1 = await this.strategy.hasEarningSurprise(3,date)
        const t2 = await this.strategy.hasEpsGrown(0.2,date)
        const t3 = await this.strategy.hasEpsAccelerated(date)
        const t4 = await this.strategy.hasTotalRevenueAccelerated(date)
        const result = await this.strategy.getConditionalStock([t1,t2,t3,t4])
        const resultIds = result.map(item=>item.id)
        return resultIds
    }
}

// async onModuleInit() {
//     const t1 = await this.hasEarningSurprise(3)
//     const t2 = await this.hasEpsGrown(0.2)
//     const t3 = await this.hasEpsAccelerated()
//     const t4 = await this.hasTotalRevenueAccelerated()
//     const result = await this.getConditionalStock([t1,t2,t3,t4])
//     const secondStage = await this.isSecondStage(result.map(item=>item.id),new Date('2024-11-25'))
//     console.log(secondStage)
// }
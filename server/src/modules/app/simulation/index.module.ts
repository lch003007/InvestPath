import { Module } from "@nestjs/common";
import { StrategyModule } from "../strategy/index.module";
import { SimulationService } from "./index.service";

@Module({
    imports:[StrategyModule],
    providers:[SimulationService]
})

export class SimulationModule{}
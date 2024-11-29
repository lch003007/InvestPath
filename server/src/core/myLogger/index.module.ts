import { Module } from "@nestjs/common";
import { MyLoggerRepository } from "./index.repository";
import { MyLoggerService } from "./index.service";
import { PrismaModule } from "src/modules/prisma/prisma.module";
@Module({
    providers:[MyLoggerRepository,MyLoggerService],
    exports:[MyLoggerService],
    imports:[PrismaModule]
})
export class MyLoggerModule{}
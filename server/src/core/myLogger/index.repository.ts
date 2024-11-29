import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaService, SystemLogCreateManyData } from "src/modules/prisma/prisma.service";

@Injectable()
export class MyLoggerRepository{
    constructor(private prisma:PrismaService){}
    async insertSystemLog(data:SystemLogCreateManyData,skipDuplicates:boolean=false){
        return this.prisma.executeOperation({data:data,skipDuplicates:skipDuplicates},'systemLog','createMany')
    }

}
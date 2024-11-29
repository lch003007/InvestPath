import { Injectable } from "@nestjs/common";
import { MyLoggerRepository } from "./index.repository";
import { LogLevel } from "@prisma/client";

@Injectable()
export class MyLoggerService{
    constructor(private repository:MyLoggerRepository){}

    async logMessage(level: LogLevel, message: string, scope: string = "") {
        await this.repository.insertSystemLog([{
            level,
            scope,
            message,
            created: new Date(),
        }]);
        console.log(`[${new Date().toISOString()}][${level.toLowerCase()}]${scope}:${message}`);
    }

    async warning(message: string, scope: string = "") {
        await this.logMessage(LogLevel.WARNING, message, scope);
    }

    async error(message: string, scope: string = "") {
        await this.logMessage(LogLevel.ERROR, message, scope);
    }

    async info(message: string, scope: string = "") {
        await this.logMessage(LogLevel.INFO, message, scope);
    }

}

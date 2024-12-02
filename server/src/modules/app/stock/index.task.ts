import { Injectable,OnModuleInit } from "@nestjs/common";
import { StockRepository } from "./index.repository";
import { StockApi } from "./index.api";
import { taskInfos,day } from "src/app.setting";
import { MyLoggerService } from "src/core/myLogger/index.service";

@Injectable()
export class StockTask implements OnModuleInit{
    constructor(private repository:StockRepository,private api:StockApi,private logger:MyLoggerService){
    }

    taskQueue = []
    taskLimit = 1900
    taskCounter = 0
    taskWindow = 1
    maxCmdAmount = 1000
    sec = 1000
    min = this.sec*60
    hour = this.min*60

    async executeTasks(){
        for(const task of this.taskQueue){
            if(this.taskQueue.filter(item=>item.updatedTime!=null).length>=this.taskLimit)
                break
            await task.callback()
            task.updatedTime = new Date()
        }
    }
    async cleanTasks(){
        this.taskQueue = this.taskQueue.filter(task=>task.updatedTime<new Date(new Date().getTime()-this.hour))
    }
    async addTask(){
        for(const taskInfo of taskInfos){
            const {callbackName,tableName,interval} = taskInfo
            const intervalData = await this.repository.getDataUpdateHistory({where:{tableName:tableName}})      
            this[callbackName](intervalData.filter(item=>{
                const nowTime = new Date().getTime()
                const updatedTime = new Date(item.updatedTime).getTime()
                return nowTime-updatedTime>=interval
            }))
        }
    }
    async scheduleTasks(){
        await this.executeTasks()
        setInterval(async()=>{
            await this.cleanTasks()
            await this.cleanDataUpdateHistory()
            await this.addTask()
            await this.executeTasks()
        },this.hour)
    }
    
    async onModuleInit() {
        // await this.testApi()
        await this.initData()
        await this.scheduleTasks()
        
    }

    chunkArray(array:any[], chunkSize:number){
        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
          result.push(array.slice(i, i + chunkSize));
        }
        return result;
      };
    async testApi(){
        // await this.initStockInfo() 
        // await this.updateStockInfo()
        // await this.initStockPriceHistory()
        // await this.scheduleTasks()
        // this.addTask()
        const apple = await this.repository.getStockInfos({where:{symbol:'AAPL'}});
        console.log(apple)
        // await this.repository.updateDataUpdateHistory({
        //     where:
        //     {
        //         tableName:'stockPriceHistory',
        //     },
        //     data:
        //     {
        //         updatedTime:new Date('2024-11-18')
        //     }
        // })
        // const taskInfo = taskInfos[0]
        // const {callbackName,tableName,interval} = taskInfo
        // const intervalData = await this.repository.getDataUpdateHistory({where:{tableName:tableName}})      
        // this[callbackName](intervalData.filter(item=>{
        //     const nowTime = new Date().getTime()
        //     const updatedTime = new Date(item.updatedTime).getTime()
        //     return nowTime-updatedTime>=interval
        // }))
        // const intervalData = await this.repository.getDataUpdateHistory({where:{tableName:'stockPriceHistory'}}) 
        // this.dailyStockPrice(intervalData)
        // this.cleanDataUpdateHistory()
    }
    async dailyStockPrice(updateInfos:any[]){
        const stockInfos = await this.repository.getStockInfos({
            select:{
                id:true,
                symbol:true
            },
            where:{
                yahooApi:true,
                id:{
                    in:updateInfos.map(item=>item.idValue)
                }
            }
        }
    )
    const nowTime = new Date()
    const oneDayDataToFetch = []
        for(const stockInfo of stockInfos){
            const updatedTime = new Date(updateInfos.find(item=>item.idValue==stockInfo.id)['updatedTime'])
            if(nowTime.getTime()-updatedTime.getTime()>=day*2){
                this.taskQueue.push({
                    callback: async() => {
                        let startFetchingDate = new Date(updatedTime);
                        startFetchingDate.setUTCDate(startFetchingDate.getUTCDate() + 1);
                        this.insertStockPriceHistory(stockInfo.symbol, stockInfo.id, startFetchingDate)
                        await this.repository.updateDataUpdateHistory({
                            where:
                            {
                                tableName:'stockPriceHistory',
                                idValue:stockInfo.id
                            },
                            data:
                            {
                                updatedTime:new Date()
                            }
                        })
                    },
                    updatedTime: null
                });

                }else{
                    oneDayDataToFetch.push(stockInfo)
                }
        }

        this.taskQueue.push({
            callback:async()=>{
                const oneDayData = await this.api.getRealTimePrice(oneDayDataToFetch.map(item=>item.symbol))
                await this.repository.insertStockPriceHistory(oneDayData.map(item=>{
                    return {
                        high:item.regularMarketDayHigh,
                        volume:item.regularMarketVolume,
                        open:item.regularMarketOpen,
                        low:item.regularMarketDayLow,
                        close:item.regularMarketPrice,
                        adjclose:item.regularMarketPrice,
                        date:item.regularMarketTime,
                        stockInfoId:oneDayDataToFetch.find(findItem=>findItem.symbol==item.symbol)['id']
                    }
                }))
                await this.repository.updateDataUpdateHistory({
                    where:
                    {
                        tableName:'stockPriceHistory',
                        idValue:{
                            in:oneDayDataToFetch.map(item=>item.id)
                        }
                    },
                    data:
                    {
                        updatedTime:new Date()
                    }
                })
            }
        })
    }
    async initData(){
        await this.initStockInfo() 
        await this.updateStockInfo()
        await this.initStockPriceHistory()
      }

    async initStockInfo(){
        const dbStockInfos = await this.repository.getStockInfos()
        const newStockInfos = await this.api.getListedStocks()
        if(dbStockInfos.length!=newStockInfos.length)
        {
            const dbStockSymbols = dbStockInfos.map(item=>item.symbol)
            const insertStockInfos = newStockInfos.filter(item=>!dbStockSymbols.includes(item.symbol))
            const insertStockSymbols = insertStockInfos.map(item=>item.symbol)
            
            insertStockInfos.forEach((insertStockInfo:any)=>{
                const {ipoDate,delistingDate} = insertStockInfo
                insertStockInfo['ipoDate'] = ipoDate=='null'?null:new Date(ipoDate)
                insertStockInfo['delistingDate'] = delistingDate=='null'?null:new Date(delistingDate)
                insertStockInfo['isListed'] = insertStockInfo['status']=='Active'
                insertStockInfo['yahooApi'] = insertStockInfo['isListed']
                insertStockInfo['updatedTime'] = new Date() 
                delete insertStockInfo['status']
            })
            await this.repository.insertStockInfo(insertStockInfos)

            const stockInfoHasId = await this.repository.getStockInfos()

            this.repository.insertDataUpdateHistory(stockInfoHasId.filter(item=>insertStockSymbols.includes(item.symbol)).map(item=>({
                tableName:'stockInfo',
                idColumn:'id',
                idValue:item.id,
                updatedTime:new Date() 
            })))
        }
    }

    async updateStockInfo(){//ok
        const stockInfos = await this.repository.getStockInfos()
        const allSymbols = stockInfos.map(item=>item.symbol)
        const chunkedSymbols = this.chunkArray(allSymbols,this.maxCmdAmount)

        for(const symbols of chunkedSymbols){
            this.taskQueue.push({
                callback:async()=>{
                    let getResult:any[] = []
                    for(let i=0;i<symbols.length;i++){
                        const fragSymbols = []
                        fragSymbols.push(symbols[i])
                    }
                    try{
                        getResult = await this.api.getRealTimePrice(symbols)
                    } catch(error){
                        getResult = error?.result || []
                    }
        
                    if (getResult.length === 0) {
                        this.logger.info(`init stocks info fail,no valid results returned`)
                        return false;
                    }else{
                        this.logger.info(`init stocks info successful`)
                    }
                    const isListedSymbols = getResult.filter(item=>item.regularMarketPrice).map((item:any)=>item.symbol)

                    const result = await this.repository.updateStockInfo([{
                        where: {
                            symbol: { in: isListedSymbols }
                        },
                        data: {
                            updatedTime: new Date(),
                            yahooApi: true
                        }
                    },
                    {
                        where: {
                            symbol: { in: symbols.filter((item:string)=>!isListedSymbols.includes(item)) }
                        },
                        data: {
                            updatedTime: new Date(),
                            yahooApi: false
                        }
                    }
                ])
                await this.repository.updateDataUpdateHistory({
                    where:
                    {
                        tableName:'stockInfo',
                        idValue:{
                            in:stockInfos.filter(item=>symbols.includes(item.symbol)).map(item=>item.id)
                        }
                    },
                    data:
                    {
                        updatedTime:new Date()
                    }
                })
                return true
                },
                updatedTime:null
            })
        }

    }

    async initStockPriceHistory(){//ok
        const stockInfos = await this.repository.getStockInfos({where:{yahooApi:true}})
        const stockInfoIds = stockInfos.map(stockInfo => stockInfo.id);
        const stockPriceHistories = await this.repository.getStockPriceHistory({
            where: { stockInfoId: { in: stockInfoIds },date:{not:undefined} },
            distinct: ['stockInfoId'],
        });
        const existingStockInfoIds = new Set(stockPriceHistories.map(item => item.stockInfoId));
        for(const stockInfo of stockInfos){
            if (!existingStockInfoIds.has(stockInfo.id)) {
                this.taskQueue.push({
                    callback: () => this.insertStockPriceHistory(stockInfo.symbol, stockInfo.id, stockInfo.ipoDate,true),
                    updatedTime: null
                });
            }
        }
    }

    async insertStockPriceHistory(symbol:string,stockInfoId:number,startDate:Date,init:boolean=false){//ok
        const endDate = new Date()
        try{
            const stockHistoryPrice = await this.api.getHistoricalPrices(symbol,startDate,endDate)
            const validStockData = stockHistoryPrice.quotes.filter(item => 
                Object.keys(item).every(key => item[key] != null)
            );
            
            await this.repository.insertStockPriceHistory(validStockData.map(item=>({
                date:item.date,
                high:item.high,
                volume:item.volume,
                open:item.open,
                low:item.low,
                close:item.close,
                adjclose:item.adjclose,
                stockInfoId:stockInfoId})))
            if(init)
                await this.repository.insertDataUpdateHistory([{
                    tableName:'stockPriceHistory',    
                        idColumn:'stockInfoId',
                        idValue:stockInfoId,
                        updatedTime:endDate}])
            this.logger.info(`insert stock price history:${symbol} successful!`)
            return true
        }catch(error){
            this.logger.warning(`insert stock price history:${symbol} failure!`)
            return false
        }
    }

    async updateFundamental(){
        const stockInfos = await this.repository.getStockInfos()
    }
    async cleanDataUpdateHistory(){
        const repeatId = []
        const notExistingId = []
        const dataUpdateHistory = await this.repository.getDataUpdateHistory()
        const stockInfos = await this.repository.getStockInfos()
        const checkRepeatData = {}
        const test = {}
        dataUpdateHistory.map(item=>{
            if(!stockInfos.find(stockInfo=>stockInfo.id==item.idValue))
                notExistingId.push(item.id)
            if(!checkRepeatData[item.tableName])
                checkRepeatData[item.tableName] = {}
            if(!checkRepeatData[item.tableName][item.idValue])
                checkRepeatData[item.tableName][item.idValue] = true
            else
                repeatId.push(item.id)
        })
        const deleteId = repeatId.concat(notExistingId)
        this.logger.info(`clean Data${deleteId}`)
        this.repository.deleteDataUpdateHistory({where:{id:{in:deleteId}}})
    }
}
    
import { Injectable,OnModuleInit } from "@nestjs/common";
import { StockRepository } from "./index.repository";
import { StockApi } from "./index.api";

@Injectable()
export class StockTask implements OnModuleInit{
    constructor(private repository:StockRepository,private api:StockApi){
    }

    taskQueue = []
    taskLimit = 2000
    taskCounter = 0
    taskWindow = 1
    maxCmdAmount = 1000
    sec = 1000
    min = this.sec*60
    hour = this.min*60

    async executeTasks(){
        this.taskQueue.forEach(async(task)=>{
            let executeTimes = 1
            while(true){
                await new Promise(resolve => setTimeout(resolve, this.sec));
                const result = await task.callback()
                if(result||executeTimes>=10||this.taskQueue.filter(item=>item.updatedTime!=null).length>=this.taskLimit){
                    if(result){
                        task.updatedTime = new Date()
                    }
                    else{
                        console.log(`error 執行超過10次:${task}`)
                    }
                }else{
                    executeTimes++
                }
            }
            
        })
    }
    async cleanTasks(){
        this.taskQueue = this.taskQueue.filter(task=>task.updatedTime<new Date(new Date().getTime()-this.hour))
    }
    async scheduleTasks(){
        await this.executeTasks()
        setInterval(()=>{
            this.executeTasks()
        },this.hour)
    }
    
    async onModuleInit() {
        await this.initData()
        await this.scheduleTasks()

        // await this.updateStockInfo()



        // this.updateStockListedStatus()
        // this.testStockListed()
        // this.updateStockInfo()
    }

    chunkArray(array:any[], chunkSize:number){
        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
          result.push(array.slice(i, i + chunkSize));
        }
        return result;
      };

    async initData(){
        await this.initStockInfo() 
        await this.updateStockInfo()
        // await this.initStockPriceHistory()
      }

    async initStockInfo(){
        let stockInfos = await this.repository.getStockInfos()
        if(stockInfos.length==0)
        {
            const newStockInfos = await this.api.getListedStocks()
            newStockInfos.forEach((newStockInfo:any)=>{
                const {ipoDate,delistingDate} = newStockInfo
                newStockInfo['ipoDate'] = ipoDate=='null'?null:new Date(ipoDate)
                newStockInfo['delistingDate'] = delistingDate=='null'?null:new Date(delistingDate)
                newStockInfo['isListed'] = newStockInfo['status']=='Active'
                newStockInfo['yahooApi'] = newStockInfo['isListed']
                newStockInfo['updatedTime'] = new Date()
                delete newStockInfo['status']
            })
            this.repository.insertStockInfo(newStockInfos)
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
                        console.log('No valid results returned');
                        return false;
                    }else{
                        console.log('good')
                    }
        
                    const isListedSymbols = getResult.map((item:any)=>item.symbol)
                    
                    await this.repository.updateStockInfo([{
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
                            symbol: { notIn: isListedSymbols }
                        },
                        data: {
                            updatedTime: new Date(),
                            yahooApi: false
                        }
                    }
                ])
                return true
                },
                updatedTime:null
            })

        }


    }

    async initStockPriceHistory(){//ok
        const stockInfos = await this.repository.getStockInfos({where:{isListed:true}})
        for(const stockInfo of stockInfos){
            const stockPriceHistory = await this.repository.getStockPriceHistory({
                where:{
                    stockInfoId:stockInfo.id
                },
                take:1,
            })
            if(stockPriceHistory.length==0)
                this.taskQueue.push({
            callback:()=>this.insertStockPriceHistory(stockInfo.symbol,stockInfo.id,stockInfo.ipoDate),
            updatedTime:null
        })
        }
    }

    async insertStockPriceHistory(symbol:string,stockInfoId:number,startDate:Date){//ok
        const stockHistoryPrice = await this.api.getHistoricalPrices(symbol,startDate,new Date())
        await this.repository.insertStockPriceHistory(stockHistoryPrice.quotes.map(item=>({...item,stockInfoId:stockInfoId})))
    }

    async updateFundamental(){
        const stockInfos = await this.repository.getStockInfos()
    }

}

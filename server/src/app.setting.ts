export const sec = 1000
export const min = sec*60
export const hour = min*60
export const day = hour*24
export const month = day*30

export const alphaVantageApiKey = 'Z9NG9EFN4IAE1VSZ'
export const alphaVantagePremiumApiKey = '8L3O5ENOOS0ILM6J'
export const taskInfos = [
    {
        tableName:'stockPriceHistory',
        callbackName:'dailyStockPrice',        
        interval:day
    }
]
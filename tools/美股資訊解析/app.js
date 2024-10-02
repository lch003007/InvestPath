const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('nasdaq-listed.csv')

const sheetName = workbook.SheetNames[0]
const workSheet = workbook['Sheets'][sheetName]
const data = XLSX.utils.sheet_to_json(workSheet,{ defval: '' })
const exportJsonFile = (data,fileName)=>{
    const jsonData = JSON.stringify(data)
    fs.writeFile(fileName, jsonData, (err) => {
        if (err) {
            console.error('寫入檔案時發生錯誤:', err);
            return;
        }
        console.log(`檔案已成功儲存為 ${fileName}`);
    })
}
const stockInfo = []
data.map((item,index)=>{
    stockInfo.push({
        id:index+1,
        name:item['Company Name'],
        symbol:item['Symbol']
    })
})
exportJsonFile(stockInfo,'stockInfo.json')
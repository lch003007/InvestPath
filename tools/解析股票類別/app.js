const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('2024-gics-structure-english.xlsx');

const sheetName = workbook.SheetNames[0]

const worksheet = workbook.Sheets[sheetName]

const gicsStructure = {}

Object.keys(worksheet).map(key=>{
    if(worksheet[key].t==='n'){
        gicsStructure[worksheet[key].v] = worksheet[String.fromCharCode(key.charCodeAt(0)+1)+key.slice(1)].v
    }
})
const sectionData = []
const industryGroupData = []
const industryData = []

Object.keys(gicsStructure).map(key=>{
    const pushData = {    
        key:key,
        value:gicsStructure[key]
    }
    switch(key.length){
        case 2:
            sectionData.push(pushData)
            break
        case 4:
            industryGroupData.push(pushData)
            break
        case 6:
            industryData.push(pushData)
            break
    }
  })
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

const getForeignId = (childKey,fatherData)=>{
    let returnKey = 0
    fatherData.map((item,key)=>{
        if(item.key==childKey.slice(0,item.key.length))
        {
            returnKey = key+1
        }
    })
    return returnKey
}

const makeSectionJson = ()=>{
    const exportData = []
    sectionData.map((item,key)=>{
        exportData.push({id:key+1,name:item.value})
    })
    exportJsonFile(exportData,'Section.json')
}
// makeSectionJson()

const makeIndustryGroupJson = ()=>{
    const exportData = []
    industryGroupData.map((item,key)=>{
            const sectionId = getForeignId(item.key,sectionData)
            exportData.push({
                id:key+1,
                name:item.value,
                sectionId:sectionId
            })
    })
    exportJsonFile(exportData,'industryGroup.json')
}
makeIndustryGroupJson()
const makeIndustryJson = ()=>{
    const exportData = []
    industryData.map((item,key)=>{
            const industryGroupId = getForeignId(item.key,industryGroupData)
            exportData.push({
                id:key+1,
                name:item.value,
                industryGroupId:industryGroupId
            })
    })
    exportJsonFile(exportData,'industry.json')
}
makeIndustryJson()
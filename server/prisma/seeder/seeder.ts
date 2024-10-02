const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

interface InitData {
    tableName: string;
    data: any[];
  }
// 輸出結果
async function seeder() {
    const files:string[] = fs.readdirSync(__dirname);
    const jsonFiles:string[] = files.filter(file => path.extname(file) === '.json');
    // const jsonFiles:string[] = [ 'section.json','industryGroup.json','industry.json','stockInfo.json']
    const initDatas:InitData[] = jsonFiles.map(item => {
        const filePath:string = path.join(__dirname, item);
        const fileData:any[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                return {
                    tableName: path.basename(item, '.json'), // 檔名去除 .json
                    data: fileData
                };
            });
    try{
        for(const item of initDatas){
            await prisma[item.tableName].deleteMany();
            for(const data of item.data){
                await prisma[item.tableName].create({
                    data:data
                })
            }
        }
        console.log('Seeder successful!')
    } catch(error){
        console.log(`Seeder error:${error}`)
    } finally{
        await prisma.$disconnect();
    }

    // initDatas.map(item=>{
    //     await prisma[item.tableName].deleteMany();
    // })
}

seeder()
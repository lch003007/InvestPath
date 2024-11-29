import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class HttpClientService {
    constructor(private readonly httpClient:HttpService){}
    async get(url:string){
        const res = await firstValueFrom(this.httpClient.get(url));
        return res.data
    }
}
import bigInt from "big-integer";
import xhttp from "@/pkg/xhttp/xhttp";
import type {User} from "@/api/user";

// {"topic":"BTCUSDT@KLINE_1","data":[[1710748560,20,20,20,20,10,200]]}

export interface KlineInfo {
    ts:    number;
    open:  string;
    high:  string;
    low:   string;
    close: string;
    vol:   string;
    tor:   string;
}

export interface KlineResp {
    code: number
    msg: string
    data:KlineInfo[]
}

export function GetKlines(params?: object) {
    return xhttp.get<KlineResp>("/api/market/klines", params)
}
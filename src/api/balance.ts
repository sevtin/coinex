import xhttp from "@/pkg/xhttp/xhttp";
import bigInt from "big-integer";

export interface BalanceResp {
    code: number;
    data: Balance[];
    msg:  string;
}

export interface Balance {
    wallet_id:  bigInt.BigInteger;
    cur_id:     number;
    balance:    string;
    frozen_amt: string;
    status:     number;
    cur_name:   string;
}

export function GetBalances() {
    return xhttp.get<BalanceResp>("/api/user/balance")
}
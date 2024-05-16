import bigInt from "big-integer";

// {"topic":"BTCUSDT@KLINE_1","data":[[1710748560,20,20,20,20,10,200]]}

export interface Kline {
    time: number;//时间戳
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface Volume {
    time: number;
    value: number;
    color: string;
}

export interface Interval {
    name: string;
    intvl: number
}


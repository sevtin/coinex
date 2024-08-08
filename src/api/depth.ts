// {"topic":"BTCUSDT@DEPTH_5","data":{"ts":1710746280,"market_id":1,"symbol":"BTCUSDT","levels":5,"bids":[[20,9540],[19,1200],[18,12]],"asks":null}}
export interface Depth {
    ts: number;//时间戳
    market_id: number;
    symbol: string;
    levels: number;
    bids: string[][];
    asks: string[][];
}

export interface DepthItem {
    ts: number;//时间戳
    price: string
    amount: string
}
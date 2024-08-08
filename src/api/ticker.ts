// {"topic":"BTCUSDT@TICKER_1440","data":{"market_id":1,"symbol":"BTCUSDT","intvl":1440,"values":[1710691200,20,20,20,20,20,400]}}

export interface Ticker {
    market_id: number;
    symbol: string;
    intvl: number;
    values: any[];
}



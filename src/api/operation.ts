export interface Operation {
    mrket: Market;
    ticker: Ticker;
    trade: Trade;
    depth: Depth;
    kline: Kline;
    order: Order;
}

export interface Market {
    intvl: number;
}

export interface Ticker {
    market_id: number;
    symbol: string;
    intvl: number;
    open: string;
    close: string;
    color: number;
}

export interface Trade {
    symbol: string;
}

export interface Depth {
    symbol: string;
    levels: number;
}

export interface Kline {
    symbol: string;
    intvl: number;
}

export interface Order {
    version: number;
}


// type MarketHandler = (intvl: number, sub: Subscribe) => void;
// type TickerHandler = (symbol: string, intvl: number, sub: Subscribe) => void;
// type TradeHandler = (symbol: string, sub: Subscribe) => void;
// type DepthHandler = (symbol: string, levels: number, sub: Subscribe) => void;
// type KlineHandler = (symbol: string, intvl: number, sub: Subscribe) => void;
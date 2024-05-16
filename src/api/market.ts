import {Subscribe} from "@/pkg/xws/xws";

export interface Market {
    market_id: number;
    symbol: string;
    intvl: number;
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    vol: number;
    tor: number;
    change: string;
    color: string;
    close_str: string
}

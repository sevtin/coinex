import {Subscribe} from "@/pkg/xws/xws";

export interface Market {
    market_id: number;
    symbol: string;
    intvl: number;
    time: string;
    open: string;
    high: string;
    low: string;
    close: string;
    vol: string;
    tor: string;
    change: string;
    color: string;
    pre_close: string;
    close_val: number;
    pre_close_val: number;
}
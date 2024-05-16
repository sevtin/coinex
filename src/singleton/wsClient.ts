import {WebSocketClient} from "@/pkg/xws/xws";
import type {Subscribe} from "@/pkg/xws/xws";
import {Message} from "@/pkg/xws/xws";


type MarketHandler = (intvl: number, sub: Subscribe) => void;
type TickerHandler = (symbol: string, intvl: number, sub: Subscribe) => void;
type TradeHandler = (symbol: string, sub: Subscribe) => void;
type DepthHandler = (symbol: string, levels: number, sub: Subscribe) => void;
type KlineHandler = (symbol: string, intvl: number, sub: Subscribe) => void;


class Singleton {
    private static instance: Singleton;
    private client: WebSocketClient

    private marketHandler: Map<string, MarketHandler>

    private tickerHandler: Map<string, TickerHandler>

    private tradeHandler: Map<string, TradeHandler>

    private depthHandler: Map<string, DepthHandler>

    private klineHandler: Map<string, KlineHandler>


    private constructor() {
    }

    public static getInstance(): Singleton {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton();
            Singleton.instance.marketHandler = new Map<string, MarketHandler>;
            Singleton.instance.tickerHandler = new Map<string, TickerHandler>
            Singleton.instance.tradeHandler = new Map<string, TradeHandler>
            Singleton.instance.depthHandler = new Map<string, DepthHandler>
            Singleton.instance.klineHandler = new Map<string, KlineHandler>
        }
        return Singleton.instance;
    }

    public SetMarketHandler(key: string, f: MarketHandler) {
        instance.marketHandler.set(key, f)
    }

    public SetTickerHandler(key: string, f: TickerHandler) {
        instance.tickerHandler.set(key, f)
    }

    public SetTradeHandler(key: string, f: TradeHandler) {
        instance.tradeHandler.set(key, f)
    }

    public SetDepthHandler(key: string, f: DepthHandler) {
        instance.depthHandler.set(key, f)
    }

    public SetKlineHandler(key: string, f: KlineHandler) {
        instance.klineHandler.set(key, f)
    }


    private onOpen() {
        console.log('WebSocket connection opened.');
    }

    private onMessage(sub: Subscribe) {
        let arr = sub.topic.split("@")
        if (arr.length != 2) {
            return
        }
        if (arr[0] == "MARKET") {
            if (instance.marketHandler) {
                // MARKET@1440: type MarketHandler = (intvl: number, sub: Subscribe) => void;
                instance.marketHandler.forEach((value, key) => {
                    value(Number(arr[1]), sub)
                });
            }
            return;
        }
        let symbol = arr[0]
        if (arr[1] == "TRADE") {
            if (instance.tradeHandler) {
                // BTCUSDT@TRADE: type TradeHandler = (symbol: string, sub: Subscribe) => void;
                instance.tradeHandler.forEach((value, key) => {
                    value(symbol, sub)
                });
            }
            return;
        }
        arr = arr[1].split("_")
        if (arr.length != 2) {
            return
        }
        switch (arr[0]) {
            case "TICKER":
                if (instance.tickerHandler) {
                    // BTCUSDT@TICKER_1440: type TickerHandler = (symbol: string, intvl: number, sub: Subscribe) => void;
                    instance.tickerHandler.forEach((value, key) => {
                        value(symbol, Number(arr[1]), sub)
                    });
                }
                break
            case "DEPTH":
                if (instance.depthHandler) {
                    // BTCUSDT@DEPTH_10: type DepthHandler = (symbol: string, levels: number, sub: Subscribe) => void;
                    instance.depthHandler.forEach((value, key) => {
                        value(symbol, Number(arr[1]), sub)
                    });
                }
                break
            case "KLINE":
                if (instance.klineHandler) {
                    // BTCUSDT@KLINE_1: type KlineHandler = (symbol: string, intvl: number, sub: Subscribe) => void;
                    instance.klineHandler.forEach((value, key) => {
                        value(symbol, Number(arr[1]), sub)
                    });
                }
                break
        }
    }

    private onError(error: Event) {
        console.error('WebSocket error:', error);
    }

    private onClose(event: CloseEvent) {
        console.log('WebSocket connection closed.', event.reason);
    }

    // 假设你的类有一些公共方法
    public connect(topics: string[]) {
        instance.client = new WebSocketClient(this.onOpen, this.onMessage, this.onError, this.onClose);
        instance.client.setTopics(topics)
        instance.client.connect();
    }

    public updateSubscribe(topics: string[]) {
        instance.client.updateSubscribe(topics)
    }

    public updateUnSubscribe(oldTopic: string, newTopic: string) {
        instance.client.updateUnSubscribe(oldTopic, newTopic)
    }
    public reconnect() {
        instance.client.closeSocket();
        instance.client.connect();
    }
    public close() {
        instance.client.closeSocket();
    }

}

export const instance = Singleton.getInstance();
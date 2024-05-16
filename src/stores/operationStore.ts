import {defineStore} from 'pinia'
import {Operation, Market, Ticker, Trade, Depth, Kline, Order} from "@/api/operation";

export const useOperationStore = defineStore('operation', {
    state: (): Operation => ({
        mrket: {} as Market,
        ticker: {} as Ticker,
        trade: {} as Trade,
        depth: {} as Depth,
        kline: {} as Kline,
        order: {version: 0} as Order,
    }),
    getters: {
        getMarket(): Market {
            return this.mrket
        },
        getTicker(): Ticker {
            return this.ticker
        },
        getTrade(): Trade {
            return this.trade
        },
        getDepth(): Depth {
            return this.depth
        },
        getKline(): Kline {
            return this.kline
        },
        getOrder(): number {
            return this.order
        },
    },
    actions: {
        setMarket(intvl: number) {
            this.$state.mrket.intvl = intvl
        },
        setTicker(market_id: number, symbol: string, intvl: number, open: number, close: number) {
            this.$state.ticker.market_id = market_id;
            this.$state.ticker.symbol = symbol;
            this.$state.ticker.intvl = intvl;
            this.$state.ticker.open = open;
            this.$state.ticker.close = close
            let color = '#FFFFF0';
            if (close > open) {
                color = '#0ECB81';
            } else if (close < open) {
                color = '#F6465D';
            }
            this.$state.ticker.color = color;

            this.$state.trade.symbol = symbol;
            this.$state.depth.symbol = symbol;
            this.$state.kline.symbol = symbol;
        },
        updateTickerPrice(price: number) {
            this.$state.ticker.close = price;
        },
        setDepth(levels: number) {
            this.$state.depth.levels = levels;
        },
        setKline(intvl: number) {
            this.$state.kline.intvl = intvl;
        },
        updateKlineIntvl(intvl: number) {
            this.$state.kline.intvl = intvl;
        },
        updateOrderVersion() {
            this.$state.order.version++;
        },
    },
    persist: false
})

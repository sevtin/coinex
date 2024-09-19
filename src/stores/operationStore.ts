import {defineStore} from 'pinia'
import {Operation, Market, Ticker, Trade, Depth, Kline, Order} from "@/api/operation";
import type {Balance} from "@/api/balance";
import {BalanceResp, GetBalances} from "@/api/balance";

export const useOperationStore = defineStore('operation', {
    state: (): Operation => ({
        mrket: {} as Market,
        ticker: {} as Ticker,
        trade: {} as Trade,
        depth: {} as Depth,
        kline: {} as Kline,
        order: {version: 0} as Order,
        Balances: [] as Balance[]
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
        getBalances(): Balance[] {
            return this.Balances
        }
    },
    actions: {
        setMarket(intvl: number) {
            this.$state.mrket.intvl = intvl
        },
        setTicker(market_id: number, symbol: string, intvl: number, open: string, close: string, color: string) {
            this.$state.ticker.market_id = market_id;
            this.$state.ticker.symbol = symbol;
            this.$state.ticker.intvl = intvl;
            this.$state.ticker.open = open;
            this.$state.ticker.close = close
            this.$state.ticker.color = color;

            this.$state.trade.symbol = symbol;
            this.$state.depth.symbol = symbol;
            this.$state.kline.symbol = symbol;
        },
        setTickerPrice(price: string) {
            this.$state.ticker.close = price;
        },
        setTickerColor(color: string) {
            this.$state.ticker.color = color;
        },
        setDepth(levels: number) {
            this.$state.depth.levels = levels;
        },
        setKlineIntvl(intvl: number) {
            this.$state.kline.intvl = intvl;
        },
        updateOrderVersion() {
            this.$state.order.version++;
        },
        updateBalances() {
            GetBalances().then((resp: BalanceResp) => {
                if (resp.data.length>0) {
                    this.$patch((state) => {
                        state.Balances = resp.data;
                    });
                }
                console.log(resp)
            }).catch((err) => {
                console.log(err)
            })
        }
    },
    persist: false,
    deep: true
})

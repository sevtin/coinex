<script setup lang="ts">
import {onMounted, ref, computed} from 'vue'
import {Subscribe} from "@/pkg/xws/xws";
import {instance} from "@/singleton/wsClient";
import type {Ticker} from "@/api/ticker";
import type {Market} from "@/api/market";
import {timestampToHourMinute} from "@/pkg/utils/time";
import {toPercentage} from "@/pkg/utils/number";

import {useOperationStore} from "@/stores/operationStore";

const operationStore = useOperationStore()

const tableData = ref<Market[]>([]);
const markets = new Map<string, Market>();
var oldMarketId: number = 1;
var interval: number = operationStore.getMarket.intvl;
const searchQuery = ref('');

// 过滤后的市场数据
const filteredMarketData = computed(() => {
  if (!searchQuery.value) {
    return tableData.value;
  }
  
  return tableData.value.filter(item => 
    item.symbol.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const marketHandler = (intvl: number, sub: Subscribe) => {
  if (!sub || !sub.data) {
    return
  }
  if (sub.data.length==0) {
    return;
  }
  interval = intvl;
  const tickers = sub.data as Ticker[];
  if (tickers.length===1) {
    const market = toMarket(tickers[0]);
    if (oldMarketId === market.market_id){
      operationStore.setTicker(market.market_id, market.symbol, intvl, market.pre_close, market.close, market.color)
    }
    const existingMarket = markets.get(market.symbol)
    if (existingMarket) {
      const index = tableData.value.findIndex(item => item.symbol === market.symbol);
      if (index !== -1) {
        tableData.value.splice(index, 1, market);
      }
    }
  }else {
    let arr = []
    for (let i = 0; i < tickers.length; i++) {
      const market = toMarket(tickers[i]);
      arr.push(market);
      markets.set(market.symbol, market);
      if (oldMarketId === market.market_id){
        operationStore.setTicker(market.market_id, market.symbol, intvl, market.pre_close, market.close, market.color)
      }
    }
    tableData.value = arr;
  }
}

const toMarket = ((ticker: Ticker) => {
  const market: Market = {
    market_id: ticker.market_id,
    symbol: ticker.symbol,
    intvl: ticker.intvl,
    time: timestampToHourMinute(ticker.values[0]),
    open: ticker.values[1],
    high: ticker.values[2],
    low: ticker.values[3],
    close: ticker.values[4],
    vol: ticker.values[5],
    tor: ticker.values[6],
    pre_close: ticker.values[7],
    change: '',
    color: '',
  };
  if (market.pre_close==='0') {
    market.pre_close = market.open;
  }
  market.close_val = parseFloat(market.close);
  market.pre_close_val = parseFloat(market.pre_close);

  if (market.symbol === operationStore.getTicker.symbol && market.intvl === operationStore.getTicker.intvl) {
    // 更新单个币种
    operationStore.setTickerPrice(market.close)
    operationStore.setTickerColor(market.color)
  }
  market.change = toPercentage((market.close_val - market.pre_close_val) / market.pre_close_val);
  market.color = "#FFFFF0"
  if (market.close_val > market.pre_close_val) {
    market.color = 'var(--binance-buy)';
  } else if (market.close_val < market.pre_close_val) {
    market.color = 'var(--binance-sell)';
  }
  return market;
})

const tickerHandler = (symbol: string, intvl: number, sub: Subscribe) => {
  if (intvl != interval) {
    return;
  }
  const ticker = sub.data as Ticker
  if (!ticker) {
    return
  }
  const market = toMarket(ticker);
  operationStore.setTicker(market.market_id, market.symbol, market.intvl, market.pre_close, market.close, market.color)
  const existingMarket = markets.get(symbol)
  if (existingMarket) {
    const index = tableData.value.findIndex(item => item.symbol === symbol);
    if (index !== -1) {
      tableData.value.splice(index, 1, market);
    }
  }
};

onMounted(() => {
  instance.SetMarketHandler("market.vue", marketHandler)
  //instance.SetTickerHandler("market.vue", tickerHandler)
})

const onRowClick = (row: any, column: any, event: Event) => {
  if (oldMarketId == row.market_id) {
    return
  }
  console.log("onRowClick", row)
  oldMarketId = row.market_id
  // 1、先存储
  operationStore.setTicker(row.market_id, row.symbol, row.intvl, row.pre_close, row.close, row.color)

  let topics = ["MARKET@" + operationStore.getMarket.intvl.toString(),
    row.symbol + "@TICKER_" + operationStore.getTicker.intvl.toString(),
    row.symbol + "@KLINE_" + operationStore.getKline.intvl.toString(),
    row.symbol + "@DEPTH_10",
    row.symbol + "@TRADE"]

  // 2、再更新订阅
  instance.updateSubscribe(topics)
}

</script>

<template>
  <div class="market-container">
    <div class="market-header">
      <div class="search-box">
        <svg class="modern-icon search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索币种" 
          class="search-input" 
        />
      </div>
    </div>
    
    <div class="market-list">
      <div class="list-header">
        <div class="header-item symbol">币对</div>
        <div class="header-item price">价格</div>
        <div class="header-item change">涨跌幅</div>
      </div>
      
      <div class="market-items">
        <div 
          v-for="item in filteredMarketData" 
          :key="item.market_id"
          class="market-item"
          :class="{'active': item.market_id === oldMarketId}"
          @click="onRowClick(item, null, $event)"
        >
          <div class="item-cell symbol">{{ item.symbol }}</div>
          <div class="item-cell price" :style="{ color: item.color }">{{ item.close }}</div>
          <div class="item-cell change">
            <span class="change-badge" :style="{ 
              backgroundColor: item.color === 'var(--binance-buy)' ? 'rgba(14, 203, 129, 0.1)' : 
                              item.color === 'var(--binance-sell)' ? 'rgba(246, 70, 93, 0.1)' : 'transparent',
              color: item.color
            }">
              {{ item.change }}
            </span>
          </div>
        </div>
        
        <!-- 空数据提示 -->
        <div v-if="filteredMarketData.length === 0" class="empty-data">
          <p>暂无数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.market-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--binance-bg-base);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.market-header {
  padding: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  background-color: rgba(0, 0, 0, 0.05);
  z-index: 3;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.search-box {
  display: flex;
  align-items: center;
  background-color: rgba(30, 32, 38, 0.5);
  border-radius: 6px;
  padding: 10px 14px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.03);
  
  &:focus-within {
    border-color: rgba(240, 185, 11, 0.3);
    background-color: rgba(30, 32, 38, 0.7);
    box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
    
    .search-icon {
      opacity: 1;
      color: var(--binance-primary);
    }
  }
  
  .modern-icon {
    width: 17px;
    height: 17px;
    transition: all 0.3s ease;
  }
  
  .search-icon {
    margin-right: 10px;
    color: var(--binance-text-tertiary);
    opacity: 0.7;
  }
  
  .search-input {
    background: none;
    border: none;
    outline: none;
    color: var(--binance-text-primary);
    width: 100%;
    font-size: 14px;
    
    &::placeholder {
      color: var(--binance-text-tertiary);
      opacity: 0.7;
    }
  }
}

.market-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  display: flex;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--binance-text-secondary);
  background-color: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 2;
}

.header-item {
  &.symbol {
    flex: 1.5;
    text-align: left;
  }
  
  &.price {
    flex: 1;
    text-align: right;
  }
  
  &.change {
    flex: 1.5;
    text-align: right;
    padding-right: 10px;
  }
}

.market-items {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
  }
}

.market-item {
  display: flex;
  padding: 12px 14px;
  font-size: 14px;
  cursor: pointer;
  background-color: var(--binance-bg-base);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
  
  &.active {
    background-color: rgba(240, 185, 11, 0.05);
    border-left: 3px solid var(--binance-primary);
    padding-left: 11px;
  }
}

.item-cell {
  display: flex;
  align-items: center;
  
  &.symbol {
    flex: 1.5;
    font-weight: 500;
  }
  
  &.price {
    flex: 1;
    justify-content: flex-end;
    font-weight: 500;
  }
  
  &.change {
    flex: 1.5;
    justify-content: flex-end;
  }
}

.change-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.empty-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--binance-text-tertiary);
  font-style: italic;
}
</style>

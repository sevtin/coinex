<script setup lang="ts">
import {onMounted, ref} from 'vue'
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
      operationStore.setTicker(market.market_id, market.symbol, intvl, market.open, market.close, market.color)
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
        operationStore.setTicker(market.market_id, market.symbol, intvl, market.open, market.close, market.color)
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
    market.color = '#0ECB81';
  } else if (market.close_val < market.pre_close_val) {
    market.color = '#F6465D';
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
  operationStore.setTicker(market.market_id, market.symbol, market.intvl, market.open, market.close, market.color)
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
  operationStore.setTicker(row.market_id, row.symbol, row.intvl, row.open, row.close, row.color)

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
  <div class="aside-container">
    <el-table
        :data="tableData"
        class="table-style"
        @row-click="onRowClick"
    >
      <el-table-column fixed prop="symbol" label="币对" width="90"/>
      <el-table-column prop="close" label="价格" width="110"/>
      <el-table-column label="涨跌幅" width="100">
        <template #default="scope">
          <span
              :style="{ color: scope.row.color}">{{
              scope.row.change
            }}</span>
        </template>
      </el-table-column>
      <template v-slot:empty>
        <div class="table-no-data">暂无数据</div>
      </template>
    </el-table>
  </div>
</template>

<style scoped lang="scss">

.aside-container {
  width: 100%;
  height: 100%;
}

.table-style {
  background-color: #2c3e50 !important;
}

.table-style ::v-deep .el-table th.el-table__cell,
::v-deep .el-table th,
::v-deep .el-table tr {
  color: white;
  background-color: #2c3e50 !important;
  font-size: 12px;
}

::v-deep .el-table__body .el-table__row.hover-row td {
  background-color: #1c2e40 !important;
}
</style>

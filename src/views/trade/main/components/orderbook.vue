<script setup lang="ts">
import AskQuoteView from "@/views/trade/main/components/orderbook/askQuote.vue"
import BidQuoteView from "@/views/trade/main/components/orderbook/bidQuote.vue"
import QuoteView from "@/views/trade/main/components/orderbook/quote.vue"
import {onMounted, ref, watch} from "vue";
import {Subscribe} from "@/pkg/xws/xws";
import {instance} from "@/singleton/wsClient";
import type {Depth, DepthItem} from "@/api/depth";
import {useOperationStore} from "@/stores/operationStore";
import {stringToNumber, stringToPrice} from "@/pkg/utils/number";

const operationStore = useOperationStore()

const bids = ref<DepthItem[]>([]);
const asks = ref<DepthItem[]>([]);
const header = ref([{'price':"价格", 'amount':"数量"}]);


// {"topic":"BTCUSDT@DEPTH_5","data":{"ts":1710746280,"market_id":1,"symbol":"BTCUSDT","levels":5,"bids":[[20,9540],[19,1200],[18,12]],"asks":null}}
const depthHandler = (symbol: string, levels: number, sub: Subscribe) => {
  if (symbol != operationStore.getTicker.symbol) {
    return
  }
  let depth = sub.data as Depth
  asks.value = getDepthItems(depth.asks, depth.ts, false)
  bids.value = getDepthItems(depth.bids, depth.ts, true)
}

const getDepthItems = (values: string[][], ts: number, bid: boolean): DepthItem[] => {
  if (!values) {
    return []
  }
  let items: DepthItem[] = []
  values.forEach((it) => {
    let item = {
      ts: ts,
      price: stringToPrice(it[0]),
      amount: stringToNumber(it[1])
    }
    if (bid) {
      items.push(item);
    } else {
      items.unshift(item);
    }
  })
  return items
}

onMounted(() => {
  instance.SetDepthHandler("orderbook.vue", depthHandler)
})

watch(
    operationStore.getDepth,
    (newDepth, oldDepth) => {
      asks.value = [];
      bids.value = [];
    }
);

</script>

<template>
  <div class="orderbook-container">
    <div class="header-view">
      <el-table
          :data="header"
          :show-header="false"
          class="table-style"
      >
        <el-table-column fixed prop="price"/>
        <el-table-column fixed prop="amount"/>
      </el-table>
    </div>
    <div class="ask-view">
      <AskQuoteView :depths="asks"/>
    </div>
    <div class="quote-view">
      <QuoteView/>
    </div>
    <div class="bid-view">
      <BidQuoteView :depths="bids"/>
    </div>
  </div>
</template>

<style scoped  lang="scss">
.orderbook-container {
  height: 100%;
  background-color: #2c3e50;
  display: flex;
  flex-direction: column;
}

.header-view {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center; /* 垂直居中 */
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
  background-color: #2c3e50 !important;
}
.ask-view {
  width: 100%;
  height: 340px;
}

.quote-view {
  width: 100%;
  height: 56px;
}

.bid-view {
  width: 100%;
  height: 340px;
}

</style>
<script setup lang="ts">

import MarketView from '@/views/trade/main/components/market.vue'
import ChartView from '@/views/trade/main/components/chart.vue'
import TradeView from '@/views/trade/main/components/trade.vue'
import OrderbookView from '@/views/trade/main/components/orderbook.vue'
import FilledOrderView from '@/views/trade/main/components/filledOrder.vue'
</script>

<template>
  <div class="main-container">
    <div class="market-view">
      <MarketView/>
    </div>
    <div class="center-view">
      <ChartView class="chart-view"/>
      <TradeView class="trade-view"/>
    </div>
    <div class="order-book-view">
      <OrderbookView/>
    </div>
    <div class="filled-order-view">
      <FilledOrderView/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.main-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  gap: 4px;
}

.market-view {
  width: 300px;
  height: 100%;
  border: 1px solid #1E2329;
}

.center-view {
  width: 848px;
  height: 100%;
  background-color: #2c3e50;
  display: flex;
  flex-direction: column;
  border: 1px solid #1E2329;
  gap: 4px;
}

.chart-view {
  width: 100%;
  height: 580px;
  display: flex;
}

.trade-view {
  width: 100%;
  height: 216px;
}

.order-book-view {
  width: 320px;
  height: 100%;
  border: 1px solid #1E2329;
}

.filled-order-view {
  width: 320px;
  height: 100%;
  border: 1px solid #1E2329;
}
</style>
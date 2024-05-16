<script setup lang="ts">
import TradeLimitView from "@/views/trade/main/components/trade/tradeLimit.vue"
import TradeMarketView from "@/views/trade/main/components/trade/tradeMarket.vue"

import {ref} from "vue";

const activeName = ref('limit')

</script>

<template>
  <div class="trade-container">
    <el-tabs v-model="activeName" class="el-tabs-view">
      <el-tab-pane class="trade-limit-view" label="限价交易" name="limit">
        <TradeLimitView/>
      </el-tab-pane>
      <el-tab-pane class="trade-market-view" label="市价交易" name="market">
        <TradeMarketView/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<style scoped lang="scss">

.trade-container {
  width: 100%;
  height: 100%;
  background-color: #2c3e50;
}

.el-tabs-view {
  height: 100%;
  padding-left: 20px;
  padding-right: 20px;
}

.trade-limit-view {
  width: 96%;
  height: 100%;
  display: flex;
}

.trade-market-view {
  width: 96%;
  height: 100%;
  display: flex;
}

::v-deep .el-tabs__item.is-active {
  color: white;
}

::v-deep .el-tabs__item {
  color: #666;
}

::v-deep .el-tabs__nav .el-tabs__active-bar {
  background-color: #666;
}

</style>
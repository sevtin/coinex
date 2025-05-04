<script setup lang="ts">
import CurrentOrderView from "@/views/trade/footer/components/currentOrder.vue"
import HistoricalOrderView from "@/views/trade/footer/components/historicalOrder.vue"
import type {TabsPaneContext} from 'element-plus'
import {ref} from "vue";

var curTab: string
const currentRef = ref(null);
const historyRef = ref(null);
const activeName = ref('current')

const onTabsClick = (tab: TabsPaneContext, _: Event) => {
  if (curTab === tab.props.name) {
    return
  }
  curTab = tab.props.name as string
  switch (curTab) {
    case "current":
      currentRef.value.loadOrderList();
      break
    case "history":
      historyRef.value.loadOrderList();
      break
  }
}

</script>

<template>
  <div class="footer-container">
    <el-tabs v-model="activeName" @tab-click="onTabsClick" class="order-tabs">
      <el-tab-pane class="current-order-view" label="当前委托" name="current">
        <CurrentOrderView ref="currentRef" :history="false"/>
      </el-tab-pane>
      <el-tab-pane class="historical-order-view" label="历史委托" name="history">
        <HistoricalOrderView ref="historyRef" :history="true"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.footer-container {
  width: 100%;
  min-height: 200px;
  padding: var(--binance-spacing-md);
  
  @media (max-width: 768px) {
    padding: var(--binance-spacing-sm);
  }
}

.order-tabs {
  height: 100%;
  
  :deep(.el-tabs__header) {
    margin-bottom: var(--binance-spacing-md);
    border-bottom: 1px solid var(--binance-border-base);
    
    @media (max-width: 768px) {
      margin-bottom: var(--binance-spacing-sm);
    }
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    background-color: var(--binance-border-base);
  }
  
  :deep(.el-tabs__item) {
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-weight: 500;
    
    &.is-active {
      color: var(--binance-primary) !important;
    }
  }
  
  :deep(.el-tabs__active-bar) {
    height: 2px;
    background-color: var(--binance-primary) !important;
  }
}

.current-order-view,
.historical-order-view {
  width: 100%;
  min-height: 200px;
  
  @media (max-width: 768px) {
    min-height: 150px;
  }
}
</style>

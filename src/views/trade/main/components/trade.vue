<script setup lang="ts">
import TradeLimitView from "@/views/trade/main/components/trade/tradeLimit.vue"
import TradeMarketView from "@/views/trade/main/components/trade/tradeMarket.vue"
import { ref } from "vue";

const activeName = ref('limit')
</script>

<template>
  <div class="trade-container">
    <el-tabs v-model="activeName" class="trade-tabs">
      <el-tab-pane label="限价交易" name="limit">
        <div class="tab-content">
          <TradeLimitView/>
        </div>
      </el-tab-pane>
      <el-tab-pane label="市价交易" name="market">
        <div class="tab-content">
          <TradeMarketView/>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.trade-container {
  width: 100%;
  background-color: var(--binance-bg-card);
  padding: 8px;
  display: flex;
  flex-direction: column;
  height: 280px;
  
  @media (max-width: 768px) {
    padding: 4px;
    min-height: 420px;
  }
}

.trade-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  :deep(.el-tabs__header) {
    margin-bottom: 8px;
    
    @media (max-width: 768px) {
      margin-bottom: 6px;
    }
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    background-color: var(--binance-border-base);
  }
  
  :deep(.el-tabs__item) {
    color: var(--binance-text-secondary);
    height: 32px;
    padding: 0 16px;
    font-size: 13px;
    
    &.is-active {
      color: var(--binance-primary);
      font-weight: 500;
    }
    
    &:hover {
      color: var(--binance-primary);
    }
  }
  
  :deep(.el-tabs__active-bar) {
    background-color: var(--binance-primary);
    height: 2px;
  }
  
  :deep(.el-tabs__content) {
    flex: 1;
    overflow: auto;
    
    @media (max-width: 768px) {
      height: auto !important;
      min-height: 350px;
    }
  }
}

.tab-content {
  @media (max-width: 768px) {
    padding-bottom: 16px;
  }
}
</style>
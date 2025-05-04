<script setup lang="ts">
import MarketView from '@/views/trade/main/components/market.vue'
import ChartView from '@/views/trade/main/components/chart.vue'
import TradeView from '@/views/trade/main/components/trade.vue'
import OrderbookView from '@/views/trade/main/components/orderbook.vue'
import FilledOrderView from '@/views/trade/main/components/filledOrder.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useOperationStore } from "@/stores/operationStore";

const operationStore = useOperationStore()

// 响应式布局控制
const isMobile = ref(window.innerWidth < 768)
const isTablet = ref(window.innerWidth >= 768 && window.innerWidth < 1200)
const isDesktop = ref(window.innerWidth >= 1200)

// 获取当前交易对信息
const currentSymbol = computed(() => operationStore.getTicker.symbol || 'BTC/USDT')
const currentPrice = computed(() => operationStore.getTicker.price || '0.00')
const priceColor = computed(() => operationStore.getTicker.color || '')

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  isTablet.value = window.innerWidth >= 768 && window.innerWidth < 1200
  isDesktop.value = window.innerWidth >= 1200
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="trade-layout" :class="{'mobile-layout': isMobile, 'tablet-layout': isTablet, 'desktop-layout': isDesktop}">
    <!-- 左侧市场面板 - 仅在平板和桌面显示 -->
    <div v-if="!isMobile" class="trade-panel market-panel">
      <MarketView/>
    </div>
    
    <!-- 中间内容区域 -->
    <div class="trade-panel center-panel">
      <!-- 仅在移动端显示的交易对信息条 -->
      <div v-if="isMobile" class="symbol-header">
        <div class="symbol-info">
          <span class="symbol-name">{{ currentSymbol }}</span>
          <span class="price" :style="{ color: priceColor }">{{ currentPrice }}</span>
        </div>
      </div>
      
      <!-- K线图表区域 -->
      <div class="chart-container">
        <ChartView/>
      </div>
      
      <!-- 交易面板 -->
      <div class="trade-container">
        <TradeView/>
      </div>
    </div>
    
    <!-- 订单簿面板 - 仅在桌面显示 -->
    <div v-if="isDesktop" class="trade-panel orderbook-panel">
      <OrderbookView/>
    </div>
    
    <!-- 最新成交面板 - 仅在桌面显示 -->
    <div v-if="isDesktop" class="trade-panel filledorders-panel">
      <div class="filled-orders-header">
        <h3 class="panel-title">最新成交</h3>
      </div>
      <FilledOrderView/>
    </div>
    
    <!-- 移动端和平板的标签页视图 -->
    <div v-if="!isDesktop" class="mobile-tabs trade-panel">
      <el-tabs type="card">
        <el-tab-pane label="订单簿">
          <div class="tab-content">
            <OrderbookView/>
          </div>
        </el-tab-pane>
        <el-tab-pane label="成交">
          <div class="tab-content">
            <FilledOrderView/>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="isMobile" label="市场">
          <div class="tab-content">
            <MarketView/>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
.trade-layout {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 3px;
  background-color: rgba(0, 0, 0, 0.12);
  
  &.mobile-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    height: auto;
  }
  
  &.tablet-layout {
    grid-template-columns: 240px 1fr;
    grid-template-rows: 1fr auto;
    grid-template-areas: 
      "market chart"
      "market trade"
      "market tabs";
    height: calc(100vh - 64px - 200px);
  }
  
  &.desktop-layout {
    grid-template-columns: 280px minmax(0, 3fr) minmax(0, 0.75fr) minmax(0, 0.9fr);
    grid-template-rows: minmax(0, 1fr);
    height: calc(100vh - 64px - 200px);
  }
}

.trade-panel {
  background-color: var(--binance-bg-base);
  border-radius: 1px;
  border: none;
  overflow: hidden;
  
  &.market-panel {
    height: 100%;
    max-height: 100%;
    overflow-y: auto;
  }
  
  &.center-panel {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 0;
    background-color: rgba(0, 0, 0, 0.1);
    height: 100%;
  }
  
  &.orderbook-panel, &.filledorders-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
  }
}

.symbol-header {
  display: flex;
  align-items: center;
  padding: var(--binance-spacing-sm);
  border-radius: 0;
  background-color: var(--binance-bg-base);
  
  .symbol-info {
    display: flex;
    align-items: center;
    gap: var(--binance-spacing-md);
    
    .symbol-name {
      font-weight: 600;
      font-size: 16px;
    }
    
    .price {
      font-weight: 600;
      font-size: 16px;
    }
  }
}

.chart-container {
  flex: 2.5;
  min-height: 400px;
  border-radius: 0;
  overflow: hidden;
  background-color: #1e2026;
  
  @media (max-width: 768px) {
    min-height: 400px;
  }
}

.trade-container {
  flex: 1;
  margin-top: 0;
  border-radius: 0;
  background-color: var(--binance-bg-base);
  border: none;
  overflow: auto;
  min-height: 280px;
  
  @media (max-width: 768px) {
    padding: 0;
    height: auto;
    min-height: 450px;
  }
}

.filled-orders-header {
  padding: 7px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.panel-title {
  font-size: 13px;
  font-weight: 500;
  margin: 0;
  color: var(--binance-text-primary);
}

.mobile-tabs {
  margin-top: 0;
  border-radius: 0;
  background-color: var(--binance-bg-base);
  border: none;
  overflow: hidden;
  
  .tab-content {
    height: 300px;
    overflow: auto;
  }
  
  :deep(.el-tabs__header) {
    margin: 0;
    background-color: var(--binance-bg-base);
  }
  
  :deep(.el-tabs__nav) {
    border: none !important;
  }
  
  :deep(.el-tabs__item) {
    border: none !important;
    height: 40px;
    color: var(--binance-text-secondary);
    
    &.is-active {
      color: var(--binance-primary);
      background-color: transparent;
      font-weight: 500;
    }
  }
  
  :deep(.el-tabs__active-bar) {
    background-color: var(--binance-primary);
  }
}

@media (max-width: 1200px) {
  .tablet-layout .market-panel {
    grid-area: market;
  }
  
  .tablet-layout .center-panel {
    grid-area: chart;
  }
  
  .tablet-layout .trade-container {
    grid-area: trade;
    min-height: 360px;
  }
  
  .tablet-layout .mobile-tabs {
    grid-area: tabs;
  }
}
</style>
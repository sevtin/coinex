<script setup lang="ts">
import {onMounted, ref, watch, computed} from "vue";
import {Subscribe} from "@/pkg/xws/xws";
import {instance} from "@/singleton/wsClient";
import type {Depth, DepthItem} from "@/api/depth";
import {useOperationStore} from "@/stores/operationStore";
import {stringToNumber, stringToPrice} from "@/pkg/utils/number";
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

const operationStore = useOperationStore()

const bids = ref<DepthItem[]>([]);
const asks = ref<DepthItem[]>([]);
const maxOrdersToDisplay = 12; // 限制显示的最大订单数量

// 价格相关数据
const tickerColor = ref('#FFFFF0');
const tickerClose = ref('0');
const tickerOpen = ref('0');
const tickerSymbol = ref('');

// 计算涨跌幅
const priceChange = computed(() => {
  const open = parseFloat(tickerOpen.value);
  const close = parseFloat(tickerClose.value);
  
  if (open <= 0) return 0;
  
  return ((close - open) / open) * 100;
});

// 确定涨跌幅的颜色
const changeColor = computed(() => {
  if (priceChange.value > 0) return 'var(--binance-buy)';
  if (priceChange.value < 0) return 'var(--binance-sell)';
  return 'var(--binance-text-secondary)';
});

// 确定涨跌幅的背景颜色
const changeBackgroundColor = computed(() => {
  if (priceChange.value > 0) return 'rgba(14, 203, 129, 0.15)';
  if (priceChange.value < 0) return 'rgba(246, 70, 93, 0.15)';
  return 'rgba(0, 0, 0, 0.15)';
});

// {"topic":"BTCUSDT@DEPTH_5","data":{"ts":1710746280,"market_id":1,"symbol":"BTCUSDT","levels":5,"bids":[[20,9540],[19,1200],[18,12]],"asks":null}}
const depthHandler = (symbol: string, levels: number, sub: Subscribe) => {
  if (symbol != operationStore.getTicker.symbol) {
    return
  }
  let depth = sub.data as Depth
  
  // 获取订单并限制数量
  let askItems = getDepthItems(depth.asks, depth.ts, true);
  let bidItems = getDepthItems(depth.bids, depth.ts, true);
  
  // 限制显示的订单数量
  asks.value = askItems.slice(0, maxOrdersToDisplay);
  bids.value = bidItems.slice(0, maxOrdersToDisplay);
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
  
  // 初始化价格相关数据
  tickerColor.value = operationStore.getTicker.color
  tickerClose.value = operationStore.getTicker.close
  tickerOpen.value = operationStore.getTicker.open
  tickerSymbol.value = operationStore.getTicker.symbol
})

// 监听价格变化
watch(
    operationStore.getTicker,
    (newTicker, oldTicker) => {
    tickerColor.value = newTicker.color
    tickerClose.value = newTicker.close
    tickerOpen.value = newTicker.open
    tickerSymbol.value = newTicker.symbol
    }
);

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
    <div class="orderbook-header">
      <h3 class="header-title">订单簿</h3>
    </div>
    
    <div class="orderbook-columns">
      <div class="column-header price">价格</div>
      <div class="column-header amount">数量</div>
    </div>
    
    <div class="orderbook-content">
      <!-- 卖单区域 - 反向排列 -->
      <div class="asks-container">
        <div 
          v-for="(item, index) in asks" 
          :key="'ask-' + index" 
          class="order-item ask"
        >
          <div class="order-price text-sell">{{ item.price }}</div>
          <div class="order-amount">{{ item.amount }}</div>
        </div>
        
        <div v-if="asks.length === 0" class="empty-row">
          <div class="empty-message">暂无数据</div>
        </div>
      </div>
      
      <!-- 当前价格区域 -->
      <div class="price-info-container">
        <div class="price-info-wrapper">
          <div class="symbol-name">{{ tickerSymbol }}</div>
          <div class="current-price" :style="{ color: tickerColor }">
            <el-icon v-if="priceChange > 0" class="trend-icon up"><ArrowUp /></el-icon>
            <el-icon v-else-if="priceChange < 0" class="trend-icon down"><ArrowDown /></el-icon>
            {{ tickerClose }}
          </div>
          <div class="price-change" :style="{ backgroundColor: changeBackgroundColor, color: changeColor }">
            {{ priceChange > 0 ? '+' : '' }}{{ priceChange.toFixed(2) }}%
          </div>
        </div>
      </div>
      
      <!-- 买单区域 -->
      <div class="bids-container">
        <div 
          v-for="(item, index) in bids" 
          :key="'bid-' + index" 
          class="order-item bid"
        >
          <div class="order-price text-buy">{{ item.price }}</div>
          <div class="order-amount">{{ item.amount }}</div>
        </div>
        
        <div v-if="bids.length === 0" class="empty-row">
          <div class="empty-message">暂无数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.orderbook-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--binance-bg-base);
  border-radius: 3px;
  overflow: hidden;
}

.orderbook-header {
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
  background-color: rgba(0, 0, 0, 0.05);
  
  .header-title {
    font-size: 13px;
    font-weight: 500;
    margin: 0;
    color: var(--binance-text-primary);
  }
}

.orderbook-columns {
  display: flex;
  padding: 6px 8px;
  background-color: rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  
  .column-header {
    flex: 1;
    font-size: 12px;
    color: var(--binance-text-secondary);
    font-weight: 500;
    
    &.amount {
      text-align: right;
    }
  }
}

.orderbook-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  /* 确保高度分配正确 */
  .asks-container,
  .bids-container {
    height: calc(50% - 30px);
    max-height: calc(50% - 30px);
    overflow: hidden;
  }
}

.asks-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column-reverse;
  min-height: 0;
  justify-content: flex-top;
  background-color: rgba(246, 70, 93, 0.02);
  
  /* 为了确保卖单区域正确显示空白状态 */
  &:empty {
    justify-content: center;
  }
  
  /* 反转卖单排序，最低价格显示在底部 */
  .order-item {
    order: 1;
  }
  
  .empty-row {
    order: 0;
  }
}

.bids-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background-color: rgba(14, 203, 129, 0.02);
}

.order-item {
  display: flex;
  padding: 7px 10px;
  font-size: 12px;
  position: relative;
  transition: background-color 0.15s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.04);
  }
  
  &.ask {
    border-bottom: 1px solid rgba(246, 70, 93, 0.07);
  }
  
  &.bid {
    border-top: 1px solid rgba(14, 203, 129, 0.07);
  }
}

.order-price {
  flex: 1;
  font-weight: 500;
  
  &.text-buy {
    color: var(--binance-buy);
  }
  
  &.text-sell {
    color: var(--binance-sell);
  }
}

.order-amount {
  flex: 1;
  text-align: right;
  color: var(--binance-text-secondary);
}

.price-info-container {
  padding: 10px 8px;
  background-color: rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 -1px 2px rgba(0, 0, 0, 0.1);
}

.price-info-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.symbol-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--binance-text-primary);
  background-color: rgba(255, 255, 255, 0.05);
  padding: 2px 4px;
  border-radius: 2px;
}

.current-price {
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  
  .trend-icon {
    font-size: 12px;
    margin-right: 3px;
    
    &.up {
      color: var(--binance-buy);
    }
    
    &.down {
      color: var(--binance-sell);
    }
  }
}

.price-change {
  font-size: 10px;
  padding: 3px 6px;
  border-radius: 4px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.empty-row {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.empty-message {
  color: var(--binance-text-tertiary);
  font-size: 12px;
  font-style: italic;
}
</style>
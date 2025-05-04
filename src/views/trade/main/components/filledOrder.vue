<script setup lang="ts">
import {onMounted, ref, watch, onBeforeUnmount} from 'vue'

import {Subscribe} from "@/pkg/xws/xws";
import {instance} from "@/singleton/wsClient";
import type {Trade} from "@/api/trade";
import {timestampToHourMinuteSecond} from "@/pkg/utils/time";
import {useOperationStore} from "@/stores/operationStore";
import {stringToNumber, stringToPrice} from "@/pkg/utils/number";

const operationStore = useOperationStore()

const tableData = ref<Trade[]>([]);

const tradeHandler = (symbol: string, sub: Subscribe) => {
  if (symbol != operationStore.getTicker.symbol) {
    return
  }

  let list = sub.data as any[][]
  const items = list.map((item) => {
    const m = {
      time: timestampToHourMinuteSecond(item[0]),
      price: stringToPrice(item[1]),
      amount: stringToNumber(item[2]),
      direction: item[3],
      color: item[3] === 1 ? 'var(--binance-buy)' : item[3] === 2 ? 'var(--binance-sell)' : '#FFFFF0',
    };
    return m;
  });
  if (items.length===50) {
    tableData.value = items
  }else {
    tableData.value.unshift(...items);
  }
}

const judgeVisibility = (() => {
  if (document.visibilityState === 'visible') {
    tableData.value = []
  }
})

onMounted(() => {
  instance.SetTradeHandler("filledOrder.vue", tradeHandler)
  document.addEventListener('visibilitychange', judgeVisibility);
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', judgeVisibility);
});

watch(
    operationStore.getTrade,
    (newTrade, oldTrade) => {
      tableData.value = [];
    }
);

</script>
<!--0:平价交易 1:主动买入 2:主动卖出-->
<template>
  <div class="filled-order-container">
    <div class="filled-order-content">
      <div class="filled-order-list" v-if="tableData.length > 0">
        <div 
          v-for="(item, index) in tableData" 
          :key="index" 
          class="filled-order-item"
        >
          <div class="item-col time">{{ item.time }}</div>
          <div class="item-col price" :style="{ color: item.color }">{{ item.price }}</div>
          <div class="item-col amount">{{ item.amount }}</div>
        </div>
      </div>
      
      <div class="empty-data" v-else>
        <span>暂无数据</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.filled-order-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--binance-bg-base);
}

.filled-order-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.filled-order-list {
  flex: 1;
  overflow-y: auto;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 24px;
    background: linear-gradient(to bottom, var(--binance-bg-base), transparent);
    z-index: 2;
    pointer-events: none;
  }
}

.filled-order-item {
  display: flex;
  padding: 6px 7px;
  font-size: 12px;
  border-bottom: 1px solid rgba(42, 45, 53, 0.3);
  
  &:hover {
    background-color: var(--binance-bg-tertiary);
  }
}

.item-col {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &.time {
    flex: 1;
    color: var(--binance-text-secondary);
  }
  
  &.price {
    flex: 1;
    text-align: right;
    font-weight: 500;
  }
  
  &.amount {
    flex: 1.5;
    text-align: right;
    color: var(--binance-text-secondary);
  }
}

.empty-data {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--binance-text-tertiary);
  font-style: italic;
  font-size: 13px;
}
</style>

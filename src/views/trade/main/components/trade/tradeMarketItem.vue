<template>
  <div class="market-item-container" :class="order.side === 1 ? 'buy-container' : 'sell-container'">
    <div class="form-field mb-2">
      <div class="field-label">数量</div>
      <div class="input-wrapper">
        <input 
          type="number" 
          v-model="amount" 
          :placeholder="order.side === 1 ? '买入数量' : '卖出数量'"
          class="form-input"
        />
        <div class="input-suffix">{{ baseSymbol }}</div>
      </div>
    </div>
    
    <button 
      class="submit-button" 
      :class="order.side === 1 ? 'buy-button' : 'sell-button'"
      @click="submitOrder"
    >
      {{ submitTitle }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed, PropType, watch} from 'vue'
import type {Order} from "@/api/order";
import {createOrder} from "@/api/order";
import {useOperationStore} from "@/stores/operationStore";
import {throttle} from "lodash";

const operationStore = useOperationStore()

const props = defineProps({
  order: {
    type: Object as PropType<Order>,
    required: true,
  }
})

// 获取当前交易对的基础币种
const baseSymbol = computed(() => {
  // 从ticker中获取当前交易对，并解析出基础币种
  const symbolPair = operationStore.getTicker.symbol || 'BTCUSDT';
  return symbolPair.split('USDT')[0];
});

const submitTitle = computed(() => {
  return props.order?.side === 1 ? '买入' : '卖出'
})

// 使用简单的ref来代替复杂的表单验证
const amount = ref(0)

// 简化表单提交
const submitOrder = () => {
  if (!validateForm()) return;
  
  createOrder({
    market_id: operationStore.getTicker.market_id,
    order_type: props.order.order_type,
    side: props.order.side,
    unfilled_qty: amount.value.toString()
  }).then((res) => {
    if (res.code === 0) {
      setTimeout(() => {
        throttledLoadAccount()
      }, 2000);
    } else {
      console.error(res.msg || '服务器返回异常');
    }
  });
}

// 简化的表单验证
const validateForm = () => {
  if (!amount.value || amount.value <= 0) {
    console.error('请输入有效数量');
    return false;
  }
  
  return true;
}

const throttledLoadAccount = throttle(() => {
  operationStore.updateOrderVersion()
  operationStore.updateBalances()
}, 1000);

// 监听交易对变化，清空表单
watch(() => operationStore.getTicker.symbol, () => {
  amount.value = 0;
});
</script>

<style scoped lang="scss">
.market-item-container {
  width: 100%;
  background-color: var(--binance-bg-tertiary);
  border-radius: 4px;
  padding: 12px;
  
  &.buy-container {
    border-top: 3px solid var(--binance-buy);
  }
  
  &.sell-container {
    border-top: 3px solid var(--binance-sell);
  }
}

.form-field {
  margin-bottom: 12px;
}

.field-label {
  font-size: 12px;
  color: var(--binance-text-secondary);
  margin-bottom: 4px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--binance-bg-card);
  border: 1px solid var(--binance-border-base);
  border-radius: 4px;
  overflow: hidden;
}

.form-input {
  flex: 1;
  border: none;
  outline: none;
  background-color: transparent;
  padding: 8px 10px;
  height: 36px;
  color: var(--binance-text-primary);
  font-size: 14px;
  
  &::placeholder {
    color: var(--binance-text-tertiary);
  }
}

.input-suffix {
  padding: 0 10px;
  font-size: 12px;
  color: var(--binance-text-secondary);
}

.submit-button {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  margin-top: 8px;
  
  &.buy-button {
    background-color: var(--binance-buy);
    
    &:hover {
      background-color: rgba(14, 203, 129, 0.8);
    }
  }
  
  &.sell-button {
    background-color: var(--binance-sell);
    
    &:hover {
      background-color: rgba(246, 70, 93, 0.8);
    }
  }
}
</style>

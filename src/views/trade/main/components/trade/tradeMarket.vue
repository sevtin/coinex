<template>
  <div class="market-container">
    <div class="market-item buy-item">
      <MarketItemView :order="buy"/>
    </div>
    <div class="market-item sell-item">
      <MarketItemView :order="sell"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import MarketItemView from "@/views/trade/main/components/trade/tradeMarketItem.vue"
import type {Order} from "@/api/order";

const buy = ref({} as Order)
const sell = ref({} as Order)

onMounted(() => {
  buy.value = {
    market_id: 0,
    order_type: 1,
    side: 1,
    price: 0,
    qty: 0,
  }
  sell.value = {
    market_id: 0,
    order_type: 1,
    side: 2,
    price: 0,
    qty: 0,
  }
})

</script>

<style scoped lang="scss">
.market-container {
  width: 100%;
  display: flex;
  gap: 8px;
  height: 100%; /* 确保容器高度占满父元素 */
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
}

.market-item {
  flex: 1;
  display: flex;
  
  @media (max-width: 768px) {
    width: 100%;
  }
}
</style>

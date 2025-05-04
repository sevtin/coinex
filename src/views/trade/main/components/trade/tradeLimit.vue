<template>
  <div class="limit-container">
    <div class="limit-item buy-item">
      <LimitItemView :order="buy"/>
    </div>
    <div class="limit-item sell-item">
      <LimitItemView :order="sell"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import LimitItemView from "@/views/trade/main/components/trade/tradeLimitItem.vue"
import type {Order} from "@/api/order";

const buy = ref({} as Order)
const sell = ref({} as Order)

onMounted(() => {
  buy.value = {
    market_id: 0,
    order_type: 0,
    side: 1,
    price: 0,
    qty: 0,
  }
  sell.value = {
    market_id: 0,
    order_type: 0,
    side: 2,
    price: 0,
    qty: 0,
  }
})

</script>

<style scoped lang="scss">
.limit-container {
  width: 100%;
  display: flex;
  gap: 8px;
  height: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
}

.limit-item {
  flex: 1;
  display: flex;
  
  @media (max-width: 768px) {
    width: 100%;
  }
}
</style>

<template>
  <div class="limit-container">
    <LimitItemView class="item-view" :order="buy"/>
    <LimitItemView class="item-view" :order="sell"/>
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
  height: 100%;
  display: flex;
  justify-content: center;
  gap: 50px;
}

.item-view {
  width: 45%;
}
</style>

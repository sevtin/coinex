<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {useOperationStore} from "@/stores/operationStore";

const operationStore = useOperationStore()

const tickerColor = ref({color: '#FFFFF0'});

const tickerClose = ref("0")

onMounted(() => {
  tickerColor.value.color = operationStore.getTicker.color
  tickerClose.value = operationStore.getTicker.close
})

watch(
    operationStore.getTicker,
    (newTicker, oldTicker) => {
      tickerColor.value.color = newTicker.color
      tickerClose.value = newTicker.close
    }
);

</script>

<template>
  <div class="price-view " :style="tickerColor">
    {{ operationStore.getTicker.symbol }}: {{ tickerClose }}
  </div>
</template>

<style scoped lang="scss">
.price-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  background-color: #1c2e40;
}
</style>
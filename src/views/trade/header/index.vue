<script setup lang="ts">

import type {Balance} from "@/api/balance";
import {ref,watch,computed} from "vue";
import {useOperationStore} from "@/stores/operationStore";

const operationStore = useOperationStore()
const userBalances = computed(() => operationStore.Balances);

const balances = ref<Balance[]>([]);

/*
onMounted(() => {
  loadBalances()
});

function loadBalances() {
  GetBalances().then((resp: BalanceResp) => {
    balances.value = resp.data;
    console.log(resp)
  }).catch((err) => {
    console.log(err)
  })
}
 */

watch(
    userBalances,
    (newBalances, oldBalances) => {
      balances.value =newBalances
    }
);

</script>

<template>
  <div class="header-container">
    <div class="title-view"> eipistar模拟交易所 </div>
    <el-scrollbar>
      <div class="scrollbar-flex-content">
        <p v-for="item in balances" :key="item.cur_id" class="scrollbar-item">
          {{ item.cur_name }} : {{ item.balance }}
        </p>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
.header-container {
  width: 100%; /* 填充整个宽度 */
  height: 100%; /* 填充整个高度 */
  display: flex;
  //justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.title-view {
  width: 300px;
  font-size: 20px;
  font-weight: bold;
  align-items: center; /* 垂直居中 */
  color: white;
}

.scrollbar-flex-content {
  display: flex;
}
.scrollbar-item {
  font-size: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  //margin: 10px;
  text-align: center;
  color: white;
}
</style>
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
      color: item[3] === 1 ? '#0ECB81' : item[3] === 2 ? '#F6465D' : '#FFFFF0',
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
    <el-table
        :data="tableData"
        :highlight-current-row="false"
        class="table-style"
        style="height: 800px; width: 100%"
    >
      <el-table-column fixed prop="time" label="时间" width="80"/>
      <el-table-column label="价格" width="120">
        <template #default="scope">
          <span
              :style="{ color: scope.row.color}">{{
              scope.row.price
            }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数量" width="120">
        <template #default="scope">
          <span
              :style="{ color: scope.row.color}">{{
              scope.row.amount
            }}</span>
        </template>
      </el-table-column>
      <template v-slot:empty>
        <div class="table-no-data">暂无数据</div>
      </template>
    </el-table>
  </div>
</template>

<style scoped lang="scss">

.filled-order-container {
  width: 100%;
  height: 100%;
}

.table-style {
  background-color: #2c3e50 !important;
}

.table-style ::v-deep .el-table th.el-table__cell,
::v-deep .el-table th,
::v-deep .el-table tr {
  color: white;
  background-color: #2c3e50 !important;
  font-size: 12px;
}

::v-deep .el-table__body .el-table__row.hover-row td {
  background-color: #1c2e40 !important;
}

</style>

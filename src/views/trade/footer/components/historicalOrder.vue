<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {orderList} from "@/api/order";
import type {OrderInfo} from "@/api/order";
import {createGuest} from "@/api/user";
import {instance} from "@/singleton/wsClient";
import {timestampFormat} from "@/pkg/utils/time";
import {default as vElTableInfiniteScroll} from "el-table-infinite-scroll";
import {useOperationStore} from "@/stores/operationStore";

const operationStore = useOperationStore()

const props = defineProps({
  history: {
    type: Boolean,
    required: true,
    default: false
  }
})

const tableData = ref([] as OrderInfo[]);
const pageLimit: number = 10;
var lastId: string = "0";
var hasMore: Boolean = true;

onMounted(() => {
  loadOrderList()
})

const loadOrderList = (() => {
  let oldLastId = lastId;
  orderList({"history": props.history, "limit": pageLimit, "last_id": lastId}).then((res) => {
    if (res.code===605) {
      createGuest().then((resp) => {
        if (resp.code == 0) {
          instance.reconnect()
        }
      })
      return;
    }
    if (!res.data) {
      if (lastId === "0") {
        tableData.value = [];
      }
      return;
    }
    let list = res.data as OrderInfo[];
    if (list.length === 0) {
      return;
    }

    list.forEach((item) => {
      item.ts_str = timestampFormat(item.created_ts*1000);
      item.side_str = item.side === 1 ? '买' : '卖';
      item.order_type_str = item.order_type === 1 ? '市价' : '限价';
      item.price_str = item.order_type === 1 ? '市价' : item.price
      item.qty_str = item.filled_qty + "/" + item.unfilled_qty;
      switch (item.order_status) {
        case 0:
          item.order_status_str = '挂单中';
          break;
        case 1:
          item.order_status_str = '部分成交';
          break;
        case 2:
          item.order_status_str = '已完成';
          break;
        case 3:
          item.order_status_str = '已取消';
          break;
        case 4:
          item.order_status_str = '已拒绝';
          break;
        case 5:
          item.order_status_str = '失败';
          break;
      }
    })
    if (list.length < pageLimit) {
      hasMore = false;
    } else {
      hasMore = true;
    }
    if (oldLastId === "0") {
      tableData.value = list;
    } else {
      tableData.value.push(...list);
    }
  })
})

defineExpose({
  loadOrderList
})

</script>

<template>
  <div class="historical-order-container">
    <el-table
        :data="tableData"
        style="height: 400px; width: 100%;"
        class="table-style"
        v-el-table-infinite-scroll="loadOrderList"
        :infinite-scroll-distance="20"
        :infinite-scroll-disabled="!hasMore"
    >
      <el-table-column prop="ts_str" label="时间" min-width="120"/>
      <el-table-column prop="order_id" label="订单ID" min-width="120"/>
      <el-table-column prop="symbol" label="交易对" min-width="100"/>
      <el-table-column prop="side_str" label="买/卖" min-width="70"/>
      <el-table-column prop="order_type_str" label="订单类型" min-width="100"/>
      <el-table-column prop="order_status_str" label="订单状态" min-width="100"/>
      <el-table-column prop="price_str" label="委托价格" min-width="120"/>
      <el-table-column prop="qty_str" label="成交/未成交数量" min-width="150"/>
      <el-table-column prop="filled_amt" label="成交金额" min-width="120"/>
    </el-table>
  </div>
</template>

<style scoped lang="scss">
.historical-order-container {
  width: 100%;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.table-style {
  width: 100%;
  overflow-x: auto;
}

// 修改表格样式，确保填满页面
:deep(.el-table) {
  width: 100% !important;
  max-width: 100%;
}

// 设置表格容器填满父容器
:deep(.el-table__inner-wrapper) {
  width: 100%;
}

// 表头和单元格样式
:deep(.el-table th.el-table__cell),
:deep(.el-table th),
:deep(.el-table tr) {
  color: white;
  font-size: 12px;
}

// 悬停效果相关样式
:deep(.el-table tbody tr:hover > td) {
  background-color: #1c2e40 !important;
}

:deep(.el-table__body tr.current-row > td) {
  background-color: #1c2e40 !important;
}

// 确保表格内容不会被截断
:deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

// 移除表格内边距
:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  margin: 0;
  padding: 0;
}

// 确保表格内容紧贴边缘
:deep(.el-table__inner-wrapper) {
  padding: 0;
  margin: 0;
}
</style>
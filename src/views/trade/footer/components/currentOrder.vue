<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import {orderList, cancelOrder} from "@/api/order";
import type {OrderInfo} from "@/api/order";
import {timestampFormat} from "@/pkg/utils/time";
import {quantity_ratio, price_ratio, amount_ratio} from "@/pkg/ratio/ratio";
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

watch(
    operationStore.getOrder,
    (newOrder, oldOrder) => {
      lastId = "0";
      loadOrderList();
    }
);

const loadOrderList = (() => {
  let oldLastId = lastId;
  orderList({"history": props.history, "limit": pageLimit, "last_id": lastId}).then((res) => {
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
    lastId = list[list.length - 1].order_id.toString();
    list.forEach((item) => {
      item.ts_str = timestampFormat(item.created_ts);
      item.side_str = item.side === 1 ? '买' : '卖';
      item.order_type_str = item.order_type === 1 ? '市价' : '限价';
      item.price_str = item.order_type === 1 ? '市价' : (item.price / price_ratio).toFixed(2)
      item.qty_str = (item.filled_qty / quantity_ratio) + "/" + (item.unfilled_qty / quantity_ratio);
      item.filled_amt_str = (item.filled_amt / amount_ratio).toFixed(2);
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

const onCancelOrder = (row: OrderInfo) => {
  cancelOrder({
    "order_id": row.order_id.toString(),
    "market_id": row.market_id,
    "side": row.side,
    "price": row.price
  }).then((res) => {
    if (res.code === 0) {
      lastId = "0";
      loadOrderList();
    }
  })
}

</script>

<template>
  <div class="current-order-container">
    <el-table
        :data="tableData"
        style="height: 400px;"
        class="table-style"
        v-el-table-infinite-scroll="loadOrderList"
        :infinite-scroll-distance="20"
        :infinite-scroll-disabled="!hasMore"
    >
      <el-table-column prop="ts_str" label="时间" width="180"/>
      <el-table-column prop="order_id" label="订单ID" width="180"/>
      <el-table-column prop="symbol" label="交易对" width="180"/>
      <el-table-column prop="side_str" label="买/卖" width="180"/>
      <el-table-column prop="order_type_str" label="订单类型" width="180"/>
      <el-table-column prop="order_status_str" label="订单状态" width="180"/>
      <el-table-column prop="price_str" label="委托价格" width="180"/>
      <el-table-column prop="qty_str" label="成交/未成交数量" width="180"/>
      <el-table-column prop="filled_amt_str" label="成交金额" width="180"/>
      <el-table-column fixed="right" label="操作" width="140" v-if="!history">
        <template #default="scope">
          <div v-if="scope.row.order_status < 2">
            <el-button size="small" type="success" @click="onCancelOrder(scope.row)">取消</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped lang="scss">

.current-order-container {
  width: 100%;
  min-height: 100px;
  display: flex;
  flex-direction: column; /* 垂直方向布局 */
  justify-content: center; /* 子元素垂直居中 */
}

.table-style {
  background-color: #2c3e50 !important;
  width: 100%;
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
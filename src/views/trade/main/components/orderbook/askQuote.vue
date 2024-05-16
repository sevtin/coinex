<script setup lang="ts">

import {DepthItem} from "@/api/depth";

const props = defineProps({
  depths: {
    type: Array as () => DepthItem[],
    required: true,
  }
})

</script>

<template>
  <div class="ask-quote">
    <el-table
        :data="props.depths"
        :show-header="false"
        class="table-style"
    >
      <el-table-column fixed prop="price_str" width="160"/>
      <el-table-column fixed prop="amount_str" width="160"/>
      <template v-slot:empty>
        <div class="noData">暂无数据</div>
      </template>
    </el-table>
  </div>
</template>

<style scoped lang="scss">
.table-style {
  background-color: #2c3e50 !important;
}

.ask-quote {
  display: flex;
  flex-direction: column-reverse; /* 将子元素按照列的方式反转排列 */
  height: 100%; /* 设置容器高度为视口高度 */
  overflow-y: auto; /* 如果表格内容超出容器高度，显示滚动条 */
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
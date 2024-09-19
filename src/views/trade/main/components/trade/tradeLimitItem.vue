<template>
  <div class="limit-item-container">
    <el-form
        ref="ruleFormRef"
        style="width: 380px"
        :model="ruleForm"
        status-icon
        :rules="rules"
        label-width="auto"
        class="ruleForm-view"
    >
      <el-form-item label="价格" prop="price">
        <el-input v-model.number="ruleForm.price"/>
      </el-form-item>
      <el-form-item label="数量" prop="amount">
        <el-input v-model.number="ruleForm.amount"/>
      </el-form-item>
      <div class="button-view">
        <el-button type="primary" @click="submitForm(ruleFormRef)">{{ submitTitle }}</el-button>
        <el-button @click="resetForm(ruleFormRef)">重置</el-button>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import {reactive, ref, computed, PropType} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import type {Order} from "@/api/order";
import {createOrder} from "@/api/order";
import {useOperationStore} from "@/stores/operationStore";
import {ElMessage} from "element-plus";

const operationStore = useOperationStore()

const props = defineProps({
  order: {
    type: Object as PropType<Order>,
    required: true,
  }
})

const submitTitle = computed(() => {
  return props.order?.side === 1 ? '买入' : '卖出'
})


const ruleFormRef = ref<FormInstance>()

const checkPrice = (_: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('Please input the Price'))
  }

  if (!Number.isFinite(value)) {
    callback(new Error('Please input a valid number with up to 2 decimal places'));
  } else {
    const floatRegex = /^\d+(\.\d{1,2})?$/;
    if (!floatRegex.test(value)) {
      callback(new Error('Please input a valid number with up to 2 decimal places'));
      return
    }
    if (value <= 0) {
      callback(new Error('Price must be greater than 0'))
    } else if (value > 1000000) {
      callback(new Error('Price must be less than 1000000'))
    } else {
      callback()
    }
  }
}

const checkAmount = (_: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('Please input the Amount'))
  }

  if (!Number.isFinite(value)) {
    callback(new Error('Please input a valid number with up to 8 decimal places'));
  } else {
    const floatRegex = /^\d+(\.\d{1,8})?$/;
    if (!floatRegex.test(value)) {
      callback(new Error('Please input a valid number with up to 8 decimal places'));
      return
    }
    if (value <= 0) {
      callback(new Error('Amount must be greater than 0'))
    } else if (value > 1000000) {
      callback(new Error('Amount must be less than 1000000'))
    } else {
      callback()
    }
  }
}

const ruleForm = reactive({
  price: 0,
  amount: 0,
})

const rules = reactive<FormRules<typeof ruleForm>>({
  price: [{validator: checkPrice, trigger: 'blur'}],
  amount: [{validator: checkAmount, trigger: 'blur'}],
})

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      createOrder({
        market_id: operationStore.getTicker.market_id,
        order_type: props.order.order_type,
        side: props.order.side,
        price: ruleForm.price.toString(),
        unfilled_qty: ruleForm.amount.toString()
      }).then((res) => {
        if (res.code===0) {
          setTimeout(() => {
            operationStore.updateOrderVersion()
            operationStore.updateBalances()
          }, 2000);
        }else {
          ElMessage({
            message: res.msg || '服务器返回异常',
            type: 'warning',
          });
        }
      })

    } else {
      console.log('error submit!')
      return false
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>

<style scoped lang="scss">
.limit-item-container {
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
}

.ruleForm-view {
  margin-top: 20px;
}

.button-view {
  display: flex;
  justify-content: center;
  gap: 40px;
}

</style>

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {createChart, IChartApi, ISeriesApi} from "lightweight-charts";
import type {Subscribe} from "@/pkg/xws/xws";
import type {KlineInfo} from "@/api/kline";
import {instance} from "@/singleton/wsClient";
import {GetKlines, KlineResp} from "@/api/kline";
import {useOperationStore} from "@/stores/operationStore";
import {timestampBarFormat} from "@/pkg/utils/time";
import {stringToNumber} from "@/pkg/utils/number";

const operationStore = useOperationStore()

interface Kline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  value: number;
  roi: number;
}

interface BarVal {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  val: number;
}

export interface Volume {
  time: number;
  value: number;
  color: string;
}

const chartData: Kline[] = [];
const volumeData: Volume[] = [];
const legendRef = ref<HTMLElement | null>(null);
const hoveredData = ref<BarVal | null>(null);

let chart: IChartApi;
let candleSeries: ISeriesApi<"Candlestick">;
let volumeSeries: ISeriesApi<"Histogram">;
let loading = false
let nodata = false

const klineHandler = (symbol: string, intvl: number, sub: Subscribe) => {
  if (symbol != operationStore.getTicker.symbol || intvl != operationStore.getKline.intvl) {
    return
  }

  let list = sub.data as any[][]
  if (!list || list.length === 0) {
    return
  }
  let fit = false;
  if (list.length > 1 || chartData.length === 0) {
    chartData.splice(0, chartData.length, ...list.map(formatKLine));
    volumeData.splice(0, volumeData.length, ...chartData.map(createVolume));
    fit = true
  } else {
    let curLine = formatKLine(list[0])
    let curVol = createVolume(curLine)
    let lastIndex = chartData.length - 1
    let lastData = chartData[lastIndex]
    if (lastData.time === curLine.time) {
      chartData[lastIndex] = curLine
      volumeData[lastIndex] = curVol
    } else {
      chartData.push(curLine)
      volumeData.push(curVol)
    }
  }
  // 设置 K 线和交易量数据
  candleSeries.setData(chartData);
  volumeSeries.setData(volumeData);
  if (fit) {
    nodata = false;
    chart.timeScale().fitContent()
  }
}

// 时间/开盘/最高/最低/收盘/成交量/成交额
const formatKLine = (line: any[]): Kline => ({
  time: line[0],
  open: stringToNumber(line[1]),
  high: stringToNumber(line[2]),
  low: stringToNumber(line[3]),
  close: stringToNumber(line[4]),
  value: stringToNumber(line[5]),
  roi: stringToNumber(line[6]),
});

const formatKLineInfo = (line: KlineInfo): Kline => ({
  time: line.ts,
  open: stringToNumber(line.open),
  high: stringToNumber(line.high),
  low: stringToNumber(line.low),
  close: stringToNumber(line.close),
  value: stringToNumber(line.vol),
  roi: stringToNumber(line.tor),
});

// 创建交易量条目
const createVolume = (kline: Kline): Volume => ({
  time: kline.time,
  value: stringToNumber(kline.value),
  color: 'rgba(82, 219, 237, 0.56)',
});

onMounted(() => {

  chart = createChart(document.getElementById('candlestick'), {
    width: 848,
    height: 494,
    // 配置图表的基本布局和样式
    layout: {
      background: {type: 'solid', color: '#2c3e50'},
      textColor: '#d1d4dc'
    },
    // 配置网格线
    grid: {
      vertLines: {visible: false},
      horzLines: {color: 'rgba(42, 46, 57, 0.5)'}
    },
    // 配置右侧价格刻度尺
    rightPriceScale: {
      borderVisible: true,
      scaleMargins: {top: 0.2, bottom: 0.2}
    },
    // 配置十字准线
    crosshair: {
      horzLine: {}
    },
    // 配置时间刻度尺
    timeScale: {
      visible: true,
      timeVisible: true,
      secondsVisible: false,
      borderVisible: true
    }
  });

  // 添加 K 线（蜡烛图）系列
  candleSeries = chart.addCandlestickSeries({
    upColor: 'rgb(14, 203, 129)',
    downColor: 'rgb(246, 70, 93)',
    borderDownColor: 'rgb(246, 70, 93)',
    borderUpColor: 'rgb(14, 203, 129)',
    wickDownColor: 'rgb(246, 70, 93)',
    wickUpColor: 'rgb(14, 203, 129)',
    // crossHairMarkerVisible: false
  });

  // 添加交易量柱状图系列
  volumeSeries = chart.addHistogramSeries({
    priceFormat: {type: 'volume'},
    priceScaleId: '',
    // crossHairMarkerVisible: false
  });

  // 配置价格刻度尺的边距
  chart.priceScale('').applyOptions({
    scaleMargins: {top: 0.8, bottom: 0}
  });

  chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
    const logicalRange = chart.timeScale().getVisibleLogicalRange();
    if (logicalRange !== null && logicalRange.from < 0 && logicalRange.to >= 1 && !loading && !nodata) {
      loadMoreData();
    }
  });

  // 更新图例内容的方法
  const updateLegend = async param => {
    if (!param || !param.time || param.logical<0) {
      hoveredData.value = null
      return;
    }
    let bar = {
      time: timestampBarFormat(param.time*1000),
      open: param.seriesData.get(candleSeries).open.toFixed(2),
      high: param.seriesData.get(candleSeries).high.toFixed(2),
      low: param.seriesData.get(candleSeries).low.toFixed(2),
      close: param.seriesData.get(candleSeries).close.toFixed(2),
      val: param.seriesData.get(volumeSeries).value,
    }
    hoveredData.value = bar
  };

  // 订阅十字准线移动事件以更新图例
  chart.subscribeCrosshairMove(updateLegend);

  // 立即更新图例
  updateLegend(undefined);

  // 自适应显示全部内容
  chart.timeScale().fitContent();

  instance.SetKlineHandler("chart.chart.vue", klineHandler)
})

watch(
    operationStore.getKline,
    (newKline, oldKline) => {
      chartData.length = 0;
      volumeData.length = 0;
      nodata = false;
      candleSeries.setData(chartData);
      volumeSeries.setData(volumeData);
      chart.timeScale().fitContent()
    }
);

function loadMoreData() {
  loading = true;
  if (!chartData || chartData.length === 0 || chartData[0].time <= 0) {
    return;
  }
  console.log("chartData[0]:", chartData[0])
  let marketId = operationStore.getTicker.market_id;
  let intvl = operationStore.getKline.intvl
  GetKlines({
    "market_id": marketId,
    "last_ts": chartData[0].time,
    "intvl": intvl,
    "limit": 50,
  }).then((resp: KlineResp) => {
    if (resp.code === 0) {
      if (!resp.data || resp.data.length === 0) {
        nodata = true;
      }
      if (resp.data && resp.data.length > 0 && marketId === operationStore.getTicker.market_id && intvl === operationStore.getKline.intvl) {
        console.log("resp.data.length:", resp.data.length)
        let reversedArray = [...resp.data].reverse();
        chartData.unshift(...reversedArray.map(formatKLineInfo));
        console.log("chartData length:", chartData.length)
        volumeData.splice(0, volumeData.length, ...chartData.map(createVolume));
        // 设置 K 线和交易量数据
        candleSeries.setData(chartData);
        volumeSeries.setData(volumeData);
      }
    }
    loading = false;
  }).catch((err) => {
    loading = false;
    console.log(err)
  })
}
</script>

<template>
  <div class="chart-view">
    <div class="value-view">
      <div v-if="hoveredData" class="items-view">
        <div class="value-item">Time: {{ hoveredData.time }}</div>
        <div class="value-item">Open: {{ hoveredData.open }}</div>
        <div class="value-item">Close: {{ hoveredData.close }}</div>
        <div class="value-item">High: {{ hoveredData.high }}</div>
        <div class="value-item">Low: {{ hoveredData.low }}</div>
        <div class="value-item">Value: {{ hoveredData.val }}</div>
      </div>
    </div>
    <div id="chart-container">
      <div id="candlestick"></div>
      <div ref="legendRef"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.chart-view {
  gap: 4px;
}

.value-view {
  width: 100%;
  height: 40px;
  //border: 1px solid #1E2329;
}

.items-view {
  width: 100%;
  height: 40px;
  display: flex;
}

.value-item {
  padding: 4px;
  min-width: 50px;
  text-align: center;
  color: #d9ecff;
  font-size: 12px;
}

#chart-container {
  width: 848px;
  height: 494px;
}

</style>
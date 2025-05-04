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
const chartContainerWidth = ref(0);
const chartContainerHeight = ref(0);

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
const createVolume = (kline: Kline): Volume => {
  const color = kline.close >= kline.open 
    ? 'rgba(14, 203, 129, 0.5)' // 上涨
    : 'rgba(246, 70, 93, 0.5)';  // 下跌
  
  return {
    time: kline.time,
    value: stringToNumber(kline.value),
    color: color,
  };
};

const handleResize = () => {
  const chartElement = document.getElementById('candlestick');
  if (chartElement) {
    const container = chartElement.parentElement;
    if (container) {
      chartContainerWidth.value = container.clientWidth || 800;
      chartContainerHeight.value = container.clientHeight || 400;
      
      if (chart) {
        chart.resize(
          chartContainerWidth.value, 
          chartContainerHeight.value
        );
      }
    }
  }
};

onMounted(() => {
  const chartElement = document.getElementById('candlestick');
  if (chartElement) {
    const container = chartElement.parentElement;
    if (container) {
      chartContainerWidth.value = container.clientWidth || 800;
      chartContainerHeight.value = container.clientHeight || 400;
    }
  }
  
  chart = createChart(document.getElementById('candlestick'), {
    width: chartContainerWidth.value,
    height: chartContainerHeight.value,
    // 配置图表的基本布局和样式
    layout: {
      background: { type: 'solid', color: '#1e2026' },
      textColor: '#848e9c'
    },
    // 配置网格线
    grid: {
      vertLines: { color: 'rgba(42, 45, 53, 0.5)', style: 1, visible: true },
      horzLines: { color: 'rgba(42, 45, 53, 0.5)', style: 1, visible: true }
    },
    // 配置右侧价格刻度尺
    rightPriceScale: {
      borderVisible: false,
      scaleMargins: { top: 0.1, bottom: 0.2 }
    },
    // 配置十字准线
    crosshair: {
      mode: 1,
      vertLine: {
        color: '#848e9c',
        width: 1,
        style: 1,
        labelBackgroundColor: '#1e2026',
      },
      horzLine: {
        color: '#848e9c',
        width: 1,
        style: 1,
        labelBackgroundColor: '#1e2026',
      }
    },
    // 配置时间刻度尺
    timeScale: {
      visible: true,
      timeVisible: true,
      secondsVisible: false,
      borderVisible: false,
      borderColor: '#2a2d35'
    }
  });

  // 添加 K 线（蜡烛图）系列
  candleSeries = chart.addCandlestickSeries({
    upColor: '#0ecb81',         // 上涨颜色：绿色
    downColor: '#f6465d',       // 下跌颜色：红色
    borderUpColor: '#0ecb81',
    borderDownColor: '#f6465d',
    wickUpColor: '#0ecb81',
    wickDownColor: '#f6465d',
    priceFormat: { type: 'price', precision: 2 }
  });

  // 添加交易量柱状图系列
  volumeSeries = chart.addHistogramSeries({
    color: 'rgba(14, 203, 129, 0.5)',
    priceFormat: { type: 'volume' },
    priceScaleId: '',
  });

  // 配置价格刻度尺的边距
  chart.priceScale('').applyOptions({
    scaleMargins: { top: 0.8, bottom: 0 }
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

  instance.SetKlineHandler("chart.chart.vue", klineHandler);
  
  window.addEventListener('resize', handleResize);
});

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
    <div class="chart-info" v-if="hoveredData">
      <div class="info-row">
        <span class="info-label">时间:</span>
        <span class="info-value time-value">{{ hoveredData.time }}</span>
        <span class="info-label">开:</span>
        <span class="info-value">{{ hoveredData.open }}</span>
        <span class="info-label">高:</span>
        <span class="info-value">{{ hoveredData.high }}</span>
        <span class="info-label">低:</span>
        <span class="info-value">{{ hoveredData.low }}</span>
        <span class="info-label">收:</span>
        <span class="info-value">{{ hoveredData.close }}</span>
        <span class="info-label">量:</span>
        <span class="info-value">{{ hoveredData.val.toFixed(6) }}</span>
      </div>
    </div>
    <div id="chart-container">
      <div id="candlestick"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chart-view {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #1e2026;
}

.chart-info {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 5;
  font-size: 12px;
  
  .info-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    background-color: rgba(30, 32, 38, 0.8);
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px solid #2a2d35;
  }
  
  .info-label {
    color: #848e9c;
    font-weight: 500;
  }
  
  .info-value {
    color: #eaecef;
    font-weight: 500;
    margin-right: 8px;
  }
  
  .time-value {
    margin-right: 16px;
  }
}

#chart-container {
  width: 100%;
  height: 100%;
}

#candlestick {
  width: 100%;
  height: 100%;
}
</style>
<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {createChart, IChartApi, ISeriesApi} from "lightweight-charts";
import ValueView from "@/views/trade/main/components/chart/value.vue"
import type {Subscribe} from "@/pkg/xws/xws";
import {instance} from "@/singleton/wsClient";
import {quantity_ratio, price_ratio, amount_ratio} from "@/pkg/ratio/ratio";

import {useOperationStore} from "@/stores/operationStore";

const operationStore = useOperationStore()

interface Kline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  roi: number;
  value: number;
}

export interface Volume {
  time: number;
  value: number;
  color: string;
}

const chartData: Kline[] = [];
const volumeData: Volume[] = [];
const legendRef = ref<HTMLElement | null>(null);

let chart: IChartApi;
let candleSeries: ISeriesApi<"Candlestick">;
let volumeSeries: ISeriesApi<"Histogram">;

const klineHandler = (symbol: string, intvl: number, sub: Subscribe) => {
  if (symbol != operationStore.getTicker.symbol || intvl != operationStore.getKline.intvl) {
    return
  }

  let list = sub.data as number[][]
  if (!list || list.length === 0) {
    return
  }
  if (list.length > 1 || chartData.length === 0) {
    chartData.splice(0, chartData.length, ...list.map(formatKLine));
    volumeData.splice(0, volumeData.length, ...chartData.map(createVolume));
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
  chart.timeScale().fitContent()
}

// 时间/开盘/最高/最低/收盘/成交量/成交额
const formatKLine = (line: number[]): Kline => ({
  time: line[0],
  open: line[1] / price_ratio,
  high: line[2] / price_ratio,
  low: line[3] / price_ratio,
  close: line[4] / price_ratio,
  roi: line[5] / quantity_ratio,
  value: line[6] / (amount_ratio*quantity_ratio),
});

// 创建交易量条目
const createVolume = (kline: Kline): Volume => ({
  time: kline.time,
  value: kline.value,
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
  // 格式化并设置数据
  // const volumeData = chartData.map(item => ({
  //   time: item.time,
  //   value: item.value,
  //   color: 'rgba(82, 219, 237, 0.56)'
  // }));
  // // 设置 K 线和交易量数据
  // candleSeries.setData(chartData);
  // volumeSeries.setData(volumeData);

  // 配置并添加图例
  // 图例的创建和更新是本项目的亮点。我创建了一个图例元素，并将其放置在图表容器中的合适位置。图例的内容基于图表上当前焦点的数据动态更新。
  const symbolName = 'ABC/USD';
  const container = document.getElementById('candlestick');
  // const legend = document.createElement('div');
  // legend.style.position = 'absolute';
  // legend.style.top = 'calc(100% + 10px)';
  // legend.style.left = '0';
  // legend.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  // legend.style.color = '#fff';
  // legend.style.padding = '5px';
  // legend.style.fontSize = '12px';
  // container.parentNode?.appendChild(legend);
  // legendRef.value = legend;
  // container.appendChild(legend);

  // 获取最后一条数据的方法
  const getLastBar = () => {

  };

  // 设置图例 HTML 的方法
  const setTooltipHtml = (name, open, high, low, close, roi, volume) => {

  };

  // 更新图例内容的方法
  const updateLegend = param => {

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
      candleSeries.setData(chartData);
      volumeSeries.setData(volumeData);
      chart.timeScale().fitContent()
    }
);
</script>

<template>
  <div class="chart-view">
    <div class="value-view">
      <ValueView/>
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

#chart-container {
  width: 848px;
  height: 494px;
}
</style>
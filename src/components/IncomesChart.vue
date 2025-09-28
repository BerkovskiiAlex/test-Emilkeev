<!-- @format -->

<script setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Line } from "vue-chartjs";
import { computed } from "vue";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const chartData = computed(() => {
  const grouped = {};

  props.data.forEach((item) => {
    const date = item.date;
    if (!grouped[date]) grouped[date] = 0;
    grouped[date] += item.quantity || 0;
  });

  const labels = Object.keys(grouped).sort();
  const values = labels.map((date) => grouped[date]);

  return {
    labels,
    datasets: [
      {
        label: "Количество доходов по дате",
        data: values,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        pointBackgroundColor: "rgb(75, 192, 192)",
        tension: 0.3,
        fill: false,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#4B5563", // цвет текста легенды (темно-серый)
        font: {
          size: 14,
          family: "'Roboto', sans-serif",
          weight: "bold",
        },
      },
    },
    title: {
      display: true,
      text: "График доходов",
      color: "#374151", // цвет заголовка
      font: {
        size: 18,
        family: "'Roboto', sans-serif",
        weight: "bold",
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: "rgba(0,0,0,0.7)",
      titleFont: {
        family: "'Roboto', sans-serif",
        size: 14,
        weight: "bold",
      },
      bodyFont: {
        family: "'Roboto', sans-serif",
        size: 12,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#6B7280", // цвет текста по оси X
        font: {
          family: "'Roboto', sans-serif",
          size: 12,
        },
      },
      grid: {
        color: "rgba(0,0,0,0.2)", // цвет сетки по оси X
      },
    },
    y: {
      ticks: {
        color: "#6B7280", // цвет текста по оси Y
        font: {
          family: "'Roboto', sans-serif",
          size: 12,
        },
      },
      grid: {
        color: "rgba(0,0,0,0.2)", // цвет сетки по оси Y
      },
    },
  },
};
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

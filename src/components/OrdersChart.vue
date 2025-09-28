<!-- @format -->

<script setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "vue-chartjs";
import { computed } from "vue";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const chartData = computed(() => {
  const labels = props.data.map((item, i) => {
    return `${item.date} #${i + 1}`;
  });

  const values = props.data.map((item) => item.total_price);

  return {
    labels,
    datasets: [
      {
        label: "Цена по дате",
        data: values,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 2,
        borderRadius: 4,
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
        color: "#4B5563",
        font: {
          size: 14,
          family: "'Roboto', sans-serif",
          weight: "bold",
        },
      },
    },
    title: {
      display: true,
      text: "График цены заказов",
      color: "#374151",
      font: {
        size: 18,
        family: "'Roboto', sans-serif",
        weight: "bold",
      },
    },
    tooltip: {
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
        color: "#6B7280",
        font: {
          family: "'Roboto', sans-serif",
          size: 12,
        },
      },
      grid: {
        color: "rgba(0,0,0,0.2)",
      },
    },
    y: {
      ticks: {
        color: "#6B7280",
        font: {
          family: "'Roboto', sans-serif",
          size: 12,
        },
      },
      grid: {
        color: "rgba(0,0,0,0.2)",
      },
    },
  },
};
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

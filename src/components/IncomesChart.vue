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
        tension: 0.1,
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
    },
    title: {
      display: true,
      text: "График доходов",
    },
  },
};
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

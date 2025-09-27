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
  const warehouseCounts = {};

  props.data.forEach((item) => {
    const warehouse = item.warehouse_name;
    if (!warehouseCounts[warehouse]) {
      warehouseCounts[warehouse] = 0;
    }
    warehouseCounts[warehouse]++;
  });

  const labels = Object.keys(warehouseCounts);
  const values = labels.map((w) => warehouseCounts[w]);

  return {
    labels,
    datasets: [
      {
        label: "Количество заказов по складам",
        data: values,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
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
      text: "Заказы по складам",
    },
  },
};
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

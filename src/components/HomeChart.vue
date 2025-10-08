<!-- @format -->

<script setup>
import { defineProps } from "vue";
import { Line } from "vue-chartjs";
import { useRouter } from "vue-router";
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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const router = useRouter();

const props = defineProps({
  title: String,
  labels: Array,
  values: Array,
  color: String,
  topChanges: {
    type: Array,
    default: () => [],
  },
  comparePeriod: String,
  dateFrom: String,
  dateTo: String,
  page: Number,
  clickable: {
    type: Boolean,
    default: false,
  },
  nmId: {
    type: [String, Number],
    default: null,
  },
});

function handleClick() {
  router.push({
    name: "details",
    query: {
      type: props.title,
      comparePeriod: props.comparePeriod,
      dateFrom: props.dateFrom,
      dateTo: props.dateTo,
      color: props.color,
      page: props.page || 1,
      nm_id: props.nmId,
    },
  });
}
</script>

<template>
  <div class="bg-white rounded shadow p-4">
    <h2 class="text-lg font-semibold mb-2">{{ title }}</h2>

    <Line
      :class="{ 'cursor-pointer': clickable }"
      :data="{
        labels: labels,
        datasets: [
          {
            label: title,
            data: values,
            borderColor: color,
            backgroundColor: color,
            tension: 0.3,
          },
        ],
      }"
      :options="{
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true },
        },
        onClick: clickable ? handleClick : undefined,
      }"
    />

    <div v-if="topChanges.length" class="mt-6">
      <h3 class="font-medium mb-2">Топ {{ topChanges.length }} изменений</h3>

      <table class="w-full text-sm border">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="p-2 border">Артикул</th>
            <th class="p-2 border">Текущий</th>
            <th class="p-2 border">Сравнительный</th>
            <th class="p-2 border">Изменение</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in topChanges" :key="item.nm_id">
            <td class="p-2 border">
              <router-link
                :to="{
                  name: 'ArticlePage',
                  params: { nmId: item.nm_id },
                  query: {
                    comparePeriod,
                    dateFrom,
                    dateTo,
                    page,
                  },
                }"
                class="text-blue-600 hover:underline"
              >
                {{ item.nm_id }}
              </router-link>
            </td>
            <td class="p-2 border">{{ item.current }}</td>
            <td class="p-2 border">{{ item.previous }}</td>
            <td class="p-2 border">
              <span
                :class="{
                  'text-green-600': item.change > 0,
                  'text-red-600': item.change < 0,
                  'text-gray-500': item.change === 0,
                }"
              >
                {{ item.change.toFixed(1) }}%
                <span v-if="item.change > 0">▲</span>
                <span v-else-if="item.change < 0">▼</span>
                <span v-else>➖</span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

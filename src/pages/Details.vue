<!-- @format -->

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useApi } from "../composables/useApi";
import HomeChart from "../components/HomeChart.vue";

const route = useRoute();
const type = ref(route.query.type);
const comparePeriod = ref(route.query.comparePeriod);
const dateFrom = ref(route.query.dateFrom);
const dateTo = ref(route.query.dateTo);
const color = ref(route.query.color || "rgba(75, 192, 192, 0.6)");
const page = ref(Number(route.query.page || 1));

const endpoint = "orders";
const { data, loading, error, fetchData } = useApi(endpoint);

const filters = ref({
  selectedDate: "",
  nm_id: "",
  oblast: "",
  category: "",
  brand: "",
});

function loadData() {
  if (!dateFrom.value || !dateTo.value) return;

  fetchData({
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    page: page.value,
    limit: 500,
  });
}

watch(
  () => route.query,
  (query) => {
    dateFrom.value = query.dateFrom;
    dateTo.value = query.dateTo;
    page.value = Number(query.page || 1);
    loadData();
  },
  { immediate: true }
);

function getPeriodKey(dateStr, period) {
  const date = new Date(dateStr);
  if (period === "day") {
    return dateStr.slice(0, 10);
  } else if (period === "week") {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / (24 * 60 * 60 * 1000);
    const weekNumber = Math.ceil(
      (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
    );
    return `${date.getFullYear()}-W${weekNumber}`;
  } else if (period === "month") {
    return dateStr.slice(0, 7);
  }
}

const availableDates = computed(() => {
  if (!data.value?.data) return [];

  const uniqueDates = new Set(
    data.value.data.map((item) => item.date?.slice(0, 10))
  );

  return Array.from(uniqueDates).sort();
});

const groupedByPeriod = computed(() => {
  const result = {};
  if (!data.value?.data) return [];

  for (const order of data.value.data) {
    const periodKey = getPeriodKey(order.date, comparePeriod.value);
    const nmId = order.nm_id;

    if (!result[periodKey]) {
      result[periodKey] = {
        period: periodKey,
        totalSales: 0,
        totalRevenue: 0,
        cancelCount: 0,
        discountSum: 0,
        discountCount: 0,
        byArticle: {},
      };
    }

    const stats = result[periodKey];
    stats.totalSales += 1;
    stats.totalRevenue += parseFloat(order.total_price || 0);
    if (order.is_cancel) stats.cancelCount += 1;
    if (order.discount_percent != null) {
      stats.discountSum += order.discount_percent;
      stats.discountCount += 1;
    }

    if (!stats.byArticle[nmId]) {
      stats.byArticle[nmId] = {
        nm_id: nmId,
        totalSales: 0,
        totalRevenue: 0,
        cancelCount: 0,
        discountSum: 0,
        discountCount: 0,
      };
    }

    const article = stats.byArticle[nmId];
    article.totalSales += 1;
    article.totalRevenue += parseFloat(order.total_price || 0);
    if (order.is_cancel) article.cancelCount += 1;
    if (order.discount_percent != null) {
      article.discountSum += order.discount_percent;
      article.discountCount += 1;
    }
  }

  return Object.values(result).sort((a, b) => a.period.localeCompare(b.period));
});

const chartLabels = computed(() =>
  groupedByPeriod.value.map((item) => item.period)
);

const chartValues = computed(() => {
  return groupedByPeriod.value.map((item) => {
    switch (type.value) {
      case "Количество продаж":
        return item.totalSales;
      case "Общая сумма продаж":
        return item.totalRevenue.toFixed(2);
      case "Количество отмен":
        return item.cancelCount;
      case "Средний % скидки":
        return item.discountCount
          ? (item.discountSum / item.discountCount).toFixed(2)
          : 0;
      default:
        return 0;
    }
  });
});

const filteredOrders = computed(() => {
  if (!data.value?.data) return [];

  return data.value.data.filter((item) => {
    const itemDate = item.date?.slice(0, 10);

    const matchesDate = filters.value.selectedDate
      ? itemDate === filters.value.selectedDate
      : true;

    const matchesNmId = filters.value.nm_id
      ? item.nm_id?.toString().includes(filters.value.nm_id)
      : true;

    const matchesOblast = filters.value.oblast
      ? item.oblast?.toLowerCase().includes(filters.value.oblast.toLowerCase())
      : true;

    const matchesCategory = filters.value.category
      ? item.category
          ?.toLowerCase()
          .includes(filters.value.category.toLowerCase())
      : true;

    const matchesBrand = filters.value.brand
      ? item.brand?.toLowerCase().includes(filters.value.brand.toLowerCase())
      : true;

    return (
      matchesDate &&
      matchesNmId &&
      matchesOblast &&
      matchesCategory &&
      matchesBrand
    );
  });
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Детальный просмотр: {{ type }}</h1>
    <p class="mb-6">
      Период: {{ comparePeriod }}<br />
      С: {{ dateFrom }} по {{ dateTo }}
    </p>

    <div v-if="loading" class="text-center">Загрузка данных...</div>
    <div v-if="error" class="text-red-600 text-center">
      Ошибка: {{ error.message }}
    </div>

    <div v-if="!loading && !error && groupedByPeriod.length">
      <HomeChart
        :title="type"
        :labels="chartLabels"
        :values="chartValues"
        :color="color"
        :topChanges="[]"
        :clickable="false"
      />
      <div class="flex flex-wrap gap-4 mb-6">
        <label class="flex flex-col w-40">
          Артикул:
          <input
            type="text"
            v-model="filters.nm_id"
            placeholder="Введите артикул"
            class="border border-gray-300 rounded px-2 py-1"
          />
        </label>

        <label class="flex flex-col w-40">
          Регион:
          <input
            type="text"
            v-model="filters.oblast"
            placeholder="Введите регион"
            class="border border-gray-300 rounded px-2 py-1"
          />
        </label>

        <label class="flex flex-col w-40">
          Категория:
          <input
            type="text"
            v-model="filters.category"
            placeholder="Введите категорию"
            class="border border-gray-300 rounded px-2 py-1"
          />
        </label>

        <label class="flex flex-col w-40">
          Бренд:
          <input
            type="text"
            v-model="filters.brand"
            placeholder="Введите бренд"
            class="border border-gray-300 rounded px-2 py-1"
          />
        </label>

        <label class="flex flex-col w-40">
          Дата:
          <select
            v-model="filters.selectedDate"
            class="border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Все</option>
            <option v-for="date in availableDates" :key="date" :value="date">
              {{ date }}
            </option>
          </select>
        </label>
      </div>

      <div class="mt-10">
        <h2 class="text-xl font-semibold mb-4">Детальные заказы</h2>
        <table class="w-full border border-gray-300 text-left text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 border">Дата</th>
              <th class="p-2 border">Артикул</th>
              <th class="p-2 border">Регион</th>
              <th class="p-2 border">Категория</th>
              <th class="p-2 border">Бренд</th>
              <th class="p-2 border">Цена</th>
              <th class="p-2 border">Скидка (%)</th>
              <th class="p-2 border">Отмена</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in filteredOrders"
              :key="item.g_number + '-' + index"
            >
              <td class="p-2 border">{{ item.date?.slice(0, 10) }}</td>
              <td class="p-2 border">{{ item.nm_id }}</td>
              <td class="p-2 border">{{ item.oblast }}</td>
              <td class="p-2 border">{{ item.category }}</td>
              <td class="p-2 border">{{ item.brand }}</td>
              <td class="p-2 border">
                {{ parseFloat(item.total_price).toFixed(2) }}
              </td>
              <td class="p-2 border">{{ item.discount_percent ?? 0 }}</td>
              <td
                class="p-2 border"
                :class="item.is_cancel ? 'text-red-500' : 'text-green-600'"
              >
                {{ item.is_cancel ? "Да" : "Нет" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="!loading && !error && !groupedByPeriod.length"
      class="text-center mt-10"
    >
      Нет данных за выбранный период
    </div>
  </div>
</template>

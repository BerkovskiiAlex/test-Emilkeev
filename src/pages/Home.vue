<!-- @format -->

<!-- Home.vue -->
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useApi } from "../composables/useApi";
import HomeChart from "../components/HomeChart.vue";

const endpoint = "orders";
const { data, loading, error, fetchData } = useApi(endpoint);

watch(data, () => {
  console.log(data.value);
});

const filters = ref({
  dateFrom: "",
  dateTo: "",
});

const currentPage = ref(1);
const lastPage = ref(1);

function loadData(page = 1) {
  currentPage.value = page;

  fetchData({
    dateFrom: filters.value.dateFrom,
    dateTo: filters.value.dateTo,
    page,
    limit: 500,
  }).then(() => {
    if (data.value?.meta?.last_page) {
      lastPage.value = data.value.meta.last_page;
    }
  });
}

onMounted(() => {
  const today = new Date().toISOString().slice(0, 10);
  filters.value.dateFrom = "2024-01-01";
  filters.value.dateTo = today;
  loadData(1);
});

watch(
  () => [filters.value.dateFrom, filters.value.dateTo],
  () => {
    loadData(1);
  }
);

// Группировка по датам и артикулам
const groupedByDate = computed(() => {
  const result = {};
  if (!data.value?.data) return [];

  for (const order of data.value.data) {
    const date = order.date.slice(0, 10);
    const nmId = order.nm_id;

    if (!result[date]) {
      result[date] = {
        date,
        totalSales: 0,
        totalRevenue: 0,
        cancelCount: 0,
        discountSum: 0,
        discountCount: 0,
        byArticle: {},
      };
    }

    const stats = result[date];
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

  return Object.values(result).sort((a, b) => a.date.localeCompare(b.date));
});

// Индексы выбранных дат
const selectedDateIndex = ref(0);
const compareToIndex = ref(1);

// Список всех дат для селектора
const allDates = computed(() => groupedByDate.value.map((item) => item.date));

// Функция сравнения двух дат по выбранному полю
const getTopChangesByField = (field) => {
  const current = groupedByDate.value[selectedDateIndex.value];
  const previous = groupedByDate.value[compareToIndex.value];

  if (!current || !previous) return [];

  const currentArticles = current.byArticle || {};
  const previousArticles = previous.byArticle || {};

  const allIds = new Set([
    ...Object.keys(currentArticles),
    ...Object.keys(previousArticles),
  ]);

  const changes = [];

  for (const id of allIds) {
    const curr = currentArticles[id]?.[field] || 0;
    const prev = previousArticles[id]?.[field] || 0;

    const diffPercent =
      prev === 0 ? (curr === 0 ? 0 : 100) : ((curr - prev) / prev) * 100;

    changes.push({
      nm_id: id,
      current: curr,
      previous: prev,
      change: diffPercent,
    });
  }

  return changes
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5);
};

function goToPage(page) {
  if (page >= 1 && page <= lastPage.value) {
    loadData(page);
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-center mb-6">
      Общая статистика заказов
    </h1>

    <div v-if="loading" class="text-center">Загрузка...</div>
    <div v-if="error" class="text-center text-red-500">{{ error.message }}</div>

    <!-- Селекторы выбора дат -->
    <div>
      <label class="flex flex-col w-40">
        Дата от:
        <input
          type="date"
          v-model="filters.dateFrom"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col w-40">
        Дата до:
        <input
          type="date"
          v-model="filters.dateTo"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
    </div>
    <div
      v-if="allDates.length"
      class="mb-6 flex flex-wrap gap-6 justify-center"
    >
      <div>
        <label class="block text-sm font-medium mb-1">Текущая дата</label>
        <select v-model="selectedDateIndex" class="border rounded px-2 py-1">
          <option v-for="(date, index) in allDates" :key="date" :value="index">
            {{ date }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Сравнить с</label>
        <select v-model="compareToIndex" class="border rounded px-2 py-1">
          <option v-for="(date, index) in allDates" :key="date" :value="index">
            {{ date }}
          </option>
        </select>
      </div>
    </div>

    <!-- Графики -->
    <div
      v-if="groupedByDate.length"
      class="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <HomeChart
        title="Количество продаж"
        :labels="groupedByDate.map((item) => item.date)"
        :values="groupedByDate.map((item) => item.totalSales)"
        :topChanges="getTopChangesByField('totalSales')"
        color="rgba(75, 192, 192, 0.6)"
      />

      <HomeChart
        title="Общая сумма продаж"
        :labels="groupedByDate.map((item) => item.date)"
        :values="groupedByDate.map((item) => item.totalRevenue.toFixed(2))"
        :topChanges="getTopChangesByField('totalRevenue')"
        color="rgba(54, 162, 235, 0.6)"
      />

      <HomeChart
        title="Количество отмен"
        :labels="groupedByDate.map((item) => item.date)"
        :values="groupedByDate.map((item) => item.cancelCount)"
        :topChanges="getTopChangesByField('cancelCount')"
        color="rgba(255, 99, 132, 0.6)"
      />

      <HomeChart
        title="Средний % скидки"
        :labels="groupedByDate.map((item) => item.date)"
        :values="
          groupedByDate.map((item) =>
            item.discountCount
              ? (item.discountSum / item.discountCount).toFixed(2)
              : 0
          )
        "
        :topChanges="getTopChangesByField('discountSum')"
        color="rgba(255, 206, 86, 0.6)"
      />
    </div>
    <div v-else-if="!loading && !error" class="text-xl text-center p-2">
      Нет данных
    </div>
    <div v-if="lastPage > 1" class="text-center p-2">
      <button
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
        class="px-2 py-1 mr-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
      >
        Назад
      </button>
      <span class="mx-2"> Страница {{ currentPage }} из {{ lastPage }} </span>
      <button
        :disabled="currentPage === lastPage"
        @click="goToPage(currentPage + 1)"
        class="px-2 py-1 ml-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
      >
        Вперёд
      </button>
    </div>
  </div>
</template>

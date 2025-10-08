<!-- @format -->

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useApi } from "../composables/useApi";
import HomeChart from "../components/HomeChart.vue";
import { storeToRefs } from "pinia";
import { useFiltersStore } from "../stores/filtersStore";

const endpoint = "orders";
const { data, loading, error, fetchData } = useApi(endpoint);

const currentPage = ref(1);
const lastPage = ref(1);
const filtersStore = useFiltersStore();
const { resetFilters } = filtersStore;
const { filters } = storeToRefs(filtersStore);

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

  if (!filters.value.dateFrom || !filters.value.dateTo) {
    filtersStore.setFilters({
      dateFrom: "2024-01-01",
      dateTo: today,
    });
  }

  loadData(1);
});

watch(
  () => [filters.value.dateFrom, filters.value.dateTo, filters.value.nmId],
  () => {
    loadData(1);
  }
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
    return `${date.getFullYear()}-Неделя ${weekNumber}`;
  } else if (period === "month") {
    return dateStr.slice(0, 7);
  }
}

const groupedByPeriod = computed(() => {
  const result = {};
  if (!data.value?.data) return [];

  const filterNmId = filters.value.nmId?.trim();

  for (const order of data.value.data) {
    if (filterNmId && String(order.nm_id) !== filterNmId) continue;
    const periodKey = getPeriodKey(order.date, filters.value.comparePeriod);
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

const selectedPeriodIndex = ref(1);
const compareToIndex = ref(0);

const allPeriods = computed(() =>
  groupedByPeriod.value.map((item) => item.period)
);

const getTopChangesByField = (field) => {
  const current = groupedByPeriod.value[selectedPeriodIndex.value];
  const previous = groupedByPeriod.value[compareToIndex.value];

  if (!current || !previous) return [];

  const currentArticles = current.byArticle || {};
  const previousArticles = previous.byArticle || {};

  const allIds = new Set([
    ...Object.keys(currentArticles),
    ...Object.keys(previousArticles),
  ]);

  const changes = [];

  for (const id of allIds) {
    let curr = 0;
    let prev = 0;

    if (field === "averageDiscount") {
      const currArticle = currentArticles[id] || {};
      const prevArticle = previousArticles[id] || {};
      curr =
        currArticle.discountCount > 0
          ? currArticle.discountSum / currArticle.discountCount
          : 0;
      prev =
        prevArticle.discountCount > 0
          ? prevArticle.discountSum / prevArticle.discountCount
          : 0;
    } else {
      curr = currentArticles[id]?.[field] || 0;
      prev = previousArticles[id]?.[field] || 0;
    }

    const diffPercent =
      prev === 0 ? (curr === 0 ? 0 : 100) : ((curr - prev) / prev) * 100;

    changes.push({
      nm_id: id,
      current: +curr.toFixed(2),
      previous: +prev.toFixed(2),
      change: diffPercent,
    });
  }

  return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
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

    <div class="mb-4 flex gap-4 items-center justify-center">
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
      <label class="flex flex-col w-48">
        Период сравнения:
        <select
          v-model="filters.comparePeriod"
          class="border border-gray-300 rounded px-2 py-1"
        >
          <option value="day">День</option>
          <option value="week">Неделя в году</option>
          <option value="month">Месяц</option>
        </select>
      </label>
      <label class="flex flex-col w-40">
        Артикул:
        <input
          type="text"
          v-model="filters.nmId"
          placeholder="Введите артикул"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <button
        @click="resetFilters"
        class="self-end px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Сбросить фильтры
      </button>
    </div>

    <div
      v-if="allPeriods.length"
      class="mb-6 flex flex-wrap gap-6 justify-center"
    >
      <div>
        <label class="block text-sm font-medium mb-1">Текущий период</label>
        <select v-model="selectedPeriodIndex" class="border rounded px-2 py-1">
          <option
            v-for="(period, index) in allPeriods"
            :key="period"
            :value="index"
          >
            {{ period }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Сравнить с</label>
        <select v-model="compareToIndex" class="border rounded px-2 py-1">
          <option
            v-for="(period, index) in allPeriods"
            :key="period"
            :value="index"
          >
            {{ period }}
          </option>
        </select>
      </div>
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

    <div
      v-if="groupedByPeriod.length"
      class="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <HomeChart
        title="Количество продаж"
        :labels="groupedByPeriod.map((item) => item.period)"
        :values="groupedByPeriod.map((item) => item.totalSales)"
        :topChanges="getTopChangesByField('totalSales')"
        color="rgba(75, 192, 192, 0.6)"
        :comparePeriod="filters.comparePeriod"
        :dateFrom="filters.dateFrom"
        :dateTo="filters.dateTo"
        :page="currentPage"
        :clickable="true"
        :nmId="filters.nmId"
      />

      <HomeChart
        title="Общая сумма продаж"
        :labels="groupedByPeriod.map((item) => item.period)"
        :values="groupedByPeriod.map((item) => item.totalRevenue.toFixed(2))"
        :topChanges="getTopChangesByField('totalRevenue')"
        color="rgba(54, 162, 235, 0.6)"
        :comparePeriod="filters.comparePeriod"
        :dateFrom="filters.dateFrom"
        :dateTo="filters.dateTo"
        :page="currentPage"
        :clickable="true"
        :nmId="filters.nmId"
      />

      <HomeChart
        title="Количество отмен"
        :labels="groupedByPeriod.map((item) => item.period)"
        :values="groupedByPeriod.map((item) => item.cancelCount)"
        :topChanges="getTopChangesByField('cancelCount')"
        color="rgba(255, 99, 132, 0.6)"
        :comparePeriod="filters.comparePeriod"
        :dateFrom="filters.dateFrom"
        :dateTo="filters.dateTo"
        :page="currentPage"
        :clickable="true"
        :nmId="filters.nmId"
      />

      <HomeChart
        title="Средний % скидки"
        :labels="groupedByPeriod.map((item) => item.period)"
        :values="
          groupedByPeriod.map((item) =>
            item.discountCount
              ? (item.discountSum / item.discountCount).toFixed(2)
              : 0
          )
        "
        :topChanges="getTopChangesByField('averageDiscount')"
        color="rgba(255, 206, 86, 0.6)"
        :comparePeriod="filters.comparePeriod"
        :dateFrom="filters.dateFrom"
        :dateTo="filters.dateTo"
        :page="currentPage"
        :clickable="true"
        :nmId="filters.nmId"
      />
    </div>
    <div v-else-if="!loading && !error" class="text-xl text-center p-2">
      Нет данных
    </div>
  </div>
</template>

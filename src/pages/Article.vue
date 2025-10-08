<!-- @format -->

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "../composables/useApi";
import { useFiltersStore } from "../stores/filtersStore";

const route = useRoute();
const router = useRouter();
const filtersStore = useFiltersStore();
const { filters } = filtersStore;

const nmId = route.params.nmId;
const endpoint = "orders";
const { data, loading, error, fetchData } = useApi(endpoint);

const dateFrom = route.query.dateFrom || filters.dateFrom;
const dateTo = route.query.dateTo || filters.dateTo;
const comparePeriod = route.query.comparePeriod || filters.comparePeriod;
const page = Number(route.query.page) || 1;

watch(
  () => route.query,
  (newQuery) => {
    fetchData({
      dateFrom: newQuery.dateFrom || filters.dateFrom,
      dateTo: newQuery.dateTo || filters.dateTo,
      page: Number(newQuery.page) || 1,
      limit: 500,
    });
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
    return `${date.getFullYear()}-Неделя ${weekNumber}`;
  } else if (period === "month") {
    return dateStr.slice(0, 7);
  }
}

const articleOrders = computed(
  () =>
    data.value?.data?.filter((item) => String(item.nm_id) === String(nmId)) ||
    []
);

const articleInfo = computed(() => articleOrders.value[0] || {});

const periods = computed(() => {
  const keys = new Set();
  articleOrders.value.forEach((order) => {
    keys.add(getPeriodKey(order.date, comparePeriod));
  });
  return Array.from(keys).sort();
});

const statsByPeriod = computed(() => {
  const result = {};

  for (const period of periods.value) {
    result[period] = {
      totalSales: 0,
      totalRevenue: 0,
      cancelCount: 0,
      discountSum: 0,
      discountCount: 0,
    };
  }

  for (const order of articleOrders.value) {
    const periodKey = getPeriodKey(order.date, comparePeriod);
    const stats = result[periodKey];

    stats.totalSales += 1;
    stats.totalRevenue += parseFloat(order.total_price || 0);
    if (order.is_cancel) stats.cancelCount += 1;
    if (order.discount_percent != null) {
      stats.discountSum += order.discount_percent;
      stats.discountCount += 1;
    }
  }

  return result;
});
</script>

<template>
  <div class="flex p-6 gap-6">
    <div class="w-1/3 bg-white rounded shadow p-4">
      <div class="mb-4">
        <img
          src="https://placehold.co/300x300?text=Image"
          alt="Product"
          class="w-full h-auto rounded"
        />
      </div>
      <h2 class="text-xl font-bold mb-2">Артикул: {{ articleInfo.nm_id }}</h2>
      <p>
        <strong>Артикул поставщика:</strong>
        {{ articleInfo.supplier_article || "—" }}
      </p>
      <p><strong>Размер:</strong> {{ articleInfo.tech_size || "—" }}</p>
      <p><strong>Штрихкод:</strong> {{ articleInfo.barcode || "—" }}</p>
      <p><strong>Бренд:</strong> {{ articleInfo.brand || "—" }}</p>
      <p><strong>Категория:</strong> {{ articleInfo.category || "—" }}</p>
      <p><strong>Склад:</strong> {{ articleInfo.warehouse_name || "—" }}</p>
      <p><strong>Регион:</strong> {{ articleInfo.oblast || "—" }}</p>
    </div>

    <div class="w-2/3 bg-white rounded shadow p-4 overflow-auto">
      <h2 class="text-xl font-semibold mb-4">Показатели по периодам</h2>
      <table class="w-full border text-sm">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-2 border">Показатель</th>
            <th class="p-2 border" v-for="period in periods" :key="period">
              {{ period }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-2 border font-medium">Количество продаж</td>
            <td class="p-2 border" v-for="period in periods" :key="period">
              {{ statsByPeriod[period]?.totalSales || 0 }}
            </td>
          </tr>
          <tr>
            <td class="p-2 border font-medium">Сумма продаж</td>
            <td class="p-2 border" v-for="period in periods" :key="period">
              {{ statsByPeriod[period]?.totalRevenue.toFixed(2) || "0.00" }}
            </td>
          </tr>
          <tr>
            <td class="p-2 border font-medium">Количество отмен</td>
            <td class="p-2 border" v-for="period in periods" :key="period">
              {{ statsByPeriod[period]?.cancelCount || 0 }}
            </td>
          </tr>
          <tr>
            <td class="p-2 border font-medium">Средний % скидки</td>
            <td class="p-2 border" v-for="period in periods" :key="period">
              {{
                statsByPeriod[period]?.discountCount
                  ? (
                      statsByPeriod[period].discountSum /
                      statsByPeriod[period].discountCount
                    ).toFixed(2)
                  : "0.00"
              }}
            </td>
          </tr>
        </tbody>
      </table>
      <button
        @click="router.back()"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        ← Вернуться назад
      </button>
    </div>
  </div>
</template>

<!-- @format -->
<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useApi } from "../composables/useApi";
import IncomesChart from "../components/IncomesChart.vue";

const endpoint = "incomes";
const { data, loading, error, fetchData } = useApi(endpoint);

const filters = ref({
  dateFrom: "",
  dateTo: "",
  warehouse_name: "",
  supplier_article: "",
});

const currentPage = ref(1);
const itemsPerPage = ref(20);
const lastPage = ref(1);

function loadData(page = 1) {
  currentPage.value = page;

  fetchData({
    dateFrom: filters.value.dateFrom,
    dateTo: filters.value.dateTo,
    page,
    limit: itemsPerPage.value,
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

watch(itemsPerPage, () => {
  loadData(1);
});

const filteredData = computed(() => {
  if (!data.value?.data) return [];

  return data.value.data.filter((item) => {
    const matchesWarehouse = filters.value.warehouse_name
      ? item.warehouse_name
          ?.toLowerCase()
          .includes(filters.value.warehouse_name.toLowerCase())
      : true;

    const matchesArticle = filters.value.supplier_article
      ? item.supplier_article
          ?.toLowerCase()
          .includes(filters.value.supplier_article.toLowerCase())
      : true;

    return matchesWarehouse && matchesArticle;
  });
});

function goToPage(page) {
  if (page >= 1 && page <= lastPage.value) {
    loadData(page);
  }
}
</script>

<template>
  <div>
    <h1 class="text-xl text-center mb-4">Incomes</h1>

    <div class="flex justify-center gap-6 text-center mb-4">
      <label>
        Дата от:
        <input
          type="date"
          v-model="filters.dateFrom"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label>
        Дата до:
        <input
          type="date"
          v-model="filters.dateTo"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label>
        Склад:
        <input
          type="text"
          v-model="filters.warehouse_name"
          placeholder="Введите склад"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label>
        Артикул:
        <input
          type="text"
          v-model="filters.supplier_article"
          placeholder="Введите артикул"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
    </div>

    <div v-if="loading" class="text-xl text-center p-8">Загрузка...</div>
    <div v-if="error" class="text-xl text-center p-8">{{ error.message }}</div>

    <div class="text-center mb-4">
      <label>
        Показывать по:
        <select v-model="itemsPerPage">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
          <option :value="500">500</option>
        </select>
      </label>
    </div>

    <table
      v-if="filteredData.length"
      class="min-w-full border-collapse border border-gray-300 mb-4"
    >
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2 text-left">ID</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Дата</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Артикул</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Количество</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Склад</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in filteredData"
          :key="item.nm_id + '-' + index"
          class="even:bg-gray-50 hover:bg-gray-100 h-12 text-sm"
        >
          <td class="border border-gray-300 px-4 py-2">{{ item.income_id }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ item.date }}</td>
          <td class="border border-gray-300 px-4 py-2">
            {{ item.supplier_article }}
          </td>
          <td class="border border-gray-300 px-4 py-2">{{ item.quantity }}</td>
          <td class="border border-gray-300 px-4 py-2">
            {{ item.warehouse_name }}
          </td>
        </tr>
      </tbody>
    </table>

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
  <div v-if="filteredData.length">
    <IncomesChart :data="filteredData" />
  </div>
</template>

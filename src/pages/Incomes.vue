<!-- @format -->
<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useApi } from "../composables/useApi";
import IncomesChart from "../components/IncomesChart.vue";
import { useRoute, useRouter } from "vue-router";

const endpoint = "incomes";
const { data, loading, error, fetchData } = useApi(endpoint);

const router = useRouter();
const route = useRoute();

const filters = ref({
  dateFrom: "",
  dateTo: "",
  warehouse_name: "",
  supplier_article: "",
});

const itemsPerPage = ref(20);
const currentPage = ref(Number(route.query.page) || 1);
const lastPage = ref(1);
const inputPage = ref(currentPage.value);

function loadData(page = 1) {
  currentPage.value = page;
  inputPage.value = page;

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

  const page = Number(route.query.page) || 1;
  currentPage.value = page;
  inputPage.value = page;

  loadData(page);
});

let isInitialLoad = true;

watch(
  () => [filters.value.dateFrom, filters.value.dateTo],
  () => {
    if (isInitialLoad) {
      isInitialLoad = false;
      return;
    }
    loadData(1);
  }
);

watch(itemsPerPage, () => {
  loadData(1);
});

watch(
  () => route.query.page,
  (newPage) => {
    const page = Number(newPage) || 1;
    if (page === currentPage.value) return;
    currentPage.value = page;
    inputPage.value = page;
    loadData(page);
  }
);

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
  if (!Number.isInteger(page) || page < 1 || page > lastPage.value) {
    alert("Неверный номер страницы");
    return;
  }

  router.replace({
    query: {
      ...route.query,
      page,
    },
  });
}
</script>

<template>
  <div>
    <h1 class="text-xl text-center mb-4">Incomes</h1>

    <div class="flex justify-center gap-6 text-center mb-4">
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
      <label class="flex flex-col w-40">
        Склад:
        <input
          type="text"
          v-model="filters.warehouse_name"
          placeholder="Введите склад"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col w-40">
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

    <div
      v-if="lastPage > 1"
      class="text-center p-4 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        :disabled="currentPage <= 5"
        @click="goToPage(currentPage - 5)"
        class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
      >
        ← 5
      </button>

      <button
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
        class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
      >
        ← 1
      </button>

      <span class="mx-2"> Страница {{ currentPage }} из {{ lastPage }} </span>

      <button
        :disabled="currentPage === lastPage"
        @click="goToPage(currentPage + 1)"
        class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
      >
        → 1
      </button>

      <button
        :disabled="currentPage + 5 > lastPage"
        @click="goToPage(currentPage + 5)"
        class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
      >
        → 5
      </button>

      <div class="flex items-center gap-2 ml-4">
        <input
          type="number"
          min="1"
          :max="lastPage"
          v-model.number="inputPage"
          class="w-20 px-2 py-1 border border-gray-300 rounded"
          @keydown.enter="goToPage(inputPage)"
        />
        <button
          @click="goToPage(inputPage)"
          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Перейти
        </button>
      </div>
    </div>
  </div>
  <div v-if="filteredData.length">
    <IncomesChart :data="filteredData" />
  </div>
</template>

<!-- @format -->

<script setup></script>
<!-- @format -->
<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useApi } from "../composables/useApi";
import StocksChart from "../components/StocksChart.vue";

const endpoint = "stocks";
const { data, loading, error, fetchData } = useApi(endpoint);

const filters = ref({
  warehouse_name: "",
  supplier_article: "",
  is_supply: "",
  is_realization: "",
  priceFrom: "",
  priceTo: "",
  discountFrom: "",
  discountTo: "",
});

const dateFrom = new Date().toISOString().slice(0, 10);
const currentPage = ref(1);
const itemsPerPage = ref(20);
const lastPage = ref(1);

function loadData(page = 1) {
  currentPage.value = page;

  fetchData({
    dateFrom,
    page,
    limit: itemsPerPage.value,
  }).then(() => {
    if (data.value?.meta?.last_page) {
      lastPage.value = data.value.meta.last_page;
    }
  });
}

onMounted(() => {
  loadData(1);
});

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

    const matchesPriceFrom =
      filters.value.priceFrom !== ""
        ? item.price >= filters.value.priceFrom
        : true;

    const matchesPriceTo =
      filters.value.priceTo !== "" ? item.price <= filters.value.priceTo : true;

    const matchesDiscountFrom =
      filters.value.discountFrom !== ""
        ? item.discount >= filters.value.discountFrom
        : true;

    const matchesDiscountTo =
      filters.value.discountTo !== ""
        ? item.discount <= filters.value.discountTo
        : true;

    return (
      matchesWarehouse &&
      matchesArticle &&
      matchesPriceFrom &&
      matchesPriceTo &&
      matchesDiscountFrom &&
      matchesDiscountTo
    );
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
    <h1 class="text-xl text-center mb-4">Stocks</h1>

    <div class="flex flex-wrap justify-center items-center gap-4 mb-4">
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
      <label class="flex flex-col w-40">
        Цена от:
        <input
          type="number"
          v-model.number="filters.priceFrom"
          placeholder="мин. цена"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col w-40">
        Цена до:
        <input
          type="number"
          v-model.number="filters.priceTo"
          placeholder="макс. цена"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col w-40">
        % дисконта от:
        <input
          type="number"
          v-model.number="filters.discountFrom"
          placeholder="мин. %"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col w-40">
        % дисконта до:
        <input
          type="number"
          v-model.number="filters.discountTo"
          placeholder="макс. %"
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

    <div class="overflow-x-auto w-full">
      <table
        v-if="filteredData.length"
        class="min-w-full border-collapse border border-gray-300 mb-4"
      >
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2 text-left">Дата</th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              Дата изменения
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left">Артикул</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Склад</th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              Количество
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left">Поставка</th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              В реализации
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              Полное количество
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              В пути к клиенту
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              В пути от клиента
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left">Цена</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Дисконт</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in filteredData"
            :key="item.nm_id + '-' + index"
            class="even:bg-gray-50 hover:bg-gray-100 h-20 text-sm"
          >
            <td class="border border-gray-300 px-4 py-2">{{ item.date }}</td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.last_change_date }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.supplier_article }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.warehouse_name }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.quantity }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              <span :style="{ color: item.is_supply ? 'green' : 'red' }">
                {{ item.is_supply ? "Поставлено" : "Не поставлено" }}
              </span>
            </td>
            <!-- Мне не совсем понятны данные которые приходят с Api которые касаются поставки и реализации. Обычно если поставлено и реализовано то значения одинаковые. -->
            <!-- Я сделал так что если товар не поставлен то он находится в реализации. -->
            <td class="border border-gray-300 px-4 py-2">
              <span :style="{ color: item.is_realization ? 'green' : 'red' }">
                {{ item.is_realization ? "Да" : "Нет" }}
              </span>
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.quantity_full }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.in_way_to_client }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.in_way_from_client }}
            </td>
            <td class="border border-gray-300 px-4 py-2">{{ item.price }}</td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.discount }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="!loading && !error" class="text-xl text-center p-2">
        Нет данных
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
  </div>
  <div v-if="filteredData.length" style="margin-bottom: 2rem">
    <StocksChart :data="filteredData" />
  </div>
</template>

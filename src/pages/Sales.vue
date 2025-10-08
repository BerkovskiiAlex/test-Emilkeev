<!-- @format -->
<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useApi } from "../composables/useApi";
import SalesChart from "../components/SalesChart.vue";
import { useRoute, useRouter } from "vue-router";

const endpoint = "sales";
const { data, loading, error, fetchData } = useApi(endpoint);

const router = useRouter();
const route = useRoute();

const filters = ref({
  dateFrom: "",
  dateTo: "",
  warehouse_name: "",
  supplier_article: "",
  priceFrom: "",
  priceTo: "",
  discount_percentFrom: "",
  discount_percentTo: "",
  country_name: "",
  oblast_okrug_name: "",
  region_name: "",
  sspFrom: "",
  sspTo: "",
  for_payFrom: "",
  for_payTo: "",
  finished_priceFrom: "",
  finished_priceTo: "",
  price_with_discFrom: "",
  price_with_discTo: "",
});

const itemsPerPage = ref(20);
const lastPage = ref(1);
const currentPage = ref(Number(route.query.page) || 1);
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
        ? item.total_price >= filters.value.priceFrom
        : true;

    const matchesPriceTo =
      filters.value.priceTo !== ""
        ? item.total_price <= filters.value.priceTo
        : true;

    const matchesDiscountPercentFrom =
      filters.value.discount_percentFrom !== ""
        ? item.discount_percent >= filters.value.discount_percentFrom
        : true;

    const matchesDiscountPercentTo =
      filters.value.discount_percentTo !== ""
        ? item.discount_percent <= filters.value.discount_percentTo
        : true;

    const matchesSspFrom =
      filters.value.sspFrom !== "" ? item.spp >= filters.value.sspFrom : true;

    const matchesSspTo =
      filters.value.sspTo !== "" ? item.spp <= filters.value.sspTo : true;

    const matchesForPayFrom =
      filters.value.for_payFrom !== ""
        ? item.for_pay >= filters.value.for_payFrom
        : true;

    const matchesForPayTo =
      filters.value.for_payTo !== ""
        ? item.for_pay <= filters.value.for_payTo
        : true;

    const matchesFinishedPriceFrom =
      filters.value.finished_priceFrom !== ""
        ? item.finished_price >= filters.value.finished_priceFrom
        : true;

    const matchesFinishedPriceTo =
      filters.value.finished_priceTo !== ""
        ? item.finished_price <= filters.value.finished_priceTo
        : true;

    const matchesPriceWithDiscFrom =
      filters.value.price_with_discFrom !== ""
        ? item.price_with_disc >= filters.value.price_with_discFrom
        : true;

    const matchesPriceWithDiscTo =
      filters.value.price_with_discTo !== ""
        ? item.price_with_disc <= filters.value.price_with_discTo
        : true;

    const matchesCountry = filters.value.country_name
      ? item.country_name
          ?.toLowerCase()
          .includes(filters.value.country_name.toLowerCase())
      : true;

    const matchesOblastOkrug = filters.value.oblast_okrug_name
      ? item.oblast_okrug_name
          ?.toLowerCase()
          .includes(filters.value.oblast_okrug_name.toLowerCase())
      : true;

    const matchesRegion = filters.value.region_name
      ? item.region_name
          ?.toLowerCase()
          .includes(filters.value.region_name.toLowerCase())
      : true;

    return (
      matchesWarehouse &&
      matchesArticle &&
      matchesPriceFrom &&
      matchesPriceTo &&
      matchesDiscountPercentFrom &&
      matchesDiscountPercentTo &&
      matchesSspFrom &&
      matchesSspTo &&
      matchesForPayFrom &&
      matchesForPayTo &&
      matchesFinishedPriceFrom &&
      matchesFinishedPriceTo &&
      matchesPriceWithDiscFrom &&
      matchesPriceWithDiscTo &&
      matchesCountry &&
      matchesOblastOkrug &&
      matchesRegion
    );
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
    <h1 class="text-xl text-center mb-4">Sales</h1>

    <div class="flex flex-wrap justify-center items-stretch gap-4 mb-4">
      <label class="flex flex-col justify-between w-40">
        Дата от:
        <input
          type="date"
          v-model="filters.dateFrom"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Дата до:
        <input
          type="date"
          v-model="filters.dateTo"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Склад:
        <input
          type="text"
          v-model="filters.warehouse_name"
          placeholder="Введите склад"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Страна:
        <input
          type="text"
          v-model="filters.country_name"
          placeholder="Введите страну"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Область/Округ:
        <input
          type="text"
          v-model="filters.oblast_okrug_name"
          placeholder="Введите область"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Регион:
        <input
          type="text"
          v-model="filters.region_name"
          placeholder="Введите регион"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Артикул:
        <input
          type="text"
          v-model="filters.supplier_article"
          placeholder="Введите артикул"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Цена от:
        <input
          type="number"
          v-model.number="filters.priceFrom"
          placeholder="мин. цена"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Цена до:
        <input
          type="number"
          v-model.number="filters.priceTo"
          placeholder="макс. цена"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Процент дисконта от:
        <input
          type="number"
          v-model.number="filters.discount_percentFrom"
          placeholder="мин. %"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Процент дисконта до:
        <input
          type="number"
          v-model.number="filters.discount_percentTo"
          placeholder="макс. %"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Скидка постоянного покупателя от:
        <input
          type="number"
          v-model.number="filters.sspFrom"
          placeholder="мин. %"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Скидка постоянного покупателя до:
        <input
          type="number"
          v-model.number="filters.sspTo"
          placeholder="макс. %"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Для оплаты от:
        <input
          type="number"
          v-model.number="filters.for_payFrom"
          placeholder="мин. цена"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Для оплаты до:
        <input
          type="number"
          v-model.number="filters.for_payTo"
          placeholder="макс. цена"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Окончательная цена от:
        <input
          type="number"
          v-model.number="filters.finished_priceFrom"
          placeholder="мин. цена"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Окончательная цена до:
        <input
          type="number"
          v-model.number="filters.finished_priceTo"
          placeholder="макс. цена"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Цена с дисконтом от:
        <input
          type="number"
          v-model.number="filters.price_with_discFrom"
          placeholder="мин. цена"
          class="border border-gray-300 rounded px-2 py-1"
        />
      </label>
      <label class="flex flex-col justify-between w-40">
        Цена с дисконтом до:
        <input
          type="number"
          v-model.number="filters.price_with_discTo"
          placeholder="макс. цена"
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
            <th class="border border-gray-300 px-4 py-2 text-left">ID</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Дата</th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              Дата изменения
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left">Артикул</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Склад</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Страна</th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              Область/Округ
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left">Регион</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Цена</th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              Процент дисконта
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              Скидка постоянного покупателя
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              Для оплаты
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              Окончательная цена
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left">
              Цена с дисконтом
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, index) in filteredData"
            :key="item.nm_id + '-' + index"
            class="even:bg-gray-50 hover:bg-gray-100 h-12 text-sm"
          >
            <td class="border border-gray-300 px-4 py-2">
              {{ item.income_id }}
            </td>
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
              {{ item.country_name }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.oblast_okrug_name }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.region_name }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.total_price }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.discount_percent }}
            </td>
            <td class="border border-gray-300 px-4 py-2">{{ item.spp }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ item.for_pay }}</td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.finished_price }}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              {{ item.price_with_disc }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="!loading && !error" class="text-xl text-center p-2">
        Нет данных
      </div>
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
    <SalesChart :data="filteredData" />
  </div>
</template>

<!-- @format -->
<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useApi } from "../composables/useApi";
import SalesChart from "../components/SalesChart.vue";

const endpoint = "sales";
const { data, loading, error, fetchData } = useApi(endpoint);

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
  if (page >= 1 && page <= lastPage.value) {
    loadData(page);
  }
}
</script>

<template>
  <div>
    <h1>Sales</h1>

    <div style="margin-bottom: 1rem">
      <label>
        Дата от:
        <input type="date" v-model="filters.dateFrom" />
      </label>
      <label>
        Дата до:
        <input type="date" v-model="filters.dateTo" />
      </label>
      <label>
        Склад:
        <input
          type="text"
          v-model="filters.warehouse_name"
          placeholder="Введите склад"
        />
      </label>
      <label>
        Страна:
        <input
          type="text"
          v-model="filters.country_name"
          placeholder="Введите страну"
        />
      </label>
      <label>
        Область/Округ:
        <input
          type="text"
          v-model="filters.oblast_okrug_name"
          placeholder="Введите область или округ"
        />
      </label>
      <label>
        Регион:
        <input
          type="text"
          v-model="filters.region_name"
          placeholder="Введите регион"
        />
      </label>
      <label>
        Артикул:
        <input
          type="text"
          v-model="filters.supplier_article"
          placeholder="Введите артикул"
        />
      </label>
      <label>
        Цена от:
        <input
          type="number"
          v-model.number="filters.priceFrom"
          placeholder="мин. цена"
        />
      </label>
      <label>
        Цена до:
        <input
          type="number"
          v-model.number="filters.priceTo"
          placeholder="макс. цена"
        />
      </label>
      <label>
        Процент дисконта от:
        <input
          type="number"
          v-model.number="filters.discount_percentFrom"
          placeholder="мин. %"
        />
      </label>
      <label>
        Процент дисконта до:
        <input
          type="number"
          v-model.number="filters.discount_percentTo"
          placeholder="макс. %"
        />
      </label>
      <label>
        Скидка постоянного покупателя от:
        <input
          type="number"
          v-model.number="filters.sspFrom"
          placeholder="мин. %"
        />
      </label>
      <label>
        Скидка постоянного покупателя до:
        <input
          type="number"
          v-model.number="filters.sspTo"
          placeholder="макс. %"
        />
      </label>
      <label>
        Для оплаты от:
        <input
          type="number"
          v-model.number="filters.for_payFrom"
          placeholder="мин. цена"
        />
      </label>
      <label>
        Для оплаты до:
        <input
          type="number"
          v-model.number="filters.for_payTo"
          placeholder="макс. цена"
        />
      </label>
      <label>
        Окончательная цена от:
        <input
          type="number"
          v-model.number="filters.finished_priceFrom"
          placeholder="мин. цена"
        />
      </label>
      <label>
        Окончательная цена до:
        <input
          type="number"
          v-model.number="filters.finished_priceTo"
          placeholder="макс. цена"
        />
      </label>
      <label>
        Цена с дисконтом от:
        <input
          type="number"
          v-model.number="filters.price_with_discFrom"
          placeholder="мин. цена"
        />
      </label>
      <label>
        Цена с дисконтом до:
        <input
          type="number"
          v-model.number="filters.price_with_discTo"
          placeholder="макс. цена"
        />
      </label>
    </div>

    <div v-if="loading">Загрузка...</div>
    <div v-if="error">{{ error.message }}</div>

    <div style="margin-bottom: 1rem">
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

    <table v-if="filteredData.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Дата</th>
          <th>Дата изменения</th>
          <th>Артикул</th>
          <th>Склад</th>
          <th>Страна</th>
          <th>Область/Округ</th>
          <th>Регион</th>
          <th>Цена</th>
          <th>Процент дисконта</th>
          <th>Скидка постоянного покупателя</th>
          <th>Для оплаты</th>
          <th>Окончательная цена</th>
          <th>Цена с дисконтом</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(item, index) in filteredData"
          :key="item.nm_id + '-' + index"
        >
          <td>{{ item.income_id }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.last_change_date }}</td>
          <td>{{ item.supplier_article }}</td>
          <td>{{ item.warehouse_name }}</td>
          <td>{{ item.country_name }}</td>
          <td>{{ item.oblast_okrug_name }}</td>
          <td>{{ item.region_name }}</td>
          <td>{{ item.total_price }}</td>
          <td>{{ item.discount_percent }}</td>
          <td>{{ item.spp }}</td>
          <td>{{ item.for_pay }}</td>
          <td>{{ item.finished_price }}</td>
          <td>{{ item.price_with_disc }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else-if="!loading && !error">Нет данных</div>

    <div v-if="lastPage > 1" style="margin-top: 1rem">
      <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
        ◀ Назад
      </button>
      <span style="margin: 0 1rem">
        Страница {{ currentPage }} из {{ lastPage }}
      </span>
      <button
        :disabled="currentPage === lastPage"
        @click="goToPage(currentPage + 1)"
      >
        Вперёд ▶
      </button>
    </div>
  </div>
  <div v-if="filteredData.length" style="margin-bottom: 2rem">
    <SalesChart :data="filteredData" />
  </div>
</template>

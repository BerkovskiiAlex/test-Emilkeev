<!-- @format -->
<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useApi } from "../composables/useApi";
import OrdersChart from "../components/OrdersChart.vue";

const endpoint = "orders";
const { data, loading, error, fetchData } = useApi(endpoint);

const filters = ref({
  dateFrom: "",
  dateTo: "",
  warehouse_name: "",
  supplier_article: "",
  last_change_date: "",
  priceFrom: "",
  priceTo: "",
  discount_percentFrom: "",
  discount_percentTo: "",
  oblast: "",
  is_cancel: "",
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

    const matchesLastChangeDate = filters.value.last_change_date
      ? item.last_change_date
          ?.toLowerCase()
          .includes(filters.value.last_change_date.toLowerCase())
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

    const matchesOblast = filters.value.oblast
      ? item.oblast?.toLowerCase().includes(filters.value.oblast.toLowerCase())
      : true;

    const matchesIsCancel =
      filters.value.is_cancel !== ""
        ? item.is_cancel === (filters.value.is_cancel === "true")
        : true;

    return (
      matchesWarehouse &&
      matchesArticle &&
      matchesLastChangeDate &&
      matchesPriceFrom &&
      matchesPriceTo &&
      matchesDiscountPercentFrom &&
      matchesDiscountPercentTo &&
      matchesOblast &&
      matchesIsCancel
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
    <h1>Orders</h1>

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
        Область:
        <input
          type="text"
          v-model="filters.oblast"
          placeholder="Введите область"
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
        Отмена:
        <select v-model="filters.is_cancel">
          <option value="">Все</option>
          <option value="true">Отменённые</option>
          <option value="false">Не отменённые</option>
        </select>
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
          <th>Артикул</th>
          <th>Цена</th>
          <th>Процент дисконта</th>
          <th>Склад</th>
          <th>Дата изменения</th>
          <th>Область</th>
          <th>Отмена</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(item, index) in filteredData"
          :key="item.nm_id + '-' + index"
        >
          <td>{{ item.income_id }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.supplier_article }}</td>
          <td>{{ item.total_price }}</td>
          <td>{{ item.discount_percent }}</td>
          <td>{{ item.warehouse_name }}</td>
          <td>{{ item.last_change_date }}</td>
          <td>{{ item.oblast }}</td>
          <td>
            <span :style="{ color: item.is_cancel ? 'red' : 'green' }">
              {{ item.is_cancel ? "Отменено" : "Без отмены" }}
            </span>
          </td>
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
    <OrdersChart :data="filteredData" />
  </div>
</template>

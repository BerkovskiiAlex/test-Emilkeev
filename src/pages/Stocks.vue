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
    <h1>Stocks</h1>

    <div style="margin-bottom: 1rem">
      <label>
        Склад:
        <input
          type="text"
          v-model="filters.warehouse_name"
          placeholder="Введите склад"
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
          v-model.number="filters.discountFrom"
          placeholder="мин. %"
        />
      </label>
      <label>
        Процент дисконта до:
        <input
          type="number"
          v-model.number="filters.discountTo"
          placeholder="макс. %"
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
          <th>Дата</th>
          <th>Дата изменения</th>
          <th>Артикул</th>
          <th>Склад</th>
          <th>Количество</th>
          <th>Поставка</th>
          <th>В реализации</th>
          <th>Полное количество</th>
          <th>В пути к клиенту</th>
          <th>В пути от клиента</th>
          <th>Цена</th>
          <th>Дисконт</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in filteredData"
          :key="item.nm_id + '-' + index"
        >
          <td>{{ item.date }}</td>
          <td>{{ item.last_change_date }}</td>
          <td>{{ item.supplier_article }}</td>
          <td>{{ item.warehouse_name }}</td>
          <td>{{ item.quantity }}</td>
          <td>
            <span :style="{ color: item.is_supply ? 'green' : 'red' }">
              {{ item.is_supply ? "Поставлено" : "Не поставлено" }}
            </span>
          </td>
          <!-- Мне не совсем понятны данные которые приходят с Api которые касаются поставки и реализации. Обычно если поставлено и реализовано то значения одинаковые. -->
          <!-- Я сделал так что если товар не поставлен то он находится в реализации. -->
          <td>
            <span :style="{ color: item.is_realization ? 'green' : 'red' }">
              {{ item.is_realization ? "Да" : "Нет" }}
            </span>
          </td>
          <td>{{ item.quantity_full }}</td>
          <td>{{ item.in_way_to_client }}</td>
          <td>{{ item.in_way_from_client }}</td>
          <td>{{ item.price }}</td>
          <td>{{ item.discount }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else-if="!loading && !error">Нет данных</div>

    <div v-if="lastPage > 1" style="margin-top: 1rem">
      <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
        Назад
      </button>
      <span style="margin: 0 1rem">
        Страница {{ currentPage }} из {{ lastPage }}
      </span>
      <button
        :disabled="currentPage === lastPage"
        @click="goToPage(currentPage + 1)"
      >
        Вперёд
      </button>
    </div>
  </div>
  <div v-if="filteredData.length" style="margin-bottom: 2rem">
    <StocksChart :data="filteredData" />
  </div>
</template>

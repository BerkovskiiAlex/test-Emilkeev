<!-- @format -->

<template>
  <div id="app" class="px-40 py-4 font-sans">
    <nav
      class="flex text-2xl justify-evenly items-center bg-gray-100 p-3 rounded shadow mb-4"
    >
      <router-link
        to="/incomes"
        class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded"
        active-class="text-blue-700 font-semibold border-b-2 border-blue-700"
      >
        Incomes
      </router-link>
      <router-link
        to="/orders"
        class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded"
        active-class="text-blue-700 font-semibold border-b-2 border-blue-700"
      >
        Orders
      </router-link>
      <router-link
        to="/sales"
        class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded"
        active-class="text-blue-700 font-semibold border-b-2 border-blue-700"
      >
        Sales
      </router-link>
      <router-link
        to="/stocks"
        class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded"
        active-class="text-blue-700 font-semibold border-b-2 border-blue-700"
      >
        Stocks
      </router-link>
    </nav>
    <router-view class="mt-6" />
  </div>
</template>

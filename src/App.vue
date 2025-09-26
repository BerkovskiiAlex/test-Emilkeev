<!-- @format -->

<template>
  <div id="app">
    <nav>
      <router-link to="/incomes">Incomes</router-link>
      <router-link to="/orders">Orders</router-link>
      <router-link to="/sales">Sales</router-link>
      <router-link to="/stocks">Stocks</router-link>
    </nav>
    <router-view />
  </div>
</template>

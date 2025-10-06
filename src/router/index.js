/** @format */

import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Details from "../pages/Details.vue";
import Incomes from "../pages/Incomes.vue";
import Orders from "../pages/Orders.vue";
import Sales from "../pages/Sales.vue";
import Stocks from "../pages/Stocks.vue";

const routes = [
  { path: "/home", component: Home },
  { path: "/details", component: Details, name: "details" },
  { path: "/incomes", component: Incomes },
  { path: "/orders", component: Orders },
  { path: "/sales", component: Sales },
  { path: "/stocks", component: Stocks },
  { path: "/", redirect: "/home" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

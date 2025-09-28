/** @format */

import axios from "axios";
import { ref } from "vue";

// const API_URL = "http://109.73.206.144:6969/api";  - меняю апи для деплоя на vercel
const API_URL = "/api";
const API_KEY = "E6kUTYrYwZq2tN4QEtyzsbEBk3ie";

export function useApi(endpoint) {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchData = async (params = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_URL}/${endpoint}`, {
        params: {
          ...params,
          key: API_KEY,
        },
      });
      data.value = response.data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return {
    data,
    loading,
    error,
    fetchData,
  };
}

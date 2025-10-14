import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_REACT_APP_API_URL;

axios.interceptors.request.use((config) => {
  const authToken = sessionStorage.getItem("accessToken");
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => {
    if (
      response.status !== 200 ||
      (Object.hasOwn(response.data || {}, "success") &&
        !response.data.success) ||
      (Object.hasOwn(response.data || {}, "statusCode") &&
        response.data.statusCode !== 200)
    ) {
      if (
        response?.data?.statusCode === 400 ||
        response?.data?.statusCode === 404 ||
        response?.data?.statusCode === 409 ||
        response?.data?.statusCode === 204 ||
        response?.data?.statusCode === 201 ||
        response?.data?.statusCode === 209
      ) {
        return response.data;
      } else {
        throw new Error(response.data);
      }
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("accessToken");
      window.location.href = "/";
      return;
    }
    throw new Error(error);
  }
);

export const apiRequest = async ({ method, url, req, params }) => {
  try {
    if (method === "get") return await axios[method](url, params);
    return await axios[method](url, req, params);
  } catch (error) {
    return { error: error.message };
  }
};

export const getApi = async (url, params) =>
  await apiRequest({ method: "get", url, params });
export const postApi = async (url, req, params) =>
  await apiRequest({ method: "post", url, req, params });
export const putApi = async (url, req, params) =>
  await apiRequest({ method: "put", url, req, params });
export const deleteApi = async (url, req, params) =>
  await apiRequest({ method: "delete", url, req, params });
export const patchApi = async (url, req, params) =>
  await apiRequest({ method: "patch", url, req, params });

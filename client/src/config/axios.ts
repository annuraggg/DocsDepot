import axios from "axios";
import Cookies from "js-cookie";

const useAxios = () => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL as string,
  });

  // fetch jwt token from cookie
  const jwtCookie = Cookies.get("token");

  if (jwtCookie) {
    api.interceptors.request.use(async (request) => {
      api.defaults.baseURL = import.meta.env.VITE_API_URL as string;
      request.headers.Authorization = `Bearer ${jwtCookie}`;
      axios.defaults.headers.Authorization = `Bearer ${jwtCookie}`;
      axios.defaults.headers.common["Authorization"] = `Bearer ${jwtCookie}`;
      return request;
    });
  }

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return api;
};

export default useAxios;

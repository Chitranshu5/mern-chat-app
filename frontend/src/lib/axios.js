import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://chitchatapptest.onrender.com/api",
  withCredentials: true,
});

import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "/api/v1",
  withCredentials: true, // send cookies with requests (e.g. auth token)
});

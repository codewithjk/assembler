import axios from "axios";

const baseURL = process.env.BASE_URL;

export const axiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 1000,
    headers: {
      'Content-Type': 'application/json'
    }
  });
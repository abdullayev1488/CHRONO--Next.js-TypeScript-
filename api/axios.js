import axios from "axios";

// API eyni Next.js tətbiqində (/api) işlədiyi üçün sorğular nisbi ünvanlıdır
export const API_URL = "";

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

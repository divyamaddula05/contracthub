import axios from "axios";

const API = axios.create({
  baseURL: "https://contracthub-api.onrender.com/api",
});

export default API;

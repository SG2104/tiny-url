import axios, { AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CreateUrlRequest {
  originalUrl: string;
  expire_at?: string;
}

export interface CreateUrlResponse {
  success: string;
  url: string;
}

export interface RedirectUrlResponse {
  url: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

// API Service functions
export const urlService = {
  async createUrl(data: CreateUrlRequest): Promise<CreateUrlResponse> {
    const response = await apiClient.post('/create', data);
    return response.data;
  },

  async getRedirectUrl(code: string): Promise<RedirectUrlResponse> {
    const response = await apiClient.get(`/redirect/${code}`);
    return response.data;
  },

  async createMillionFakeUrls(): Promise<{ success: string }> {
    const response = await apiClient.post('/create-million-fake-urls');
    return response.data;
  },

  async getAllUrls(page = 1, limit = 10): Promise<{ data: any[], pagination: any }> {
    const response = await apiClient.get(`/urls?page=${page}&limit=${limit}`);
    return response.data;
  }
};

export default apiClient;
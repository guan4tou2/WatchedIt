import {
  Work,
  WorkCreate,
  WorkUpdate,
  WorkList,
  Tag,
  AnimeSearchResult,
  Stats,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`API 請求: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      console.log(`API 響應: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API 錯誤: ${response.status} - ${errorText}`);
        throw new Error(`API 錯誤: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API 請求失敗: ${url}`, error);
      throw error;
    }
  }

  // 作品相關 API
  async getWorks(params?: {
    page?: number;
    size?: number;
    title?: string;
    type?: string;
    status?: string;
    year?: number;
    tag_ids?: number[];
  }): Promise<WorkList> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }

    return this.request<WorkList>(`/works?${searchParams.toString()}`);
  }

  async getWork(id: string): Promise<Work> {
    return this.request<Work>(`/works/${id}`);
  }

  async createWork(work: WorkCreate): Promise<Work> {
    return this.request<Work>("/works", {
      method: "POST",
      body: JSON.stringify(work),
    });
  }

  async updateWork(id: string, work: WorkUpdate): Promise<Work> {
    return this.request<Work>(`/works/${id}`, {
      method: "PUT",
      body: JSON.stringify(work),
    });
  }

  async deleteWork(id: string): Promise<void> {
    return this.request<void>(`/works/${id}`, {
      method: "DELETE",
    });
  }

  async getStats(): Promise<Stats> {
    return this.request<Stats>("/works/stats/overview");
  }

  // 標籤相關 API
  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>("/tags");
  }

  async createTag(tag: { name: string; color: string }): Promise<Tag> {
    return this.request<Tag>("/tags", {
      method: "POST",
      body: JSON.stringify(tag),
    });
  }

  async updateTag(
    id: number,
    tag: { name?: string; color?: string }
  ): Promise<Tag> {
    return this.request<Tag>(`/tags/${id}`, {
      method: "PUT",
      body: JSON.stringify(tag),
    });
  }

  async deleteTag(id: number): Promise<void> {
    return this.request<void>(`/tags/${id}`, {
      method: "DELETE",
    });
  }

  // 搜尋相關 API
  async searchAnime(query: string): Promise<AnimeSearchResult[]> {
    return this.request<AnimeSearchResult[]>(
      `/search/anime?query=${encodeURIComponent(query)}`
    );
  }

  async getSuggestions(query: string): Promise<string[]> {
    return this.request<string[]>(
      `/search/suggestions?query=${encodeURIComponent(query)}`
    );
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

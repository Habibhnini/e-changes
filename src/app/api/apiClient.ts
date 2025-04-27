class ApiClient {
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async get(url: string, includeAuth = true): Promise<any> {
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(includeAuth),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized (expired token, etc.)
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred");
    }

    return response.json();
  }

  async post(url: string, data: any, includeAuth = true): Promise<any> {
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized (expired token, etc.)
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred");
    }

    return response.json();
  }

  async put(url: string, data: any): Promise<any> {
    const response = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized (expired token, etc.)
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred");
    }

    return response.json();
  }

  async delete(url: string): Promise<any> {
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized (expired token, etc.)
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred");
    }

    return response.json();
  }

  // Authentication methods
  async login(email: string, password: string): Promise<any> {
    return this.post("/api/login_check", { email, password }, false);
  }

  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<any> {
    return this.post(
      "/api/register",
      { email, password, firstName, lastName },
      false
    );
  }

  async getMe(): Promise<any> {
    return this.get("/api/me");
  }

  // Transaction and message methods
  async getConversations() {
    return this.get("/api/messages/conversations");
  }

  async getTransactionMessages(transactionId: string) {
    return this.get(`/api/messages/transaction/${transactionId}`);
  }

  async replyToTransaction(transactionId: string, content: string) {
    return this.post(`/api/messages/transaction/${transactionId}/reply`, {
      content,
    });
  }

  async startTransaction(serviceId: string, content: string) {
    return this.post(`/api/messages/service/${serviceId}/start`, { content });
  }

  async getServiceDetail(serviceId: string) {
    return this.get(`/api/service/${serviceId}`);
  }
}

// Create a singleton instance
const apiClient = new ApiClient();
export default apiClient;

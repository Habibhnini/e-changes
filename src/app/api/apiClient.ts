// First, let's define your ServiceDetail interface to match what your component expects
interface ServiceDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  type: string;
  status: string;
  createdAt: string;
  category: {
    id: number;
    name: string;
  };
  vendor: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    rating: number;
  };
  transaction?: {
    id: number;
    status: string;
    createdAt: string;
  } | null;
  isOwner?: boolean;
}

// Let's update your ApiClient class with this type
class ApiClient {
  async forgotPassword(resetEmail: string): Promise<void> {
    const formData = new FormData();
    formData.append("email", resetEmail);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/request-password-reset`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error ||
          "Une erreur est survenue lors de la demande de réinitialisation."
      );
    }
  }
  // apiClient.ts

  async resetPassword(token: string, password: string): Promise<void> {
    const formData = new FormData();
    formData.append("token", token);
    formData.append("password", password);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reset-password`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.error || "Échec de la réinitialisation du mot de passe."
      );
    }
  }

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

  async get<T>(url: string, includeAuth = true): Promise<T> {
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(includeAuth),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized (expired token, etc.)
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/auth";
        }
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred");
    }

    return response.json() as Promise<T>;
  }

  async post<T, U = unknown>(
    url: string,
    data: U,
    includeAuth = true
  ): Promise<T> {
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
          window.location.href = "/auth";
        }
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred");
    }

    return response.json() as Promise<T>;
  }

  async put<T, U = unknown>(url: string, data: U): Promise<T> {
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
          window.location.href = "/auth";
        }
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred");
    }

    return response.json() as Promise<T>;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized (expired token, etc.)
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/auth";
        }
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred");
    }

    return response.json() as Promise<T>;
  }

  // Authentication methods
  async login(email: string, password: string): Promise<any> {
    return this.post("/api/auth_check", { email, password }, false);
  }

  // Add this method to your ApiClient class
  async registerWithFormData(formData: FormData): Promise<any> {
    const response = await fetch("/api/register", {
      method: "POST",
      // Do NOT set Content-Type header when using FormData
      headers: {
        // Only include auth if needed
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/auth";
        }
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred");
    }

    return response.json();
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

  // Update the getServiceDetail method to use the proper type
  async getServiceDetail(serviceId: string): Promise<ServiceDetail> {
    // Get the raw data from the API
    const rawData = await this.get<any>(`/api/service/${serviceId}`);

    // Transform the data to match the expected ServiceDetail interface
    // This handles cases where the API response doesn't perfectly match your expected interface
    const serviceDetail: ServiceDetail = {
      id: Number(rawData.id), // Convert string ID to number if needed
      title: rawData.title || "",
      description: rawData.description || "",
      price: typeof rawData.price === "number" ? rawData.price : 0,
      type: rawData.type || "standard",
      status: rawData.status || "active",
      createdAt: rawData.createdAt || new Date().toISOString(),

      // Ensure category has the right structure
      category: {
        id: rawData.category?.id ? Number(rawData.category.id) : 0,
        name: rawData.category?.name || "",
      },

      // Ensure vendor has the right structure
      vendor: {
        id: rawData.vendor?.id ? Number(rawData.vendor.id) : 0,
        email: rawData.vendor?.email || "",
        firstName: rawData.vendor?.firstName || "",
        lastName: rawData.vendor?.lastName || "",
        profileImage: rawData.vendor?.profileImage || "",
        rating:
          typeof rawData.vendor?.rating === "number"
            ? rawData.vendor.rating
            : 0,
      },

      // Optional transaction data
      transaction: rawData.transaction
        ? {
            id: Number(rawData.transaction.id),
            status: rawData.transaction.status || "",
            createdAt:
              rawData.transaction.createdAt || new Date().toISOString(),
          }
        : null,

      isOwner: !!rawData.isOwner,
    };

    return serviceDetail;
  }
}

// Create a singleton instance
const apiClient = new ApiClient();
export default apiClient;

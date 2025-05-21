// api/walletApi.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface User {
  id: number;
  fullName: string;
}

export interface Wallet {
  id: number;
  balance: number;
  createdAt: string;
  user: User;
}

export interface Transaction {
  id: number;
  amount: number;
  type: "deposit" | "withdrawal";
  description: string;
  createdAt: string;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Helper function to get auth headers with JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

/**
 * Fetch the current user's wallet information
 */
export const getWalletInfo = async (): Promise<Wallet> => {
  const response = await fetch(`${API_URL}/api/wallet`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch wallet data");
  }

  return response.json();
};

/**
 * Fetch paginated transaction history
 */
export const getTransactions = async (
  page = 1,
  limit = 10
): Promise<PaginatedTransactions> => {
  const response = await fetch(
    `${API_URL}/api/wallet/transactions?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch transactions");
  }

  return response.json();
};

/**
 * Use energy from the wallet
 */
export const useEnergy = async (
  amount: number,
  description: string
): Promise<{ transaction: Transaction; wallet: Wallet }> => {
  const response = await fetch(`${API_URL}/api/wallet/use-energy`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount, description }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to use energy");
  }

  return response.json();
};

// walletApi.ts
export async function transferEnergy(
  recipientEmail: string,
  amount: number
): Promise<{ success: boolean; message: string }> {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/wallet/transfer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ recipientEmail, amount }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Erreur lors du transfert d'énergie");
  }

  return res.json();
}

// Add these functions to your api/walletApi.ts file
export const getWalletTransactions = async (
  page = 1,
  limit = 10,
  type = null
) => {
  try {
    let url = `/api/wallet/transactions`;

    // Add type filter if provided
    if (type) {
      url = `/api/wallet/transactions/${type}`;
    }

    // Add pagination params
    url += `?page=${page}&limit=${limit}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch wallet transactions");
    }

    return await response.json();
  } catch (error) {
    // console.error("Error fetching wallet transactions:", error);
    throw error;
  }
};

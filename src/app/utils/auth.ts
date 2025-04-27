// Gets the JWT token from storage
export const getAuthToken = (): string | null => {
  return localStorage.getItem("token"); // Adjust based on where you store your token
};

// Creates headers with Authorization
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Makes an authenticated API request
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = getAuthHeaders();

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  };

  return fetch(url, fetchOptions);
};

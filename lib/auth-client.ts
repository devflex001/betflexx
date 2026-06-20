/**
 * Stub auth client - no authentication functionality
 * System runs without user authentication
 */

export function useAuthClient() {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
  };
}

export function useSession() {
  return {
    data: null,
    isPending: false,
    status: "unauthenticated",
  };
}

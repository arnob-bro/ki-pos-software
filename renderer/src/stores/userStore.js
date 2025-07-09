import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null
        });
      },

      setToken: (token) => {
        set({ accessToken: token });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      // Login action
      login: async (identifier, password) => {
        set({ isLoading: true, error: null });
        
        try {
          if (!window.posAPI || !window.posAPI.login) {
            throw new Error("POS API not available");
          }

          const result = await window.posAPI.login(identifier, password);
          
          if (result.success) {
            set({
              user: result.user,
              accessToken: result.tokens?.accessToken || '',
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return { success: true, user: result.user };
          } else {
            set({
              isLoading: false,
              error: result.message || 'Login failed'
            });
            return { success: false, message: result.message };
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'An error occurred during login'
          });
          return { success: false, message: error.message };
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        
        try {
          const { user, accessToken } = get();
          
          // Call logout API if available
          if (window.posAPI && window.posAPI.logout && user?.id) {
            const result = await window.posAPI.logout(user.id, accessToken);
            return result;
          }
          // If no API, treat as success
          return { success: true, message: 'Logout successful (no API)' };
        } catch (error) {
          console.error('Logout error:', error);
          return { success: false, message: error.message || 'Logout error' };
        } finally {
          // Clear state regardless of API call success
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      // Validate session
      validateSession: async () => {
        const { accessToken } = get();
        
        if (!accessToken) {
          set({ isAuthenticated: false, user: null });
          return false;
        }

        try {
          if (!window.posAPI || !window.posAPI.validateSession) {
            // If no validation API, assume token is valid if it exists
            return !!accessToken;
          }

          const result = await window.posAPI.validateSession(accessToken);
          
          if (result.success) {
            set({
              user: result.user,
              isAuthenticated: true,
              error: null
            });
            return true;
          } else {
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              error: result.message
            });
            return false;
          }
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: error.message
          });
          return false;
        }
      },

      // Update user data
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'user-storage', // unique name for localStorage key
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useUserStore;
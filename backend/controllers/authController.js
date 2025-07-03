const authService = require('../services/authService');

class AuthController {
  constructor() {
    // Initialize any dependencies or configuration
  }

  /**
   * Authenticate user login
   * @param {string} identifier - Username, email, or user ID
   * @param {string} password - User password
   * @returns {Object} Login result with success status and user data or error message
   */
  async login(identifier, password) {
    try {
      const result = await authService.loginUser(identifier, password);
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Authentication error',
        code: 'AUTH_ERROR',
        error: error.message
      };
    }
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Registration result
   */
  async register(userData) {
    try {
      const result = await authService.registerUser(userData);
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Registration error',
        code: 'REGISTRATION_ERROR',
        error: error.message
      };
    }
  }

  /**
   * Logout user
   * @param {string} userId - User ID to logout
   * @param {string} refreshToken - Refresh token to invalidate
   * @returns {Object} Logout result
   */
  async logout(userId, refreshToken) {
    try {
      const result = await authService.logoutUser(userId, refreshToken);
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Logout error',
        code: 'LOGOUT_ERROR',
        error: error.message
      };
    }
  }

  /**
   * Validate user session/token
   * @param {string} token - JWT token to validate
   * @returns {Object} Validation result
   */
  async validateSession(token) {
    try {
      const result = await authService.validateToken(token);
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Session validation error',
        code: 'SESSION_ERROR',
        error: error.message
      };
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Password change result
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const result = await authService.changePassword(userId, currentPassword, newPassword);
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Password change error',
        code: 'PASSWORD_CHANGE_ERROR',
        error: error.message
      };
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  async getProfile(userId) {
    try {
      const result = await authService.getUserProfile(userId);
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Profile retrieval error',
        code: 'PROFILE_ERROR',
        error: error.message
      };
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Update result
   */
  async updateProfile(userId, updateData) {
    try {
      const result = await authService.updateUserProfile(userId, updateData);
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Profile update error',
        code: 'PROFILE_UPDATE_ERROR',
        error: error.message
      };
    }
  }
}

// Create and export a singleton instance
const authController = new AuthController();

module.exports = authController;
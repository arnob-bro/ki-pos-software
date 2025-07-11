const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  findUserById, 
  findUserByEmail, 
  findUserByName, 
  createUser, 
  updateUser, 
  deleteUser,
  updateLastLogin,
  getUserWithRole,
  getUserPermissionsWithCodes
} = require('../models/UserModel');
const { generateToken, verifyToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/hash');
const logger = require('../config/logger');

class AuthService {
  constructor() {
    this.saltRounds = 12;
    this.tokenExpiry = '24h';
    this.refreshTokenExpiry = '7d';
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User name
   * @param {string} userData.password - Password
   * @param {string} userData.email - Email
   * @param {number} userData.role_id - Role ID
   * @returns {Object} Registration result
   */
  async registerUser(userData) {
    try {
      // Validate input data
      if (!userData.name || !userData.password || !userData.email || !userData.role_id) {
        return {
          success: false,
          message: 'Missing required fields: name, password, email, and role_id are required',
          code: 'MISSING_FIELDS'
        };
      }

      // Check if user already exists by email
      const existingUserByEmail = findUserByEmail(userData.email);
      if (existingUserByEmail) {
        return {
          success: false,
          message: 'Email already exists',
          code: 'EMAIL_EXISTS'
        };
      }

      // Check if user already exists by name
      const existingUserByName = findUserByName(userData.name);
      if (existingUserByName) {
        return {
          success: false,
          message: 'Username already exists',
          code: 'USERNAME_EXISTS'
        };
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password, this.saltRounds);

      // Create user object
      const newUser = {
        name: userData.name,
        email: userData.email,
        password_hash: hashedPassword,
        role_id: userData.role_id,
        status: 'active'
      };

      // Save user to database
      const createdUser = createUser(newUser);
      if (!createdUser) {
        return {
          success: false,
          message: 'Failed to create user',
          code: 'CREATE_FAILED'
        };
      }

      // Generate tokens
      const accessToken = generateToken(
        { id: createdUser.id, name: createdUser.name, role_id: createdUser.role_id },
        this.tokenExpiry
      );
      const refreshToken = generateToken(
        { id: createdUser.id, type: 'refresh' },
        this.refreshTokenExpiry
      );

      // Get user permissions
      const userPermissions = getUserPermissionsWithCodes(createdUser.id);

      logger.info(`User registered successfully: ${createdUser.name}`);

      return {
        success: true,
        message: 'User registered successfully',
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          role_id: createdUser.role_id,
          status: createdUser.status
        },
        permissions: userPermissions.permissions,
        permissionCodes: userPermissions.permissionCodes,
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      logger.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed',
        code: 'REGISTRATION_ERROR',
        error: error.message
      };
    }
  }

  /**
   * Authenticate user login
   * @param {string} identifier - Username or email
   * @param {string} password - Password
   * @returns {Object} Login result
   */
  async loginUser(identifier, password) {
    try {
      // Validate input
      if (!identifier || !password) {
        return {
          success: false,
          message: 'Username/email and password are required',
          code: 'MISSING_CREDENTIALS'
        };
      }

      // Find user by email or name
      let user = findUserByEmail(identifier);
      if (!user) {
        user = findUserByName(identifier);
        if(!user){
            user = findUserById(identifier);
        }
      }

      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Check if user is active
      if (user.status !== 'active') {
        return {
          success: false,
          message: `Account is ${user.status}`,
          code: 'ACCOUNT_INACTIVE'
        };
      }

      // Generate tokens
      const accessToken = generateToken(
        { id: user.id, name: user.name, role_id: user.role_id },
        this.tokenExpiry
      );
      const refreshToken = generateToken(
        { id: user.id, type: 'refresh' },
        this.refreshTokenExpiry
      );

      // Update last login
      updateLastLogin(user.id);

      // Get user permissions
      const userPermissions = getUserPermissionsWithCodes(user.id);

      logger.info(`User logged in successfully: ${user.name}`);

      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          status: user.status
        },
        permissions: userPermissions.permissions,
        permissionCodes: userPermissions.permissionCodes,
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed',
        code: 'LOGIN_ERROR',
        error: error.message
      };
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} Token refresh result
   */
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        return {
          success: false,
          message: 'Refresh token is required',
          code: 'MISSING_TOKEN'
        };
      }

      // Verify refresh token
      const decoded = verifyToken(refreshToken);
      if (!decoded || decoded.type !== 'refresh') {
        return {
          success: false,
          message: 'Invalid refresh token',
          code: 'INVALID_TOKEN'
        };
      }

      // Get user
      const user = findUserById(decoded.id);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Generate new access token
      const newAccessToken = generateToken(
        { id: user.id, name: user.name, role_id: user.role_id },
        this.tokenExpiry
      );

      // Get user permissions
      const userPermissions = getUserPermissionsWithCodes(user.id);

      return {
        success: true,
        message: 'Token refreshed successfully',
        accessToken: newAccessToken,
        permissions: userPermissions.permissions,
        permissionCodes: userPermissions.permissionCodes
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Token refresh failed',
        code: 'REFRESH_ERROR',
        error: error.message
      };
    }
  }

  /**
   * Logout user
   * @param {string} userId - User ID
   * @param {string} refreshToken - Refresh token to invalidate
   * @returns {Object} Logout result
   */
  async logoutUser(userId, refreshToken) {
    try {
      // Here you could implement token blacklisting
      // For now, we'll just log the logout
      logger.info(`User logged out: ${userId}`);

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      logger.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed',
        code: 'LOGOUT_ERROR',
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
      // Get user
      const user = findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Verify current password
      const isValidPassword = await comparePassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        };
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword, this.saltRounds);

      // Update password
      const updated = updateUser(userId, { 
        password_hash: hashedNewPassword
      });

      if (!updated) {
        return {
          success: false,
          message: 'Failed to update password',
          code: 'UPDATE_FAILED'
        };
      }

      logger.info(`Password changed for user: ${userId}`);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      logger.error('Password change error:', error);
      return {
        success: false,
        message: 'Password change failed',
        code: 'PASSWORD_CHANGE_ERROR',
        error: error.message
      };
    }
  }

  /**
   * Get user profile with role information
   * @param {string} userId - User ID
   * @returns {Object} User profile
   */
  async getUserProfile(userId) {
    try {
      const user = getUserWithRole(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Get user permissions
      const userPermissions = getUserPermissionsWithCodes(userId);

      return {
        success: true,
        message: 'Profile retrieved successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          role_name: user.role_name,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        permissions: userPermissions.permissions,
        permissionCodes: userPermissions.permissionCodes
      };
    } catch (error) {
      logger.error('Get profile error:', error);
      return {
        success: false,
        message: 'Failed to get profile',
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
  async updateUserProfile(userId, updateData) {
    try {
      const user = findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Remove sensitive fields from update data
      const { password_hash, role_id, id, ...safeUpdateData } = updateData;

      const updated = updateUser(userId, safeUpdateData);
      if (!updated) {
        return {
          success: false,
          message: 'Failed to update profile',
          code: 'UPDATE_FAILED'
        };
      }

      logger.info(`Profile updated for user: ${userId}`);

      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      logger.error('Profile update error:', error);
      return {
        success: false,
        message: 'Profile update failed',
        code: 'PROFILE_UPDATE_ERROR',
        error: error.message
      };
    }
  }

  /**
   * Validate JWT token
   * @param {string} token - JWT token
   * @returns {Object} Validation result
   */
  async validateToken(token) {
    try {
      if (!token) {
        return {
          success: false,
          message: 'Token is required',
          code: 'MISSING_TOKEN'
        };
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return {
          success: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        };
      }

      // Check if user still exists
      const user = findUserById(decoded.id);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Check if user is active
      if (user.status !== 'active') {
        return {
          success: false,
          message: 'User account is not active',
          code: 'USER_INACTIVE'
        };
      }

      // Get user permissions
      const userPermissions = getUserPermissionsWithCodes(user.id);

      return {
        success: true,
        message: 'Token is valid',
        user: {
          id: user.id,
          name: user.name,
          role_id: user.role_id
        },
        permissions: userPermissions.permissions,
        permissionCodes: userPermissions.permissionCodes
      };
    } catch (error) {
      logger.error('Token validation error:', error);
      return {
        success: false,
        message: 'Token validation failed',
        code: 'VALIDATION_ERROR',
        error: error.message
      };
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();

module.exports = authService;

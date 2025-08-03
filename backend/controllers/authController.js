const AuthService = require("../services/authService");

class AuthController {
	constructor(db) {
		this.authService = AuthService(db);
	}

	async login(identifier, password) {
		try {
			const result = await this.authService.loginUser(identifier, password);
			return result;
		} catch (error) {
			return {
				success: false,
				message: "Authentication error",
				code: "AUTH_ERROR",
				error: error.message,
			};
		}
	}

	async register(userData, currentUser) {
		try {
			const result = await this.authService.registerUser(userData, currentUser);
			return result;
		} catch (error) {
			return {
				success: false,
				message: "Registration error",
				code: "REGISTRATION_ERROR",
				error: error.message,
			};
		}
	}

	async logout(userId, refreshToken) {
		try {
			const result = await this.authService.logoutUser(userId, refreshToken);
			return result;
		} catch (error) {
			return {
				success: false,
				message: "Logout error",
				code: "LOGOUT_ERROR",
				error: error.message,
			};
		}
	}

	async validateSession(token) {
		try {
			const result = await this.authService.validateToken(token);
			return result;
		} catch (error) {
			return {
				success: false,
				message: "Session validation error",
				code: "SESSION_ERROR",
				error: error.message,
			};
		}
	}

	async changePassword(userId, currentPassword, newPassword) {
		try {
			const result = await this.authService.changePassword(
				userId,
				currentPassword,
				newPassword
			);
			return result;
		} catch (error) {
			return {
				success: false,
				message: "Password change error",
				code: "PASSWORD_CHANGE_ERROR",
				error: error.message,
			};
		}
	}

	async getProfile(userId) {
		try {
			const result = await this.authService.getUserProfile(userId);
			return result;
		} catch (error) {
			return {
				success: false,
				message: "Profile retrieval error",
				code: "PROFILE_ERROR",
				error: error.message,
			};
		}
	}

	async updateProfile(userId, updateData) {
		try {
			const result = await this.authService.updateUserProfile(
				userId,
				updateData
			);
			return result;
		} catch (error) {
			return {
				success: false,
				message: "Profile update error",
				code: "PROFILE_UPDATE_ERROR",
				error: error.message,
			};
		}
	}
}

function createAuthController(db) {
	return new AuthController(db);
}

module.exports = createAuthController;

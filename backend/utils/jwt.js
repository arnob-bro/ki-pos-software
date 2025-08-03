const jwt = require("jsonwebtoken");

// JWT secret key - in production, this should be in environment variables
const JWT_SECRET =
	process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_REFRESH_SECRET =
	process.env.JWT_REFRESH_SECRET ||
	"your-refresh-secret-key-change-in-production";

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
function generateToken(payload, expiresIn = "24h") {
	try {
		return jwt.sign(payload, JWT_SECRET, { expiresIn });
	} catch (error) {
		console.error("Token generation error:", error);
		throw new Error("Failed to generate token");
	}
}

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(payload, expiresIn = "7d") {
	try {
		return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
	} catch (error) {
		console.error("Refresh token generation error:", error);
		throw new Error("Failed to generate refresh token");
	}
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		console.error("Token verification error:", error);
		return null;
	}
}

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 */
function verifyRefreshToken(token) {
	try {
		return jwt.verify(token, JWT_REFRESH_SECRET);
	} catch (error) {
		console.error("Refresh token verification error:", error);
		return null;
	}
}

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
function decodeToken(token) {
	try {
		return jwt.decode(token);
	} catch (error) {
		console.error("Token decode error:", error);
		return null;
	}
}

module.exports = {
	generateToken,
	generateRefreshToken,
	verifyToken,
	verifyRefreshToken,
	decodeToken,
};

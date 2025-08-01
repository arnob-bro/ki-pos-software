# Development Guidelines

## Overview
This document outlines the development standards, best practices, and workflow for the KI POS System project.

## Code Style & Standards

### JavaScript/Node.js

#### Naming Conventions
```javascript
// Variables and functions: camelCase
const userName = 'john';
const getUserById = (id) => { /* ... */ };

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;

// Classes: PascalCase
class ProductService { /* ... */ }

// Files: kebab-case
// user-service.js, product-controller.js
```

#### Code Structure
```javascript
// File organization
const dependencies = require('dependencies');
const localModules = require('./local-modules');

class ServiceClass {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  // Public methods first
  async publicMethod() {
    // Implementation
  }

  // Private methods last
  _privateMethod() {
    // Implementation
  }
}

module.exports = ServiceClass;
```

#### Error Handling
```javascript
// Use try-catch for async operations
async function processData(data) {
  try {
    const result = await someAsyncOperation(data);
    return result;
  } catch (error) {
    logger.error('Failed to process data:', error);
    throw new Error(`Processing failed: ${error.message}`);
  }
}

// Use descriptive error messages
if (!user) {
  throw new Error('User not found with provided ID');
}
```

### React/JSX

#### Component Structure
```jsx
// Functional components with hooks
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2 }) => {
  // Hooks at the top
  const [state, setState] = useState(initialValue);
  
  // Effects after state
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render logic
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

ComponentName.defaultProps = {
  prop2: 0
};

export default ComponentName;
```

#### CSS/Styling
```css
/* Use BEM methodology for CSS classes */
.component-name {
  /* Base styles */
}

.component-name__element {
  /* Element styles */
}

.component-name--modifier {
  /* Modifier styles */
}

```


## Code Quality Tools

### ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:node/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Security Best Practices

### Input Validation
```javascript
// Always validate input data
const validateProductData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Product name is required');
  }
  
  if (!data.price || isNaN(data.price) || data.price <= 0) {
    errors.push('Valid price is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  
  return data;
};
```

### SQL Injection Prevention
```javascript
// Use parameterized queries
const getProductById = (id) => {
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  return stmt.get(id);
};

// Never use string concatenation
// ❌ Bad
const query = `SELECT * FROM products WHERE id = ${id}`;

// ✅ Good
const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
```

### Authentication & Authorization
```javascript
// Always check permissions
const checkPermission = (user, permission) => {
  if (!user || !user.permissions) {
    return false;
  }
  return user.permissions.includes(permission);
};

// Use in middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!checkPermission(req.user, permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions'
      });
    }
    next();
  };
};
```

## Performance Optimization

### Database Optimization
```javascript
// Use indexes for frequently queried fields
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_transactions_date ON transactions(DATE(timestamp));

// Use prepared statements
const stmt = db.prepare('SELECT * FROM products WHERE category_id = ?');
const products = stmt.all(categoryId);

// Implement pagination
const getProducts = (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const stmt = db.prepare(`
    SELECT * FROM products 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset);
};
```

### Frontend Optimization
```javascript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Component logic */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

## Error Handling

### Centralized Error Handling
```javascript
// Global error handler
const errorHandler = (error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.message
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }
  
  // Default error
  res.status(500).json({
    error: 'Internal server error'
  });
};
```

### Logging
```javascript
// Use structured logging
const logger = require('./utils/logger');

logger.info('User logged in', {
  userId: user.id,
  timestamp: new Date().toISOString(),
  ipAddress: req.ip
});

logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
});
```

## Documentation Standards

### Code Comments
```javascript
/**
 * Creates a new product in the database
 * @param {Object} productData - Product information
 * @param {string} productData.name - Product name
 * @param {number} productData.price - Product price
 * @param {number} productData.categoryId - Category ID
 * @returns {Promise<Object>} Created product
 * @throws {Error} When validation fails or database error occurs
 */
async function createProduct(productData) {
  // Implementation
}
```

### API Documentation
```javascript
/**
 * @api {post} /products Create Product
 * @apiName CreateProduct
 * @apiGroup Products
 * @apiPermission product:add
 * 
 * @apiParam {String} name Product name
 * @apiParam {Number} price Product price
 * @apiParam {Number} categoryId Category ID
 * 
 * @apiSuccess {Object} product Created product
 * @apiSuccess {String} product.id Product ID
 * @apiSuccess {String} product.name Product name
 * 
 * @apiError {Object} 400 Validation failed
 * @apiError {Object} 401 Unauthorized
 * @apiError {Object} 500 Internal server error
 */
```

## Deployment Guidelines

### Environment Configuration
```javascript
// Use environment variables
const config = {
  database: {
    path: process.env.DB_PATH || './pos.db'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret'
  },
  server: {
    port: process.env.PORT || 3000
  }
};
```

### Build Process
```json
{
  "scripts": {
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "electron-builder",
    "build:frontend": "vite build",
    "package": "electron-builder --publish=never"
  }
}
```

## Monitoring & Debugging

### Application Monitoring
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// Performance monitoring
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration
    });
  });
  next();
};
```

### Debug Configuration
```json
{
  "scripts": {
    "debug": "NODE_ENV=development DEBUG=* electron .",
    "dev:debug": "concurrently \"npm run debug\" \"npm run dev:frontend\""
  }
}
```

## Code Review Checklist

### Before Submitting PR
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New functionality has tests
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] Error handling is implemented
- [ ] Security considerations addressed
- [ ] Performance impact considered

### Review Process
- [ ] Check for security vulnerabilities
- [ ] Verify error handling
- [ ] Review test coverage
- [ ] Check for code duplication
- [ ] Verify naming conventions
- [ ] Review documentation
- [ ] Test functionality manually 
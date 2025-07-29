# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### Node.js Version Compatibility
**Problem**: `better-sqlite3` requires Node.js 20.x or higher
```
npm WARN EBADENGINE Unsupported engine {
  package: 'better-sqlite3@12.1.1',
  required: { node: '20.x || 22.x || 23.x || 24.x' },
  current: { node: 'v18.19.0', npm: '10.2.3' }
}
```

**Solution**:
1. Upgrade Node.js to version 20 or higher
2. If using nvm:
   ```bash
   nvm install 20
   nvm use 20
   ```
3. Verify version: `node --version`
4. Clean and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

#### Native Module Compilation Issues
**Problem**: Python `distutils` module missing
```
ModuleNotFoundError: No module named 'distutils'
```

**Solution**:
1. Install setuptools: `pip install setuptools`
2. Install Visual Studio Build Tools (Windows)
3. Clean and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

#### Permission Errors During Installation
**Problem**: EPERM errors when removing directories
```
npm WARN cleanup Failed to remove some directories
Error: EPERM: operation not permitted
```

**Solution**:
1. Close all editors/terminals using the project
2. Delete node_modules manually:
   ```bash
   # Windows
   rd /s /q node_modules
   del package-lock.json
   
   # Linux/Mac
   rm -rf node_modules package-lock.json
   ```
3. Reinstall: `npm install`

#### Module Version Mismatch
**Problem**: Native modules compiled for different Node.js version
```
Error: The module was compiled against a different Node.js version using NODE_MODULE_VERSION 115. This version of Node.js requires NODE_MODULE_VERSION 119.
```

**Solution**:
1. Rebuild native modules:
   ```bash
   npm rebuild
   ```
2. Or reinstall completely:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Runtime Issues

#### Database Connection Errors
**Problem**: Database file not found or corrupted
```
Error: Cannot find database file
```

**Solution**:
1. Check database path in configuration
2. Run migrations: `npm run migrate`
3. Verify database file exists: `backend/pos.db`
4. Check file permissions

#### IPC Communication Errors
**Problem**: IPC handlers not registered
```
Error: IPC handler not found
```

**Solution**:
1. Check IPC handler registration in `backend/ipcHandlers/`
2. Verify handler names match between main and renderer
3. Restart the application

#### Authentication Issues
**Problem**: Login fails or token invalid
```
Error: Invalid credentials
```

**Solution**:
1. Check user credentials in database
2. Verify JWT secret configuration
3. Check token expiration settings
4. Clear browser cache/local storage

### Frontend Issues

#### Missing Dependencies
**Problem**: Module not found errors
```
Failed to resolve import "lucide-react"
```

**Solution**:
1. Install missing dependencies:
   ```bash
   cd renderer
   npm install lucide-react
   ```
2. Check all imports in components
3. Verify package.json dependencies

#### Build Errors
**Problem**: Vite build fails
```
Build failed with errors
```

**Solution**:
1. Check for syntax errors in components
2. Verify all imports are correct
3. Clear build cache: `npm run clean`
4. Check for TypeScript errors if using TS

#### Styling Issues
**Problem**: CSS not loading or styles not applied
```
Styles not working
```

**Solution**:
1. Check CSS import paths
2. Verify CSS class names
3. Check for CSS conflicts
4. Clear browser cache

### Database Issues

#### Migration Errors
**Problem**: Database migrations fail
```
Error: Migration failed
```

**Solution**:
1. Check migration file syntax
2. Verify database connection
3. Check for conflicting migrations
4. Reset database if needed:
   ```bash
   rm backend/pos.db
   npm run migrate
   ```

#### Data Integrity Issues
**Problem**: Foreign key constraint violations
```
Error: FOREIGN KEY constraint failed
```

**Solution**:
1. Check referenced data exists
2. Verify foreign key relationships
3. Clean up orphaned records
4. Check migration order

#### Performance Issues
**Problem**: Slow database queries
```
Queries taking too long
```

**Solution**:
1. Add database indexes
2. Optimize query structure
3. Use prepared statements
4. Implement pagination
5. Monitor query performance

### Electron Issues

#### App Not Starting
**Problem**: Electron app fails to start
```
Error: App threw an error during load
```

**Solution**:
1. Check main process file (`backend/index.js`)
2. Verify all required files exist
3. Check for syntax errors
4. Review console output for errors

#### Renderer Process Crashes
**Problem**: Frontend crashes or freezes
```
Renderer process crashed
```

**Solution**:
1. Check React component errors
2. Verify IPC communication
3. Check for infinite loops
4. Review browser console errors

#### Native Module Issues
**Problem**: Native modules not working
```
Error: The module was compiled against a different Node.js version
```

**Solution**:
1. Rebuild native modules:
   ```bash
   npm rebuild
   ```
2. Check Node.js version compatibility
3. Reinstall dependencies
4. Use electron-rebuild if needed

### Network Issues

#### IPC Communication Failures
**Problem**: Main-renderer communication fails
```
IPC communication error
```

**Solution**:
1. Check IPC handler registration
2. Verify message format
3. Check for security restrictions
4. Review Electron security settings

#### API Endpoint Errors
**Problem**: API calls fail
```
API endpoint not found
```

**Solution**:
1. Check route definitions
2. Verify HTTP methods
3. Check authentication middleware
4. Review request/response format

### Security Issues

#### Permission Denied Errors
**Problem**: Insufficient permissions
```
Error: Insufficient permissions
```

**Solution**:
1. Check user role and permissions
2. Verify permission codes
3. Check RBAC configuration
4. Review permission middleware

#### Authentication Failures
**Problem**: JWT token issues
```
Error: Invalid token
```

**Solution**:
1. Check JWT secret configuration
2. Verify token expiration
3. Check token format
4. Review authentication middleware

### Performance Issues

#### Slow Application Startup
**Problem**: App takes too long to start
```
Slow startup time
```

**Solution**:
1. Optimize database queries
2. Lazy load components
3. Reduce bundle size
4. Use code splitting

#### Memory Leaks
**Problem**: Application memory usage increases
```
High memory usage
```

**Solution**:
1. Check for event listener leaks
2. Review component cleanup
3. Monitor memory usage
4. Implement proper cleanup

### Development Issues

#### Hot Reload Not Working
**Problem**: Changes not reflected immediately
```
Hot reload not working
```

**Solution**:
1. Check Vite configuration
2. Verify file watching
3. Restart development server
4. Clear cache

#### Debugging Issues
**Problem**: Cannot debug application
```
Debugging not working
```

**Solution**:
1. Enable debug mode
2. Check DevTools configuration
3. Use console logging
4. Set breakpoints in DevTools

### Production Issues

#### Build Failures
**Problem**: Production build fails
```
Build error in production
```

**Solution**:
1. Check environment variables
2. Verify build configuration
3. Review error logs
4. Test build locally

#### Distribution Issues
**Problem**: App packaging fails
```
Electron builder error
```

**Solution**:
1. Check electron-builder configuration
2. Verify app metadata
3. Review build scripts
4. Check for missing files

## Debug Tools and Commands

### Database Debugging
```bash
# Check database integrity
sqlite3 backend/pos.db "PRAGMA integrity_check;"

# View database schema
sqlite3 backend/pos.db ".schema"

# Check table contents
sqlite3 backend/pos.db "SELECT * FROM users;"
```

### Logging
```bash
# Enable debug logging
DEBUG=* npm run dev

# View application logs
tail -f logs/app.log

# Check error logs
grep ERROR logs/error.log
```

### Performance Monitoring
```bash
# Monitor memory usage
node --inspect backend/index.js

# Profile database queries
sqlite3 backend/pos.db "PRAGMA profile;"
```

### Network Debugging
```bash
# Check IPC communication
# Add console.log in IPC handlers

# Monitor network requests
# Use browser DevTools Network tab
```

## Prevention Strategies

### Code Quality
- Use ESLint and Prettier
- Implement automated testing
- Regular code reviews
- Follow coding standards

### Database Management
- Regular backups
- Monitor database size
- Optimize queries
- Use migrations properly

### Security
- Regular security audits
- Update dependencies
- Monitor for vulnerabilities
- Implement proper RBAC

### Performance
- Monitor application metrics
- Optimize database queries
- Use caching strategies
- Regular performance testing

## Getting Help

### Documentation
- Check this troubleshooting guide
- Review API documentation
- Read development guidelines
- Check database schema docs

### Community Support
- GitHub Issues
- Stack Overflow
- Electron Discord
- React Community

### Debugging Checklist
- [ ] Check error messages
- [ ] Review console output
- [ ] Verify configuration
- [ ] Test in isolation
- [ ] Check dependencies
- [ ] Review recent changes
- [ ] Monitor system resources
- [ ] Check network connectivity 
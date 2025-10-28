# HTTPS Setup for Local Development

## Quick HTTPS Setup (Windows)

### Option 1: Using mkcert (Recommended)
```powershell
# Install mkcert (if you have Chocolatey)
choco install mkcert

# Or download from: https://github.com/FiloSottile/mkcert/releases
# Add mkcert.exe to your PATH

# Install local CA
mkcert -install

# Generate certificates
mkcert localhost 127.0.0.1 ::1
```

### Option 2: Quick HTTPS proxy with ngrok
```powershell
# Install ngrok: https://ngrok.com/download
# Or with Chocolatey:
choco install ngrok

# Run your app on port 3000
npm run dev

# In another terminal, create HTTPS tunnel
ngrok http 3000

# Use the HTTPS URL provided by ngrok
```

### Option 3: Use Vite with self-signed cert
Update `vite.config.ts`:
```typescript
export default defineConfig(({ mode }) => {
    // ... existing config
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Add HTTPS with basic cert (browser will show warning)
        https: mode === 'development' ? {
          // This creates a self-signed cert (not recommended for production)
        } : undefined
      },
      // ... rest of config
    };
});
```

## Testing Camera/Mic Issues

1. **Start your app with HTTPS** (use one of the methods above)
2. **Open the app** in your browser
3. **Click "Debug Media Issues"** before starting a conversation
4. **Review the diagnostic report** - it will show:
   - Whether you're in a secure context (HTTPS)
   - Available cameras and microphones  
   - Permission status
   - Browser compatibility

## Common Issues:

### "Not in secure context"
- **Solution**: Must use HTTPS or localhost
- **Quick fix**: Use ngrok or mkcert

### "Permission denied"
- **Solution**: Click camera/mic icon in browser address bar
- **Alternative**: Try incognito mode, then allow permissions

### "No devices found"
- **Solution**: Check if other apps are using camera/mic
- **Alternative**: Refresh browser, restart if needed

### "Device busy/not readable"
- **Solution**: Close Zoom, Teams, or other video apps
- **Alternative**: Restart browser or computer

## Browser Testing Priority:
1. Chrome/Edge (best support)
2. Firefox (good support)  
3. Safari (iOS has restrictions)

The debug panel will help identify exactly what's wrong!
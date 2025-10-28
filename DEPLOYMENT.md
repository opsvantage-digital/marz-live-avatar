# 🚀 Deployment Guide for Marz Live Avatar

## 🔒 **CRITICAL: HTTPS Required**

Modern browsers **require HTTPS** for camera and microphone access. HTTP deployments will fail with permission errors.

## ✅ **Recommended Deployment Platforms**

### 1. **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project root
vercel

# Follow prompts, auto-detects Vite config
```

### 2. **Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build first
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### 3. **GitHub Pages (with Actions)**
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 4. **Local HTTPS Testing**
```bash
# Install mkcert for local SSL
# Windows (with Chocolatey):
choco install mkcert

# Create local certificate
mkcert localhost 127.0.0.1 ::1

# Update vite.config.ts
server: {
  https: {
    key: './localhost-key.pem',
    cert: './localhost.pem'
  },
  port: 3000,
  host: '0.0.0.0'
}

# Start with HTTPS
npm run dev
```

## 🔧 **Environment Variables**

### For Production
Set these in your deployment platform:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### Platform-Specific Instructions

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add `GEMINI_API_KEY` with your key

**Netlify:**
1. Site Settings → Environment Variables
2. Add `GEMINI_API_KEY` with your key

## 🐛 **Common Issues & Fixes**

### Issue: "Media access denied"
- ✅ Ensure site is served over HTTPS
- ✅ Check browser permissions (camera/mic icon in address bar)
- ✅ Try incognito/private mode
- ✅ Clear browser cache and cookies

### Issue: "API key not found"
- ✅ Check environment variable is set correctly
- ✅ Redeploy after adding env vars
- ✅ Verify key format (starts with `AIza`)

### Issue: Camera/mic not working
- ✅ Use the "Debug Media Issues" button
- ✅ Check if other apps are using camera/mic
- ✅ Try different browser
- ✅ Check device permissions in OS settings

### Issue: "Not in secure context"
- ✅ Must use HTTPS (not HTTP)
- ✅ Localhost is considered secure for development

## 📱 **Mobile Considerations**

- Some mobile browsers have stricter media policies
- iOS Safari requires user interaction before media access
- Test on multiple devices/browsers

## 🔍 **Testing Your Deployment**

1. Open deployed URL
2. Click "Debug Media Issues" first
3. Grant camera/microphone permissions
4. Check all devices are detected
5. Test actual conversation

## 📞 **Support**

If you continue having issues:
1. Use the "Debug Media Issues" tool
2. Export the diagnostic report
3. Check browser console for errors
4. Test on different devices/browsers

Remember: **HTTPS is mandatory** for camera/microphone access!
# Deployment Guide

This guide covers how to deploy your CourseBot application to various free hosting platforms.

## 🚀 Quick Start - Vercel (Recommended)

### Why Vercel?
- Optimized for React applications
- Automatic deployments from GitHub
- Built-in environment variable support
- Excellent performance with CDN
- Custom domains included

### Steps:

1. **Push your code to GitHub** (if not already done)
2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
3. **Click "New Project"** and select your repository
4. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Add environment variables**:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
6. **Deploy!**

Your app will be live at `https://your-app-name.vercel.app`

## 🎯 Alternative Options

### 1. Netlify
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Site settings > Environment variables
5. Deploy!

### 2. GitHub Pages
1. Enable GitHub Pages in your repository settings
2. Run: `npm run deploy`
3. Your app will be at `https://[username].github.io/[repository-name]`

### 3. Surge.sh (Simplest)
1. Install: `npm install -g surge`
2. Build: `npm run build`
3. Deploy: `cd dist && surge`

## 🔧 Pre-deployment Checklist

- [ ] Database is set up in Supabase
- [ ] Environment variables are configured
- [ ] App builds successfully (`npm run build`)
- [ ] All dependencies are listed in package.json
- [ ] Database connection works in production

## 📋 Common Issues & Solutions

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working
- Make sure they start with `VITE_`
- Check they're set in your hosting platform dashboard
- Restart the deployment after adding variables

### Database Connection Issues
- Verify Supabase URL and key are correct
- Check Supabase project is not paused
- Ensure RLS policies allow public access

## 🌐 Custom Domain Setup

### Vercel:
1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify:
1. Go to Site Settings > Domain management
2. Add custom domain
3. Configure DNS records

## 📱 Performance Tips

1. **Enable compression** (usually automatic on hosting platforms)
2. **Use CDN** (included with Vercel/Netlify)
3. **Optimize images** (consider using Vercel's image optimization)
4. **Enable caching** (configured automatically)

## 🔒 Security Considerations

1. **Never commit `.env` files** (they're in `.gitignore`)
2. **Use environment variables** for sensitive data
3. **Configure Supabase RLS** properly for production
4. **Enable HTTPS** (automatic on modern platforms)

## 📊 Monitoring

### Vercel:
- Built-in analytics dashboard
- Real-time error tracking
- Performance monitoring

### Netlify:
- Analytics available
- Form handling built-in
- Split testing features

Choose the platform that best fits your needs. **Vercel is recommended** for React applications with Supabase integration.

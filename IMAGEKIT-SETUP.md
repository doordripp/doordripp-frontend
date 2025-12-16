# ImageKit Setup Guide

ImageKit provides **20GB free storage** and **20GB bandwidth/month** - perfect for e-commerce product images!

## Why ImageKit?

- ✅ **20GB Free Storage** (4x more than Firebase)
- ✅ **No Credit Card Required** 
- ✅ **Automatic Image Optimization** (resize, compress, WebP)
- ✅ **Global CDN** (fast loading worldwide)
- ✅ **Permanent Storage** (images never deleted)
- ✅ **Perfect for 1000+ products**

---

## Quick Setup (5 Minutes)

### Step 1: Create ImageKit Account

1. Go to **https://imagekit.io/**
2. Click **"Get Started Free"**
3. Sign up with Google/Email
4. No credit card required!

### Step 2: Get Your Credentials

1. After login, go to **Developer Options** (left sidebar)
2. You'll see:
   - **Public Key** - Copy this
   - **URL Endpoint** - Copy this (looks like: `https://ik.imagekit.io/your_id`)

### Step 3: Update `.env` File

Open `doordripp-frontend/.env` and replace:

```env
VITE_IMAGEKIT_PUBLIC_KEY=your_actual_public_key
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_actual_id
```

**Example:**
```env
VITE_IMAGEKIT_PUBLIC_KEY=public_abc123xyz
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/doordripp123
```

### Step 4: Setup Backend Authentication (IMPORTANT)

ImageKit requires server-side authentication for uploads. You need to add an endpoint to your backend.

**Install ImageKit SDK in Backend:**
```bash
cd doordripp-backend/node-backend
npm install imagekit
```

**Create `src/routes/imagekit.js`:**
```javascript
const express = require('express');
const ImageKit = require('imagekit');
const router = express.Router();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

router.get('/imagekit-auth', (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.send(authenticationParameters);
  } catch (error) {
    console.error('ImageKit auth error:', error);
    res.status(500).json({ error: 'Failed to generate auth parameters' });
  }
});

module.exports = router;
```

**Add to `src/index.js`:**
```javascript
const imagekitRoutes = require('./routes/imagekit');
app.use('/api', imagekitRoutes);
```

**Add to backend `.env`:**
```env
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

> Get **Private Key** from ImageKit Dashboard → Developer Options

### Step 5: Restart Servers

```bash
# Stop both servers (Ctrl+C)

# Restart backend
cd doordripp-backend/node-backend
npm run dev

# Restart frontend
cd doordripp-frontend
npm run dev
```

---

## Testing Upload

1. Login as admin: `admin@doordripp.com` / `Admin@123`
2. Go to **Admin Panel → Products → Add New Product**
3. Use **ImageKit Uploader** to upload product images
4. Images will be uploaded to ImageKit and optimized automatically

---

## Features

### Automatic Optimization
Images are automatically:
- Resized to optimal dimensions
- Compressed for faster loading
- Converted to WebP (modern format)
- Served via global CDN

### Image Transformations
You can resize images on-the-fly in URLs:
```
https://ik.imagekit.io/your_id/products/image.jpg?tr=w-400,h-400
```

### Storage Monitoring
- Check usage in ImageKit Dashboard
- 20GB free forever
- Upgrade to paid plan if needed ($10/month for 50GB)

---

## Troubleshooting

### "ImageKit Not Configured" Error
- Make sure `.env` has correct credentials
- Restart dev server after changing `.env`
- Check no typos in public key and URL endpoint

### "Authentication Failed" Error
- Backend auth endpoint not working
- Check backend `.env` has private key
- Make sure backend route is added correctly

### Images Not Uploading
- Check browser console for errors
- Verify file size < 5MB
- Only JPG, PNG, WebP allowed
- Check internet connection

---

## Production Deployment

When deploying to production:

1. Add ImageKit env vars to hosting platform (Vercel/Render)
2. Update `VITE_IMAGEKIT_AUTH_ENDPOINT` to production backend URL
3. No changes needed to ImageKit account

---

## Free Tier Limits

| Feature | Free Tier |
|---------|-----------|
| Storage | 20GB |
| Bandwidth | 20GB/month |
| Requests | 20,000/month |
| Transformations | Unlimited |
| CDN | Global |

**For 1000 Products:**
- Storage needed: ~500MB - 1.5GB ✅
- Well within free limits!

---

## Support

- **ImageKit Docs:** https://docs.imagekit.io/
- **Dashboard:** https://imagekit.io/dashboard
- **Support:** https://imagekit.io/support

Happy uploading! 🚀

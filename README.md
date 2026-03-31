## Local Development

Start the backend API first:

```bash
cd C:\databaseauth\server
npm start
```

Then start the Next.js frontend:

```bash
cd C:\cerfmay\cefrmay
npm run dev
```

Open `http://localhost:3000`.

Local development uses `http://127.0.0.1:4272/api/v1` by default unless `BACKEND_API_BASE_URL` is set.

## Vercel Deployment

This frontend should not connect to MySQL directly. It connects to the backend API, and the backend API connects to SQL.

Set these environment variables in Vercel:

```env
BACKEND_API_BASE_URL=https://api.alprasoft-corp.com/api/v1
BACKEND_API_KEY=your-backend-api-key
APP_SESSION_SECRET=your-long-random-session-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-backend-admin-password
```

Production builds fall back to `https://api.alprasoft-corp.com/api/v1` if `BACKEND_API_BASE_URL` is not set, but production should still set it explicitly in Vercel.

## Notes

- Player login, progress sync, stage results, and `/admin` all use the backend API.
- The backend API handles SQL access, UID generation, admin authentication, and dashboard aggregation.

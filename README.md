# BestUmuranga Classifieds

BestUmuranga is a classifieds and real‑estate style web platform focused on **Rwanda** and **DR Congo**, built as a full‑stack app:

- **Backend:** Laravel API (`backend/`)
- **Frontend:** React + Vite + TailwindCSS (`frontend/`)

The app supports brokers (realtors/agents), public visitors, listings with images and attributes (vehicles, properties, electronics, furniture, etc.), inquiries with client contact details, and multilingual UI.

---

## Project structure

```text
ECLASSIFIEDUMURANGA/
├─ backend/      # Laravel API (auth, listings, inquiries, locations, etc.)
└─ frontend/     # React SPA (public site, broker dashboard, admin)
```

Each folder has its own dependencies and build/dev commands.

---

## Prerequisites

- **PHP** 8.1+ and **Composer**
- **Node.js** 18+ and **npm**
- **MySQL/MariaDB** (or another DB supported by Laravel)
- Local web stack such as **XAMPP** is fine (this project lives under `C:\xampp\htdocs`).

---

## 1. Backend setup (Laravel API)

From the **project root**:

```bash
cd backend
```

### Install dependencies

```bash
composer install
npm install
```

### Environment

Copy the example env file and configure DB and app URL:

```bash
cp .env.example .env
```

Edit `.env`:

- `APP_NAME=BestUmuranga`
- `APP_URL=http://localhost:8000` (or your preferred URL)
- Database section:
  - `DB_HOST=127.0.0.1`
  - `DB_PORT=3306`
  - `DB_DATABASE=bestumuranga`
  - `DB_USERNAME=your_db_user`
  - `DB_PASSWORD=your_db_password`

### Generate key & run migrations/seeders

```bash
php artisan key:generate
php artisan migrate --seed
```

This will create all tables (users, listings, images, inquiries, locations, etc.) and seed initial data (admin user, categories, locations).

### Run backend dev server

```bash
php artisan serve
```

By default the API will be available at:

- `http://127.0.0.1:8000`

If you prefer to run under XAMPP/Apache, point a virtual host to `backend/public`.

---

## 2. Frontend setup (React + Vite)

From the **project root**:

```bash
cd frontend
```

### Install dependencies

```bash
npm install
```

### Configure API base URL (if needed)

The frontend uses an API helper in `src/lib/api.js`. Ensure the base URL points to your backend, e.g.

```js
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

Adjust this when deploying to production.

### Run frontend dev server

```bash
npm run dev
```

Vite will start a dev server (for example `http://localhost:5173` or `http://localhost:5175`).

---

## 3. How the app is organized

- **Public site**
  - Home listings, promoted ads and categories sidebar
  - Search bar and filters
  - Single listing detail page with gallery, broker info, inquiry form, and social sharing
  - WhatsApp floating support button
  - Multilingual UI (English, Kinyarwanda, French, Swahili) via `react-i18next`
- **Broker dashboard**
  - Manage own listings
  - View and respond to inquiries
  - Quick actions and statistics
- **Broker registration**
  - Dedicated page for brokers with full contact and location details

---

## 4. Basic deployment notes

### Backend (Laravel)

Typical options:

- **Shared hosting / cPanel**
  - Upload `backend/` and point the document root to `backend/public`
  - Configure `.env` for production DB, mail, app URL, etc.
  - Run (via SSH or hosting terminal):
    ```bash
    composer install --no-dev
    php artisan key:generate
    php artisan migrate --force --seed
    ```

- **VPS / Cloud server (Ubuntu, etc.)**
  - Install PHP, Composer, Nginx/Apache, MySQL
  - Clone this repo
  - Point webserver to `backend/public`
  - Run migrations and set up a queue worker if needed

### Frontend (Vite React build)

From `frontend/`:

```bash
npm run build
```

This generates a production build under `frontend/dist`. Options:

- Serve built files via **Nginx/Apache** as a static site, with a rewrite rule to `index.html` for SPA routing.
- Deploy `frontend/dist` to a static hosting service (e.g., Netlify, Vercel, S3 + CloudFront), configured with the same API base URL as your Laravel backend.

---

## 5. Development workflow

Typical local flow:

1. Start backend:
   ```bash
   cd backend
   php artisan serve
   ```
2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. Edit React components or Laravel controllers/migrations.
4. Commit & push:
   ```bash
   git status
   git add .
   git commit -m "Describe your change"
   git push
   ```

---

## 6. License

This project is currently private to the BestUmuranga team. Update this section with your preferred license (e.g. MIT) if you plan to open source it.

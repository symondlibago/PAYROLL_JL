# Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Backend Setup
```bash
cd backend
composer install
cp .env.example .env
# Edit .env with your database credentials
php artisan key:generate
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev -- --host 0.0.0.0 --port 3000
```

### Step 3: Create Test User
```bash
cd backend
php artisan tinker
```
```php
App\Models\User::create(['name' => 'Test User', 'email' => 'test@test.com', 'password' => Hash::make('password123')]);
exit
```

### Step 4: Login
- Open http://localhost:3000
- Email: test@test.com
- Password: password123

## 🔧 Database Setup

### MySQL Commands
```sql
CREATE DATABASE monitoring_system;
CREATE USER 'monitoring_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON monitoring_system.* TO 'monitoring_user'@'localhost';
FLUSH PRIVILEGES;
```

### Update .env
```env
DB_DATABASE=monitoring_system
DB_USERNAME=monitoring_user
DB_PASSWORD=your_password
```

## ✅ Verification

1. Backend running: http://localhost:8000
2. Frontend running: http://localhost:3000
3. Login works with test credentials
4. Dashboard loads after login

## 🐛 Common Fixes

- **Port in use**: Change ports in commands
- **Database error**: Check MySQL is running and credentials are correct
- **CORS error**: Ensure backend is running on port 8000
- **npm install fails**: Use `--legacy-peer-deps` flag


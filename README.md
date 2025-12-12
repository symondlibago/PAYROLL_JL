# Monitoring Systems - Full Stack Application

A complete monitoring systems dashboard with Laravel PHP backend and React frontend, featuring seamless authentication integration.

## 🚀 Features

- **Secure Authentication**: Laravel Sanctum-based API authentication
- **Modern Frontend**: React with Vite, Tailwind CSS, and Framer Motion
- **Real-time Dashboard**: Comprehensive monitoring system interface
- **Responsive Design**: Mobile-friendly interface
- **Fast Performance**: Optimized for speed and efficiency

## 📁 Project Structure

```
monitoring-systems-complete/
├── frontend/          # React frontend application
├── backend/           # Laravel backend API
└── README.md         # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- PHP (v8.1 or higher)
- Composer
- MySQL
- Git

### Backend Setup (Laravel)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your database in `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=monitoring_system
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

5. Generate application key:
   ```bash
   php artisan key:generate
   ```

6. Create database:
   ```sql
   CREATE DATABASE monitoring_system;
   ```

7. Run migrations:
   ```bash
   php artisan migrate
   ```

8. Create a test user (optional):
   ```bash
   php artisan tinker
   ```
   ```php
   App\Models\User::create([
       'name' => 'Test User',
       'email' => 'test@test.com',
       'password' => Hash::make('password123')
   ]);
   ```

9. Start the Laravel server:
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```

### Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```bash
   npm run dev -- --host 0.0.0.0 --port 3000
   ```

## 🔧 API Configuration

The frontend is configured to connect to the Laravel backend at `http://localhost:8000/api`. 

To change the API URL, update the `API_BASE_URL` constant in:
- `frontend/src/components/LoginPage.jsx`
- `frontend/src/utils/auth.js`

## 🔐 Authentication

### API Endpoints

- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout (requires authentication)
- `GET /api/user` - Get authenticated user (requires authentication)

### Frontend Authentication Flow

1. User enters credentials in the login form
2. Frontend sends POST request to `/api/login`
3. Backend validates credentials and returns JWT token
4. Frontend stores token in localStorage
5. Protected routes use the token for API requests
6. Automatic logout on token expiration

## 🎯 Usage

1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Use the test credentials:
   - Email: `test@test.com`
   - Password: `password123`
4. Access the full monitoring dashboard

## 📊 Dashboard Features

- **Dashboard Overview**: System metrics and statistics
- **Expenses & Receipts**: Financial tracking
- **Equipment Inventory**: Asset management
- **Task Monitoring**: Project tracking
- **Workers Payroll**: Employee management
- **Employee Management**: Staff administration

## 🔒 Security Features

- Laravel Sanctum authentication
- CORS protection
- Input validation
- Password hashing
- Token-based authentication
- Automatic session management

## 🚀 Production Deployment

### Backend Deployment

1. Configure production environment variables
2. Set `APP_ENV=production` in `.env`
3. Run `php artisan config:cache`
4. Run `php artisan route:cache`
5. Set up proper web server (Apache/Nginx)

### Frontend Deployment

1. Build the production version:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your web server
3. Configure API URL for production environment

## 🛡️ CORS Configuration

The backend is configured to allow cross-origin requests from any origin. For production, update `config/cors.php` to restrict allowed origins.

## 📝 Environment Variables

### Backend (.env)
```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:your-app-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=monitoring_system
DB_USERNAME=root
DB_PASSWORD=your_password
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is properly configured
2. **Database Connection**: Verify MySQL credentials and database exists
3. **Port Conflicts**: Change ports if 3000 or 8000 are in use
4. **Node Dependencies**: Use `--legacy-peer-deps` flag for npm install

### Support

For issues and questions, please check the troubleshooting section or create an issue in the repository.

---

**Made with ❤️ for BA Monitoring Systems**


import CarsView from './views/CarsView.js';
import CarDetailView from './views/CarDetailView.js';
import CarFormView from './views/CarFormView.js';
import LoginView from './views/LoginView.js';
import RegisterView from './views/RegisterView.js';
import ForgotPasswordView from './views/ForgotPasswordView.js';
import ResetPasswordView from './views/ResetPasswordView.js';
import BookingsView from './views/BookingsView.js';
import ProfileView from './views/ProfileView.js';
import AdminUsersView from './views/AdminUsersView.js';
import MessagesView from './views/MessagesView.js';

export default [
  { path: '/', redirect: { name: 'cars' } },
  { path: '/cars', name: 'cars', component: CarsView },
  { path: '/cars/new', name: 'car-create', component: CarFormView, meta: { requiresAuth: true, roles: ['owner', 'admin'] } },
  { path: '/cars/:id', name: 'car-detail', component: CarDetailView },
  { path: '/cars/:id/edit', name: 'car-edit', component: CarFormView, meta: { requiresAuth: true, roles: ['owner', 'admin'] } },
  { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView, meta: { guestOnly: true } },
  { path: '/reset-password', name: 'reset-password', component: ResetPasswordView, meta: { guestOnly: true } },
  { path: '/bookings', name: 'bookings', component: BookingsView, meta: { requiresAuth: true } },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/messages', name: 'messages', component: MessagesView, meta: { requiresAuth: true } },
  { path: '/admin/users', name: 'admin-users', component: AdminUsersView, meta: { requiresAuth: true, roles: ['admin'] } },
];

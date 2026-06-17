import api from './api';

export const login = async (email, contrasena) => {
  const { data } = await api.post('/api/auth/login', { email, contrasena });
  localStorage.setItem('token', data.token);
  return data;
};

export const register = async (nombre, email, contrasena) => {
  const { data } = await api.post('/api/auth/register', { nombre, email, contrasena });
  localStorage.setItem('token', data.token);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/api/auth/me');
  return data.user;
};

export const logout = () => {
  localStorage.removeItem('token');
};
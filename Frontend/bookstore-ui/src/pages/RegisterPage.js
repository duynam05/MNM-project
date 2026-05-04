import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

import { buildApiUrl } from '../config/api';

const readErrorMessage = async (response, fallbackMessage) => {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    return fallbackMessage;
  }

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (payload?.errors && typeof payload.errors === 'object') {
    const firstError = Object.values(payload.errors).flat().find(Boolean);
    if (typeof firstError === 'string' && firstError.trim()) {
      return firstError;
    }
  }

  return fallbackMessage;
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      const res = await fetch(buildApiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const message = await readErrorMessage(res, 'Đăng ký thất bại.');
        setError(message);
        return;
      }

      navigate('/login');
    } catch (err) {
      console.error('Register request failed:', err);
      setError('Không kết nối được tới backend http://127.0.0.1:8000.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Tạo Tài Khoản</h2>
          <p className="text-gray-500 mt-2">Tham gia cộng đồng yêu sách ngay hôm nay</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Họ tên</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                className="w-full rounded-lg border px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition hover:text-gray-700"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Nhập lại mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                className="w-full rounded-lg border px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition hover:text-gray-700"
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 mt-4"
          >
            <UserPlus size={20} /> Đăng Ký
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

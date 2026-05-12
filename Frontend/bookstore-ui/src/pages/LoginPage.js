import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from '../contexts/AuthContext';
import { ADMIN_APP_URL, buildApiUrl } from '../config/api';

const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(buildApiUrl('/auth/token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await readJson(res);
      if (!res.ok) {
        setError(data?.message || 'Đăng nhập thất bại.');
        return;
      }

      const token = data?.result?.token;
      if (!token) {
        setError('Phản hồi đăng nhập không hợp lệ.');
        return;
      }

      const decoded = jwtDecode(token);

      const profileRes = await fetch(buildApiUrl('/users/my-info'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profileData = await readJson(profileRes);
      if (!profileRes.ok) {
        setError(profileData?.message || 'Không tải được thông tin người dùng.');
        return;
      }

      const profile = profileData?.result;
      const roles = profile?.roles || [];
      const isAdmin = roles.some((role) => role.name === 'ADMIN');

      const user = {
        email: profile?.email || decoded.sub,
        fullName: profile?.fullName || decoded.sub,
        roles,
        role: roles.map((role) => role.name).join(', ') || decoded.scope,
      };

      login(user, token);

      if (isAdmin) {
        window.location.href = `${ADMIN_APP_URL}?token=${encodeURIComponent(token)}`;
        return;
      }

      navigate(from);
    } catch (err) {
      console.error('Login request failed:', err);
      setError('Không kết nối được tới backend http://127.0.0.1:8000.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Đăng Nhập</h2>
          <p className="text-gray-500 mt-2">Chào mừng bạn quay trở lại Bookstore</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full rounded-lg border px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> Đăng Nhập
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Edit2, Eye, EyeOff, LogOut, MapPin, Phone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl } from '../config/api';

const PHONE_REGEX = /^0\d{9}$/;

const AccountPage = () => {
  const [errors, setErrors] = useState({});
  const inputRefs = {
    currentPassword: useRef(null),
    newPassword: useRef(null),
    confirmPassword: useRef(null),
  };

  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem('token'), []);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pwd, setPwd] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPwd, setChangingPwd] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [showPwdFields, setShowPwdFields] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const isPhoneInvalid = form.phone && !PHONE_REGEX.test(form.phone);

  const initialsOf = (value = '') =>
    value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'US';

  const togglePwdField = (field) => {
    setShowPwdFields((current) => ({ ...current, [field]: !current[field] }));
  };

  const validatePasswordForm = () => {
    const nextErrors = {};

    if (!pwd.currentPassword) {
      nextErrors.currentPassword = 'Không được để trống';
    }

    if (!pwd.newPassword) {
      nextErrors.newPassword = 'Không được để trống';
    } else if (pwd.newPassword.length < 6) {
      nextErrors.newPassword = 'Phải >= 6 ký tự';
    }

    if (!pwd.confirmPassword) {
      nextErrors.confirmPassword = 'Không được để trống';
    } else if (pwd.confirmPassword !== pwd.newPassword) {
      nextErrors.confirmPassword = 'Không khớp';
    }

    if (pwd.newPassword === pwd.currentPassword) {
      nextErrors.newPassword = 'Không được trùng mật khẩu cũ';
    }

    setErrors(nextErrors);

    const firstErrorField = Object.keys(nextErrors)[0];
    if (firstErrorField && inputRefs[firstErrorField]?.current) {
      inputRefs[firstErrorField].current.focus();
    }

    return Object.keys(nextErrors).length === 0;
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(buildApiUrl('/users/my-info'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Load thất bại');
      }

      const userData = data.result;
      setProfile(userData);
      setForm({
        fullName: userData.fullName || '',
        phone: userData.phone || '',
        address: userData.address || '',
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [user, authLoading, fetchProfile, navigate]);

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.phone || form.phone.trim() === '') {
      toast.error('Số điện thoại là bắt buộc');
      return;
    }

    if (!PHONE_REGEX.test(form.phone)) {
      toast.error('SĐT phải 10 số và bắt đầu bằng 0');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(buildApiUrl('/users/me'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Cập nhật thất bại');
      }

      const updated = data.result;
      setProfile(updated);
      setForm({
        fullName: updated.fullName || '',
        phone: updated.phone || '',
        address: updated.address || '',
      });
      setIsEditing(false);

      toast.success('Cập nhật thành công');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!validatePasswordForm()) return;

    try {
      setChangingPwd(true);

      const res = await fetch(buildApiUrl('/auth/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: pwd.currentPassword,
          newPassword: pwd.newPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorCode = data?.code;
        const backendMsg = data?.message || '';

        if (errorCode === 1023 || backendMsg.toLowerCase().includes('invalid current password')) {
          setErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' });
          inputRefs.currentPassword.current?.focus();
          return;
        }

        if (res.status === 401) {
          toast.error('Phiên đăng nhập hết hạn');
          return;
        }

        throw new Error(backendMsg || 'Đổi mật khẩu thất bại');
      }

      toast.success('Đổi mật khẩu thành công');
      setPwd({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
      setShowPwdForm(false);
      setShowPwdFields({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
    } catch (err) {
      toast.error(err.message || 'Lỗi server');
    } finally {
      setChangingPwd(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.info('Đã đăng xuất');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Không tìm thấy dữ liệu người dùng
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <User className="text-blue-600" size={28} />
          <h1 className="text-3xl font-bold text-gray-800">Tài khoản</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-2xl font-bold text-blue-700 shadow-sm">
              {initialsOf(profile.fullName || profile.email)}
            </div>

            <h2 className="mt-3 font-semibold text-lg">{profile.fullName}</h2>
            <p className="text-gray-500 text-sm">{profile.email}</p>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <input
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                className="w-full border p-2 rounded-lg"
                placeholder="Họ tên"
              />

              <div>
                <input
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className={`w-full border p-2 rounded-lg ${isPhoneInvalid ? 'border-red-500' : ''}`}
                  placeholder="Số điện thoại"
                />

                {isPhoneInvalid ? (
                  <p className="text-red-500 text-xs mt-1">
                    SĐT phải 10 số và bắt đầu bằng 0
                  </p>
                ) : null}
              </div>

              <input
                value={form.address}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                className="w-full border p-2 rounded-lg"
                placeholder="Địa chỉ"
              />

              <div className="flex gap-2">
                <button
                  disabled={saving || !form.phone || form.phone.trim() === '' || !PHONE_REGEX.test(form.phone)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-200 py-2 rounded-lg"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>{profile.phone || 'Chưa có'}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{profile.address || 'Chưa có'}</span>
              </div>

              <hr />

              <button
                onClick={() => setIsEditing(true)}
                className="w-full border py-2 rounded-lg"
              >
                <Edit2 size={16} className="inline mr-2" />
                Chỉnh sửa
              </button>

              <hr className="my-4" />

              <button
                onClick={() => setShowPwdForm((current) => !current)}
                className="w-full border py-2 rounded-lg mb-3"
              >
                Đổi mật khẩu
              </button>

              {showPwdForm ? (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <div className="relative">
                      <input
                        ref={inputRefs.currentPassword}
                        type={showPwdFields.currentPassword ? 'text' : 'password'}
                        value={pwd.currentPassword}
                        onChange={(event) => setPwd({ ...pwd, currentPassword: event.target.value })}
                        className={`w-full border p-2 pr-10 rounded-lg ${errors.currentPassword ? 'border-red-500' : ''}`}
                        placeholder="Mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => togglePwdField('currentPassword')}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition hover:text-gray-700"
                        aria-label={showPwdFields.currentPassword ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'}
                      >
                        {showPwdFields.currentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {errors.currentPassword ? (
                      <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                    ) : null}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        ref={inputRefs.newPassword}
                        type={showPwdFields.newPassword ? 'text' : 'password'}
                        value={pwd.newPassword}
                        onChange={(event) => setPwd({ ...pwd, newPassword: event.target.value })}
                        className={`w-full border p-2 pr-10 rounded-lg ${errors.newPassword ? 'border-red-500' : ''}`}
                        placeholder="Mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => togglePwdField('newPassword')}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition hover:text-gray-700"
                        aria-label={showPwdFields.newPassword ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                      >
                        {showPwdFields.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {errors.newPassword ? (
                      <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                    ) : null}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        ref={inputRefs.confirmPassword}
                        type={showPwdFields.confirmPassword ? 'text' : 'password'}
                        value={pwd.confirmPassword}
                        onChange={(event) => setPwd({ ...pwd, confirmPassword: event.target.value })}
                        className={`w-full border p-2 pr-10 rounded-lg ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="Xác nhận mật khẩu"
                      />
                      <button
                        type="button"
                        onClick={() => togglePwdField('confirmPassword')}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition hover:text-gray-700"
                        aria-label={showPwdFields.confirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}
                      >
                        {showPwdFields.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {errors.confirmPassword ? (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    ) : null}
                  </div>

                  <button
                    disabled={changingPwd}
                    className="w-full bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
                  >
                    {changingPwd ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                  </button>
                </form>
              ) : null}

              <button
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-600 py-2 rounded-lg"
              >
                <LogOut size={16} className="inline mr-2" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

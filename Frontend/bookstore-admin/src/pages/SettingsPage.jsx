import { useEffect, useRef, useState } from 'react';

import MaterialIcon from '../components/MaterialIcon';
import { apiRequest } from '../lib/apiClient';

const initialNotificationSettings = {
  periodicEmail: true,
  stockAlert: true,
  newReview: false,
};

const initialStoreSettings = {
  storeName: 'BookStore',
  supportPhone: '',
  officeAddress: '',
};

const initialProfileForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  bio: '',
};

const initialPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const sectionItems = [
  { id: 'profile', label: 'Hồ sơ cá nhân' },
  { id: 'general', label: 'Cài đặt chung' },
  { id: 'security', label: 'Bảo mật' },
  { id: 'notifications', label: 'Thông báo' },
];

function SectionHeading({ icon, title }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <MaterialIcon fill>{icon}</MaterialIcon>
      </span>
      <h4 className="text-lg font-bold tracking-tight text-slate-900">{title}</h4>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, disabled = false }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <input
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
        disabled={disabled}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder, visible, onToggleVisibility }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <div className="relative">
        <input
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 pr-12 text-sm outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20"
          placeholder={placeholder}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
        />
        <button
          className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-slate-600"
          type="button"
          onClick={onToggleVisibility}
        >
          <MaterialIcon>{visible ? 'visibility_off' : 'visibility'}</MaterialIcon>
        </button>
      </div>
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows = 3, placeholder, disabled = false }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <textarea
        className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function toProfileForm(adminUser) {
  return {
    fullName: adminUser?.fullName || '',
    email: adminUser?.email || '',
    phone: adminUser?.phone || '',
    address: adminUser?.address || '',
    bio: adminUser?.bio || '',
  };
}

function SettingsPage({ adminUser, token, onProfileUpdated }) {
  const [notifications, setNotifications] = useState(initialNotificationSettings);
  const [storeSettings, setStoreSettings] = useState(initialStoreSettings);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const manualScrollTargetRef = useRef('');

  useEffect(() => {
    setProfileForm(toProfileForm(adminUser));
    setIsTwoFactorEnabled(Boolean(adminUser?.twoFactorEnabled));
  }, [adminUser]);

  useEffect(() => {
    if (!token) return;

    let active = true;

    const loadSettings = async () => {
      setSettingsLoading(true);
      setSettingsError('');

      try {
        const settings = await apiRequest('/admin/settings', { token });
        if (!active) return;

        setStoreSettings({
          storeName: settings.storeName || 'BookStore',
          supportPhone: settings.supportPhone || '',
          officeAddress: settings.officeAddress || '',
        });
        setNotifications({
          periodicEmail: Boolean(settings.periodicEmail),
          stockAlert: Boolean(settings.stockAlert),
          newReview: Boolean(settings.newReview),
        });
      } catch (error) {
        if (!active) return;
        setSettingsError(error instanceof Error ? error.message : 'Không thể tải cài đặt hệ thống.');
      } finally {
        if (active) {
          setSettingsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    const elements = sectionItems
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    const updateActiveSection = () => {
      const scrollAnchor = 120;

      if (manualScrollTargetRef.current) {
        const manualTarget = document.getElementById(manualScrollTargetRef.current);

        if (manualTarget) {
          const { top, bottom } = manualTarget.getBoundingClientRect();

          if (top <= scrollAnchor + 8 && bottom > scrollAnchor) {
            setActiveSection(manualScrollTargetRef.current);
            return;
          }
        }
      }

      let nextActiveSection = sectionItems[0].id;

      for (const element of elements) {
        if (element.getBoundingClientRect().top - scrollAnchor <= 0) {
          nextActiveSection = element.id;
        } else {
          break;
        }
      }

      if (manualScrollTargetRef.current === nextActiveSection) {
        manualScrollTargetRef.current = '';
      }

      setActiveSection((current) => (current === nextActiveSection ? current : nextActiveSection));
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
    };
  }, []);

  const handleNavigateSection = (event, sectionId) => {
    event.preventDefault();
    const target = document.getElementById(sectionId);
    if (!target) return;

    manualScrollTargetRef.current = sectionId;
    setActiveSection(sectionId);
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleProfileChange = (field) => (event) => {
    setProfileForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleStoreSettingsChange = (field) => (event) => {
    setStoreSettings((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const toggleNotification = (field) => {
    setNotifications((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const hasPasswordInput = Boolean(
    passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword,
  );

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    if (hasPasswordInput) {
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setSaveError('Vui lòng nhập đầy đủ thông tin mật khẩu.');
        setSaving(false);
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setSaveError('Mật khẩu mới phải có ít nhất 6 ký tự.');
        setSaving(false);
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setSaveError('Xác nhận mật khẩu mới không khớp.');
        setSaving(false);
        return;
      }
    }

    try {
      const [updatedProfile] = await Promise.all([
        apiRequest('/users/me', {
          token,
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: profileForm.fullName.trim(),
            phone: profileForm.phone.trim(),
            address: profileForm.address.trim(),
            bio: profileForm.bio.trim(),
            twoFactorEnabled: isTwoFactorEnabled,
          }),
        }),
        apiRequest('/admin/settings', {
          token,
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeName: storeSettings.storeName.trim(),
            supportPhone: storeSettings.supportPhone.trim(),
            officeAddress: storeSettings.officeAddress.trim(),
            periodicEmail: notifications.periodicEmail,
            stockAlert: notifications.stockAlert,
            newReview: notifications.newReview,
          }),
        }),
      ]);

      if (hasPasswordInput) {
        await apiRequest('/auth/change-password', {
          token,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        });
      }

      onProfileUpdated?.(updatedProfile);
      setProfileForm(toProfileForm(updatedProfile));
      setIsTwoFactorEnabled(Boolean(updatedProfile?.twoFactorEnabled));
      setPasswordForm(initialPasswordForm);
      setPasswordVisibility({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      setSaveSuccess(hasPasswordInput ? 'Đã lưu cài đặt và đổi mật khẩu thành công.' : 'Đã lưu thay đổi thành công.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Không thể lưu thay đổi.');
    } finally {
      setSaving(false);
    }
  };

  const adminInitials = (profileForm.fullName || profileForm.email || 'AD')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AD';

  return (
    <main className="ml-64 min-h-[calc(100vh-4rem)] bg-[#f8f9fa] p-8 md:p-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10">
          <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-blue-600">
            BookStore Admin
          </span>
          <h3 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900">Cài đặt trung tâm</h3>
          {settingsError ? <p className="text-sm text-red-600">{settingsError}</p> : null}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <nav className="sticky top-24 space-y-1">
              {sectionItems.map((section) => {
                const isActive = activeSection === section.id;

                return (
                  <a
                    key={section.id}
                    className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-all ${
                      isActive
                        ? 'border border-slate-100 bg-white font-bold text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                    href={`#${section.id}`}
                    onClick={(event) => handleNavigateSection(event, section.id)}
                  >
                    <span>{section.label}</span>
                    <MaterialIcon className={`text-base transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                      chevron_right
                    </MaterialIcon>
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="space-y-8 pb-20 lg:col-span-9">
            {saveError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {saveError}
              </div>
            ) : null}

            {saveSuccess ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {saveSuccess}
              </div>
            ) : null}

            <section className="scroll-mt-24 rounded-lg border border-slate-100 bg-white p-8 shadow-sm" id="profile">
              <SectionHeading icon="account_circle" title="Hồ sơ cá nhân" />

              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700 ring-4 ring-blue-50">
                    {adminInitials}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">Tài khoản quản trị</p>
                    <p className="text-xs text-slate-500">Thông tin hồ sơ.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <InputField
                    label="Họ và tên"
                    value={profileForm.fullName}
                    onChange={handleProfileChange('fullName')}
                    placeholder="Nhập họ và tên"
                  />
                  <InputField
                    disabled
                    label="Email quản trị"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileChange('email')}
                    placeholder="admin@bookstore.vn"
                  />
                  <InputField
                    label="Số điện thoại"
                    value={profileForm.phone}
                    onChange={handleProfileChange('phone')}
                    placeholder="Nhập số điện thoại"
                  />
                  <InputField
                    label="Địa chỉ"
                    value={profileForm.address}
                    onChange={handleProfileChange('address')}
                    placeholder="Nhập địa chỉ liên hệ"
                  />
                  <div className="md:col-span-2">
                    <TextAreaField
                      label="Tiểu sử ngắn"
                      value={profileForm.bio}
                      onChange={handleProfileChange('bio')}
                      placeholder="Nhập mô tả ngắn cho tài khoản quản trị"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="scroll-mt-24 rounded-lg border border-slate-100 bg-white p-8 shadow-sm" id="general">
              <SectionHeading icon="storefront" title="Cài đặt chung" />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InputField
                  label="Tên cửa hàng"
                  value={storeSettings.storeName}
                  onChange={handleStoreSettingsChange('storeName')}
                  placeholder="Nhập tên cửa hàng"
                  disabled={settingsLoading}
                />
                <InputField
                  label="Số điện thoại liên hệ"
                  value={storeSettings.supportPhone}
                  onChange={handleStoreSettingsChange('supportPhone')}
                  placeholder="Nhập số điện thoại liên hệ"
                  disabled={settingsLoading}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Địa chỉ văn phòng"
                    value={storeSettings.officeAddress}
                    onChange={handleStoreSettingsChange('officeAddress')}
                    placeholder="Nhập địa chỉ văn phòng"
                    disabled={settingsLoading}
                  />
                </div>
              </div>
            </section>

            <section className="scroll-mt-24 rounded-lg border border-slate-100 bg-white p-8 shadow-sm" id="security">
              <SectionHeading icon="verified_user" title="Bảo mật" />

              <div className="space-y-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-4">
                    <p className="text-sm font-bold text-slate-900">Đổi mật khẩu</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <PasswordField
                      label="Mật khẩu hiện tại"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange('currentPassword')}
                      placeholder="Nhập mật khẩu hiện tại"
                      visible={passwordVisibility.currentPassword}
                      onToggleVisibility={() => togglePasswordVisibility('currentPassword')}
                    />
                    <PasswordField
                      label="Mật khẩu mới"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange('newPassword')}
                      placeholder="Nhập mật khẩu mới"
                      visible={passwordVisibility.newPassword}
                      onToggleVisibility={() => togglePasswordVisibility('newPassword')}
                    />
                    <PasswordField
                      label="Xác nhận mật khẩu"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange('confirmPassword')}
                      placeholder="Nhập lại mật khẩu mới"
                      visible={passwordVisibility.confirmPassword}
                      onToggleVisibility={() => togglePasswordVisibility('confirmPassword')}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100/50 text-blue-600">
                      <MaterialIcon>phonelink_lock</MaterialIcon>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Xác thực 2 yếu tố (2FA)</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className={`mr-4 text-[0.65rem] font-bold uppercase ${isTwoFactorEnabled ? 'text-green-600' : 'text-red-500'}`}>
                      {isTwoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
                    </span>
                    <button
                      className={`relative h-5 w-10 rounded-full p-0.5 transition-colors ${isTwoFactorEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                      type="button"
                      onClick={() => setIsTwoFactorEnabled((current) => !current)}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${isTwoFactorEnabled ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="scroll-mt-24 rounded-lg border border-slate-100 bg-white p-8 shadow-sm" id="notifications">
              <SectionHeading icon="notifications_active" title="Thông báo" />

              <div className="space-y-2">
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-4 transition-colors hover:border-slate-100 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <MaterialIcon className="text-slate-400">mail</MaterialIcon>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Email định kỳ</p>
                      <p className="text-xs text-slate-500">Nhận báo cáo doanh thu hằng tuần qua email.</p>
                    </div>
                  </div>
                  <input checked={notifications.periodicEmail} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" type="checkbox" onChange={() => toggleNotification('periodicEmail')} />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-4 transition-colors hover:border-slate-100 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <MaterialIcon className="text-slate-400">inventory</MaterialIcon>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Cảnh báo tồn kho</p>
                      <p className="text-xs text-slate-500">Thông báo khi sách trong kho sắp hết hàng.</p>
                    </div>
                  </div>
                  <input checked={notifications.stockAlert} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" type="checkbox" onChange={() => toggleNotification('stockAlert')} />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-4 transition-colors hover:border-slate-100 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <MaterialIcon className="text-slate-400">stars</MaterialIcon>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Đánh giá mới</p>
                      <p className="text-xs text-slate-500">Nhận thông báo khi có khách hàng để lại đánh giá sách.</p>
                    </div>
                  </div>
                  <input checked={notifications.newReview} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" type="checkbox" onChange={() => toggleNotification('newReview')} />
                </label>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={saving || settingsLoading}
                type="button"
                onClick={handleSaveAll}
              >
                {saving ? 'Đang lưu thay đổi...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SettingsPage;


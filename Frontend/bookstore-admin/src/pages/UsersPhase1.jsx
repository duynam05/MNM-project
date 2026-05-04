import { useMemo, useState } from 'react';

import MaterialIcon from '../components/MaterialIcon';

const PAGE_SIZE = 8;

function initialsOf(value = '') {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'NA';
}

function avatarTone(index) {
  const tones = ['bg-blue-100 text-blue-700', 'bg-slate-100 text-slate-700', 'bg-red-100 text-red-700', 'bg-amber-100 text-amber-700'];
  return tones[index % tones.length];
}

function userStatusMeta(status) {
  if (status === 'DISABLED') {
    return { label: 'Bị khóa', wrap: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-600' };
  }
  return { label: 'Hoạt động', wrap: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' };
}

function buildPageNumbers(currentPage, totalPages) {
  const start = Math.max(currentPage - 2, 0);
  const end = Math.min(start + 5, totalPages);
  return Array.from({ length: Math.max(end - start, 0) }, (_, index) => start + index);
}

export function UsersPhase1({
  users,
  loading,
  error,
  busyUserId,
  roleOptions,
  selectedRole,
  selectedStatus,
  onCreate,
  onEdit,
  onToggleStatus,
  onDelete,
  onRoleChange,
  onStatusChange,
  onRefresh,
}) {
  const [currentPage, setCurrentPage] = useState(0);

  const activeCount = users.filter((user) => user.status === 'ACTIVE').length;
  const adminCount = users.filter((user) => user.roles?.some((role) => role.name === 'ADMIN')).length;
  const disabledCount = users.filter((user) => user.status === 'DISABLED').length;

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages - 1, 0));

  const paginatedUsers = useMemo(
    () => users.slice(safeCurrentPage * PAGE_SIZE, (safeCurrentPage + 1) * PAGE_SIZE),
    [users, safeCurrentPage],
  );

  const pageNumbers = useMemo(
    () => buildPageNumbers(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages],
  );

  const startIndex = users.length ? safeCurrentPage * PAGE_SIZE + 1 : 0;
  const endIndex = Math.min((safeCurrentPage + 1) * PAGE_SIZE, users.length);

  return (
    <main className="ml-64 min-h-screen bg-white">
      <div className="px-10 pb-12 pt-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="mb-1 text-3xl font-extrabold tracking-tight text-slate-900">Người dùng</h2>
            <p className="text-sm text-slate-500">Quản lý và phân quyền hệ thống thành viên của bạn.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95" type="button" onClick={onCreate}>
            <MaterialIcon className="text-lg">person_add</MaterialIcon>
            Thêm người dùng mới
          </button>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            ['group', 'bg-blue-50 text-blue-600', 'Tổng thành viên', String(users.length), 'text-green-600', 'trending_up', `${loading ? 'Đang tải dữ liệu' : 'Dữ liệu đã cập nhật'}`],
            ['verified', 'bg-green-50 text-green-600', 'Đang hoạt động', String(activeCount), 'text-slate-400', '', `${activeCount} tài khoản sẵn sàng`],
            ['shield_person', 'bg-amber-50 text-amber-600', 'Vai trò quản lý', String(adminCount), 'text-slate-400', '', 'Bao gồm tài khoản ADMIN'],
            ['block', 'bg-red-50 text-red-600', 'Đã chặn', String(disabledCount), 'text-red-400', 'warning', 'Cần xem xét lại'],
          ].map(([icon, iconWrap, label, value, noteColor, noteIcon, note]) => (
            <div key={label} className="rounded-lg border border-slate-200/60 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconWrap}`}><MaterialIcon fill>{icon}</MaterialIcon></div>
                <div><p className="text-[0.72rem] font-bold uppercase tracking-widest text-slate-400">{label}</p><h3 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{value}</h3></div>
              </div>
              <div className={`flex items-center gap-2 text-xs font-medium ${noteColor}`}>{noteIcon ? <MaterialIcon className="text-sm">{noteIcon}</MaterialIcon> : null}<span>{note}</span></div>
            </div>
          ))}
        </div>

        <section className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500">
            <MaterialIcon className="text-lg">filter_list</MaterialIcon>
            Bộ lọc:
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <span>Vai trò</span>
            <select className="border-none bg-transparent text-sm font-medium text-slate-900 focus:outline-none" value={selectedRole} onChange={(event) => onRoleChange(event.target.value)}>
              <option value="all">Tất cả</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <span>Trạng thái</span>
            <select className="border-none bg-transparent text-sm font-medium text-slate-900 focus:outline-none" value={selectedStatus} onChange={(event) => onStatusChange(event.target.value)}>
              <option value="all">Tất cả</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="DISABLED">Bị khóa</option>
            </select>
          </label>
          <div className="flex-grow" />
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600" onClick={onRefresh} type="button">
            <MaterialIcon className="text-lg">restart_alt</MaterialIcon>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </section>

        {error ? <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Danh sách tài khoản</h3>
              <p className="mt-1 text-sm text-slate-500">{loading ? 'Đang tải dữ liệu...' : `Hiển thị ${startIndex} - ${endIndex} / ${users.length} tài khoản`}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Người dùng', 'Email', 'Vai trò', 'Trạng thái', 'Thao tác'].map((head) => (
                    <th key={head} className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!loading && paginatedUsers.length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan="5">
                      Không tìm thấy người dùng phù hợp.
                    </td>
                  </tr>
                ) : null}

                {paginatedUsers.map((user, index) => {
                  const status = userStatusMeta(user.status);
                  const isBusy = busyUserId === user.id;

                  return (
                    <tr key={user.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold uppercase ${avatarTone(index)}`}>{initialsOf(user.fullName || user.email)}</div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.fullName || 'Chưa có tên'}</p>
                            <p className="text-xs text-slate-500">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{user.roles?.map((role) => role.name).join(', ') || 'USER'}</span></td>
                      <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.wrap}`}><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50" type="button" onClick={() => onEdit(user)} disabled={isBusy}><MaterialIcon className="text-lg">edit</MaterialIcon></button>
                          <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:border-amber-100 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50" type="button" onClick={() => onToggleStatus(user)} disabled={isBusy}><MaterialIcon className="text-lg">{user.status === 'ACTIVE' ? 'block' : 'verified'}</MaterialIcon></button>
                          <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-50" type="button" onClick={() => onDelete(user)} disabled={isBusy}><MaterialIcon className="text-lg">delete</MaterialIcon></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length > 0 ? (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-tighter text-slate-500">
                Trang {safeCurrentPage + 1} / {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button className="rounded p-1 text-slate-500 transition-colors disabled:opacity-30" type="button" disabled={safeCurrentPage === 0} onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}>
                  <MaterialIcon className="text-[20px]">chevron_left</MaterialIcon>
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button key={pageNumber} className={`flex h-8 w-8 items-center justify-center rounded text-xs font-bold ${pageNumber === safeCurrentPage ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white'}`} type="button" onClick={() => setCurrentPage(pageNumber)}>
                    {pageNumber + 1}
                  </button>
                ))}

                <button className="rounded p-1 text-slate-500 transition-colors disabled:opacity-30 hover:bg-white" type="button" disabled={safeCurrentPage + 1 >= totalPages} onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages - 1))}>
                  <MaterialIcon className="text-[20px]">chevron_right</MaterialIcon>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export function UserFormPhase1({ mode, user, roles, submitting, error, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => (
    mode === 'edit' && user
      ? {
          email: user.email || '',
          password: '',
          fullName: user.fullName || '',
          roles: user.roles?.map((role) => role.name) || ['USER'],
          status: user.status || 'ACTIVE',
        }
      : { email: '', password: '', fullName: '', roles: ['USER'], status: 'ACTIVE' }
  ));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <main className="ml-64 flex min-w-0 flex-1 flex-col bg-white">
      <div className="mx-auto w-full max-w-6xl p-8 lg:p-12">
        <div className="mb-10">
          <nav className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <button className="transition-colors hover:text-blue-600" type="button" onClick={onCancel}>Người dùng</button>
            <MaterialIcon className="text-[10px]">chevron_right</MaterialIcon>
            <span className="font-bold text-slate-900">{mode === 'edit' ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</span>
          </nav>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{mode === 'edit' ? 'Cập nhật thông tin' : 'Tạo tài khoản hệ thống'}</h2>
          <p className="mt-1 text-slate-500">{mode === 'edit' ? 'Cập nhật hồ sơ và phân quyền truy cập cho nhân sự.' : 'Thiết lập tài khoản mới cho người dùng nội bộ.'}</p>
        </div>

        <form className="grid grid-cols-1 gap-8 lg:grid-cols-12" onSubmit={handleSubmit}>
          <div className="space-y-6 lg:col-span-4">
            <div className="flex flex-col items-center rounded-xl border border-slate-100 bg-white p-8 text-center shadow-[0_12px_32px_rgba(43,52,55,0.04)]">
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-50 bg-blue-100 text-3xl font-bold text-blue-700 shadow-lg">
                {initialsOf(form.fullName || form.email)}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{form.fullName || 'Người dùng mới'}</h3>
              <p className="mb-4 text-sm text-slate-500">{form.email || 'Chưa có email'}</p>
              <div className="rounded-full bg-blue-50 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-blue-600">{form.roles[0] || 'USER'}</div>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-8">
            <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-[0_12px_32px_rgba(43,52,55,0.04)]">
              <h3 className="mb-8 flex items-center gap-2 text-lg font-bold text-slate-900"><MaterialIcon className="text-blue-600">person</MaterialIcon>Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2"><label className="mb-2 block text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">Họ và tên</label><input className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} type="text" required /></div>
                <div><label className="mb-2 block text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">Email</label><input className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" required disabled={mode === 'edit'} /></div>
                <div><label className="mb-2 block text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">Vai trò</label><select className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" value={form.roles[0] || 'USER'} onChange={(event) => setForm((current) => ({ ...current, roles: [event.target.value] }))}>{roles.map((role) => <option key={role.name} value={role.name}>{role.name}</option>)}</select></div>
                <div><label className="mb-2 block text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">Mật khẩu</label><input className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} type="password" placeholder={mode === 'edit' ? 'Để trống để giữ nguyên' : 'Ít nhất 6 ký tự'} required={mode === 'create'} /></div>
                <div><label className="mb-2 block text-[0.7rem] font-bold uppercase tracking-widest text-slate-400">Trạng thái</label><select className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option value="ACTIVE">Hoạt động</option><option value="DISABLED">Bị khóa</option></select></div>
              </div>
            </div>

            {error ? <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}

            <div className="flex justify-end gap-4">
              <button className="rounded-lg border border-slate-200 bg-white px-8 py-4 text-sm font-bold tracking-wide text-slate-500 transition-all hover:bg-slate-50" type="button" onClick={onCancel}>Hủy thay đổi</button>
              <button className="flex items-center gap-3 rounded-lg bg-blue-600 px-10 py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 disabled:opacity-60" type="submit" disabled={submitting}>Lưu thay đổi<MaterialIcon className="text-[20px]">check_circle</MaterialIcon></button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

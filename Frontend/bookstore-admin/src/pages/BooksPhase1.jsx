import { useMemo, useState } from 'react';

import MaterialIcon from '../components/MaterialIcon';

const PAGE_SIZE = 8;

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return '0 VND';
  return `${Number(value).toLocaleString('vi-VN')} VND`;
}

function stockMeta(stock) {
  if (!stock) return { label: 'Hết hàng', wrap: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-600' };
  if (stock < 10) return { label: 'Sắp hết', wrap: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500' };
  return { label: 'Còn hàng', wrap: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-600' };
}

function buildPageNumbers(currentPage, totalPages) {
  const start = Math.max(currentPage - 2, 0);
  const end = Math.min(start + 5, totalPages);
  return Array.from({ length: Math.max(end - start, 0) }, (_, index) => start + index);
}

export function BooksPhase1({
  books,
  loading,
  error,
  busyBookId,
  categoryOptions,
  selectedCategory,
  selectedStock,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
  onCategoryChange,
  onStockChange,
}) {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages - 1, 0));

  const paginatedBooks = useMemo(
    () => books.slice(safeCurrentPage * PAGE_SIZE, (safeCurrentPage + 1) * PAGE_SIZE),
    [books, safeCurrentPage],
  );

  const pageNumbers = useMemo(
    () => buildPageNumbers(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages],
  );

  const startIndex = books.length ? safeCurrentPage * PAGE_SIZE + 1 : 0;
  const endIndex = Math.min((safeCurrentPage + 1) * PAGE_SIZE, books.length);

  return (
    <main className="ml-64 min-h-screen px-8 pb-12 pt-8">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-slate-400">
            <button className="transition-colors hover:text-blue-600" type="button">Trang chủ</button>
            <MaterialIcon className="text-[10px]">chevron_right</MaterialIcon>
            <span className="text-slate-900">Quản lý sách</span>
          </nav>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Thư viện Sách</h2>
          <p className="mt-1 text-slate-500">Quản lý và cập nhật kho sách của hệ thống.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95" onClick={onCreate} type="button">
          <MaterialIcon>add</MaterialIcon>
          Thêm sách mới
        </button>
      </div>

      <section className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500">
          <MaterialIcon className="text-lg">filter_list</MaterialIcon>
          Bộ lọc:
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <span>Danh mục</span>
          <select
            className="border-none bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="all">Tất cả</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <span>Trạng thái</span>
          <select
            className="border-none bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
            value={selectedStock}
            onChange={(event) => onStockChange(event.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="in-stock">Còn hàng</option>
            <option value="low-stock">Sắp hết</option>
            <option value="out-of-stock">Hết hàng</option>
          </select>
        </label>
        <div className="flex-grow" />
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600" onClick={onRefresh} type="button">
          <MaterialIcon className="text-lg">restart_alt</MaterialIcon>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </section>

      {error ? <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      {!loading && !error ? (
        <p className="mb-4 text-sm text-slate-500">
          Hiển thị {startIndex} - {endIndex} / {books.length} sách phù hợp với bộ lọc hiện tại.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Sách</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Danh mục</th>
                <th className="px-6 py-4 text-right text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Giá bán</th>
                <th className="px-6 py-4 text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Tồn kho</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="px-6 py-4 text-right text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && books.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan="6">
                    Không tìm thấy sách phù hợp.
                  </td>
                </tr>
              ) : null}

              {paginatedBooks.map((book) => {
                const stock = stockMeta(book.stock);
                const isBusy = busyBookId === book.id;

                return (
                  <tr key={book.id} className="group transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded border border-slate-100 shadow-sm">
                          {book.image ? <img alt={`${book.title} Cover`} className="h-full w-full object-cover" src={book.image} /> : <div className="h-full w-full bg-slate-100" />}
                        </div>
                        <div>
                          <h4 className="leading-tight font-bold text-slate-900 transition-colors group-hover:text-blue-600">{book.title}</h4>
                          <p className="text-xs text-slate-500">{book.author}</p>
                          <p className="mt-1 text-[10px] font-medium uppercase tracking-tighter text-slate-400">{book.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{book.category || 'Chưa phân loại'}</span></td>
                    <td className="px-6 py-4 text-right"><span className="font-bold text-slate-900">{formatCurrency(book.price)}</span></td>
                    <td className="px-6 py-4 text-center"><span className={`font-medium ${!book.stock ? 'text-red-600' : 'text-slate-900'}`}>{book.stock ?? 0}</span></td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${stock.wrap}`}><span className={`h-1.5 w-1.5 rounded-full ${stock.dot}`} />{stock.label}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50" type="button" onClick={() => onEdit(book)} disabled={isBusy}>
                          <MaterialIcon className="text-lg">edit</MaterialIcon>
                        </button>
                        <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-50" type="button" onClick={() => onDelete(book)} disabled={isBusy}>
                          <MaterialIcon className="text-lg">delete</MaterialIcon>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {books.length > 0 ? (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-tighter text-slate-500">
              Trang {safeCurrentPage + 1} / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                className="rounded p-1 text-slate-500 transition-colors disabled:opacity-30"
                type="button"
                disabled={safeCurrentPage === 0}
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
              >
                <MaterialIcon className="text-[20px]">chevron_left</MaterialIcon>
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`flex h-8 w-8 items-center justify-center rounded text-xs font-bold ${
                    pageNumber === safeCurrentPage ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white'
                  }`}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber + 1}
                </button>
              ))}

              <button
                className="rounded p-1 text-slate-500 transition-colors disabled:opacity-30 hover:bg-white"
                type="button"
                disabled={safeCurrentPage + 1 >= totalPages}
                onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages - 1))}
              >
                <MaterialIcon className="text-[20px]">chevron_right</MaterialIcon>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export function BookFormPhase1({ mode, book, submitting, uploadLoading, error, onCancel, onSubmit, onUploadImage }) {
  const defaultForm = { title: '', author: '', category: '', price: '0', stock: '0', rating: '0', image: '' };
  const [form, setForm] = useState(() => (
    mode === 'edit' && book
      ? {
          title: book.title || '',
          author: book.author || '',
          category: book.category || '',
          price: String(book.price ?? 0),
          stock: String(book.stock ?? 0),
          rating: String(book.rating ?? 0),
          image: book.image || '',
        }
      : defaultForm
  ));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      rating: Number(form.rating || 0),
      image: form.image.trim(),
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imageUrl = await onUploadImage(file);
    if (imageUrl) setForm((current) => ({ ...current, image: imageUrl }));
    event.target.value = '';
  };

  return (
    <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-y-auto bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-8 md:p-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <span className="cursor-pointer transition-colors hover:text-blue-600">Quản lý</span>
          <MaterialIcon className="text-[10px]">chevron_right</MaterialIcon>
          <span className="cursor-pointer transition-colors hover:text-blue-600">Sách</span>
          <MaterialIcon className="text-[10px]">chevron_right</MaterialIcon>
          <span className="font-semibold text-blue-600">{mode === 'edit' ? 'Cập nhật sách' : 'Thêm sách mới'}</span>
        </nav>

        <div className="flex flex-col gap-12 md:flex-row">
          <div className="md:w-1/3">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-slate-900">{mode === 'edit' ? 'Cập nhật sách' : 'Thêm Sách Mới'}</h2>
            <p className="text-sm leading-relaxed text-slate-500">Cập nhật trực tiếp dữ liệu sách trong hệ thống quản trị.</p>
            <div className="group mt-10">
              <label className="mb-4 block text-[0.7rem] font-bold uppercase tracking-[0.1em] text-slate-500">Ảnh bìa sách</label>
              <label className="flex aspect-[3/4] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 transition-all hover:border-blue-300 hover:bg-blue-50/40 active:scale-[0.98]">
                {form.image ? (
                  <img alt="Book Cover" className="h-full max-h-72 w-full rounded-lg object-cover" src={form.image} />
                ) : (
                  <>
                    <MaterialIcon className="text-4xl text-slate-400 transition-colors group-hover:text-blue-600">add_photo_alternate</MaterialIcon>
                    <div className="text-center"><p className="text-sm font-medium text-slate-900">{uploadLoading ? 'Đang tải ảnh...' : 'Tải lên ảnh bìa'}</p><p className="mt-1 text-xs text-slate-500">Hỗ trợ JPG, PNG</p></div>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-[0px_12px_40px_rgba(0,0,0,0.04)]">
              <form className="grid grid-cols-1 gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
                <div className="md:col-span-2"><label className="mb-2 block px-1 text-[0.75rem] font-semibold text-slate-500">Tên sách</label><input className="w-full rounded-lg border-none bg-slate-100 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Nhập tiêu đề sách..." type="text" required /></div>
                <div><label className="mb-2 block px-1 text-[0.75rem] font-semibold text-slate-500">Tác giả</label><input className="w-full rounded-lg border-none bg-slate-100 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20" value={form.author} onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))} placeholder="Tên tác giả..." type="text" required /></div>
                <div><label className="mb-2 block px-1 text-[0.75rem] font-semibold text-slate-500">Thể loại</label><input className="w-full rounded-lg border-none bg-slate-100 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Văn học, Kỹ năng..." type="text" /></div>
                <div><label className="mb-2 block px-1 text-[0.75rem] font-semibold text-slate-500">Giá bán (VNĐ)</label><div className="relative"><input className="w-full rounded-lg border-none bg-slate-100 px-4 py-3 pr-12 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="0" type="number" min="0" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">đ</span></div></div>
                <div><label className="mb-2 block px-1 text-[0.75rem] font-semibold text-slate-500">Số lượng tồn kho</label><input className="w-full rounded-lg border-none bg-slate-100 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} placeholder="0" type="number" min="0" /></div>
                <div><label className="mb-2 block px-1 text-[0.75rem] font-semibold text-slate-500">Điểm đánh giá</label><input className="w-full rounded-lg border-none bg-slate-100 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20" value={form.rating} onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))} placeholder="0" type="number" min="0" max="5" step="0.1" /></div>
                <div className="md:col-span-2"><label className="mb-2 block px-1 text-[0.75rem] font-semibold text-slate-500">URL ảnh</label><input className="w-full rounded-lg border-none bg-slate-100 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20" value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} placeholder="https://..." type="text" /></div>
                {error ? <div className="md:col-span-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
                <div className="mt-2 flex items-center justify-end gap-4 border-t border-slate-50 pt-6 md:col-span-2"><button className="px-6 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900" onClick={onCancel} type="button">Hủy bỏ</button><button className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-60" disabled={submitting} type="submit"><MaterialIcon className="text-sm">save</MaterialIcon>{submitting ? 'Đang lưu...' : 'Lưu thông tin'}</button></div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

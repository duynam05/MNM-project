import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BookCopy, Clock3, Sparkles } from 'lucide-react';

import BookCard from '../components/BookCard';
import { useHistory } from '../contexts/HistoryContext';
import { buildApiUrl, extractResultList } from '../config/api';

const HOME_BOOK_LIMIT = 12;
const ALL_CATEGORY = 'Tất cả';

const splitCategories = (value) =>
  String(value || '')
    .split(/\s*(?:,|;|\||\/|\s-\s)\s*/u)
    .map((item) => item.trim())
    .filter(Boolean);

const formatCompactNumber = (value) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(Number(value) || 0);

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value) || 0);

const Home = () => {
  const { viewedCategories } = useHistory();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);

  useEffect(() => {
    const controller = new AbortController();

    fetch(buildApiUrl('/books?page=0&size=16&sort=popular'), {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load home books');
        }

        return res.json();
      })
      .then((data) => {
        const bookList = extractResultList(data);
        setBooks(bookList.slice(0, HOME_BOOK_LIMIT));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setBooks([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set();

    books.forEach((book) => {
      splitCategories(book.category).forEach((category) => uniqueCategories.add(category));
    });

    return [ALL_CATEGORY, ...uniqueCategories].slice(0, 6);
  }, [books]);

  const normalizedViewedCategories = useMemo(
    () => viewedCategories.map((category) => category.toLowerCase()),
    [viewedCategories]
  );

  const filteredBooks = useMemo(() => {
    if (selectedCategory === ALL_CATEGORY) {
      return books;
    }

    return books.filter((book) => splitCategories(book.category).includes(selectedCategory));
  }, [books, selectedCategory]);

  const featuredBooks = useMemo(() => filteredBooks.slice(0, 4), [filteredBooks]);

  const secondaryBooks = useMemo(() => {
    const pool = filteredBooks.length > 4 ? filteredBooks : books;

    return pool
      .filter((book) => !featuredBooks.some((featuredBook) => featuredBook.id === book.id))
      .slice(0, 4);
  }, [books, featuredBooks, filteredBooks]);

  const recommendedBooks = useMemo(() => {
    const personalized = books
      .filter((book) =>
        splitCategories(book.category).some((category) =>
          normalizedViewedCategories.includes(category.toLowerCase())
        ) &&
        !featuredBooks.some((featuredBook) => featuredBook.id === book.id)
      )
      .slice(0, 4);

    if (personalized.length > 0) {
      return personalized;
    }

    return books
      .filter((book) => !featuredBooks.some((featuredBook) => featuredBook.id === book.id))
      .slice(0, 4);
  }, [books, featuredBooks, normalizedViewedCategories]);

  const highlightedCategoryCount = Math.max(categories.length - 1, 0);
  const averagePrice = useMemo(() => {
    if (!books.length) {
      return 0;
    }

    const totalPrice = books.reduce((sum, book) => sum + (Number(book.price) || 0), 0);
    return Math.round(totalPrice / books.length);
  }, [books]);

  return (
    <div className="space-y-12 pb-14">
      <section className="overflow-hidden rounded-b-[2rem] bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div className="relative">
            <div className="absolute -left-10 top-0 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute left-20 top-28 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="relative space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur">
                <Sparkles size={16} />
                Tuyển chọn sách nổi bật cho người đọc mới
              </span>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-5xl">
                  Trang chủ đã được làm lại để tìm sách nhanh hơn, gọn hơn.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  Thay vì chỉ hiển thị vài sản phẩm, trang chủ giờ có bộ lọc danh mục, nhóm gợi ý theo hành vi xem gần đây và đường dẫn nhanh tới khu vực mua hàng.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/books?sort=popular"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  Khám phá sách
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/account/orders"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Theo dõi đơn hàng
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Sách đang hiển thị</p>
              <p className="mt-3 text-3xl font-bold text-white">{formatCompactNumber(books.length)}</p>
              <p className="mt-2 text-sm text-slate-300">Danh sách ưu tiên từ dữ liệu phổ biến trên hệ thống.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Danh mục nổi bật</p>
              <p className="mt-3 text-3xl font-bold text-white">{formatCompactNumber(highlightedCategoryCount)}</p>
              <p className="mt-2 text-sm text-slate-300">Chọn nhanh một nhóm sách để thu hẹp nội dung trên trang chủ.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Mức giá trung bình</p>
              <p className="mt-3 text-3xl font-bold text-white">{formatCurrency(averagePrice)}</p>
              <p className="mt-2 text-sm text-slate-300">Dùng để người xem mới ước lượng nhanh ngân sách đọc.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Điểm vào nhanh</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Lọc trang chủ theo danh mục</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Chức năng này giúp trang chủ không bị quá tĩnh. Người dùng có thể đổi ngữ cảnh xem ngay tại trang đầu thay vì phải chuyển sang danh sách sách.
            </p>
          </div>

          <Link to="/books" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800">
            Xem toàn bộ thư viện
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const isActive = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                    : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedCategory === ALL_CATEGORY ? 'Nổi bật tuần này' : `Nổi bật trong ${selectedCategory}`}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Danh sách ưu tiên các đầu sách dễ tiếp cận, phù hợp để bắt đầu mua ngay từ trang chủ.
            </p>
          </div>
          <Link
            to={`/books${selectedCategory === ALL_CATEGORY ? '?sort=popular' : `?category=${encodeURIComponent(selectedCategory)}`}`}
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            Xem thêm
          </Link>
        </div>

        {loading ? <div className="rounded-3xl bg-white px-6 py-12 text-center text-slate-500 shadow-sm">Đang tải sản phẩm...</div> : null}

        {!loading && featuredBooks.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Chưa có dữ liệu sách để hiển thị ở danh mục này.
          </div>
        ) : null}

        {featuredBooks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : null}
      </section>

      {secondaryBooks.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-6 rounded-[2rem] bg-gradient-to-r from-amber-100 via-orange-50 to-white p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Chọn nhanh</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Những cuốn đáng xem tiếp theo</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Vùng này giúp trang chủ có thêm nhịp nội dung, tránh việc người dùng chỉ nhìn thấy đúng một hàng sản phẩm rồi rời đi.
                </p>
              </div>

              <Link
                to="/books?sort=rating"
                className="inline-flex items-center gap-2 self-start rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Xem sách rating cao
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {secondaryBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      ) : null}

      {recommendedBooks.length > 0 ? (
        <section className="mx-auto grid max-w-7xl gap-8 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-slate-900 p-7 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Gợi ý cá nhân</p>
            <h2 className="mt-3 text-3xl font-bold">Dựa trên lịch sử xem gần đây</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {viewedCategories.length > 0
                ? `Bạn đã xem các danh mục như ${viewedCategories.join(', ')}. Trang chủ giờ tận dụng dữ liệu đó để hiển thị gợi ý gần hơn với mối quan tâm hiện tại.`
                : 'Khi người dùng xem chi tiết sách, khu vực này sẽ dần cá nhân hóa lại theo danh mục đã mở gần đây.'}
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-1 text-cyan-300" size={18} />
                <div>
                  <p className="font-semibold">Ít bước hơn</p>
                  <p className="text-sm text-slate-300">Không cần rời trang chủ vẫn có thêm ngữ cảnh để chọn sách.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-1 text-cyan-300" size={18} />
                <div>
                  <p className="font-semibold">Nhanh hơn</p>
                  <p className="text-sm text-slate-300">Phù hợp khi người dùng quay lại và muốn tiếp tục hành trình mua hàng.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookCopy className="mt-1 text-cyan-300" size={18} />
                <div>
                  <p className="font-semibold">Nội dung bớt lặp</p>
                  <p className="text-sm text-slate-300">Tách riêng khối đề xuất để homepage có chiều sâu hơn bản cũ.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {recommendedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Home;

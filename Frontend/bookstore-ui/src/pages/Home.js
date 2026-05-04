import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { useHistory } from '../contexts/HistoryContext';
import { buildApiUrl, extractResultList } from '../config/api';

const HOME_BOOK_LIMIT = 12;

const Home = () => {
  const { viewedCategories } = useHistory();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(buildApiUrl('/books'))
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
        console.error(err);
        setBooks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const featuredBooks = useMemo(
    () => books.slice(0, 4),
    [books]
  );

  const recommendedBooks = useMemo(
    () => books
      .filter((book) =>
        viewedCategories.includes(book.category) &&
        !featuredBooks.some((featuredBook) => featuredBook.id === book.id)
      )
      .slice(0, 4),
    [books, featuredBooks, viewedCategories]
  );

  return (
    <div className="space-y-12 pb-10">
      <section className="rounded-b-3xl bg-blue-600 px-4 py-20 text-center text-white">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Thế giới sách trong tầm tay</h1>
        <p className="mb-8 text-xl opacity-90">Khám phá những tựa sách bán chạy nhất mọi thời đại.</p>
        <Link to="/books" className="rounded-full bg-white px-8 py-3 font-bold text-blue-600 transition hover:bg-gray-100">
          Mua ngay
        </Link>
      </section>

      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="border-l-4 border-blue-600 pl-3 text-2xl font-bold">Sách Nổi Bật</h2>
          <Link to="/books" className="text-sm font-medium text-blue-600 hover:underline">
            Xem tất cả
          </Link>
        </div>

        {loading && <div className="py-10 text-center text-gray-500">Đang tải sản phẩm...</div>}

        {!loading && featuredBooks.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Chưa có dữ liệu sách để hiển thị.
          </div>
        )}

        {featuredBooks.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {recommendedBooks.length > 0 && (
        <section className="container mx-auto rounded-xl bg-gray-50 px-4 py-8">
          <h2 className="mb-6 border-l-4 border-blue-600 pl-3 text-2xl font-bold">Gợi ý cho bạn</h2>
          <p className="mb-4 text-gray-500">Dựa trên những danh mục bạn đã xem gần đây.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {recommendedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
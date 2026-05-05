import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

import BookCard from '../components/BookCard';
import { buildApiUrl, extractResultList } from '../config/api';

const PAGE_SIZE = 12;

const splitCategories = (value) =>
  String(value || '')
    .split(/\s*(?:,|;|\||\/|\s-\s)\s*/u)
    .map((item) => item.trim())
    .filter(Boolean);

const BookList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
  const [page, setPage] = useState(Number(searchParams.get('page') || 0));
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
    setSortBy(searchParams.get('sort') || 'popular');
    setPage(Number(searchParams.get('page') || 0));
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (debouncedSearchTerm) {
      nextParams.set('q', debouncedSearchTerm);
    }

    if (selectedCategory !== 'All') {
      nextParams.set('category', selectedCategory);
    }

    if (sortBy !== 'popular') {
      nextParams.set('sort', sortBy);
    }

    if (page > 0) {
      nextParams.set('page', String(page));
    }

    const current = searchParams.toString();
    const next = nextParams.toString();

    if (current !== next) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedSearchTerm, page, searchParams, selectedCategory, setSearchParams, sortBy]);

  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    const currentCategory = searchParams.get('category') || 'All';
    const currentSort = searchParams.get('sort') || 'popular';

    if (
      debouncedSearchTerm !== currentQ ||
      selectedCategory !== currentCategory ||
      sortBy !== currentSort
    ) {
      setPage(0);
    }
  }, [debouncedSearchTerm, searchParams, selectedCategory, sortBy]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      size: String(PAGE_SIZE),
      sort: sortBy,
    });

    if (debouncedSearchTerm) {
      params.set('q', debouncedSearchTerm);
    }

    if (selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }

    setLoading(true);

    fetch(buildApiUrl(`/books?${params.toString()}`), { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setBooks(extractResultList(data));
        setTotalPages(Number(data?.result?.totalPages || 0));
        setTotalElements(Number(data?.result?.totalElements || 0));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setBooks([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedSearchTerm, page, selectedCategory, sortBy]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(buildApiUrl('/books?page=0&size=100&sort=title_asc'), { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const bookList = extractResultList(data);
        const categoryOptions = [
          'All',
          ...new Set(
            bookList.flatMap((book) => splitCategories(book.category)),
          ),
        ];
        setCategories(categoryOptions);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });

    return () => controller.abort();
  }, []);

  const hasBooks = books.length > 0;
  const shownCount = useMemo(
    () => (hasBooks ? page * PAGE_SIZE + books.length : 0),
    [books.length, hasBooks, page],
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 rounded bg-white p-4 shadow md:flex-row">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            className="w-full rounded border py-2 pl-10 pr-4"
            placeholder="Tìm sách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(0);
          }}
        >
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(0);
          }}
        >
          <option value="popular">Phổ biến</option>
          <option value="rating">Rating</option>
          <option value="price_asc">Giá tăng</option>
          <option value="price_desc">Giá giảm</option>
          <option value="title_asc">Tên A-Z</option>
          <option value="title_desc">Tên Z-A</option>
        </select>
      </div>

      {loading && <div className="py-10 text-center text-gray-500">Đang tải sách...</div>}

      {!loading && !hasBooks && (
        <div className="py-10 text-center text-gray-500">Không tìm thấy sách phù hợp.</div>
      )}

      {hasBooks && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {!loading && totalPages > 0 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-sm text-gray-600">
            Hiển thị {shownCount} / {totalElements} sản phẩm
          </div>

          <div className="flex items-center gap-3">
            <button
              className="rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            >
              Trước
            </button>

            <span className="text-sm text-gray-600">
              Trang {page + 1} / {Math.max(totalPages, 1)}
            </span>

            <button
              className="rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList;

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { Search } from 'lucide-react';
import { buildApiUrl, extractResultList } from '../config/api';

const PAGE_SIZE = 12;

const BookList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
  const [page, setPage] = useState(Number(searchParams.get('page') || 0));
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  const filteredBooks = useMemo(() => {
    let result = books;
  
    if (selectedCategory !== 'All') {
      result = result.filter(b => b.category === selectedCategory);
    }
  
    if (debouncedSearchTerm) {
      const lower = debouncedSearchTerm.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(lower) ||
        b.author.toLowerCase().includes(lower)
      );
    }
  
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        default: return b.rating - a.rating;
      }
    });
  
    return result;
  }, [books, debouncedSearchTerm, selectedCategory, sortBy]);


  useEffect(() => {
    setLoading(true);
  
    fetch(buildApiUrl('/books'))
      .then(res => res.json())
      .then(data => {
        const bookList = extractResultList(data);

        setBooks(bookList);

        const categoryOptions = [
          'All',
          ...new Set(bookList.map(b => b.category).filter(Boolean))
        ];
        setCategories(categoryOptions);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredBooks.length / PAGE_SIZE));
    setTotalElements(filteredBooks.length);
  }, [filteredBooks]);

  const paginatedBooks = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredBooks.slice(start, start + PAGE_SIZE);
  }, [filteredBooks, page]);

  useEffect(() => {
    const maxPage = Math.max(Math.ceil(filteredBooks.length / PAGE_SIZE) - 1, 0);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filteredBooks, page]);

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
    setSortBy(searchParams.get('sort') || 'popular');
    setPage(Number(searchParams.get('page') || 0));
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchParamsString = searchParams.toString();

  useEffect(() => {
    const currentParams = new URLSearchParams(searchParamsString);
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

    const currentQ = currentParams.get('q') || '';
    const currentCategory = currentParams.get('category') || 'All';
    const currentSort = currentParams.get('sort') || 'popular';

    if (
      debouncedSearchTerm !== currentQ ||
      selectedCategory !== currentCategory ||
      sortBy !== currentSort
    ) {
      nextParams.set('page', '0'); // reset khi filter đổi
    } else if (page > 0) {
      nextParams.set('page', page.toString());
    }

    // const current = searchParams.toString();
    const next = nextParams.toString();
    const current = searchParamsString;

    if (current !== next) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedSearchTerm, page, searchParamsString, selectedCategory, sortBy, setSearchParams]);

  const hasBooks = filteredBooks.length > 0;

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
          {categories.map((c) => <option key={c}>{c}</option>)}
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
        </select>
      </div>

      {loading && <div className="py-10 text-center text-gray-500">Đang tải sách...</div>}

      {!loading && !hasBooks && (
        <div className="py-10 text-center text-gray-500">Không tìm thấy sách phù hợp.</div>
      )}

      {hasBooks && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {paginatedBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {!loading && totalPages > 0 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-sm text-gray-600">
            Hiển thị {page * PAGE_SIZE + paginatedBooks.length} / {totalElements} sản phẩm
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

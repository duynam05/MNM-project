import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';

import StarRating from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from '../contexts/HistoryContext';
import { buildApiUrl, resolveImageUrl } from '../config/api';

function depthTone(depth) {
  if (depth <= 0) return 'border-blue-100 bg-blue-50/50';
  if (depth === 1) return 'border-sky-100 bg-sky-50/50';
  if (depth === 2) return 'border-emerald-100 bg-emerald-50/50';
  return 'border-slate-200 bg-slate-50';
}

function ReplyItem({
  reply,
  reviewId,
  depth = 0,
  currentUserId,
  editingReplyId,
  editReplyContent,
  replyingTarget,
  replyDraft,
  busyReviewId,
  onStartEditReply,
  onCancelEditReply,
  onEditReplyChange,
  onSaveEditReply,
  onDeleteReply,
  onStartReply,
  onCancelReply,
  onReplyDraftChange,
  onSaveReply,
  user,
}) {
  const isOwner = currentUserId && reply.userId === currentUserId;
  const isEditing = editingReplyId === reply.id;
  const isReplying = replyingTarget?.type === 'reply' && replyingTarget?.parentReplyId === reply.id;
  const isBusy = busyReviewId === reply.id;
  const children = Array.isArray(reply.replies) ? reply.replies : [];
  const leftOffset = Math.min(depth, 3) * 20;
  const [childrenExpanded, setChildrenExpanded] = useState(false);

  return (
    <div className="relative mt-3" style={{ marginLeft: `${leftOffset}px` }}>
      {depth > 0 ? <div className="absolute -left-3 top-0 h-full w-px bg-slate-200" /> : null}
      <div className={`rounded-xl border p-4 shadow-sm ${depthTone(depth)}`}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Cấp {depth + 1}
          </span>
          <span className="text-sm font-semibold text-slate-900">{reply.userName}</span>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={editReplyContent}
              onChange={(event) => onEditReplyChange(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isBusy}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                onClick={() => onSaveEditReply(reviewId, reply.id)}
              >
                Lưu sửa
              </button>
              <button
                type="button"
                disabled={isBusy}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                onClick={onCancelEditReply}
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-700">{reply.content}</p>
        )}

        {isReplying ? (
          <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <textarea
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Nhập phản hồi của bạn..."
              value={replyDraft}
              onChange={(event) => onReplyDraftChange(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isBusy}
                className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60"
                onClick={() => onSaveReply(reviewId, reply.id)}
              >
                Gửi phản hồi
              </button>
              <button
                type="button"
                disabled={isBusy}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                onClick={onCancelReply}
              >
                Hủy
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {isOwner ? (
            <>
              <button
                type="button"
                disabled={isBusy}
                className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
                onClick={() => onStartEditReply(reply)}
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                disabled={isBusy}
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                onClick={() => onDeleteReply(reviewId, reply.id)}
              >
                Xóa
              </button>
            </>
          ) : null}
          {user ? (
            <button
              type="button"
              disabled={isBusy}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              onClick={() => onStartReply('reply', reviewId, reply.id)}
            >
              Phản hồi
            </button>
          ) : null}
        </div>

        {children.length > 0 ? (
          <button
            type="button"
            className="mt-3 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
            onClick={() => setChildrenExpanded((current) => !current)}
          >
            {childrenExpanded ? `Thu gọn ${children.length} phản hồi` : `Xem ${children.length} phản hồi`}
          </button>
        ) : null}
      </div>

      {children.length > 0 && childrenExpanded ? (
        <div className="mt-3">
          {children.map((child) => (
            <ReplyItem
              key={child.id}
              reply={child}
              reviewId={reviewId}
              depth={depth + 1}
              currentUserId={currentUserId}
              editingReplyId={editingReplyId}
              editReplyContent={editReplyContent}
              replyingTarget={replyingTarget}
              replyDraft={replyDraft}
              busyReviewId={busyReviewId}
              onStartEditReply={onStartEditReply}
              onCancelEditReply={onCancelEditReply}
              onEditReplyChange={onEditReplyChange}
              onSaveEditReply={onSaveEditReply}
              onDeleteReply={onDeleteReply}
              onStartReply={onStartReply}
              onCancelReply={onCancelReply}
              onReplyDraftChange={onReplyDraftChange}
              onSaveReply={onSaveReply}
              user={user}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToHistory } = useHistory();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editingReplyId, setEditingReplyId] = useState('');
  const [editReplyContent, setEditReplyContent] = useState('');
  const [replyingTarget, setReplyingTarget] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [busyReviewId, setBusyReviewId] = useState('');
  const [expandedThreads, setExpandedThreads] = useState({});

  const stock = book?.stock ?? 0;
  const isOutOfStock = stock === 0;
  const currentUserId = user?.id || '';

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(buildApiUrl(`/books/${id}`), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          if (res.status === 401) {
            setError('Bạn cần đăng nhập để xem sách');
            return;
          }
          throw new Error(data?.message || 'Không thể tải sách');
        }
        const foundBook = data?.result || data;
        setBook(foundBook);
        addToHistory(foundBook?.category);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    fetchBook();
  }, [addToHistory, id]);

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch(buildApiUrl(`/books/${id}/reviews`));
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || 'Không thể tải đánh giá');
        }
        setReviews(data?.result || data || []);
      } catch (err) {
        console.error(err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  const displayedAverageRating = useMemo(() => {
    if (reviews.length > 0) {
      return reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
    }
    return Number(book?.rating || 0);
  }, [book?.rating, reviews]);

  const updateReviewInState = (updatedReview) => {
    setReviews((current) => current.map((review) => (review.id === updatedReview.id ? updatedReview : review)));
  };

  const resetInlineStates = () => {
    setEditingReviewId('');
    setEditRating(0);
    setEditComment('');
    setEditingReplyId('');
    setEditReplyContent('');
    setReplyingTarget(null);
    setReplyDraft('');
  };

  const getTokenOrRedirect = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Phiên đăng nhập đã hết hạn');
      navigate('/login');
      return '';
    }
    return token;
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    if (isOutOfStock) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl('/cart'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId: book.id, quantity: 1 }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        let message = 'Có lỗi xảy ra';
        switch (data?.code) {
          case 1011:
            message = 'Số lượng vượt quá tồn kho';
            break;
          case 1006:
            message = 'Phiên đăng nhập đã hết hạn';
            navigate('/login');
            break;
          default:
            message = data?.message || message;
        }
        toast.error(message);
        return;
      }
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (err) {
      console.error(err);
      toast.error('Không thể kết nối server');
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để viết nhận xét');
      navigate('/login');
      return;
    }
    if (userRating === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      toast.error('Vui lòng nhập nội dung nhận xét');
      return;
    }
    const token = getTokenOrRedirect();
    if (!token) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(buildApiUrl(`/books/${id}/reviews`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: userRating, content: trimmedComment }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Không thể gửi đánh giá');
      const createdReview = data?.result || data;
      if (createdReview) setReviews((current) => [createdReview, ...current]);
      setComment('');
      setUserRating(0);
      toast.success('Đánh giá của bạn đã hiển thị ngay');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleStartEditReview = (review) => {
    resetInlineStates();
    setEditingReviewId(review.id);
    setEditRating(Number(review.rating || 0));
    setEditComment(review.content || '');
  };

  const handleSaveEditReview = async (reviewId) => {
    if (editRating === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    const trimmedComment = editComment.trim();
    if (!trimmedComment) {
      toast.error('Vui lòng nhập nội dung nhận xét');
      return;
    }
    const token = getTokenOrRedirect();
    if (!token) return;
    setBusyReviewId(reviewId);
    try {
      const res = await fetch(buildApiUrl(`/books/${id}/reviews/${reviewId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: editRating, content: trimmedComment }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Không thể cập nhật đánh giá');
      updateReviewInState(data?.result || data);
      resetInlineStates();
      toast.success('Đã cập nhật đánh giá');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Không thể cập nhật đánh giá');
    } finally {
      setBusyReviewId('');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    const token = getTokenOrRedirect();
    if (!token) return;
    setBusyReviewId(reviewId);
    try {
      const res = await fetch(buildApiUrl(`/books/${id}/reviews/${reviewId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Không thể xóa đánh giá');
      setReviews((current) => current.filter((review) => review.id !== reviewId));
      resetInlineStates();
      toast.success('Đã xóa đánh giá');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Không thể xóa đánh giá');
    } finally {
      setBusyReviewId('');
    }
  };

  const handleStartEditReply = (reply) => {
    resetInlineStates();
    setEditingReplyId(reply.id);
    setEditReplyContent(reply.content || '');
  };

  const handleSaveEditReply = async (reviewId, replyId) => {
    const trimmedReply = editReplyContent.trim();
    if (!trimmedReply) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }
    const token = getTokenOrRedirect();
    if (!token) return;
    setBusyReviewId(replyId);
    try {
      const res = await fetch(buildApiUrl(`/books/${id}/reviews/${reviewId}/replies/${replyId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply: trimmedReply }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Không thể cập nhật phản hồi');
      updateReviewInState(data?.result || data);
      resetInlineStates();
      toast.success('Đã cập nhật phản hồi');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Không thể cập nhật phản hồi');
    } finally {
      setBusyReviewId('');
    }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phản hồi này?')) return;
    const token = getTokenOrRedirect();
    if (!token) return;
    setBusyReviewId(replyId);
    try {
      const res = await fetch(buildApiUrl(`/books/${id}/reviews/${reviewId}/replies/${replyId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Không thể xóa phản hồi');
      updateReviewInState(data?.result || data);
      resetInlineStates();
      toast.success('Đã xóa phản hồi');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Không thể xóa phản hồi');
    } finally {
      setBusyReviewId('');
    }
  };

  const handleStartReply = (type, reviewId, parentReplyId = null) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để phản hồi');
      navigate('/login');
      return;
    }
    setEditingReviewId('');
    setEditingReplyId('');
    setReplyingTarget({ type, reviewId, parentReplyId });
    setReplyDraft('');
  };

  const handleSaveReply = async (reviewId, parentReplyId = null) => {
    const trimmedReply = replyDraft.trim();
    if (!trimmedReply) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }
    const token = getTokenOrRedirect();
    if (!token) return;
    setBusyReviewId(parentReplyId || reviewId);
    try {
      const res = await fetch(buildApiUrl(`/books/${id}/reviews/${reviewId}/reply`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply: trimmedReply, parentReplyId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Không thể lưu phản hồi');
      updateReviewInState(data?.result || data);
      setReplyingTarget(null);
      setReplyDraft('');
      toast.success('Đã lưu phản hồi');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Không thể lưu phản hồi');
    } finally {
      setBusyReviewId('');
    }
  };

  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!book) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex justify-center rounded-lg bg-gray-100 p-8">
          <img
            src={resolveImageUrl(book.image)}
            alt={book.title}
            className="max-w-xs rounded shadow-2xl"
            onError={(event) => {
              event.currentTarget.src = '/placeholder-book.svg';
            }}
          />
        </div>
        <div>
          <h1 className="mb-2 text-3xl font-bold">{book.title}</h1>
          <p className="mb-4 text-xl text-gray-600">Tác giả: {book.author}</p>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
            </span>
            <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">{book.category}</span>
          </div>
          <div className="mb-6 flex items-center gap-2">
            <StarRating rating={displayedAverageRating} />
            <span className="text-gray-500">({reviews.length} đánh giá)</span>
          </div>
          <p className="mb-4 text-sm text-gray-500">{isOutOfStock ? 'Hết hàng' : `Còn ${stock} sản phẩm`}</p>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart /> Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="mb-6 text-2xl font-bold">Đánh giá và Nhận xét</h2>
        <div className="mb-8 rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 font-semibold">Viết nhận xét của bạn</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="mb-2 block text-sm">Đánh giá của bạn:</label>
              <StarRating rating={userRating} onRate={setUserRating} editable />
            </div>
            <textarea
              className="mb-4 w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              required
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="rounded bg-gray-800 px-6 py-2 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submittingReview ? 'Đang gửi...' : 'Gửi nhận xét'}
            </button>
          </form>
          <p className="mt-3 text-sm text-gray-500">
            Bạn có thể đánh giá nhiều lần và các đánh giá mới sẽ hiển thị ngay.
          </p>
        </div>

        <div className="space-y-6">
          {reviewsLoading && <p className="text-gray-500">Đang tải đánh giá...</p>}
          {!reviewsLoading &&
            reviews.map((review) => {
              const isOwner = currentUserId && review.reviewerId === currentUserId;
              const isEditing = editingReviewId === review.id;
              const isReplyingReview = replyingTarget?.type === 'review' && replyingTarget?.reviewId === review.id;
              const isBusy = busyReviewId === review.id;
              const replies = Array.isArray(review.replies) ? review.replies : [];
              const isThreadExpanded = Boolean(expandedThreads[review.id]);

              return (
                <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="font-bold">{review.reviewer}</span>
                    <StarRating rating={isEditing ? editRating : review.rating} onRate={isEditing ? setEditRating : undefined} editable={isEditing} />
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        value={editComment}
                        onChange={(event) => setEditComment(event.target.value)}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button type="button" disabled={isBusy} className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60" onClick={() => handleSaveEditReview(review.id)}>Lưu sửa</button>
                        <button type="button" disabled={isBusy} className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60" onClick={resetInlineStates}>Hủy</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">{review.content}</p>
                  )}

                  {review.adminReply ? (
                    <div className="mt-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-slate-700">
                      <span className="mb-1 block font-semibold text-blue-700">Phản hồi từ admin</span>
                      {review.adminReply}
                    </div>
                  ) : null}

                  {isReplyingReview ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <textarea
                        className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Nhập phản hồi của bạn..."
                        value={replyDraft}
                        onChange={(event) => setReplyDraft(event.target.value)}
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" disabled={isBusy} className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60" onClick={() => handleSaveReply(review.id, null)}>Gửi phản hồi</button>
                        <button type="button" disabled={isBusy} className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60" onClick={() => setReplyingTarget(null)}>Hủy</button>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {isOwner ? (
                      <>
                        <button type="button" disabled={isBusy} className="rounded border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:opacity-60" onClick={() => handleStartEditReview(review)}>Chỉnh sửa</button>
                        <button type="button" disabled={isBusy} className="rounded border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60" onClick={() => handleDeleteReview(review.id)}>Xóa</button>
                      </>
                    ) : null}
                    {user ? (
                      <button type="button" disabled={isBusy} className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60" onClick={() => handleStartReply('review', review.id, null)}>Phản hồi</button>
                    ) : null}
                  </div>

                  {replies.length > 0 ? (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.96),rgba(241,245,249,0.92))] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Thảo luận dưới đánh giá</p>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
                          {replies.length}+ phản hồi
                        </span>
                      </div>
                      <button
                        type="button"
                        className="mt-3 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
                        onClick={() => setExpandedThreads((current) => ({ ...current, [review.id]: !current[review.id] }))}
                      >
                        {isThreadExpanded ? `Thu gọn toàn bộ thảo luận` : `Xem toàn bộ thảo luận`}
                      </button>
                      {isThreadExpanded ? (
                        <div className="mt-3">
                          {replies.map((reply) => (
                            <ReplyItem
                              key={reply.id}
                              reply={reply}
                              reviewId={review.id}
                              depth={0}
                              currentUserId={currentUserId}
                              editingReplyId={editingReplyId}
                              editReplyContent={editReplyContent}
                              replyingTarget={replyingTarget}
                              replyDraft={replyDraft}
                              busyReviewId={busyReviewId}
                              onStartEditReply={handleStartEditReply}
                              onCancelEditReply={resetInlineStates}
                              onEditReplyChange={setEditReplyContent}
                              onSaveEditReply={handleSaveEditReply}
                              onDeleteReply={handleDeleteReply}
                              onStartReply={handleStartReply}
                              onCancelReply={() => setReplyingTarget(null)}
                              onReplyDraftChange={setReplyDraft}
                              onSaveReply={handleSaveReply}
                              user={user}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          {!reviewsLoading && reviews.length === 0 && <p className="text-gray-500">Chưa có nhận xét nào.</p>}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;

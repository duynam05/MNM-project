import { useEffect, useMemo, useRef, useState } from 'react';

import MaterialIcon from '../components/MaterialIcon';
import { apiRequest } from '../lib/apiClient';

const PAGE_SIZE = 10;

function ReviewStars({ rating }) {
  return (
    <div className="mb-2 flex items-center gap-1 text-yellow-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <MaterialIcon key={index} className="text-lg" fill={index < Math.round(rating || 0)}>
          star
        </MaterialIcon>
      ))}
    </div>
  );
}

function formatRelativeTime(value) {
  if (!value) return '';

  const createdAt = new Date(value);
  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;

  return createdAt.toLocaleDateString('vi-VN');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function StarTabLabel({ count }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span>{count}</span>
      <MaterialIcon className="text-[14px] text-yellow-500" fill>
        star
      </MaterialIcon>
    </span>
  );
}

function buildTags(review) {
  const tags = [];

  if (review.verifiedPurchase) {
    tags.push({ label: 'Đã mua hàng', className: 'bg-slate-100 text-slate-500' });
  }

  if (review.status === 'APPROVED') {
    tags.push({ label: 'Đang hiển thị', className: 'bg-green-50 text-green-700', icon: 'check_circle' });
  } else if (review.status === 'REJECTED') {
    tags.push({ label: 'Đã từ chối', className: 'bg-slate-200 text-slate-700', icon: 'block' });
  } else if (review.status === 'PENDING') {
    tags.push({ label: 'Bản cũ chờ duyệt', className: 'bg-amber-100 text-amber-800', icon: 'schedule' });
  }

  if ((review.rating || 0) <= 3) {
    tags.push({ label: 'Cần hỗ trợ', className: 'bg-slate-100 text-red-500' });
  }

  if (review.adminReply) {
    tags.push({ label: 'Đã phản hồi', className: 'bg-blue-50 text-blue-600', icon: 'reply' });
  }

  if ((review.replies || []).length > 0) {
    tags.push({
      label: `${flattenReplies(review.replies).length} thảo luận`,
      className: 'bg-indigo-50 text-indigo-700',
      icon: 'forum',
    });
  }

  return tags;
}

function flattenReplies(replies, depth = 0) {
  return (replies || []).flatMap((reply) => [
    { ...reply, depth },
    ...flattenReplies(reply.replies, depth + 1),
  ]);
}

function depthTone(depth) {
  if (depth <= 0) return 'border-indigo-200 bg-indigo-50/40';
  if (depth === 1) return 'border-sky-200 bg-sky-50/40';
  if (depth === 2) return 'border-emerald-200 bg-emerald-50/40';
  return 'border-slate-200 bg-slate-50';
}

function DiscussionReply({
  reply,
  reviewId,
  depth = 0,
  replyTarget,
  replyDraft,
  busyTargetId,
  onOpenReply,
  onCancelReply,
  onReplyDraftChange,
  onSubmitReply,
  onDeleteReply,
}) {
  const isReplying = replyTarget?.reviewId === reviewId && replyTarget?.parentReplyId === reply.id;
  const isBusy = busyTargetId === reply.id;
  const children = reply.replies || [];
  const leftOffset = Math.min(depth, 3) * 22;
  const [childrenExpanded, setChildrenExpanded] = useState(false);

  return (
    <div className="relative mt-3" style={{ marginLeft: `${leftOffset}px` }}>
      {depth > 0 ? <div className="absolute -left-4 top-0 h-full w-px bg-slate-200" /> : null}
      <div className={`rounded-xl border px-4 py-4 shadow-sm ${depthTone(depth)}`}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Cấp {depth + 1}
          </span>
          <span className="text-sm font-semibold text-slate-900">{reply.userName}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="text-xs text-slate-500">{formatRelativeTime(reply.createdAt)}</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-700">{reply.content}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
            type="button"
            onClick={() => onOpenReply(reviewId, reply.id)}
          >
            Phản hồi
          </button>
          <button
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            type="button"
            disabled={isBusy}
            onClick={() => onDeleteReply(reviewId, reply.id)}
          >
            Xóa
          </button>
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

        {isReplying ? (
          <div className="mt-4 rounded-xl border border-blue-100 bg-white p-4">
            <div className="mb-2 flex items-center gap-2">
              <MaterialIcon className="text-sm text-blue-600">subdirectory_arrow_right</MaterialIcon>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Phản hồi vào mục này</p>
            </div>
            <textarea
              className="min-h-[88px] w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              placeholder="Nhập phản hồi cho bình luận này..."
              value={replyDraft}
              onChange={(event) => onReplyDraftChange(event.target.value)}
            />
            <div className="mt-3 flex justify-end gap-3">
              <button className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200" type="button" onClick={onCancelReply}>
                Hủy
              </button>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={busyTargetId === reply.id || !replyDraft.trim()}
                onClick={() => onSubmitReply(reviewId, reply.id)}
              >
                {busyTargetId === reply.id ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {children.length > 0 && childrenExpanded ? (
        <div className="mt-3">
          {children.map((child) => (
            <DiscussionReply
              key={child.id}
              reply={child}
              reviewId={reviewId}
              depth={depth + 1}
              replyTarget={replyTarget}
              replyDraft={replyDraft}
              busyTargetId={busyTargetId}
              onOpenReply={onOpenReply}
              onCancelReply={onCancelReply}
              onReplyDraftChange={onReplyDraftChange}
              onSubmitReply={onSubmitReply}
              onDeleteReply={onDeleteReply}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DiscussionThread({
  review,
  replyTarget,
  replyDraft,
  busyTargetId,
  onOpenReply,
  onCancelReply,
  onReplyDraftChange,
  onSubmitReply,
  onDeleteReply,
}) {
  const replies = review.replies || [];
  if (replies.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.96),rgba(241,245,249,0.92))] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MaterialIcon className="text-sm text-indigo-600">forum</MaterialIcon>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Thảo luận dưới đánh giá</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
          {flattenReplies(replies).length} phản hồi
        </span>
      </div>

      <div className="space-y-3">
        {replies.map((reply) => (
          <DiscussionReply
            key={reply.id}
            reply={reply}
            reviewId={review.id}
            depth={0}
            replyTarget={replyTarget}
            replyDraft={replyDraft}
            busyTargetId={busyTargetId}
            onOpenReply={onOpenReply}
            onCancelReply={onCancelReply}
            onReplyDraftChange={onReplyDraftChange}
            onSubmitReply={onSubmitReply}
            onDeleteReply={onDeleteReply}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  replyOpen,
  replyDraft,
  submitting,
  replyTarget,
  busyTargetId,
  onReject,
  onOpenReply,
  onCloseReply,
  onReplyDraftChange,
  onSubmitReply,
  onOpenDiscussionReply,
  onCloseDiscussionReply,
  onSubmitDiscussionReply,
  onDeleteDiscussionReply,
  discussionComposerRef,
}) {
  const tags = buildTags(review);
  const timeLabel = formatRelativeTime(review.createdAt);
  const isReplyingToReviewDiscussion = replyTarget?.reviewId === review.id && replyTarget?.parentReplyId == null;
  const [threadExpanded, setThreadExpanded] = useState(false);

  if (replyOpen) {
    return (
      <div className="rounded-lg border border-blue-500/20 bg-white p-8 shadow-sm ring-1 ring-blue-500/5">
        <div className="mb-8 grid grid-cols-12 gap-8">
          <div className="col-span-3">
            <div className="mb-4 flex gap-4">
              <img alt={review.title} className="h-28 w-20 rounded object-cover shadow-sm" src={review.image} />
              <div className="flex flex-col justify-center">
                <h4 className="mb-1 text-base font-bold leading-tight text-slate-900">{review.title}</h4>
                <p className="text-xs text-slate-500">{review.author}</p>
                <span className="mt-2 self-start rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                  {review.category}
                </span>
              </div>
            </div>
            <ReviewStars rating={review.rating} />
          </div>
          <div className="col-span-7 border-l border-slate-100 pl-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-sm font-bold text-slate-900">{review.reviewer}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-500">{timeLabel}</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-900">{review.content}</p>
            {(review.replies || []).length > 0 ? (
              <>
                <button
                  type="button"
                  className="mt-4 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
                  onClick={() => setThreadExpanded((current) => !current)}
                >
                  {threadExpanded ? 'Thu gọn toàn bộ thảo luận' : 'Xem toàn bộ thảo luận'}
                </button>
                {threadExpanded ? (
                  <DiscussionThread
                    review={review}
                    replyTarget={replyTarget}
                    replyDraft={replyDraft}
                    busyTargetId={busyTargetId}
                    onOpenReply={onOpenDiscussionReply}
                    onCancelReply={onCloseDiscussionReply}
                    onReplyDraftChange={onReplyDraftChange}
                    onSubmitReply={onSubmitDiscussionReply}
                    onDeleteReply={onDeleteDiscussionReply}
                  />
                ) : null}
              </>
            ) : null}
          </div>
          <div className="col-span-2 flex justify-end">
            <button className="p-2 text-slate-500 transition-colors hover:text-blue-600" type="button" onClick={onCloseReply}>
              <MaterialIcon>close</MaterialIcon>
            </button>
          </div>
        </div>
        <div className="ml-12 rounded-lg border border-slate-100 bg-slate-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
              <MaterialIcon className="text-sm" fill>
                shield_person
              </MaterialIcon>
            </div>
            <span className="text-xs font-bold uppercase tracking-tight text-slate-900">Phản hồi từ admin</span>
          </div>
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-slate-200 bg-white p-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            placeholder="Nhập nội dung phản hồi của bạn..."
            value={replyDraft}
            onChange={(event) => onReplyDraftChange(event.target.value)}
          />
          <div className="mt-4 flex justify-end gap-3">
            <button className="rounded-lg px-6 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200" type="button" onClick={onCloseReply}>
              Hủy bỏ
            </button>
            <button
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={submitting || !replyDraft.trim()}
              onClick={onSubmitReply}
            >
              {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative grid grid-cols-12 items-start gap-8 overflow-hidden rounded-lg border border-slate-50 bg-white p-8 shadow-sm">
      {review.status === 'PENDING' ? <div className="absolute bottom-0 left-0 top-0 w-1 bg-amber-400" /> : null}
      <div className="col-span-3">
        <div className="mb-4 flex gap-4">
          <img
            alt={review.title}
            className={`h-28 w-20 rounded object-cover shadow-sm ${review.status === 'PENDING' ? 'opacity-80' : ''}`}
            src={review.image}
          />
          <div className="flex flex-col justify-center">
            <h4 className="mb-1 text-base font-bold leading-tight text-slate-900">{review.title}</h4>
            <p className="text-xs text-slate-500">{review.author}</p>
            <span
              className={`mt-2 self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                review.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-600'
              }`}
            >
              {review.category}
            </span>
          </div>
        </div>
        <ReviewStars rating={review.rating} />
      </div>
      <div className="col-span-7 border-l border-slate-100 pl-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-sm font-bold text-slate-900">{review.reviewer}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="text-xs text-slate-500">{timeLabel}</span>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-slate-900">{review.content}</p>

        {review.adminReply ? (
          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-blue-700">Phản hồi hiện tại</p>
            <p className="text-sm leading-relaxed text-slate-900">{review.adminReply}</p>
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            type="button"
            onClick={onOpenReply}
          >
            {review.adminReply ? 'Sửa phản hồi' : 'Phản hồi'}
          </button>
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={() => onOpenDiscussionReply(review.id, null)}
          >
            Trả lời luồng
          </button>
          <button
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            type="button"
            onClick={onReject}
          >
            {review.status === 'REJECTED' ? 'Mở lại' : 'Xóa'}
          </button>
        </div>

        {(review.replies || []).length > 0 ? (
          <>
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 transition hover:text-slate-800"
              onClick={() => setThreadExpanded((current) => !current)}
            >
              {threadExpanded ? 'Thu gọn toàn bộ thảo luận' : 'Xem toàn bộ thảo luận'}
            </button>
            {threadExpanded ? (
              <DiscussionThread
                review={review}
                replyTarget={replyTarget}
                replyDraft={replyDraft}
                busyTargetId={busyTargetId}
                onOpenReply={onOpenDiscussionReply}
                onCancelReply={onCloseDiscussionReply}
                onReplyDraftChange={onReplyDraftChange}
                onSubmitReply={onSubmitDiscussionReply}
                onDeleteReply={onDeleteDiscussionReply}
              />
            ) : null}
          </>
        ) : null}

        {isReplyingToReviewDiscussion ? (
          <div ref={discussionComposerRef} className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="mb-3 flex items-center gap-2">
              <MaterialIcon className="text-sm text-indigo-600">reply</MaterialIcon>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Phản hồi vào thảo luận</p>
            </div>
            <textarea
              className="min-h-[88px] w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              placeholder="Nhập phản hồi của admin vào luồng thảo luận..."
              value={replyDraft}
              onChange={(event) => onReplyDraftChange(event.target.value)}
            />
            <div className="mt-3 flex justify-end gap-3">
              <button className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200" type="button" onClick={onCloseDiscussionReply}>
                Hủy
              </button>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={busyTargetId === review.id || !replyDraft.trim()}
                onClick={() => onSubmitDiscussionReply(review.id, null)}
              >
                {busyTargetId === review.id ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex gap-3">
          {tags.map((tag) => (
            <span key={tag.label} className={`flex items-center gap-1 rounded px-3 py-1 text-[0.65rem] font-bold uppercase ${tag.className}`}>
              {tag.icon ? <MaterialIcon className="text-[12px]">{tag.icon}</MaterialIcon> : null}
              {tag.label}
            </span>
          ))}
        </div>
      </div>
      <div className="col-span-2" />
    </div>
  );
}

function ReviewsPage({ token, searchValue }) {
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    pendingReviews: 0,
    responseRate: 0,
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [replyOpenId, setReplyOpenId] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [busyTargetId, setBusyTargetId] = useState('');
  const [discussionReplyTarget, setDiscussionReplyTarget] = useState(null);
  const discussionComposerRefs = useRef({});

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [reviewList, summaryData] = await Promise.all([
          apiRequest('/admin/reviews', { token }),
          apiRequest('/admin/reviews/summary', { token }),
        ]);

        if (!active) return;
        setReviews(reviewList);
        setSummary(summaryData);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu đánh giá');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [token]);

  const rejectedReviewsCount = useMemo(
    () => reviews.filter((review) => review.status === 'REJECTED').length,
    [reviews],
  );

  const filteredReviews = useMemo(() => {
    const normalizedSearch = normalizeText(searchValue);

    return reviews.filter((review) => {
      const matchesTab =
        activeTab === 'ALL' || Number(review.rating || 0) === Number(activeTab);

      const discussionText = flattenReplies(review.replies)
        .map((reply) => `${reply.userName} ${reply.content}`)
        .join(' ');

      const matchesSearch =
        !normalizedSearch ||
        [
          review.title,
          review.author,
          review.category,
          review.reviewer,
          review.content,
          review.status,
          review.adminReply,
          discussionText,
        ].some((value) => normalizeText(value).includes(normalizedSearch));

      return matchesTab && matchesSearch;
    });
  }, [activeTab, reviews, searchValue]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchValue]);

  const totalPages = Math.max(Math.ceil(filteredReviews.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const paginatedReviews = filteredReviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const summaryCards = [
    {
      label: 'Trung bình sao',
      content: (
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-slate-900">{summary.averageRating.toFixed(1)}</span>
          <div className="flex text-yellow-500">
            {Array.from({ length: 5 }).map((_, index) => (
              <MaterialIcon key={index} className="text-sm" fill={index < Math.round(summary.averageRating)}>
                star
              </MaterialIcon>
            ))}
          </div>
        </div>
      ),
    },
    { label: 'Tổng đánh giá', value: summary.totalReviews.toLocaleString('vi-VN') },
    {
      label: 'Đã từ chối',
      value: rejectedReviewsCount.toLocaleString('vi-VN'),
      accent: 'border-l-4 border-slate-400',
      valueClassName: 'text-slate-600',
    },
    {
      label: 'Tỷ lệ phản hồi',
      value: `${summary.responseRate}%`,
      accent: 'border-l-4 border-blue-600',
      valueClassName: 'text-blue-600',
    },
  ];

  const updateLocalReview = (updatedReview) => {
    setReviews((current) => current.map((review) => (review.id === updatedReview.id ? updatedReview : review)));
  };

  const reloadSummary = async () => {
    try {
      const summaryData = await apiRequest('/admin/reviews/summary', { token });
      setSummary(summaryData);
    } catch {
      // Keep current summary on refresh failure.
    }
  };

  const reloadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [reviewList, summaryData] = await Promise.all([
        apiRequest('/admin/reviews', { token }),
        apiRequest('/admin/reviews/summary', { token }),
      ]);
      setReviews(reviewList);
      setSummary(summaryData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'KhĂ´ng thá»ƒ táº£i dá»¯ liá»‡u Ä‘Ă¡nh giĂ¡');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reviewId, status) => {
    setBusyTargetId(reviewId);
    setError('');
    try {
      const updatedReview = await apiRequest(`/admin/reviews/${reviewId}/status`, {
        token,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      updateLocalReview(updatedReview);
      await reloadSummary();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Không thể cập nhật trạng thái đánh giá');
    } finally {
      setBusyTargetId('');
    }
  };

  const handleReplySubmit = async (reviewId) => {
    const reply = replyDrafts[reviewId] || '';
    if (!reply.trim()) return;

    setBusyTargetId(reviewId);
    setError('');
    try {
      const updatedReview = await apiRequest(`/admin/reviews/${reviewId}/reply`, {
        token,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply }),
      });
      updateLocalReview(updatedReview);
      setReplyOpenId('');
      await reloadSummary();
    } catch (replyError) {
      setError(replyError instanceof Error ? replyError.message : 'Không thể gửi phản hồi');
    } finally {
      setBusyTargetId('');
    }
  };

  const handleOpenDiscussionReply = (reviewId, parentReplyId) => {
    setDiscussionReplyTarget({ reviewId, parentReplyId });
    setReplyDrafts((current) => ({
      ...current,
      [`discussion:${reviewId}:${parentReplyId || 'root'}`]: current[`discussion:${reviewId}:${parentReplyId || 'root'}`] || '',
    }));
  };

  useEffect(() => {
    if (!discussionReplyTarget || discussionReplyTarget.parentReplyId !== null) return;
    const node = discussionComposerRefs.current[discussionReplyTarget.reviewId];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [discussionReplyTarget]);

  const handleCloseDiscussionReply = () => {
    setDiscussionReplyTarget(null);
  };

  const getDiscussionDraftKey = (reviewId, parentReplyId) => `discussion:${reviewId}:${parentReplyId || 'root'}`;

  const handleSubmitDiscussionReply = async (reviewId, parentReplyId) => {
    const draftKey = getDiscussionDraftKey(reviewId, parentReplyId);
    const reply = replyDrafts[draftKey] || '';
    if (!reply.trim()) return;

    setBusyTargetId(parentReplyId || reviewId);
    setError('');
    try {
      const updatedReview = await apiRequest(`/admin/reviews/${reviewId}/discussion-replies`, {
        token,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply, parentReplyId }),
      });
      updateLocalReview(updatedReview);
      setReplyDrafts((current) => ({ ...current, [draftKey]: '' }));
      setDiscussionReplyTarget(null);
      await reloadSummary();
    } catch (replyError) {
      setError(replyError instanceof Error ? replyError.message : 'Không thể gửi phản hồi vào thảo luận');
    } finally {
      setBusyTargetId('');
    }
  };

  const handleDeleteDiscussionReply = async (reviewId, replyId) => {
    if (!window.confirm('Xóa phản hồi này khỏi luồng thảo luận?')) return;

    setBusyTargetId(replyId);
    setError('');
    try {
      const updatedReview = await apiRequest(`/admin/reviews/${reviewId}/discussion-replies/${replyId}`, {
        token,
        method: 'DELETE',
      });
      updateLocalReview(updatedReview);
      if (discussionReplyTarget?.parentReplyId === replyId) {
        setDiscussionReplyTarget(null);
      }
      await reloadSummary();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Không thể xóa phản hồi');
    } finally {
      setBusyTargetId('');
    }
  };

  return (
    <main className="ml-64 min-h-screen bg-slate-100/70 p-12">
      <div className="mb-12 flex items-end justify-between gap-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">Quản lý đánh giá</h2>
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>Trang chủ</span>
            <MaterialIcon className="text-sm">chevron_right</MaterialIcon>
            <span className="text-blue-600">Đánh giá khách hàng</span>
          </nav>
        </div>
        <div className="flex gap-4">
          <div className="flex rounded-lg border border-slate-100 bg-white p-1 shadow-sm">
            <button
              className={`rounded-md px-4 py-2 text-sm font-semibold ${activeTab === 'ALL' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 transition-colors hover:text-slate-900'}`}
              type="button"
              onClick={() => setActiveTab('ALL')}
            >
              Tất cả
            </button>
            <button
              className={`px-4 py-2 text-sm font-semibold ${activeTab === '5' ? 'rounded-md bg-blue-50 text-blue-600' : 'text-slate-500 transition-colors hover:text-slate-900'}`}
              type="button"
              onClick={() => setActiveTab('5')}
            >
              <StarTabLabel count="5" />
            </button>
            <button
              className={`px-4 py-2 text-sm font-semibold ${activeTab === '4' ? 'rounded-md bg-blue-50 text-blue-600' : 'text-slate-500 transition-colors hover:text-slate-900'}`}
              type="button"
              onClick={() => setActiveTab('4')}
            >
              <StarTabLabel count="4" />
            </button>
            <button
              className={`px-4 py-2 text-sm font-semibold ${activeTab === '3' ? 'rounded-md bg-blue-50 text-blue-600' : 'text-slate-500 transition-colors hover:text-slate-900'}`}
              type="button"
              onClick={() => setActiveTab('3')}
            >
              <StarTabLabel count="3" />
            </button>
            <button
              className={`px-4 py-2 text-sm font-semibold ${activeTab === '2' ? 'rounded-md bg-blue-50 text-blue-600' : 'text-slate-500 transition-colors hover:text-slate-900'}`}
              type="button"
              onClick={() => setActiveTab('2')}
            >
              <StarTabLabel count="2" />
            </button>
            <button
              className={`px-4 py-2 text-sm font-semibold ${activeTab === '1' ? 'rounded-md bg-blue-50 text-blue-600' : 'text-slate-500 transition-colors hover:text-slate-900'}`}
              type="button"
              onClick={() => setActiveTab('1')}
            >
              <StarTabLabel count="1" />
            </button>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={loading} onClick={reloadAll}>
            <MaterialIcon className="text-lg">refresh</MaterialIcon>
            Làm mới
          </button>
        </div>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-4">
        {summaryCards.map((item) => (
          <div key={item.label} className={`rounded-lg bg-white p-6 shadow-sm ${item.accent || ''}`}>
            <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-widest text-slate-500">{item.label}</p>
            {item.content || <p className={`text-4xl font-bold text-slate-900 ${item.valueClassName || ''}`}>{item.value}</p>}
          </div>
        ))}
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow-sm">Đang tải dữ liệu đánh giá...</div>
      ) : null}

      {!loading && filteredReviews.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow-sm">
          Không có đánh giá phù hợp với bộ lọc hiện tại.
        </div>
      ) : null}

      {!loading && filteredReviews.length > 0 ? (
        <>
          <div className="space-y-6">
            {paginatedReviews.map((review) => {
              const discussionDraftKey = getDiscussionDraftKey(
                discussionReplyTarget?.reviewId,
                discussionReplyTarget?.parentReplyId,
              );

              return (
                <ReviewCard
                  key={review.id}
                  review={review}
                  replyOpen={replyOpenId === review.id}
                  replyDraft={
                    replyOpenId === review.id
                      ? replyDrafts[review.id] ?? review.adminReply ?? ''
                      : discussionReplyTarget?.reviewId === review.id
                        ? replyDrafts[discussionDraftKey] ?? ''
                        : ''
                  }
                  submitting={busyTargetId === review.id}
                  replyTarget={discussionReplyTarget}
                  busyTargetId={busyTargetId}
                  onReject={() => handleStatusUpdate(review.id, review.status === 'REJECTED' ? 'APPROVED' : 'REJECTED')}
                  onOpenReply={() => {
                    setReplyOpenId(review.id);
                    setReplyDrafts((current) => ({
                      ...current,
                      [review.id]: current[review.id] ?? review.adminReply ?? '',
                    }));
                  }}
                  onCloseReply={() => setReplyOpenId('')}
                  onReplyDraftChange={(value) => {
                    if (replyOpenId === review.id) {
                      setReplyDrafts((current) => ({ ...current, [review.id]: value }));
                      return;
                    }
                    if (discussionReplyTarget?.reviewId === review.id) {
                      const key = getDiscussionDraftKey(discussionReplyTarget.reviewId, discussionReplyTarget.parentReplyId);
                      setReplyDrafts((current) => ({ ...current, [key]: value }));
                    }
                  }}
                  onSubmitReply={() => handleReplySubmit(review.id)}
                  onOpenDiscussionReply={handleOpenDiscussionReply}
                  onCloseDiscussionReply={handleCloseDiscussionReply}
                  onSubmitDiscussionReply={handleSubmitDiscussionReply}
                  onDeleteDiscussionReply={handleDeleteDiscussionReply}
                  discussionComposerRef={(node) => {
                    if (node) {
                      discussionComposerRefs.current[review.id] = node;
                    } else {
                      delete discussionComposerRefs.current[review.id];
                    }
                  }}
                />
              );
            })}
          </div>

          <div className="mt-12 flex items-center justify-between rounded-lg border border-slate-50 bg-white px-8 py-4 shadow-sm">
            <span className="text-xs font-medium text-slate-500">
              Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredReviews.length)} trên {filteredReviews.length} đánh giá
            </span>
            <div className="flex gap-2">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                <MaterialIcon>chevron_left</MaterialIcon>
              </button>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${
                      pageNumber === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50'
                    }`}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              {totalPages > 5 ? <span className="flex items-end px-2 text-slate-500">...</span> : null}
              {totalPages > 5 ? (
                <button
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${
                    totalPages === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50'
                  }`}
                  type="button"
                  onClick={() => setPage(totalPages)}
                >
                  {totalPages}
                </button>
              ) : null}
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
              >
                <MaterialIcon>chevron_right</MaterialIcon>
              </button>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}

export default ReviewsPage;

'use client';

import { useEffect, useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null } | null;
}

export default function BusinessReviewsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    fetchBusinessId();
  }, []);

  const fetchBusinessId = async () => {
    try {
      const res = await fetch('/api/businesses/my');
      if (res.ok) {
        const data = await res.json();
        setBusinessId(data.business.id);
        setAvgRating(data.business.avgRating || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchReviews();
    }
  }, [businessId]);

  const fetchReviews = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}/reviews?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
    );
  };

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }));

  const total = reviews.length || 1;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center space-y-2">
              <Skeleton className="w-20 h-12 mx-auto" />
              <Skeleton className="w-24 h-4 mx-auto" />
            </div>
            <div className="flex-1 w-full space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="flex-1 h-2 rounded-full" />
                  <Skeleton className="w-6 h-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <Skeleton circle className="w-10 h-10" />
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
              <Skeleton className="w-full h-4 mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-foreground">{avgRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <div className="text-sm text-muted mt-1">{reviews.length} تقييم</div>
          </div>
          <div className="flex-1 w-full space-y-2">
            {ratingCounts.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-4">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted w-8 text-left">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="لا توجد تقييمات بعد"
            description="التقييمات ستظهر هنا بمجرد تقييم العملاء لعملك"
          />
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={review.user?.avatar || '/logo/favicon.svg'}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                  <div>
                    <div className="font-medium text-sm text-foreground">
                      {review.user?.name || 'مستخدم'}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {renderStars(review.rating)}
                      <span className="text-xs text-muted">
                        {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-foreground leading-relaxed mt-3 mr-13">{review.comment}</p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

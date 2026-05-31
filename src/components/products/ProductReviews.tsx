import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/Toast';
import { Review, Profile } from '../../types';

interface ProductReviewsProps {
  productId: string;
  onReviewChanged?: () => void;
}

interface ReviewWithProfile extends Review {
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function ProductReviews({ productId, onReviewChanged }: ProductReviewsProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [userReview, setUserReview] = useState<ReviewWithProfile | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId, user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id(full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedData = data as unknown as ReviewWithProfile[];
      setReviews(formattedData);
      
      if (user) {
        const existing = formattedData.find(r => r.user_id === user.id);
        setUserReview(existing || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to leave a review', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const newReview = {
        product_id: productId,
        user_id: user.id,
        rating,
        comment,
        is_approved: true,
      };

      if (userReview) {
        const { error } = await supabase
          .from('reviews')
          .update(newReview)
          .eq('id', userReview.id);
        if (error) throw error;
        showToast('Review updated successfully!', 'success');
      } else {
        const { error } = await supabase
          .from('reviews')
          .insert(newReview);
        if (error) throw error;
        showToast('Review submitted successfully!', 'success');
      }

      setShowForm(false);
      fetchReviews();
      if (onReviewChanged) {
        onReviewChanged();
      }
    } catch (error: any) {
      console.error('Error saving review:', error);
      showToast(error.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
          <div className="flex items-center mt-2">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${parseFloat(averageRating) >= star ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {averageRating} out of 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
        
        {user && !showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              if (userReview) {
                setRating(userReview.rating);
                setComment(userReview.comment || '');
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl mb-10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {userReview ? 'Update your review' : 'How was this product?'}
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoveredRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike?"
              className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {isSubmitting ? 'Saving...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="animate-pulse space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No reviews yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-4">
              {review.profiles?.avatar_url ? (
                <img
                  src={review.profiles.avatar_url}
                  alt={review.profiles.full_name || 'User'}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg border border-indigo-200 dark:border-indigo-800">
                  {(review.profiles?.full_name || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {review.profiles?.full_name || 'Anonymous User'}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.created_at || '').toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </span>
                </div>
                
                <div className="flex text-yellow-400 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${review.rating >= star ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

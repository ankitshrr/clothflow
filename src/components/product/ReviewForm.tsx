import { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
  onCancel: () => void;
}

export function ReviewForm({ productId, onReviewSubmitted, onCancel }: ReviewFormProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (rating < 1 || rating > 5) {
      showToast('Please select a rating', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          title,
          comment,
          is_approved: true // Auto approve for now, or false if moderation is needed
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already reviewed this product.');
        }
        throw error;
      }

      showToast('Review submitted successfully', 'success');
      onReviewSubmitted();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Great quality and fit!"
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Comments (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others what you think about this product..."
            rows={4}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            maxLength={1000}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" loading={submitting}>
          Submit Review
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

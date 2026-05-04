import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRate, editable = false }) => {
  const safeRating = Number(rating) || 0;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={`cursor-pointer ${
            star <= safeRating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
          onClick={() => editable && onRate && onRate(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;
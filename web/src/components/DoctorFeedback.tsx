import { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, User } from 'lucide-react';
import axiosClient from '../api/axiosClient';

interface Rating {
  id: string;
  patientName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface DoctorRatingSummary {
  doctorId: string;
  averageRating: number;
  totalRatings: number;
  ratings: Rating[];
}

export function DoctorFeedback() {
  const [summary, setSummary] = useState<DoctorRatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get('/ratings/doctor/me');
      setSummary(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load ratings');
      console.error('Error fetching ratings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Loading feedback...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!summary || summary.totalRatings === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">No feedback yet</p>
        <p className="text-sm text-gray-400">Patient ratings will appear here after appointments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Rating</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(summary.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {summary.averageRating.toFixed(1)}
              </span>
              <span className="text-gray-600">/ 5.0</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Based on {summary.totalRatings} {summary.totalRatings === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      </div>

      {/* Individual Ratings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Feedback</h3>
        <div className="space-y-4">
          {summary.ratings.map(rating => (
            <div
              key={rating.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{rating.patientName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{formatDate(rating.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rating.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {rating.comment && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 italic">"{rating.comment}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

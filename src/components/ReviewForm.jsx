import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { submitReview } from '../services/reviewsService';
import { toast } from './Toast';

/** Public "leave a review" form — posts to /api/reviews (Upstash-backed, unmoderated). */
export default function ReviewForm({ t, onSubmitted }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [destination, setDestination] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim() || text.trim().length < 10) {
      toast.error(t('homePage.reviews.formErrorTitle'), t('homePage.reviews.formErrorBody'));
      return;
    }
    setSubmitting(true);
    const result = await submitReview({ name, city, destination, rating, text });
    setSubmitting(false);
    if (result.success) {
      toast.success(t('homePage.reviews.formSuccessTitle'), t('homePage.reviews.formSuccessBody'));
      setName(''); setCity(''); setDestination(''); setRating(5); setText('');
      onSubmitted?.(result.review);
    } else {
      toast.error(t('homePage.reviews.formErrorTitle'), result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#f6f1e4] rounded-2xl border border-[#e6dcc3] shadow-soft p-5">
      <div className="text-[13px] font-black text-[#1a1a1a] mb-3">{t('homePage.reviews.formTitle')}</div>

      <div className="flex items-center gap-1 mb-3" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHoverRating(n)}
            aria-label={`${n} star`} className="p-0.5">
            <Star className={`w-5 h-5 transition-colors ${(hoverRating || rating) >= n ? 'fill-[#d9a43e] text-[#d9a43e]' : 'text-[#d9c9a3]'}`} />
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mb-2">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required
          placeholder={t('homePage.reviews.namePlaceholder')}
          className="px-3 py-2.5 rounded-xl border border-[#e6dcc3] bg-white text-[13px] font-semibold text-[#1a1a1a] placeholder:text-[#a89a7d] outline-none focus:border-[#2f6395] transition" />
        <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={60}
          placeholder={t('homePage.reviews.cityPlaceholder')}
          className="px-3 py-2.5 rounded-xl border border-[#e6dcc3] bg-white text-[13px] font-semibold text-[#1a1a1a] placeholder:text-[#a89a7d] outline-none focus:border-[#2f6395] transition" />
      </div>

      <input value={destination} onChange={(e) => setDestination(e.target.value)} maxLength={60}
        placeholder={t('homePage.reviews.destinationPlaceholder')}
        className="w-full px-3 py-2.5 rounded-xl border border-[#e6dcc3] bg-white text-[13px] font-semibold text-[#1a1a1a] placeholder:text-[#a89a7d] outline-none focus:border-[#2f6395] transition mb-2" />

      <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={500} required rows={3}
        placeholder={t('homePage.reviews.textPlaceholder')}
        className="w-full px-3 py-2.5 rounded-xl border border-[#e6dcc3] bg-white text-[13px] font-medium text-[#1a1a1a] placeholder:text-[#a89a7d] outline-none focus:border-[#2f6395] transition resize-none mb-3" />

      <button type="submit" disabled={submitting}
        className="inline-flex items-center gap-2 bg-[#003580] hover:bg-[#2f6395] disabled:opacity-60 text-white text-[13px] font-black rounded-xl px-4 py-2.5 transition active:scale-95">
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {t('homePage.reviews.formSubmit')}
      </button>
    </form>
  );
}

const FALLBACKS = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
];

let i = 0;

/** Attach this as an `onError` handler so broken images degrade gracefully. */
export const handleImgError = (e) => {
  const img = e?.currentTarget;
  if (!img || img.dataset.fbApplied) return;
  img.dataset.fbApplied = '1';
  img.src = FALLBACKS[i++ % FALLBACKS.length];
};

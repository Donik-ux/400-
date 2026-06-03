import { useState } from 'react';
import { searchFlights, refineWithAi } from '../services/flightService';
import useStore from '../store/useStore';

/**
 * Search cascade (best → fallback):
 *   1. /api/flights — Vercel serverless function → Amadeus Self-Service GDS data
 *      (real airline prices/times, same data Skyscanner pulls).
 *   2. Grok-refined deterministic search — base price estimated by xAI Grok,
 *      derived 6 flights with realistic times.
 *   3. Template deterministic search — pure curated price table, instant.
 *
 * Source flag is exposed via `source` so the UI can show the right badge.
 */

const callAmadeus = async (params, signal) => {
  const qs = new URLSearchParams({
    from:   params.from   || '',
    to:     params.to     || '',
    date:   params.date   || '',
    adults: String(params.pax || params.adults || 1),
    cabin:  (params.cabin || 'ECONOMY').toUpperCase().replace(' ', '_'),
  });
  const res = await fetch(`/api/flights?${qs}`, { signal });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`/api/flights ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  const json = await res.json();
  if (!Array.isArray(json.flights) || json.flights.length === 0) {
    throw new Error('AMADEUS_EMPTY');
  }
  return json;
};

export const useFlights = () => {
  const { setFlights, setLoading, loading } = useStore();
  const [error, setError]               = useState(null);
  const [aiRefining, setAiRefining]     = useState(false);
  const [aiSource,   setAiSource]       = useState(null);     // Grok price metadata
  const [source,     setSource]         = useState(null);     // 'amadeus' | 'grok' | 'template'

  const getFlights = async (params) => {
    setLoading(true);
    setError(null);
    setAiSource(null);
    setSource(null);

    try {
      // ── Pass 0: real data via Amadeus (preferred) ──
      try {
        const amad = await callAmadeus(params);
        setFlights(amad.flights);
        setSource(amad.source || 'amadeus');   // 'travelpayouts' | 'amadeus'
        setLoading(false);
        return amad.flights;
      } catch (err) {
        if (err.status === 501) {
          console.info('Amadeus not configured (no env vars) — using AI fallback');
        } else if (err.message === 'AMADEUS_EMPTY') {
          console.info('Amadeus returned no offers — using AI fallback');
        } else {
          console.warn('Amadeus call failed, falling back to AI:', err.message);
        }
        // fall through to AI/template
      }

      // ── Pass 1: instant deterministic prices (works everywhere) ──
      const first = await searchFlights(params);
      setFlights(first);
      setSource('template');
      setLoading(false);

      // ── Pass 2: Grok refinement (silent, non-blocking) ──
      setAiRefining(true);
      try {
        const ai = await refineWithAi(params);
        if (ai && Number.isFinite(ai.median)) {
          const refined = await searchFlights({ ...params, aiBasePrice: ai.median });
          setFlights(refined);
          setAiSource(ai);
          setSource('grok');
        }
      } catch (err) {
        console.warn('AI refine failed:', err.message);
      } finally {
        setAiRefining(false);
      }

      return first;
    } catch (err) {
      setError('Failed to search flights. Please try again.');
      setLoading(false);
      throw err;
    }
  };

  return { getFlights, loading, error, aiRefining, aiSource, source };
};

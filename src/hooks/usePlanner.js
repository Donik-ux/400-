import { useState } from 'react';
import { generateItinerary } from '../services/plannerService';
import { generateAiItinerary, isAiAvailable, NAV_APPS } from '../services/aiPlannerService';
import useStore from '../store/useStore';

export const usePlanner = () => {
  const { setItineraries, setItineraryMeta, setLoading, loading } = useStore();
  const [error, setError] = useState(null);

  const getPlan = async (params) => {
    setLoading(true);
    setError(null);

    const applyResult = (result) => {
      setItineraries(result.days);
      setItineraryMeta({
        budgetBreakdown:     result.budgetBreakdown,
        transportSuggestion: result.transportSuggestion,
        travelTips:          result.travelTips,
        transportMode:       result.transportMode || params.transportMode || 'walking',
        navApps:             NAV_APPS[params.transportMode] || NAV_APPS.walking,
        halalFoodGuide:      result.halalFoodGuide || null,
        source:              result.source || 'template',
      });
      return result;
    };

    try {
      if (isAiAvailable()) {
        try {
          const ai = await generateAiItinerary(params);
          return applyResult(ai);
        } catch (aiErr) {
          // AI failed — silently fall through to template planner
          console.warn('AI planner unavailable, using template fallback:', aiErr?.message || aiErr);
        }
      }

      const tpl = await generateItinerary(params);
      return applyResult({ ...tpl, source: 'template' });
    } catch (err) {
      setError('Failed to generate itinerary. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getPlan, loading, error };
};

import { create } from 'zustand';

const useStore = create((set) => ({
  itineraries:    [],
  setItineraries: (itineraries) => set({ itineraries }),

  itineraryMeta:    null,
  setItineraryMeta: (itineraryMeta) => set({ itineraryMeta }),

  flights:    [],
  setFlights: (flights) => set({ flights }),

  loading:    false,
  setLoading: (loading) => set({ loading }),

  error:    null,
  setError: (error) => set({ error }),
}));

export default useStore;

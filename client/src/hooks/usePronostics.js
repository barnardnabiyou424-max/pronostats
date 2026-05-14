// src/hooks/usePronostics.js
// Gère la connexion SSE, le fetch initial et les mises à jour temps réel

import { useState, useEffect, useRef, useCallback } from 'react';

const MOCK_DATA = {
  lastUpdate: new Date().toISOString(),
  totalMatchs: 4,
  valueBets: 4,
  predictions: [
    {
      match_id: 1,
      domicile: 'Paris Saint-Germain',
      exterieur: 'Marseille',
      updatedAt: new Date(Date.now() - 120000).toISOString(),
      prediction: {
        probas: { p1: 81.4, pN: 11.6, p2: 7.0 },
        score_predit: { dom: 3, ext: 0, probabilite: 9.7 },
        top_scores: [
          { score: '3-0', probabilite: 9.7 },
          { score: '2-0', probabilite: 9.5 },
          { score: '3-1', probabilite: 8.1 },
          { score: '2-1', probabilite: 7.9 },
          { score: '4-0', probabilite: 7.4 },
        ],
        value_bet: '1', value_edge: 12.4, confiance: 95,
        lambdas: { dom: 3.073, ext: 0.837 },
        ajustements: { elo_dom: 1.12, elo_ext: 0.91, repos_dom: 1, repos_ext: 0.93, absences_dom: 0.96, absences_ext: 0.95 },
      },
      match: {
        journee: 28,
        date: new Date(Date.now() + 2 * 86400000).toISOString(),
        cotes: { cote_1: 1.38, cote_n: 4.80, cote_2: 8.50 },
        absences: {
          domicile:  [{ joueur: 'Hakimi',     raison: 'blessure',    importance: 8 }],
          exterieur: [{ joueur: 'Aubameyang', raison: 'suspension',  importance: 9 }],
        },
      },
    },
    {
      match_id: 2,
      domicile: 'Monaco', exterieur: 'Lyon',
      updatedAt: new Date(Date.now() - 90000).toISOString(),
      prediction: {
        probas: { p1: 63.9, pN: 18.6, p2: 17.5 },
        score_predit: { dom: 2, ext: 1, probabilite: 11.2 },
        top_scores: [
          { score: '2-1', probabilite: 11.2 }, { score: '1-0', probabilite: 10.8 },
          { score: '2-0', probabilite: 10.1 }, { score: '1-1', probabilite: 9.4 },
          { score: '3-1', probabilite: 7.2 },
        ],
        value_bet: '1', value_edge: 6.8, confiance: 72,
        lambdas: { dom: 1.98, ext: 1.21 },
        ajustements: { elo_dom: 1.04, elo_ext: 0.97, repos_dom: 1, repos_ext: 1, absences_dom: 1, absences_ext: 1 },
      },
      match: { journee: 28, date: new Date(Date.now() + 3 * 86400000).toISOString(), cotes: { cote_1: 2.10, cote_n: 3.40, cote_2: 3.20 }, absences: { domicile: [], exterieur: [] } },
    },
    {
      match_id: 3,
      domicile: 'Lille', exterieur: 'Nice',
      updatedAt: new Date(Date.now() - 60000).toISOString(),
      prediction: {
        probas: { p1: 58.4, pN: 23.4, p2: 18.2 },
        score_predit: { dom: 2, ext: 1, probabilite: 10.4 },
        top_scores: [
          { score: '1-0', probabilite: 11.3 }, { score: '2-1', probabilite: 10.4 },
          { score: '1-1', probabilite: 10.1 }, { score: '2-0', probabilite: 9.6 },
          { score: '0-0', probabilite: 7.8 },
        ],
        value_bet: '1', value_edge: 4.2, confiance: 64,
        lambdas: { dom: 1.72, ext: 1.08 },
        ajustements: { elo_dom: 1.02, elo_ext: 0.98, repos_dom: 1, repos_ext: 1, absences_dom: 1, absences_ext: 1 },
      },
      match: { journee: 28, date: new Date(Date.now() + 4 * 86400000).toISOString(), cotes: { cote_1: 2.35, cote_n: 3.20, cote_2: 3.10 }, absences: { domicile: [], exterieur: [] } },
    },
    {
      match_id: 4,
      domicile: 'Rennes', exterieur: 'Lens',
      updatedAt: new Date(Date.now() - 30000).toISOString(),
      prediction: {
        probas: { p1: 54.6, pN: 23.0, p2: 22.4 },
        score_predit: { dom: 1, ext: 1, probabilite: 10.9 },
        top_scores: [
          { score: '1-1', probabilite: 10.9 }, { score: '1-0', probabilite: 10.6 },
          { score: '2-1', probabilite: 9.8 },  { score: '0-0', probabilite: 8.9 },
          { score: '2-0', probabilite: 8.1 },
        ],
        value_bet: 'N', value_edge: 3.1, confiance: 55,
        lambdas: { dom: 1.54, ext: 1.42 },
        ajustements: { elo_dom: 1.01, elo_ext: 0.99, repos_dom: 0.93, repos_ext: 1, absences_dom: 1, absences_ext: 1 },
      },
      match: { journee: 28, date: new Date(Date.now() + 5 * 86400000).toISOString(), cotes: { cote_1: 2.50, cote_n: 3.10, cote_2: 2.95 }, absences: { domicile: [], exterieur: [] } },
    },
  ],
};

export function usePronostics() {
  const [data, setData]           = useState(null);
  const [connected, setConnected] = useState(false);
  const [newIds, setNewIds]       = useState(new Set());
  const [lastTick, setLastTick]   = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const esRef = useRef(null);

  // Chargement initial
  const fetchSnapshot = useCallback(async () => {
    try {
      const res = await fetch('/api/stream/snapshot');
      if (!res.ok) throw new Error('Backend non disponible');
      const json = await res.json();
      setData(json.data);
      setLastTick(new Date());
    } catch {
      // Backend pas dispo → mode mock
      console.warn('Backend non disponible, mode mock activé');
      setData(MOCK_DATA);
      setLastTick(new Date());
    }
  }, []);

  // Connexion SSE
  useEffect(() => {
    fetchSnapshot();

    try {
      esRef.current = new EventSource('/api/stream');

      esRef.current.addEventListener('connected', () => {
        setConnected(true);
      });

      esRef.current.addEventListener('predictions_update', e => {
        const payload = JSON.parse(e.data);
        const ids = new Set(payload.predictions.map(p => p.match_id));
        setNewIds(ids);
        setData(payload);
        setLastTick(new Date());
        // Retire le highlight après 3s
        setTimeout(() => setNewIds(new Set()), 3000);
      });

      esRef.current.onerror = () => {
        setConnected(false);
        // Retry automatique toutes les 5s si déconnecté
        setTimeout(fetchSnapshot, 5000);
      };
    } catch {
      // SSE non supporté ou backend absent → polling toutes les 30s
      const poll = setInterval(fetchSnapshot, 30000);
      return () => clearInterval(poll);
    }

    return () => {
      esRef.current?.close();
    };
  }, [fetchSnapshot]);

  // Refresh manuel
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetch('/api/stream/refresh', { method: 'POST' });
      await fetchSnapshot();
    } catch {
      await fetchSnapshot();
    } finally {
      setRefreshing(false);
    }
  }, [fetchSnapshot]);

  return { data, connected, newIds, lastTick, refreshing, refresh };
}

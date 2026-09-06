import { describe, expect, it } from 'vitest';
import {
  createAntiInsightData,
  createModeMetrics,
} from '@/features/activity/view/dashboard-page/activity-dashboard.presentation';

describe('activity dashboard presentation', () => {
  it('aggregates metrics for a mode card', () => {
    expect(
      createModeMetrics([
        {
          key: 'standard:example.com',
          source: 'standard',
          hostname: 'example.com',
          attempts: 3,
          grants: 1,
          longestWithoutAccessMs: 0,
          feelings: [],
        },
        {
          key: 'standard:video.example',
          source: 'standard',
          hostname: 'video.example',
          attempts: 2,
          grants: 0,
          longestWithoutAccessMs: 0,
          feelings: [],
        },
      ]),
    ).toEqual({ attempts: 5, grants: 1, sites: 2 });
  });

  it('limits insights to the most common feelings and latest reflections', () => {
    const result = createAntiInsightData(
      [1, 2, 3, 4].map((at) => ({
        id: String(at),
        source: 'anti-porn' as const,
        kind: 'reflection' as const,
        hostname: 'example.com',
        path: '/',
        at,
      })),
      [
        {
          key: 'anti-porn:example.com',
          source: 'anti-porn',
          hostname: 'example.com',
          attempts: 0,
          grants: 0,
          longestWithoutAccessMs: 0,
          feelings: [
            { feeling: 'ansiedade', count: 3 },
            { feeling: 'impulso', count: 1 },
          ],
        },
      ],
    );

    expect(result.commonFeelings[0]).toEqual(['ansiedade', 3]);
    expect(result.reflections.map((event) => event.id)).toEqual(['4', '3', '2']);
  });
});

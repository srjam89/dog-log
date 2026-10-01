import { countSkills, summarizeActivities, topSkills } from '../analytics';

describe('analytics utilities', () => {
  const walks = [
    {
      started_at: '2026-09-01T09:00:00.000Z',
      duration_minutes: 30,
      distance_km: 2.5,
      rating: 4,
    },
    {
      started_at: '2026-09-02T09:00:00.000Z',
      duration_minutes: 20,
      distance_km: null,
      rating: null,
    },
  ];
  const sessions = [
    {
      occurred_at: '2026-09-02T17:00:00.000Z',
      duration_minutes: 15,
      skills: ['Sit', 'Stay'],
      rating: 5,
    },
    {
      occurred_at: '2026-09-02T18:00:00.000Z',
      duration_minutes: 10,
      skills: ['Stay'],
      rating: 3,
    },
  ];

  it('summarizes activity totals and ratings', () => {
    expect(summarizeActivities(walks, sessions)).toMatchObject({
      totalActivities: 4,
      totalWalks: 2,
      totalTrainingSessions: 2,
      totalWalkMinutes: 50,
      totalTrainingMinutes: 25,
      totalDistanceKm: 2.5,
      averageRating: 4,
    });
  });

  it('counts and ranks practiced skills', () => {
    expect(countSkills(sessions)).toEqual({ Sit: 1, Stay: 2 });
    expect(topSkills(sessions)).toEqual([
      { skill: 'Stay', count: 2 },
      { skill: 'Sit', count: 1 },
    ]);
  });
});

/**
 * Player Service
 * Simulates a backend API for player verification and data fetching.
 */

export interface PlayerData {
  username: string;
  level: number;
  region: string;
  isVerified: boolean;
}

const MOCK_PLAYERS: Record<string, PlayerData> = {
  '12345678': {
    username: 'ProGamer_Elite',
    level: 99,
    region: 'Global',
    isVerified: true,
  },
  '87654321': {
    username: 'NoobMaster69',
    level: 42,
    region: 'North America',
    isVerified: true,
  },
  '11223344': {
    username: 'ShadowNinja',
    level: 75,
    region: 'Asia',
    isVerified: true,
  },
};

/**
 * Verifies a Player ID and fetches associated account data.
 * @param playerId The 8-12 digit Player ID to verify.
 * @returns A promise that resolves with PlayerData or rejects with an error message.
 */
export const verifyPlayerId = async (playerId: string): Promise<PlayerData> => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Basic format validation
  const idRegex = /^\d{8,12}$/;
  if (!idRegex.test(playerId)) {
    throw new Error('Invalid Player ID format. Must be 8-12 digits.');
  }

  // Simulate "Banned" IDs
  if (playerId.startsWith('999')) {
    throw new Error('This Player ID has been flagged for suspicious activity and is banned.');
  }

  // Check mock database
  if (MOCK_PLAYERS[playerId]) {
    return MOCK_PLAYERS[playerId];
  }

  // Simulate "Not Found" for specific IDs
  if (playerId === '00000000') {
    throw new Error('Account not found. Please check the ID and try again.');
  }

  // Fallback: Generate a name for other valid IDs to simulate a large database
  return {
    username: `ElitePlayer_${playerId.slice(-4)}`,
    level: Math.floor(Math.random() * 50) + 1,
    region: ['Global', 'Asia', 'Europe', 'America'][Math.floor(Math.random() * 4)],
    isVerified: true,
  };
};

import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { seedDatabase } from '../lib/hsk-seeder';

export function useDB() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    seedDatabase()
      .then(() => setReady(true))
      .catch((e) => setError(e));
  }, []);

  return { db, ready, error };
}

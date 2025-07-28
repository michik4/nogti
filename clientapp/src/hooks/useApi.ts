
import { useState, useEffect } from 'react';

export interface UseApiOptions<T> {
  initialData?: T;
  immediate?: boolean;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<{ data: T }>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { initialData = null, immediate = false } = options;
  
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (...args: any[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(initialData);
    setLoading(false);
    setError(null);
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  return { data, loading, error, execute, reset };
}

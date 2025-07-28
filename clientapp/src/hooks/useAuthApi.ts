import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiResponse } from '@/types/api.types';

interface UseAuthApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAuthApi<T>() {
  const [state, setState] = useState<UseAuthApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const { isAuthenticated } = useAuth();

  const execute = useCallback(async (
    apiCall: () => Promise<ApiResponse<T>>
  ): Promise<T | null> => {
    if (!isAuthenticated) {
      setState(prev => ({ ...prev, error: 'Пользователь не аутентифицирован' }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Ошибка API');
      }
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.message || 'Произошла ошибка'
      });
      return null;
    }
  }, [isAuthenticated]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isAuthenticated
  };
} 
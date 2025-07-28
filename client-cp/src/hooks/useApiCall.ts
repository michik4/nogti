import { useState, useCallback } from 'react';

export interface ApiCallState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: any;
}

export const useApiCall = () => {
  const [state, setState] = useState<ApiCallState>({
    loading: false,
    error: null,
    success: false,
    data: null
  });

  const execute = useCallback(async (apiCall: () => Promise<any>, successMessage?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));
    
    try {
      const result = await apiCall();
      
      // Сохраняем полный ответ с метаданными
      const responseData = {
        timestamp: new Date().toISOString(),
        success: true,
        message: successMessage || 'Операция выполнена успешно',
        data: result
      };
      
      setState({
        loading: false,
        error: null,
        success: true,
        data: responseData
      });
      
      if (successMessage) {
        console.log(`✅ ${successMessage}`);
      }
      
      return result;
    } catch (error) {
      let errorMessage = 'Неизвестная ошибка';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'response' in error) {
        // Обработка ошибок axios
        const axiosError = error as any;
        if (axiosError.response?.status === 401) {
          errorMessage = 'Ошибка авторизации. Пожалуйста, войдите в систему заново.';
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else {
          errorMessage = `Ошибка ${axiosError.response?.status || 'сети'}`;
        }
      }
      
      // Создаем детальную информацию об ошибке для JSON вывода
      const errorData = {
        timestamp: new Date().toISOString(),
        success: false,
        error: errorMessage,
        details: {
          message: errorMessage,
          status: error && typeof error === 'object' && 'response' in error 
            ? (error as any).response?.status 
            : 'unknown',
          statusText: error && typeof error === 'object' && 'response' in error 
            ? (error as any).response?.statusText 
            : 'unknown',
          data: error && typeof error === 'object' && 'response' in error 
            ? (error as any).response?.data 
            : null
        }
      };
      
      setState({
        loading: false,
        error: errorMessage,
        success: false,
        data: errorData
      });
      
      console.error(`❌ Ошибка: ${errorMessage}`);
      throw error;
    }
  }, []);

  const clearState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      data: null
    });
  }, []);

  return {
    ...state,
    execute,
    clearState
  };
}; 
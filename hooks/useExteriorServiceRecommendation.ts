import { useCallback, useEffect, useRef, useState } from 'react';
import httpService from '../services/httpService';

export interface ExteriorServiceRecommendation {
  show_recommendation: boolean;
  arrived_flights_count?: number;
}

// The API owns the flight count and customer threshold. Mobile only presents its result.
export function useExteriorServiceRecommendation(
  tailNumber: string,
  customerId: number | null | undefined,
  onError: () => void,
) {
  const [recommendation, setRecommendation] = useState<ExteriorServiceRecommendation | null>(null);
  const requestId = useRef(0);
  const tail = tailNumber.trim().toUpperCase();
  const context = `${customerId ?? ''}:${tail}`;
  const currentContext = useRef(context);
  currentContext.current = context;
  const errorHandler = useRef(onError);
  errorHandler.current = onError;

  const reset = useCallback(() => {
    requestId.current += 1;
    setRecommendation(null);
  }, []);

  useEffect(() => {
    reset();
    return () => { requestId.current += 1; };
  }, [context, reset]);

  const check = useCallback(async () => {
    const id = ++requestId.current;
    setRecommendation(null);
    if (!tail || !customerId) return;

    try {
      const result: ExteriorServiceRecommendation = await httpService.post(
        '/tail-exterior-level-2-checker',
        { tail_number: tail, customer_id: customerId, ident: '' },
      );
      if (id === requestId.current && context === currentContext.current) {
        setRecommendation(result);
      }
    } catch {
      if (id === requestId.current && context === currentContext.current) {
        errorHandler.current();
      }
    }
  }, [tail, customerId, context]);

  return { recommendation, check, reset };
}

import { useState, useEffect, useCallback } from "react";
import { MainService } from "@/shared/services/main.service";
import type { Calculation } from "@/shared/types";



interface UseCalculationsReturn {
  calculations: Calculation[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  remove: (id: number) => Promise<void>;
}

export const useCalculations = (userId?: number): UseCalculationsReturn => {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalculations = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await MainService.getCalculations(userId);
      setCalculations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los cálculos");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchCalculations();
  }, [fetchCalculations]);

  const remove = async (id: number): Promise<void> => {
    await MainService.deleteCalculation(id);
    setCalculations((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    calculations,
    loading,
    error,
    refetch: fetchCalculations,
    remove,
  };
};
import { useEffect, useState } from 'preact/hooks';
import type { ReflectionsRepository } from '@/features/reflections/domain/reflections.repository';

export function useReflectionsModel(repository: ReflectionsRepository) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let mounted = true;
    void repository
      .getEnabled()
      .then((value) => {
        if (mounted) setEnabled(value);
      })
      .catch(() => {
        if (mounted)
          setFeedback(
            'Não foi possível carregar sua preferência. Reabra esta página para tentar novamente.',
          );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [repository]);

  async function changeEnabled(value: boolean): Promise<void> {
    setLoading(true);
    try {
      await repository.setEnabled(value);
      setEnabled(value);
      setFeedback('Preferência salva para todas as telas de bloqueio.');
    } catch {
      setFeedback('Não foi possível salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return { enabled, loading, feedback, changeEnabled };
}

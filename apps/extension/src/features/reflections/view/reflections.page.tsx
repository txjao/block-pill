import { ChromeReflectionsRepository } from '@/features/reflections/infrastructure/reflections.repository.chrome';
import type { ComponentChildren } from 'preact';
import { useReflectionsModel } from './reflections.model';
import { ReflectionsView, ReflectionQuoteView } from './reflections.view';

const repository = new ChromeReflectionsRepository();

export function ReflectionsPage() {
  const model = useReflectionsModel(repository);
  return <ReflectionsView {...model} />;
}

export function ReflectionQuotePage({
  fallback,
}: {
  fallback?: ComponentChildren;
} = {}) {
  const model = useReflectionsModel(repository);
  return <ReflectionQuoteView {...model} fallback={fallback} />;
}

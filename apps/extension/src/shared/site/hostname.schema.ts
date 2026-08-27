import { z } from 'zod';
import { parseHostname, type Hostname } from './hostname';

export const hostnameSchema = z.string().transform<Hostname>((value, context) => {
  try {
    return parseHostname(value);
  } catch (error) {
    context.addIssue({
      code: 'custom',
      message: error instanceof Error ? error.message : 'Informe um domínio válido.',
    });
    return z.NEVER;
  }
});

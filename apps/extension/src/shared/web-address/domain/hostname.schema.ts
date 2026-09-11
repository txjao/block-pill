import { z } from 'zod';
import { InvalidHostnameError } from './hostname.error';
import { parseHostname } from './hostname.parser';
import type { Hostname } from './hostname';

export const hostnameSchema = z
  .string()
  .transform<Hostname>((value, context) => {
    try {
      return parseHostname(value);
    } catch (error) {
      if (!(error instanceof InvalidHostnameError)) throw error;

      context.addIssue({
        code: 'custom',
        message: error.message,
      });
      return z.NEVER;
    }
  });

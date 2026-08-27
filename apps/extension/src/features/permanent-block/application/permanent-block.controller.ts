import type { PermanentBlockService } from '../domain/permanent-block.service';
import type { PermanentBlock } from '../domain/permanent-block.types';

export class PermanentBlockController {
  constructor(private readonly service: PermanentBlockService) {}

  list(): Promise<PermanentBlock[]> {
    return this.service.list();
  }

  add(hostname: string): Promise<PermanentBlock> {
    return this.service.add(hostname);
  }

  synchronize(): Promise<void> {
    return this.service.synchronize();
  }
}

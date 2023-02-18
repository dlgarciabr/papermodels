import { ItemIntegrationStatus } from '@prisma/client';
import { z } from 'zod';

export const zItemIntegrationStatusEnum = z.enum([
  ItemIntegrationStatus.done,
  ItemIntegrationStatus.error,
  ItemIntegrationStatus.pending,
  ItemIntegrationStatus.pendingFiles,
  ItemIntegrationStatus.running,
  ItemIntegrationStatus.pendingSimulation,
  ItemIntegrationStatus.simulated
]);

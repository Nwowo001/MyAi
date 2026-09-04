/**
 * @fileoverview Knowledge base validation schemas.
 */

import { z } from 'zod';

export const CreateKnowledgeSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  content: z.string().min(1).max(50000).trim(),
  source: z.enum(['MANUAL', 'FAQ', 'POLICY', 'PRODUCT', 'SERVICE', 'OTHER']).default('MANUAL'),
});

export const UpdateKnowledgeSchema = CreateKnowledgeSchema.partial();

export type CreateKnowledgeInput = z.infer<typeof CreateKnowledgeSchema>;
export type UpdateKnowledgeInput = z.infer<typeof UpdateKnowledgeSchema>;

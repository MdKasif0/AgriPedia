import * as z from 'zod';

export const PlannerDataSchema = z.object({
  userId: z.string().optional().default("defaultUser"), // Optional as it's added later in current flow
  location: z.object({
    lat: z.number().nullable(),
    lon: z.number().nullable(),
    address: z.string().optional(),
    climateZone: z.string(),
  }).optional(),
  space: z.string().optional(),
  sunlight: z.string().optional(),
  purpose: z.array(z.string()).optional(),
  experience: z.string().optional(),
  timeCommitment: z.string().optional(),
  createdAt: z.string().optional(), // Optional as it's added later
});

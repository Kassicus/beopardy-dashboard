import { z } from "zod";

export const episodeSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  episode_number: z.coerce
    .number()
    .int("Must be a whole number")
    .positive("Must be a positive number"),
  season: z.coerce
    .number()
    .int("Must be a whole number")
    .positive("Must be a positive number"),
  air_date: z.string().min(1, "Air date is required"),
  youtube_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  thumbnail_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type EpisodeFormData = z.infer<typeof episodeSchema>;

export const appearanceSchema = z.object({
  player_id: z.string().uuid("Invalid player"),
  questions_seen: z.coerce.number().int().min(0, "Cannot be negative"),
  questions_correct: z.coerce.number().int().min(0, "Cannot be negative"),
  points_scored: z.coerce.number().int(),
  is_winner: z.boolean(),
  placement: z.coerce
    .number()
    .int()
    .min(1, "Must be at least 1")
    .max(10, "Must be at most 10")
    .optional()
    .nullable(),
  final_wager: z.coerce
    .number()
    .int()
    .min(0, "Cannot be negative")
    .optional()
    .nullable(),
  final_correct: z.boolean().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type AppearanceFormData = z.infer<typeof appearanceSchema>;

export const resultsSchema = z.object({
  results: z.array(appearanceSchema).min(1, "At least one participant required"),
});

export type ResultsFormData = z.infer<typeof resultsSchema>;

//use zod to define the shape of our form

import { z } from "zod";

//title and multiple units (can add units in the UI)
export const createChaptersSchema = z.object({
  title: z.string().min(3).max(100),
  units: z.array(z.string()),
});

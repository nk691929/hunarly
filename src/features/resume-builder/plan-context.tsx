"use client";

import { createContext, useContext } from "react";
import type { Plan } from "@/config/plans";

const PlanContext = createContext<Plan>("free");

export const PlanProvider = PlanContext.Provider;

/** The current person's plan, for showing locks and upgrade hints. Never a security boundary. */
export function usePlan(): Plan {
  return useContext(PlanContext);
}

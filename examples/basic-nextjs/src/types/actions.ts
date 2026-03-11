/**
 * Standard action state shape for Server Actions.
 * Used by contact form and other form submissions.
 */
export type ActionState<T = unknown> =
  | { success: true; data?: T }
  | { error: Record<string, string[]> }
  | null;

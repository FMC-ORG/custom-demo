'use server';

import { z } from 'zod';
import type { ActionState } from '@/types/actions';

const shortSchema = z.object({
  nome: z.string().min(1, 'Nome è obbligatorio'),
  cognome: z.string().min(1, 'Cognome è obbligatorio'),
  email: z.string().email('Email non valida'),
  messaggio: z.string().min(1, 'Messaggio è obbligatorio'),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Devi accettare l\'Informativa Privacy' }),
  }),
});

const longSchema = shortSchema.extend({
  telefono: z.string().optional(),
  azienda: z.string().min(1, 'Azienda è obbligatorio'),
  ruolo: z.string().min(1, 'Ruolo è obbligatorio'),
  città: z.string().optional(),
  commercialConsent: z.boolean().optional(),
  thirdPartyConsent: z.boolean().optional(),
});

export type ContactFormShortPayload = z.infer<typeof shortSchema>;
export type ContactFormLongPayload = z.infer<typeof longSchema>;

/**
 * Mocked Server Action for contact form submission.
 * Validates with Zod, simulates delay, logs payload, returns success.
 */
export async function submitContactForm(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const variant = (formData.get('_variant') as 'short' | 'long') || 'short';
  const schema = variant === 'long' ? longSchema : shortSchema;

  const raw = {
    nome: formData.get('nome'),
    cognome: formData.get('cognome'),
    email: formData.get('email'),
    messaggio: formData.get('messaggio'),
    privacyAccepted: formData.get('privacyAccepted') === 'on',
    ...(variant === 'long' && {
      telefono: formData.get('telefono') || undefined,
      azienda: formData.get('azienda'),
      ruolo: formData.get('ruolo'),
      città: formData.get('città') || undefined,
      commercialConsent: formData.get('commercialConsent') === 'on',
      thirdPartyConsent: formData.get('thirdPartyConsent') === 'on',
    }),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  // Mock: log and simulate delay
  console.log('[ContactForm] Mock submit:', parsed.data);
  await new Promise((resolve) => setTimeout(resolve, 500));

  return { success: true };
}

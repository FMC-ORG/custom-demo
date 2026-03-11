'use client';

import type React from 'react';
import { useActionState } from 'react';
import { ComponentProps } from 'lib/component-props';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { LocaleAwareLink } from '@/components/ui/locale-link/LocaleAwareLink';
import { cn } from '@/lib/utils';
import { submitContactForm } from '@/lib/actions/contact-form';
import type { LinkField } from '@sitecore-content-sdk/nextjs';

/**
 * ContactForm fields — no ComponentQuery, default JSS PascalCase shape.
 */
interface ContactFormFields {
  LabelNome?: { value?: string };
  LabelCognome?: { value?: string };
  LabelEmail?: { value?: string };
  LabelTelefono?: { value?: string };
  LabelAzienda?: { value?: string };
  LabelRuolo?: { value?: string };
  /** Sitecore field name is LabelCitta (no accent) due to naming rules */
  LabelCitta?: { value?: string };
  LabelMessaggio?: { value?: string };
  LabelPrivacy?: { value?: string };
  LabelCommercialConsent?: { value?: string };
  LabelThirdPartyConsent?: { value?: string };
  SubmitButtonText?: { value?: string };
  PrivacyPolicyUrl?: LinkField;
}

interface ContactFormProps extends ComponentProps {
  params: { [key: string]: string };
  fields?: ContactFormFields;
}

const DEFAULT_LABELS = {
  labelNome: 'Nome',
  labelCognome: 'Cognome',
  labelEmail: 'Email',
  labelTelefono: 'Telefono',
  labelAzienda: 'Azienda',
  labelRuolo: 'Ruolo',
  labelCittà: 'Città',
  labelMessaggio: 'Messaggio',
  labelPrivacy: "Ho preso visione dell'",
  labelPrivacyLinkText: 'Informativa Privacy',
  labelCommercialConsent:
    'Acconsento a ricevere comunicazioni commerciali e promozionali relative a servizi e prodotti propri delle società appartenenti al Gruppo imprenditoriale Var Group S.p.A., nonché messaggi informativi relativi alle attività istituzionali delle società medesime.',
  labelThirdPartyConsent:
    'Acconsento alla comunicazione dei dati personali a società terze (appartenenti alle categorie merceologiche ATECO J62, J63 e M70 riguardanti prodotti e servizi informatici e di consulenza aziendale).',
  submitButtonText: 'Invia la tua Richiesta',
};

const inputBase =
  'w-full rounded-md border border-vg-border bg-white px-4 py-3 text-vg-body placeholder:text-vg-muted transition-colors focus:border-vg-blue focus:outline-none focus:ring-2 focus:ring-vg-blue/20';

function Label({
  htmlFor,
  children,
  required,
  className,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-sm font-medium text-vg-body mb-1.5',
        className
      )}
    >
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

function ContactFormLayout({
  fields,
  params,
  variant,
}: ContactFormProps & { variant: 'short' | 'long' }) {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles = '', RenderingIdentifier: id } = params;

  const [state, formAction, isPending] = useActionState(submitContactForm, null);

  /** Type guard: state.error exists only when validation fails */
  const error: Record<string, string[]> | undefined =
    state && 'error' in state ? state.error : undefined;

  const labels = {
    labelNome: fields?.LabelNome?.value ?? DEFAULT_LABELS.labelNome,
    labelCognome: fields?.LabelCognome?.value ?? DEFAULT_LABELS.labelCognome,
    labelEmail: fields?.LabelEmail?.value ?? DEFAULT_LABELS.labelEmail,
    labelTelefono: fields?.LabelTelefono?.value ?? DEFAULT_LABELS.labelTelefono,
    labelAzienda: fields?.LabelAzienda?.value ?? DEFAULT_LABELS.labelAzienda,
    labelRuolo: fields?.LabelRuolo?.value ?? DEFAULT_LABELS.labelRuolo,
    labelCittà: fields?.LabelCitta?.value ?? DEFAULT_LABELS.labelCittà,
    labelMessaggio: fields?.LabelMessaggio?.value ?? DEFAULT_LABELS.labelMessaggio,
    labelPrivacy: fields?.LabelPrivacy?.value ?? DEFAULT_LABELS.labelPrivacy,
    labelCommercialConsent:
      fields?.LabelCommercialConsent?.value ?? DEFAULT_LABELS.labelCommercialConsent,
    labelThirdPartyConsent:
      fields?.LabelThirdPartyConsent?.value ?? DEFAULT_LABELS.labelThirdPartyConsent,
    submitButtonText:
      fields?.SubmitButtonText?.value ?? DEFAULT_LABELS.submitButtonText,
  };

  const privacyLink = fields?.PrivacyPolicyUrl;
  const isLong = variant === 'long';

  const privacyLinkText = privacyLink?.value?.text ?? DEFAULT_LABELS.labelPrivacyLinkText;

  return (
    <section
      className={cn('contact-form py-12', styles)}
      id={id}
      data-testid="contact-form"
    >
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-lg border border-vg-border bg-white p-6 shadow-lg md:p-8">
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="_variant" value={variant} />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome" required>
                    {labels.labelNome}
                  </Label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    placeholder={labels.labelNome}
                    className={inputBase}
                    required
                    aria-invalid={!!error?.nome}
                    aria-describedby={error?.nome ? 'nome-error' : undefined}
                  />
                  {error?.nome && (
                    <p id="nome-error" className="mt-1 text-sm text-destructive">
                      {error.nome[0]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cognome" required>
                    {labels.labelCognome}
                  </Label>
                  <input
                    id="cognome"
                    name="cognome"
                    type="text"
                    placeholder={labels.labelCognome}
                    className={inputBase}
                    required
                    aria-invalid={!!error?.cognome}
                  />
                  {error?.cognome && (
                    <p className="mt-1 text-sm text-destructive">
                      {error.cognome[0]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" required>
                    {labels.labelEmail}
                  </Label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={labels.labelEmail}
                    className={inputBase}
                    required
                    aria-invalid={!!error?.email}
                  />
                  {error?.email && (
                    <p className="mt-1 text-sm text-destructive">
                      {error.email[0]}
                    </p>
                  )}
                </div>

                {isLong && (
                  <>
                    <div>
                      <Label htmlFor="telefono">{labels.labelTelefono}</Label>
                      <input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        placeholder={labels.labelTelefono}
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <Label htmlFor="azienda" required>
                        {labels.labelAzienda}
                      </Label>
                      <input
                        id="azienda"
                        name="azienda"
                        type="text"
                        placeholder={labels.labelAzienda}
                        className={inputBase}
                        required={isLong}
                        aria-invalid={!!error?.azienda}
                      />
                      {error?.azienda && (
                        <p className="mt-1 text-sm text-destructive">
                          {error.azienda[0]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="ruolo" required>
                        {labels.labelRuolo}
                      </Label>
                      <input
                        id="ruolo"
                        name="ruolo"
                        type="text"
                        placeholder={labels.labelRuolo}
                        className={inputBase}
                        required={isLong}
                        aria-invalid={!!error?.ruolo}
                      />
                      {error?.ruolo && (
                        <p className="mt-1 text-sm text-destructive">
                          {error.ruolo[0]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="città">{labels.labelCittà}</Label>
                      <input
                        id="città"
                        name="città"
                        type="text"
                        placeholder={labels.labelCittà}
                        className={inputBase}
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <Label htmlFor="messaggio" required>
                  {labels.labelMessaggio}
                </Label>
                <textarea
                  id="messaggio"
                  name="messaggio"
                  placeholder={labels.labelMessaggio}
                  rows={isLong ? 10 : 8}
                  className={cn(inputBase, 'min-h-[120px] resize-y')}
                  required
                  aria-invalid={!!error?.messaggio}
                />
                {error?.messaggio && (
                  <p className="mt-1 text-sm text-destructive">
                    {error.messaggio[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 border-t border-vg-border pt-6">
              <div className="flex items-start gap-3">
                <input
                  id="privacyAccepted"
                  name="privacyAccepted"
                  type="checkbox"
                  required
                  className="mt-1.5 h-5 w-5 shrink-0 rounded border-vg-border text-vg-blue focus:ring-vg-blue/20"
                  aria-invalid={!!error?.privacyAccepted}
                />
                <label htmlFor="privacyAccepted" className="text-sm text-vg-body">
                  {labels.labelPrivacy}
                  {privacyLink?.value?.href ? (
                    <LocaleAwareLink
                      field={privacyLink}
                      editable={isEditing}
                      className="text-vg-blue underline-offset-4 hover:underline"
                    >
                      {privacyLinkText}
                    </LocaleAwareLink>
                  ) : (
                    privacyLinkText
                  )}{' '}
                  *
                </label>
              </div>
              {error?.privacyAccepted && (
                <p className="text-sm text-destructive">
                  {error.privacyAccepted[0]}
                </p>
              )}

              {isLong && (
                <>
                  <div className="flex items-start gap-3">
                    <input
                      id="commercialConsent"
                      name="commercialConsent"
                      type="checkbox"
                      className="mt-1.5 h-5 w-5 shrink-0 rounded border-vg-border text-vg-blue focus:ring-vg-blue/20"
                    />
                    <label
                      htmlFor="commercialConsent"
                      className="text-sm text-vg-body"
                    >
                      {labels.labelCommercialConsent}
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      id="thirdPartyConsent"
                      name="thirdPartyConsent"
                      type="checkbox"
                      className="mt-1.5 h-5 w-5 shrink-0 rounded border-vg-border text-vg-blue focus:ring-vg-blue/20"
                    />
                    <label
                      htmlFor="thirdPartyConsent"
                      className="text-sm text-vg-body"
                    >
                      {labels.labelThirdPartyConsent}
                    </label>
                  </div>
                </>
              )}
            </div>

            {state && 'success' in state && (
              <p className="rounded-md bg-green-50 p-4 text-sm text-green-800">
                Richiesta inviata con successo. Ti contatteremo presto.
              </p>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  'rounded-md bg-vg-blue px-8 py-3 font-medium text-white shadow-md transition-colors hover:bg-vg-blue/90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed'
                )}
              >
                {isPending ? 'Invio in corso...' : labels.submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

/**
 * Default variant — same as Short (essential fields only).
 */
export const Default: React.FC<ContactFormProps> = (props) => (
  <ContactFormLayout {...props} variant="short" />
);

/**
 * Short variant — Nome, Cognome, Email, Messaggio, Privacy checkbox.
 */
export const Short: React.FC<ContactFormProps> = (props) => (
  <ContactFormLayout {...props} variant="short" />
);

/**
 * Long variant — All fields including Telefono, Azienda, Ruolo, Città and all 3 consent checkboxes.
 */
export const Long: React.FC<ContactFormProps> = (props) => (
  <ContactFormLayout {...props} variant="long" />
);

'use server';

import { createHash } from 'crypto';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RECIPIENT_EMAIL = 'federicomujica1@gmail.com';
const FROM_EMAIL = 'onboarding@resend.dev';

const BASE_URL = 'https://sagademo.vercel.app';
/** App uses [site]/[locale]/[[...path]] — include site and locale for correct routing */
const SITE_LOCALE = 'saga-group/en';

const UTM_CONTENT_TO_ARTICLE_PATH: Record<string, string> = {
  strasbourg_basel: `/${SITE_LOCALE}/travel/strasbourg-basel-upper-rhine`,
  sights_scenery_rhine: `/${SITE_LOCALE}/travel/sights-scenery-rhine-2026`,
  amsterdam_cologne: `/${SITE_LOCALE}/travel/amsterdam-cologne-rhine-gorge`,
};

function buildUserFakehash(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex').slice(0, 16);
}

function buildCruiseUrl(utmContent: string, userFakehash: string): string {
  const path = UTM_CONTENT_TO_ARTICLE_PATH[utmContent] ?? `/${SITE_LOCALE}/travel`;
  const params = new URLSearchParams({
    utm_source: 'newsletter',
    utm_medium: 'email',
    utm_campaign: 'subscription_confirmation',
    utm_content: utmContent,
    fakehash: userFakehash,
  });
  return `${BASE_URL}${path}?${params.toString()}`;
}

const CRUISE_OFFERS = [
  {
    image:
      'https://travel.saga.co.uk/-/media/acromas/sagatravel/images/destination/river%20cruise%20regions/rhine/rh434%20strasbourg%20basel%20and%20the%20beautiful%20rhine/search/s_dst_france_ext_37326a.jpg?h=160',
    ship: 'Spirit of the Rhine',
    title: 'Strasbourg, Basel and the Upper Rhine',
    region: 'The Rhine and her Tributaries',
    nights: '7 nights',
    save: 'Save up to 20%',
    price: 'from £2,099 per person',
    utmContent: 'strasbourg_basel',
  },
  {
    image:
      'https://travel.saga.co.uk/-/media/acromas/sagatravel/images/destination/river%20cruise%20regions/rhine/rh428%20sights%20and%20scenery%20of%20the%20rhine%202026/search/s_dst_germany_ext_31314.jpg?h=160',
    ship: '',
    title: 'Sights and Scenery of the Rhine 2026',
    region: 'The Rhine',
    nights: '7 nights',
    save: 'Save up to 25%',
    price: 'from £1,731 per person',
    utmContent: 'sights_scenery_rhine',
  },
  {
    image:
      'https://travel.saga.co.uk/-/media/acromas/sagatravel/images/destination/river%20cruise%20regions/rhine/rh43r%20amsterdam%20cologne%20and%20the%20rhine%20gorge/search/s_dst_germany_ext_36465.jpg?h=160',
    ship: 'Spirit of the Rhine',
    title: 'Amsterdam Cologne and the Rhine Gorge',
    region: 'The Rhine and Dutch Waterways',
    nights: '8 nights',
    save: 'Save up to 25%',
    price: 'from £2,091 per person',
    utmContent: 'amsterdam_cologne',
  },
] as const;

export type SubscribeResult = { success: true } | { success: false; error: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Builds the Saga-styled HTML email body for subscription confirmation
 */
function getSubscriptionEmailHtml(firstName: string, lastName: string, email: string): string {
  const userFakehash = buildUserFakehash(email);
  const cruiseCardsHtml = CRUISE_OFFERS.map((cruise, index) => {
    const url = buildCruiseUrl(cruise.utmContent, userFakehash);
    const paddingStyle =
      index === 0
        ? 'padding: 0 6px 0 0;'
        : index === 1
          ? 'padding: 0 6px;'
          : 'padding: 0 0 0 6px;';
    return `
    <td style="width: 33.33%; ${paddingStyle} vertical-align: top;">
      <a href="${url}" style="text-decoration: none; color: inherit; display: block;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #E8F4F8; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 0;">
              <img src="${cruise.image}" alt="${cruise.title}" width="160" height="90" style="display: block; width: 100%; max-width: 160px; height: auto; object-fit: cover;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 12px;">
              <p style="margin: 0 0 4px 0; color: #1B2A6B; font-size: 14px; font-weight: 600;">${cruise.title}</p>
              <p style="margin: 0; color: #1B2A6B; font-size: 13px; font-weight: 600;">${cruise.price}</p>
            </td>
          </tr>
        </table>
      </a>
    </td>`;
  }).join('');

  const cruiseCardsTableHtml = `
    <tr>
      ${cruiseCardsHtml}
    </tr>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Open Sans', Arial, Helvetica, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
      <tr>
        <td style="padding: 32px 32px 24px 32px;">
          <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
            <div style="width: 4px; height: 32px; background-color: #A8D8D8; border-radius: 9999px; flex-shrink: 0;"></div>
            <h1 style="margin: 0; color: #1B2A6B; font-size: 24px; font-weight: bold; line-height: 1.3;">Saga Magazine Subscription Confirmation</h1>
          </div>
          <p style="margin: 0 0 24px 0; color: rgba(27, 42, 107, 0.7); font-size: 14px; line-height: 1.6;">
            Thank you for subscribing to Saga Magazine. We're delighted to have you join our community.
          </p>
          <div style="background-color: #E8F4F8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; color: #1B2A6B; font-size: 14px; font-weight: 600;">Subscriber details</p>
            <p style="margin: 0; color: #1B2A6B; font-size: 14px; line-height: 1.6;">
              <strong>Name:</strong> ${firstName} ${lastName}<br>
              <strong>Email:</strong> ${email}
            </p>
          </div>
          <p style="margin: 0 0 12px 0; color: #1B2A6B; font-size: 16px; font-weight: 600;">Explore our featured river cruises</p>
          <p style="margin: 0 0 16px 0; color: rgba(27, 42, 107, 0.7); font-size: 14px; line-height: 1.6;">
            Discover these hand-picked travel destinations from Saga River Cruises:
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            ${cruiseCardsTableHtml}
          </table>
          <p style="margin: 24px 0 0 0; color: rgba(27, 42, 107, 0.6); font-size: 12px; line-height: 1.5;">
            You can unsubscribe at any time. By subscribing you agree to receive emails with related content and offers from Saga.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`.trim();
}

/**
 * Server Action: sends a subscription confirmation email to the fixed recipient
 * with Saga Magazine confirmation and travel destination offers.
 */
export async function subscribeAction(formData: FormData): Promise<SubscribeResult> {
  const firstName = (formData.get('firstName') as string)?.trim() ?? '';
  const lastName = (formData.get('lastName') as string)?.trim() ?? '';
  const email = (formData.get('email') as string)?.trim() ?? '';

  if (!firstName) {
    return { success: false, error: 'First name is required.' };
  }
  if (!lastName) {
    return { success: false, error: 'Last name is required.' };
  }
  if (!email) {
    return { success: false, error: 'Email is required.' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service is not configured. Please try again later.' };
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: RECIPIENT_EMAIL,
      subject: `New Saga Magazine Subscription - ${firstName} ${lastName}`,
      html: getSubscriptionEmailHtml(firstName, lastName, email),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: 'Failed to send confirmation. Please try again later.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Subscribe action error:', err);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
}

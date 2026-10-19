import React from 'react';
import { render } from '@testing-library/react';
import { Default } from '@/components/uiim/content/RichTextBlock';
import { WithImages as FeatureCards } from '@/components/uiim/cards/FeatureCardsGrid';
import { Default as Newsletter } from '@/components/uiim/forms/NewsletterSignup';

// Fixtures are partial on purpose: they model only the fields under test.
type RichTextBlockProps = React.ComponentProps<typeof Default>;
type FeatureCardsProps = React.ComponentProps<typeof FeatureCards>;
type NewsletterProps = React.ComponentProps<typeof Newsletter>;

// Minimal SDK helper stand-ins; props mirror what the components pass through.
type MockFieldProps<T> = { field?: { value?: T }; [prop: string]: unknown };

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => ({ page: { mode: { isEditing: false } } }),
  Text: ({ field, tag = 'span', ...props }: MockFieldProps<string> & { tag?: string }) =>
    React.createElement(tag, props, field?.value),
  RichText: ({ field, ...props }: MockFieldProps<string>) => (
    <div {...props} data-sdk-rich dangerouslySetInnerHTML={{ __html: field?.value || '' }} />
  ),
  NextImage: ({ field, ...props }: MockFieldProps<{ src?: string; alt?: string }>) => (
    <img src={field?.value?.src} alt={field?.value?.alt} {...props} />
  ),
  Link: ({
    field,
    children,
    ...props
  }: MockFieldProps<{ href?: string; text?: string }> & {
    children?: React.ReactNode;
  }) => (
    <a href={field?.value?.href} {...props}>
      {children || field?.value?.text}
    </a>
  ),
}));
const props = (editing = false, body = '<p>&nbsp;</p>') =>
  ({
    params: {},
    fields: { Title: { value: ' ' }, Body: { value: body } },
    page: { mode: { isEditing: editing } },
  }) as unknown as RichTextBlockProps;

test('blank plain text and empty Rich Text have no display wrappers but remain editable', () => {
  const view = render(<Default {...props()} />);
  expect(view.container.querySelector('h2')).toBeNull();
  expect(view.container.querySelector('[data-sdk-rich]')).toBeNull();
  view.rerender(<Default {...props(true)} />);
  expect(view.container.querySelector('h2')).not.toBeNull();
  expect(view.container.querySelector('[data-sdk-rich]')).not.toBeNull();
});

test('media-only Rich Text retains authored HTML without an empty title wrapper', () => {
  const html = '<p><img src="/content.png" alt="Diagram"></p>';
  const view = render(<Default {...props(false, html)} />);
  expect(view.container.querySelector('h2')).toBeNull();
  expect(view.container.querySelector('[data-sdk-rich]')?.innerHTML).toBe(html);
});

test('blank card text removes its padded body while keeping the image and the component', () => {
  const fields = {
    data: {
      datasource: {
        title: { jsonValue: { value: ' ' } },
        description: { jsonValue: { value: '<p>&nbsp;</p>' } },
        children: {
          results: [
            {
              id: 'card',
              cardTitle: { jsonValue: { value: ' ' } },
              cardDescription: { jsonValue: { value: '' } },
              cardImage: {
                jsonValue: { value: { src: '/card.png', alt: 'Card' } },
              },
              cardLink: { jsonValue: { value: { href: '' } } },
            },
          ],
        },
      },
    },
  };
  const view = render(
    <FeatureCards
      {...({
        params: {},
        fields,
        page: { mode: { isEditing: false } },
      } as unknown as FeatureCardsProps)}
    />,
  );
  expect(view.container.querySelector('.feature-cards-grid')).not.toBeNull();
  expect(view.container.querySelector('img')).not.toBeNull();
  expect(view.container.querySelector('.p-6')).toBeNull();
  expect(view.container.querySelector('.mb-12')).toBeNull();
  fields.data.datasource.children.results[0].cardLink.jsonValue.value.href = '/cta';
  view.rerender(
    <FeatureCards
      {...({
        params: {},
        fields,
        page: { mode: { isEditing: false } },
      } as unknown as FeatureCardsProps)}
    />,
  );
  expect(view.container.querySelector('.p-6')).not.toBeNull();
  expect(view.container.querySelector('a')).toHaveAttribute('href', '/cta');
});

test('meaningful-content checks do not replace a newsletter button label with a boolean', () => {
  const view = render(
    <Newsletter
      {...({
        params: {},
        page: { mode: { isEditing: false } },
        fields: {
          Title: { value: '' },
          Description: { value: '' },
          ButtonText: { value: 'Join updates' },
          PlaceholderText: { value: '' },
          SuccessMessage: { value: 'Thanks' },
        },
      } as unknown as NewsletterProps)}
    />,
  );
  expect(view.getByRole('button')).toHaveTextContent('Join updates');
});

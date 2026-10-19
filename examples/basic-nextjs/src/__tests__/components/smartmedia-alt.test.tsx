import React from 'react';
import { render } from '@testing-library/react';
import { SmartMedia } from '@/components/uiim/media/SmartMedia';

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => ({ page: { mode: { isEditing: false } } }),
  NextImage: ({
    field,
    ...props
  }: {
    field?: { value?: { src?: string; alt?: string } };
    [prop: string]: unknown;
  }) => <img src={field?.value?.src} alt={field?.value?.alt} {...props} />,
}));

test('SmartMedia keeps authored alt unless an explicit override is provided', () => {
  const field = {
    value: {
      src: '/image.png',
      alt: 'Authored description',
      width: 100,
      height: 100,
    },
  };
  const view = render(<SmartMedia field={field} />);
  expect(view.container.querySelector('img')).toHaveAttribute('alt', 'Authored description');
  view.rerender(<SmartMedia field={field} alt="Override" />);
  expect(view.container.querySelector('img')).toHaveAttribute('alt', 'Override');
  view.rerender(<SmartMedia field={field} alt="" />);
  expect(view.container.querySelector('img')).toHaveAttribute('alt', '');
});

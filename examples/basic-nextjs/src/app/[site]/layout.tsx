import { draftMode } from 'next/headers';
import Bootstrap from 'src/Bootstrap';
import CloudSDKInit from 'src/components/cloud-sdk/CloudSDKInit';

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const { isEnabled } = await draftMode();

  return (
    <>
      <Bootstrap siteName={site} isPreviewMode={isEnabled} />
      <CloudSDKInit />
      {children}
    </>
  );
}

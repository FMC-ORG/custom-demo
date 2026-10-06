import { defineCliConfig } from '@sitecore-content-sdk/nextjs/config-cli';
import {
  generateSites,
  generateMetadata,
  extractFiles,
  writeImportMap,
} from '@sitecore-content-sdk/nextjs/tools';
import scConfig from './sitecore.config';

export default defineCliConfig({
  config: scConfig,
  build: {
    commands: [
      generateMetadata(),
      generateSites(),
      extractFiles(),
      writeImportMap({
        paths: ['src/components'],
      }),
    ],
  },
  componentMap: {
    paths: ['src/components'],
    // Only Sitecore renderings belong in the component map. Exclude helpers that
    // are imported directly by other components or by the layout.
    exclude: [
      'src/components/content-sdk/*', // SitecoreStyles, CdpPageView (used by Layout/Scripts)
      'src/components/ui/**', // shadcn/ui primitives
      'src/components/search-experience/search-components/**', // hooks and parts of SearchExperience
      'src/components/uiim/media/SmartMedia.tsx', // wrapper used inside five components (ADR 0005)
      'src/components/**/*.props.ts', // props sidecar files
      'src/components/**/*.props.tsx',
    ],
  },
});

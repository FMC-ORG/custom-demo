'use client';

import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  LinkField,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import React from 'react';
import { ComponentProps } from 'lib/component-props';

interface ImageFields {
  Image: ImageField;
  ImageCaption: Field<string>;
  TargetUrl: LinkField;
}

interface ImageProps extends ComponentProps {
  fields: ImageFields;
}

const ImageWrapper: React.FC<{
  className: string;
  id?: string;
  children: React.ReactNode;
}> = ({ className, id, children }) => (
  <div className={className.trim()} id={id}>
    <div className="component-content">{children}</div>
  </div>
);

const ImageDefault: React.FC<ImageProps> = ({ params }) => (
  <ImageWrapper className={`component image ${params.styles}`}>
    <span className="is-empty-hint">Image</span>
  </ImageWrapper>
);

export const Banner: React.FC<ImageProps> = (props) => {
  const { params, fields } = props;
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const { styles, RenderingIdentifier: id } = params;

  const hasImage =
    fields?.Image?.value?.src || (isEditing && fields?.Image);

  if (!fields || !hasImage) {
    return (
      <div className={`component hero-banner ${styles}`.trim()} id={id}>
        <div className="component-content sc-sxa-image-hero-banner">
          <span className="is-empty-hint">Image</span>
        </div>
      </div>
    );
  }

  const imageField = {
    ...fields.Image,
    value: {
      ...fields.Image.value,
      style: { objectFit: 'cover', width: '100%', height: '100%' },
    },
  };

  const backgroundImageUrl = fields.Image?.value?.src;
  const backgroundStyle = backgroundImageUrl
    ? { backgroundImage: `url('${backgroundImageUrl}')` }
    : {};

  return (
    <div className={`component hero-banner ${styles}`.trim()} id={id}>
      <div
        className="component-content sc-sxa-image-hero-banner"
        style={backgroundStyle}
      >
        <ContentSdkImage
          field={imageField}
          editable={isEditing}
          loading="eager"
          fetchPriority="high"
        />
      </div>
    </div>
  );
};

export const Default: React.FC<ImageProps> = (props) => {
  const { fields, params, page } = props;
  const { styles, RenderingIdentifier: id } = params;

  if (!fields) {
    return <ImageDefault {...props} />;
  }

  const hasImage =
    fields.Image?.value?.src || (page?.mode?.isEditing && fields.Image);

  const ImageComponent = () => (
    <ContentSdkImage
      field={fields.Image}
      editable={page?.mode?.isEditing}
    />
  );
  const shouldWrapWithLink =
    !page?.mode?.isEditing && fields.TargetUrl?.value?.href;

  return (
    <ImageWrapper className={`component image ${styles}`} id={id}>
      {hasImage && fields.Image ? (
        shouldWrapWithLink ? (
          <ContentSdkLink field={fields.TargetUrl}>
            <ImageComponent />
          </ContentSdkLink>
        ) : (
          <ImageComponent />
        )
      ) : (
        <span className="is-empty-hint">Image</span>
      )}
      <Text
        tag="span"
        className="image-caption field-imagecaption"
        field={fields.ImageCaption}
      />
    </ImageWrapper>
  );
};

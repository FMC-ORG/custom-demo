'use client';
import React, { useState, JSX } from 'react';
import { Link as ContentSdkLink, LinkField, Text, TextField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { Menu, X, User } from "lucide-react"
import Link from "next/link"

const navLinks = [
  { label: "Insurance", href: "#" },
  { label: "Holidays", href: "#" },
  { label: "Cruises", href: "#" },
  { label: "Money", href: "#" },
  { label: "Magazine", href: "#" },
]


interface Fields {
  Id: string;
  DisplayName: string;
  Title: TextField;
  NavigationTitle: TextField;
  Href: string;
  Querystring: string;
  Children: Array<Fields>;
  Styles: string[];
}

interface NavigationListItemProps {
  fields: Fields;
  handleClick: (event?: React.MouseEvent<HTMLElement>) => void;
  relativeLevel: number;
}

interface NavigationProps extends ComponentProps {
  fields: Fields;
}

const getTextContent = (fields: Fields): JSX.Element | string => {
  if (fields.NavigationTitle) return <Text field={fields.NavigationTitle} />;
  if (fields.Title) return <Text field={fields.Title} />;
  return fields.DisplayName;
};

const getLinkField = (fields: Fields): LinkField => {
  const linkField: LinkField = {
    value: {
      href: fields.Href,
      title:
        fields.NavigationTitle?.value?.toString() ??
        fields.Title?.value?.toString() ??
        fields.DisplayName,
    },
  };

  // Only add querystring if it exists
  if (fields.Querystring) {
    linkField.value.querystring = fields.Querystring;
  }

  return linkField;
};

const NavigationListItem: React.FC<NavigationListItemProps> = ({
  fields,
  handleClick,
  relativeLevel,
}) => {
  const [isActive, setIsActive] = useState(false);
  const { page } = useSitecore();

  const classNames = [...fields.Styles, `rel-level${relativeLevel}`, isActive ? 'active' : ''].join(
    ' '
  );

  const hasChildren = fields.Children?.length > 0;
  const children = hasChildren
    ? fields.Children.map((fields, index) => (
        <NavigationListItem
          key={`${index}-${fields.Id}`}
          fields={fields}
          handleClick={handleClick}
          relativeLevel={relativeLevel + 1}
        />
      ))
    : null;

  return (
    <li className={classNames} key={fields.Id} tabIndex={0}>
      <div
        className={`navigation-title ${hasChildren ? 'child' : ''}`}
        onClick={() => setIsActive(!isActive)}
      >
        <ContentSdkLink field={getLinkField(fields)} editable={page.mode.isEditing} onClick={handleClick}>
          {getTextContent(fields)}
        </ContentSdkLink>
      </div>
      {hasChildren && <ul className="clearfix">{children}</ul>}
    </li>
  );
};

export const Default = ({ params, fields }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="#" className="flex-shrink-0">
            <svg
              viewBox="0 0 200 50"
              className="h-8 w-auto"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="0"
                y="40"
                fontFamily="Georgia, serif"
                fontSize="42"
                fontWeight="400"
                letterSpacing="6"
                fill="#1B2A6B"
              >
                SAGA
              </text>
            </svg>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-saga-navy font-semibold text-sm hover:underline underline-offset-4 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* MySaga Button */}
          <div className="hidden md:flex items-center">
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-md bg-saga-teal px-4 py-2 text-sm font-semibold text-saga-navy hover:bg-saga-teal/80 transition-colors"
            >
              <User className="h-4 w-4" />
              MySaga
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-saga-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-saga-navy font-semibold text-sm hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-md bg-saga-teal px-4 py-2 text-sm font-semibold text-saga-navy w-fit"
            >
              <User className="h-4 w-4" />
              MySaga
            </Link>
          </div>
        </div>
      )}
    </header>
  )
};

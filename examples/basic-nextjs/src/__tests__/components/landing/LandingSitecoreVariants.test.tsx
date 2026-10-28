import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "lib/component-props";
import { Sitecore as HeroSitecore } from "@/components/uiim/landing/LandingHero";
import { Sitecore as FeaturesSitecore } from "@/components/uiim/landing/LandingFeatures";
import { Sitecore as StatsSitecore } from "@/components/uiim/landing/LandingStats";
import { Sitecore as SocialProofSitecore } from "@/components/uiim/landing/LandingSocialProof";
import { Sitecore as FAQSitecore } from "@/components/uiim/landing/LandingFAQ";
import { Sitecore as FinalCTASitecore } from "@/components/uiim/landing/LandingFinalCTA";

type MockField = { value?: unknown };
type LinkValue = { href?: string; text?: string };

jest.mock("@sitecore-content-sdk/nextjs", () => {
  const R = jest.requireActual("react");
  return {
    Text: ({ field, tag, ...rest }: { field?: MockField; tag?: string }) =>
      R.createElement(tag || "span", rest, (field?.value as string) || ""),
    RichText: ({ field, ...rest }: { field?: MockField }) =>
      R.createElement("div", {
        ...rest,
        dangerouslySetInnerHTML: { __html: field?.value || "" },
      }),
    NextImage: ({
      field,
      className,
    }: {
      field?: { value?: { src?: string; alt?: string } };
      className?: string;
    }) =>
      R.createElement("img", {
        src: field?.value?.src,
        alt: field?.value?.alt,
        className,
        "data-testid": "sdk-image",
      }),
    Link: ({
      field,
      children,
      ...rest
    }: {
      field?: { value?: LinkValue };
      children?: React.ReactNode;
      showLinkTextWithChildrenPresent?: boolean;
    }) => {
      delete rest.showLinkTextWithChildrenPresent;
      return R.createElement(
        "a",
        { href: field?.value?.href, ...rest },
        field?.value?.text,
        children,
      );
    },
  };
});

const f = (value: unknown) => ({ value });
const link = (href: string, text: string) => ({ value: { href, text } });

const routeFields = {
  heroEyebrow: f("AI and agents"),
  heroHeadline: f("AI and agents that understand your brand"),
  heroSubhead: f("Put 20+ pre-built agents to work."),
  heroPrimaryCta: link("/demo", "Request a demo"),
  heroSecondaryCta: link("/agents", "Agents in action"),
  heroImage: f({ src: "/hero.jpg", alt: "Hero", width: 1200, height: 800 }),
  feature1IconName: f("Bot"),
  feature1Title: f("Create content"),
  feature1Description: f("<p>Briefs, copy and images.</p>"),
  feature2Title: f("Get discovered"),
  feature2Description: f("<p>Search and AI visibility.</p>"),
  feature3Title: f("Make it personal"),
  feature3Description: f("<p>ABM at scale.</p>"),
  stat1Number: f("20+"),
  stat1Label: f("Pre-built agents"),
  stat2Number: f("3x"),
  stat2Label: f("Faster content"),
  stat3Number: f("0"),
  stat3Label: f("Token limits"),
  testimonialQuote: f("<p>SitecoreAI changed how we work.</p>"),
  testimonialAuthorName: f("Jane Smith"),
  testimonialAuthorTitle: f("CMO, Example"),
  testimonialAuthorImage: f({ src: "/jane.jpg", alt: "Jane" }),
  partnerLogosImage: f({ src: "/logos.png", alt: "Partners" }),
  faq1Question: f("What is SitecoreAI?"),
  faq1Answer: f("<p>A cloud-native DXP.</p>"),
  faq2Question: f("Do I pay extra for AI?"),
  faq2Answer: f("<p>No.</p>"),
  finalCtaHeadline: f("Put AI agents to work"),
  finalCtaSubhead: f("<p>See it in action.</p>"),
  finalCtaButton: link("/demo", "Request a demo"),
};

const without = (fields: Record<string, unknown>, ...keys: string[]) =>
  Object.fromEntries(Object.entries(fields).filter(([k]) => !keys.includes(k)));

const makeProps = (fields: Record<string, unknown> | null, isEditing = false) =>
  ({
    rendering: { componentName: "Landing" },
    params: { styles: "custom-style", RenderingIdentifier: "rid" },
    page: {
      mode: { isEditing },
      layout: { sitecore: { route: fields ? { fields } : null } },
    },
  }) as unknown as ComponentProps;

const variants = [
  ["LandingHero", HeroSitecore],
  ["LandingFeatures", FeaturesSitecore],
  ["LandingStats", StatsSitecore],
  ["LandingSocialProof", SocialProofSitecore],
  ["LandingFAQ", FAQSitecore],
  ["LandingFinalCTA", FinalCTASitecore],
] as const;

describe("Landing Sitecore variants", () => {
  it.each(variants)(
    "%s renders the empty-state hint without route fields",
    (name, Variant) => {
      render(<Variant {...makeProps(null)} />);
      expect(screen.getByText(name)).toBeInTheDocument();
    },
  );

  it.each(variants)(
    "%s keeps params.styles and RenderingIdentifier on the wrapper",
    (_n, Variant) => {
      const { container } = render(<Variant {...makeProps(routeFields)} />);
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper).toHaveClass("component", "custom-style");
      expect(wrapper).toHaveAttribute("id", "rid");
    },
  );

  describe("LandingHero", () => {
    it("renders eyebrow, headline, subhead, both CTAs and media", () => {
      render(<HeroSitecore {...makeProps(routeFields)} />);
      expect(screen.getByTestId("hero-eyebrow")).toHaveTextContent(
        "AI and agents",
      );
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "AI and agents that understand your brand",
      );
      expect(screen.getByTestId("hero-subhead")).toBeInTheDocument();
      expect(screen.getByTestId("hero-primary-cta")).toHaveAttribute(
        "href",
        "/demo",
      );
      expect(screen.getByTestId("hero-secondary-cta")).toHaveAttribute(
        "href",
        "/agents",
      );
      expect(screen.getByTestId("hero-media")).toBeInTheDocument();
    });

    it("drops the media column and empty CTA when content is missing", () => {
      render(
        <HeroSitecore
          {...makeProps(without(routeFields, "heroImage", "heroSecondaryCta"))}
        />,
      );
      expect(screen.queryByTestId("hero-media")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("hero-secondary-cta"),
      ).not.toBeInTheDocument();
    });

    it("keeps empty fields editable in the editor", () => {
      render(<HeroSitecore {...makeProps({ heroHeadline: f("") }, true)} />);
      expect(screen.getByTestId("hero-eyebrow")).toBeInTheDocument();
      expect(screen.getByTestId("hero-subhead")).toBeInTheDocument();
      expect(screen.getByTestId("hero-media")).toBeInTheDocument();
    });
  });

  it("LandingFeatures renders one card per authored feature", () => {
    render(<FeaturesSitecore {...makeProps(routeFields)} />);
    expect(screen.getAllByTestId("feature-card")).toHaveLength(3);
    expect(screen.getByText("Create content")).toBeInTheDocument();
  });

  it("LandingStats renders gradient numbers with labels and hides empty tiles", () => {
    render(
      <StatsSitecore
        {...makeProps(without(routeFields, "stat3Number", "stat3Label"))}
      />,
    );
    expect(screen.getAllByTestId("stat-tile")).toHaveLength(2);
    expect(screen.getByText("20+")).toBeInTheDocument();
  });

  describe("LandingSocialProof", () => {
    it("renders the quote, author and logo strip", () => {
      render(<SocialProofSitecore {...makeProps(routeFields)} />);
      expect(
        screen.getByText("SitecoreAI changed how we work."),
      ).toBeInTheDocument();
      expect(screen.getByTestId("testimonial-author-name")).toHaveTextContent(
        "Jane Smith",
      );
      expect(screen.getByTestId("partner-logos")).toBeInTheDocument();
    });

    it("hides the logo strip when no logos image is set", () => {
      render(
        <SocialProofSitecore
          {...makeProps(without(routeFields, "partnerLogosImage"))}
        />,
      );
      expect(screen.queryByTestId("partner-logos")).not.toBeInTheDocument();
    });
  });

  describe("LandingFAQ", () => {
    it("hides empty pairs and opens the first item by default", () => {
      render(<FAQSitecore {...makeProps(routeFields)} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
      expect(buttons[1]).toHaveAttribute("aria-expanded", "false");
    });

    it("toggles items on click", () => {
      render(<FAQSitecore {...makeProps(routeFields)} />);
      const [first, second] = screen.getAllByRole("button");
      fireEvent.click(second);
      expect(first).toHaveAttribute("aria-expanded", "false");
      expect(second).toHaveAttribute("aria-expanded", "true");
      fireEvent.click(second);
      expect(second).toHaveAttribute("aria-expanded", "false");
    });

    it("shows all five items expanded in the editor", () => {
      render(<FAQSitecore {...makeProps({}, true)} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(5);
      buttons.forEach((b) =>
        expect(b).toHaveAttribute("aria-expanded", "true"),
      );
    });
  });

  it("LandingFinalCTA renders headline, subhead and button", () => {
    render(<FinalCTASitecore {...makeProps(routeFields)} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Put AI agents to work",
    );
    expect(screen.getByTestId("final-cta-subhead")).toBeInTheDocument();
    expect(screen.getByTestId("final-cta-button")).toHaveAttribute(
      "href",
      "/demo",
    );
  });
});

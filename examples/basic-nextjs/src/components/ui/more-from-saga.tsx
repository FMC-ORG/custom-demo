import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

const items = [
  {
    image: "/images/health-insurance.jpg",
    title: "Saga Health Insurance",
    description:
      "Get 3 months free + \u00a3125 Wellness Gift Card when you buy direct from us. Start your new policy by 19 Feb 2026. T&Cs apply.",
    cta: "Get a quote now",
    href: "#",
  },
  {
    image: "/images/travel-offers.jpg",
    title: "Do not miss these Saga travel offers",
    description:
      "New Lower Fares on cruises, plus 10% and more on tours and hotel stays of 14 nights or longer.",
    cta: "Book now",
    href: "#",
  },
  {
    image: "/images/podcast.jpg",
    title: "Listen to Saga\u2019s new podcast",
    description:
      "Experience is Everything \u2013 Jenni Murray talks to household names about their extraordinary lives",
    cta: "Listen now",
    href: "#",
  },
  {
    image: "/images/connections.jpg",
    title: "Find friendship or romance",
    description:
      "Our online matching service brings you closer to like-minded people on a site you can trust. Join Saga Connections and create your free profile today.",
    cta: "Find out more",
    href: "#",
  },
]

export function MoreFromSaga() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-1 h-8 bg-saga-teal rounded-full mt-1 flex-shrink-0" />
          <h2 className="text-2xl md:text-3xl font-bold text-saga-navy">More from Saga</h2>
        </div>
        <p className="text-sm md:text-base text-saga-navy/70 mb-8 ml-4 max-w-2xl">
          {
            "We\u2019ve got loads of insider guides, expert advice and a bit of fun, from buying a house, investing in stocks and shares, budgeting and a shed-load more."
          }
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="bg-background rounded-lg overflow-hidden border border-border/50 shadow-sm"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 flex flex-col">
                <h3 className="text-base font-bold text-saga-navy leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-saga-navy/70 leading-relaxed flex-1">
                  {item.description}
                </p>
                <Link
                  href={item.href}
                  className="mt-4 inline-flex items-center gap-1 text-saga-navy font-semibold text-sm hover:underline"
                >
                  <span className="flex items-center justify-center h-6 w-6 rounded-full border-2 border-saga-teal">
                    <ChevronRight className="h-3.5 w-3.5 text-saga-navy" />
                  </span>
                  {item.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

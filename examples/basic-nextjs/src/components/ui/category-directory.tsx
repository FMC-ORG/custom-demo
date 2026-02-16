import { Shield, Umbrella, Ship, PiggyBank, BookOpen, Wine, Heart, User } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    icon: Shield,
    title: "Saga Insurance",
    description: "Car, home, travel and health \u2013 we\u2019ve got you covered.",
    cta: "Go to Saga Insurance",
    href: "#",
  },
  {
    icon: Umbrella,
    title: "Saga Holidays",
    description: "Discover a holiday created with you in mind.",
    cta: "Go to Saga Holidays",
    href: "#",
  },
  {
    icon: Ship,
    title: "Saga Cruises",
    description: "Luxury, all-inclusive cruising to a host of exciting destinations.",
    cta: "Go to Saga Cruises",
    href: "#",
  },
  {
    icon: PiggyBank,
    title: "Saga Money",
    description: "Products to help you feel good about your finances.",
    cta: "Go to Saga Money",
    href: "#",
  },
  {
    icon: BookOpen,
    title: "Saga Magazine",
    description: "Widen your world with our award-winning magazine.",
    cta: "Go to Saga Magazine",
    href: "#",
  },
  {
    icon: Wine,
    title: "Vintage by Saga",
    description: "Great value, carefully chosen wines, by the bottle or case.",
    cta: "Go to Vintage by Saga",
    href: "#",
  },
  {
    icon: Heart,
    title: "Saga Connections",
    description: "Find love, friendship and fun online.",
    cta: "Join today",
    href: "#",
  },
  {
    icon: User,
    title: "MySaga",
    description: "View your quotes and manage holiday bookings.",
    cta: "Log in to MySaga",
    href: "#",
  },
]

export function CategoryDirectory() {
  return (
    <section className="bg-saga-light-blue py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <div
                key={cat.title}
                className="bg-background rounded-lg p-6 flex flex-col shadow-sm border border-border/50"
              >
                <Icon className="h-8 w-8 text-saga-navy mb-3" strokeWidth={1.5} />
                <h3 className="text-lg font-bold text-saga-navy">{cat.title}</h3>
                <p className="mt-2 text-sm text-saga-navy/70 leading-relaxed flex-1">
                  {cat.description}
                </p>
                <Link
                  href={cat.href}
                  className="mt-4 inline-block w-fit rounded-md bg-saga-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
                >
                  {cat.cta}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

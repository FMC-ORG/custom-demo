import { Award, Star, Trophy } from "lucide-react"

const awards = [
  {
    icon: Award,
    topText: "May 2025",
    title: "Which?",
    subtitle: "Best Buy",
    bottomText: "Travel Insurance",
    detail: "Standard & Plus",
  },
  {
    icon: Trophy,
    topText: "Winner",
    title: "British Travel",
    subtitle: "Awards 2024",
    bottomText: "Best Cruise Line",
    detail: "for Luxury Holidays",
  },
  {
    icon: Award,
    topText: "March 2025",
    title: "Which?",
    subtitle: "Recommended",
    bottomText: "Provider",
    detail: "Ocean Cruises",
  },
  {
    icon: Star,
    topText: "British Travel",
    title: "Awards 2024",
    subtitle: "Winner",
    bottomText: "19 Awards",
    detail: "",
  },
  {
    icon: Trophy,
    topText: "Silver Travel",
    title: "Awards 2024",
    subtitle: "Winner",
    bottomText: "",
    detail: "",
  },
]

export function AwardsSection() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-1 h-8 bg-saga-teal rounded-full mt-1 flex-shrink-0" />
          <h2 className="text-2xl md:text-3xl font-bold text-saga-navy text-balance">
            Award-winning service you can trust
          </h2>
        </div>
        <p className="text-sm md:text-base text-saga-navy/70 mb-10 ml-4 max-w-xl">
          We are delighted that our dedication to providing our customers with products and services
          tailored to them has been recognised through a variety of awards and reviews.
        </p>

        {/* Awards strip */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 via-amber-50/50 to-rose-50 py-10 px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {awards.map((award, i) => {
              const Icon = award.icon
              return (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <div className="h-20 w-20 rounded-full border-2 border-saga-navy/20 flex flex-col items-center justify-center bg-background shadow-sm">
                    <span className="text-[8px] text-saga-navy/50 uppercase font-semibold leading-none">
                      {award.topText}
                    </span>
                    <span className="text-sm font-extrabold text-saga-navy leading-tight">
                      {award.title}
                    </span>
                    <span className="text-[10px] font-bold text-saga-navy leading-none">
                      {award.subtitle}
                    </span>
                    {award.bottomText && (
                      <span className="text-[8px] text-saga-navy/50 uppercase leading-none">
                        {award.bottomText}
                      </span>
                    )}
                  </div>
                  {award.detail && (
                    <span className="text-xs text-saga-navy/60 font-medium">{award.detail}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

import Image from "next/image"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

const trustPoints = [
  {
    title: "A trusted British brand",
    description:
      "One of UK\u2019s most trusted brands for people over 50, known for our high quality products and exceptional standards of service.",
  },
  {
    title: "Designed for the over-50s",
    description:
      "With more than 70 years experience of designing and delivering award-winning products for the over-50s, your needs are our first thought, not an afterthought.",
  },
  {
    title: "Award winning",
    description:
      "We regularly win awards. Our Ocean Cruises and All-Inclusive Holidays are Which Recommended.",
  },
]

export function TrustSection() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-1 h-8 bg-saga-teal rounded-full mt-1 flex-shrink-0" />
          <h2 className="text-2xl md:text-3xl font-bold text-saga-navy text-balance">
            Delivering exceptional experiences every day
          </h2>
        </div>
        <p className="text-base md:text-lg text-saga-navy/70 mb-8 ml-4">
          You can trust us to take care of the details that matter
        </p>

        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {/* Trust points */}
          <div className="flex-1">
            <div className="flex flex-col gap-6">
              {trustPoints.map((point) => (
                <div key={point.title} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-saga-navy text-base">{point.title}</h3>
                    <p className="mt-1 text-sm text-saga-navy/70 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="#"
              className="mt-8 inline-block rounded-md bg-saga-navy px-6 py-3 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
            >
              Learn more about Saga
            </Link>
          </div>

          {/* Image */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative h-72 md:h-96 rounded-xl overflow-hidden">
              <Image
                src="/images/couple-hiking.jpg"
                alt="Happy couple hiking in an autumn forest"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import Image from "next/image"
import Link from "next/link"

export function TravelInsuranceBanner() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="relative h-[400px] md:h-[350px]">
        <Image
          src="/images/travel-insurance-beach.jpg"
          alt="Beach chairs on a tropical beach at sunset"
          fill
          className="object-cover"
        />
        {/* Overlay tint */}
        <div className="absolute inset-0 bg-saga-navy/40" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Left card */}
              <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-md shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold text-saga-navy">
                  Saga Travel Insurance
                </h2>
                <p className="mt-3 text-sm text-saga-navy/80 leading-relaxed">
                  {
                    "Enjoy quality cover with Saga\u2019s Plus and Standard options, named Which? Best Buys so you can choose your travel insurance with confidence."
                  }
                </p>
                <Link
                  href="#"
                  className="mt-5 inline-block rounded-md bg-saga-navy px-6 py-3 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
                >
                  Get your quote today
                </Link>
              </div>

              {/* Right badge */}
              <div className="hidden md:flex flex-col items-center gap-2">
                <div className="bg-background rounded-full h-28 w-28 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-[10px] font-bold text-saga-navy uppercase">May 2025</span>
                  <span className="text-lg font-extrabold text-saga-navy leading-tight">
                    {"Which?"}
                  </span>
                  <span className="text-xs font-bold text-saga-navy">Best Buy</span>
                  <span className="text-[9px] text-saga-navy/60 uppercase mt-0.5">
                    Travel Insurance
                  </span>
                </div>
                <span className="text-sm font-semibold text-white">Standard & Plus</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

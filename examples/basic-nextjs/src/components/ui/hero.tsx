import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Image */}
      <div className="relative h-[500px] md:h-[560px]">
        <Image
          src="/images/hero.jpg"
          alt="Active older man stretching outdoors in a park"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay Card */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-4 sm:mx-8 md:mx-16 lg:mx-20 max-w-lg">
            <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-saga-navy leading-tight tracking-tight text-balance">
                GET YOUR MONEY MOVING WITH SAGA
              </h1>
              <p className="mt-4 text-sm md:text-base text-saga-navy/80 leading-relaxed">
                Designed for people over 50, the new Saga Easy Access Savings Account is offering 4.00% / 3.93% AER/Gross p.a. (variable). Includes a 1.25% AER fixed bonus for one year. Interest paid monthly.
              </p>
              <Link
                href="#"
                className="mt-6 inline-block w-full text-center rounded-md bg-saga-navy px-8 py-3.5 text-sm font-semibold text-white hover:bg-saga-dark-navy transition-colors"
              >
                Boost your savings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

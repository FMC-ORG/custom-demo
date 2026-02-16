import Link from "next/link"

const footerColumns = [
  {
    title: "Our company",
    links: [
      { label: "About us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Investor relations", href: "#", external: true },
      { label: "Newsroom", href: "#", external: true },
      { label: "Shareholder services", href: "#", external: true },
      { label: "Corporate", href: "#", external: true },
    ],
  },
  {
    title: "Our products",
    links: [
      { label: "Insurance", href: "#" },
      { label: "Holidays", href: "#" },
      { label: "Cruises", href: "#" },
      { label: "Money", href: "#" },
      { label: "Magazine", href: "#" },
    ],
  },
  {
    title: "More from us",
    links: [
      { label: "Hear more from us", href: "#" },
      { label: "Generation Experience", href: "#" },
      { label: "Saga Connections", href: "#", external: true },
      { label: "Vintage by Saga", href: "#", external: true },
    ],
  },
  {
    title: "Other information",
    links: [
      { label: "Cookie settings", href: "#" },
      { label: "Cookie policy", href: "#" },
      { label: "Privacy policy", href: "#" },
      { label: "Terms and conditions", href: "#" },
      { label: "Modern slavery statement", href: "#" },
      { label: "Gender pay review", href: "#" },
      { label: "Customer reviews policy", href: "#" },
      { label: "Sitemap", href: "#" },
    ],
  },
  {
    title: "Contact us",
    links: [
      { label: "Log in to MySaga", href: "#" },
      { label: "Get in touch", href: "#" },
      { label: "Make a complaint", href: "#" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-saga-navy text-white">
      {/* Decorative top strip */}
      <div className="h-12 bg-gradient-to-r from-saga-teal via-cyan-500 to-saga-teal opacity-60" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo and 1951 badge */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-10">
          <svg
            viewBox="0 0 200 50"
            className="h-8 w-auto mb-4 sm:mb-0"
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
              fill="white"
            >
              SAGA
            </text>
          </svg>

          <div className="flex flex-col items-center">
            <span className="text-xs tracking-[0.4em] text-white/60 mb-1">1 9 5 1</span>
            <div className="h-10 w-10 rounded-full border border-white/30 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold mb-4 text-white">{col.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white hover:underline transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      {link.external && (
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social icons */}
        <div className="flex items-center justify-end gap-4 mt-8">
          {/* X (Twitter) */}
          <Link href="#" aria-label="Follow us on X" className="text-white/70 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </Link>
          {/* Facebook */}
          <Link href="#" aria-label="Follow us on Facebook" className="text-white/70 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <p>
              Registered office: 3 Pancras Square, London, United Kingdom, N1C 4AG
            </p>
            <p>&copy; Saga 2026</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

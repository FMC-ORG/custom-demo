"use client"

import { useState } from "react"
import { Menu, X, User } from "lucide-react"
import Link from "next/link"

const navLinks = [
  { label: "Insurance", href: "#" },
  { label: "Holidays", href: "#" },
  { label: "Cruises", href: "#" },
  { label: "Money", href: "#" },
  { label: "Magazine", href: "#" },
]

export function Header() {
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
}

"use client"

import { useState } from "react"

export function Newsletter() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")

  return (
    <section className="py-12 md:py-16 bg-saga-light-blue">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-1 h-8 bg-saga-teal rounded-full mt-1 flex-shrink-0" />
          <h2 className="text-2xl md:text-3xl font-bold text-saga-navy text-balance">
            Sign up to our free Saga Magazine newsletter
          </h2>
        </div>
        <p className="text-sm text-saga-navy/70 mb-8 ml-4 leading-relaxed">
          Get inspiring real-life stories, expert health advice, finance news and our hugely popular
          puzzles delivered direct to your inbox. Plus news and offers from Saga Magazine and our
          carefully chosen partners.
        </p>

        {/* Form */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-background rounded-xl p-6 md:p-8 shadow-sm border border-border/50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-semibold text-saga-navy mb-1.5"
              >
                First name <span className="text-destructive">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full rounded-md border border-input px-3 py-2.5 text-sm text-saga-navy placeholder:text-saga-navy/40 focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-semibold text-saga-navy mb-1.5"
              >
                Last name <span className="text-destructive">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full rounded-md border border-input px-3 py-2.5 text-sm text-saga-navy placeholder:text-saga-navy/40 focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-saga-navy mb-1.5"
              >
                Email Address <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full rounded-md border border-input px-3 py-2.5 text-sm text-saga-navy placeholder:text-saga-navy/40 focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>
            <button
              type="submit"
              className="rounded-md border-2 border-saga-navy bg-background px-6 py-2.5 text-sm font-semibold text-saga-navy hover:bg-saga-navy hover:text-white transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
          <p className="mt-4 text-xs text-saga-navy/60 leading-relaxed">
            By providing your details you will receive emails with related content and offers from
            Saga. You can unsubscribe at any time.
          </p>
        </form>
      </div>
    </section>
  )
}

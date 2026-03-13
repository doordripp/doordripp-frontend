import React from 'react'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <header className="bg-white/90 border border-amber-100 shadow-lg shadow-amber-100/40 rounded-3xl p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-amber-700 uppercase">
            About Us
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-neutral-900 leading-tight">
            DOORDRIPP is India's fastest wardrobe rescue.
          </h1>
          <p className="mt-4 text-lg text-neutral-700 leading-relaxed">
            DOORDRIPP is not just an platform; we are India's newest and most essential fashion-tech platform, here to solve your wardrobe emergencies, one minute at a time. We're changing the game by bringing the future of fashion directly to your doorstep delivered instantly.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-sm shadow-amber-100/50">
            <h2 className="text-2xl font-semibold text-neutral-900">The DOORDRIPP Promise: Style in a Snap</h2>
            <p className="mt-3 text-neutral-700 leading-relaxed">
              Imagine this scenario: You have a meeting in an hour and you do not have a formal white shirt. Stress? Not anymore. You simply order it on the DOORDRIPP app and it will be delivered to the doorstep in minutes.
            </p>
          </div>

          <div className="bg-neutral-900 text-white rounded-2xl p-8 shadow-lg shadow-neutral-900/20">
            <h2 className="text-2xl font-semibold">Why DOORDRIPP?</h2>
            <p className="mt-3 text-neutral-100 leading-relaxed">
              We believe that your life shouldn't be governed by shipping times. Our customers are dynamic, busy, and demand instant solutions. We give you the peace of mind to live spontaneously, knowing that if your outfit plan fails, we are literally minutes away from saving the day.
            </p>
          </div>
        </section>

        <section className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-sm shadow-amber-100/40">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-neutral-900">Our Commitment</h3>
            <blockquote className="text-neutral-700 leading-relaxed border-l-4 border-amber-500 pl-4">
              "We are committed to partnering primarily with local and ethical retailers who prioritize quality and sustainable practices. Fast fashion doesn't have to mean throwaway fashion."
            </blockquote>
            <p className="text-neutral-700 leading-relaxed">DOORDRIPP is owned by Doordripp.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

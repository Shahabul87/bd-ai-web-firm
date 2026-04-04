import Button from '../ui/Button';

export default function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-16 sm:px-16 sm:py-24 text-center">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Build Something Great?
            </h2>
            <p className="mt-4 text-lg text-indigo-100 max-w-xl mx-auto">
              Get a free consultation &mdash; no commitment, no pressure
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/quote"
                className="inline-flex items-center justify-center rounded-lg font-medium px-8 py-3 text-base bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg shadow-indigo-900/30 transition-all duration-200"
              >
                Get a Free Quote
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg font-medium px-8 py-3 text-base border border-white/30 text-white hover:bg-white/10 transition-all duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

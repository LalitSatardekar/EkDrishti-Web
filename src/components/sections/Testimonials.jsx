import { testimonials } from '../../data/content'

export const TestimonialCard = ({ t, featured = false }) => (
  <div
    className={`glass-card p-8 flex flex-col gap-6 rounded-2xl border transition-all duration-300 ${
      featured
        ? 'border-accent/30 shadow-[0_0_32px_rgba(37,99,235,0.15)]'
        : 'border-borderSubtle hover:border-accent/20 hover:shadow-[0_0_18px_rgba(37,99,235,0.08)]'
    }`}
  >
    {/* Stars */}
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>

    {/* Quote */}
    <div className="relative">
      <span className="absolute -top-3 -left-1 text-5xl leading-none text-amber-400/30 font-serif select-none" aria-hidden="true">&ldquo;</span>
      <p className="text-textPrimary text-base leading-relaxed italic pl-5">
        {t.quote}
      </p>
    </div>

    {/* Author */}
    <div className="flex items-center gap-3 mt-auto pt-2 border-t border-borderSubtle">
      <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover shrink-0" />
      <div>
        <p className="font-heading font-semibold text-sm text-textPrimary">{t.author}</p>
        <p className="text-xs text-textSecondary">{t.role}</p>
      </div>
    </div>
  </div>
)

const Testimonials = () => (
  <section className="py-24">
    <div className="section-container">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase rounded-full bg-accent/10 border border-accent/20 text-accentLight">
          Client Stories
        </span>
        <h2 className="text-4xl font-heading font-bold text-textPrimary mb-4">
          Trusted by{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accentLight">
            Industry Leaders
          </span>
        </h2>
        <p className="text-textSecondary max-w-xl mx-auto">
          Real results from real partnerships — hear directly from the brands we&apos;ve helped grow.
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 via-transparent to-transparent rounded-3xl blur-2xl pointer-events-none" aria-hidden="true" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.id} t={t} featured={i === 0} />
          ))}
        </div>
      </div>
    </div>
  </section>
)

export default Testimonials
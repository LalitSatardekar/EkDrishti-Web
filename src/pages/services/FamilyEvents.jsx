const FamilyEvents = () => {
  return (
    <div className="py-24">
      <div className="section-container">
        {/* Hero */}
        <div className="text-center mb-20">
          <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium">
            Family Events
          </span>
          <h1 className="mt-6 text-5xl md:text-6xl font-heading font-bold text-textPrimary mb-6">
            Celebrate Every
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-accentLight to-amber-400">
              Special Moment
            </span>
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            From intimate gatherings to grand celebrations — we craft unforgettable family events with meticulous attention to every detail.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {[
            { icon: '💍', title: 'Weddings', desc: 'Full-service wedding planning, décor, and coordination tailored to your love story.' },
            { icon: '🎂', title: 'Birthday Celebrations', desc: 'Milestone birthdays made extraordinary — from intimate dinners to lavish parties.' },
            { icon: '🎓', title: 'Graduations', desc: 'Commemorate academic achievements with elegantly styled celebration events.' },
            { icon: '👶', title: 'Baby Showers', desc: 'Warm, whimsical baby shower experiences that celebrate new beginnings.' },
            { icon: '🥂', title: 'Anniversaries', desc: 'Romantic anniversary celebrations crafted to honour your journey together.' },
            { icon: '🏡', title: 'Family Reunions', desc: 'Bringing generations together with expertly organised reunion experiences.' },
          ].map((s) => (
            <div key={s.title} className="group glass-card p-8 hover:-translate-y-2 transition-all duration-300 border-borderSubtle hover:border-amber-500/30 hover:shadow-[0_0_28px_rgba(245,158,11,0.10)]">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <h3 className="text-xl font-heading font-bold text-textPrimary mb-3 group-hover:text-amber-400 transition-colors duration-300">{s.title}</h3>
              <p className="text-textSecondary leading-relaxed text-sm">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a href="/contact" className="btn-primary inline-block">Plan Your Event</a>
        </div>
      </div>
    </div>
  )
}

export default FamilyEvents

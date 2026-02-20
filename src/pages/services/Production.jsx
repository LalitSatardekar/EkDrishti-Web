const Production = () => {
  return (
    <div className="py-24">
      <div className="section-container">
        {/* Hero */}
        <div className="text-center mb-20">
          <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium">
            Production
          </span>
          <h1 className="mt-6 text-5xl md:text-6xl font-heading font-bold text-textPrimary mb-6">
            Visuals That
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-accentLight to-amber-400">
              Tell Your Story
            </span>
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            High-end photo and video production that captures moments, elevates brands, and leaves a lasting impression.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {[
            { icon: '🎥', title: 'Video Production', desc: 'Brand films, commercials, reels, and corporate videos crafted with cinematic precision.' },
            { icon: '📸', title: 'Photography', desc: 'Professional brand, product, and event photography that tells compelling visual stories.' },
            { icon: '🎬', title: 'Post-Production', desc: 'Expert editing, colour grading, motion graphics, and sound design for polished output.' },
            { icon: '🎙️', title: 'Podcast Production', desc: 'End-to-end podcast setup, recording, editing, and distribution support.' },
            { icon: '🖥️', title: 'Motion Graphics', desc: '2D/3D animations and kinetic typography that bring your brand message to life.' },
            { icon: '🎞️', title: 'Event Coverage', desc: 'Live and multi-camera event filming with same-day highlight reel delivery.' },
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
          <a href="/contact" className="btn-primary inline-block">Start a Production Project</a>
        </div>
      </div>
    </div>
  )
}

export default Production

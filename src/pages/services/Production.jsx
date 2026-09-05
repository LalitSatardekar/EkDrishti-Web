import { useState } from 'react'
import MindMapHero from '../../components/hero/MindMapHero'
import ProductionPreview from '../../components/services/ProductionPreview'
import ContactModal from '../../components/ui/ContactModal'
import { trackButtonClick } from '../../lib/analytics'

const Production = () => {
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <div className="bg-primary">
      {/* Mind Map Hero */}
      <MindMapHero serviceType="production" />

      {/* Services Preview Section */}
      <ProductionPreview />

      {/* Services Grid */}
      <div className="section-container py-24">

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
          <button
            type="button"
            onClick={() => {
              trackButtonClick('Start a Production Project', 'production_cta')
              setIsContactOpen(true)
            }}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-all duration-300"
          >
            Start a Production Project
          </button>
        </div>
      </div>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  )
}

export default Production

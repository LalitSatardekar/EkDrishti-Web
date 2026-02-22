import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden py-20 md:py-0">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-transparent" />
      
      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
             {/* <div className="inline-block">
                <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium">
                  Award-Winning Digital Agency
                </span>
              </div>*/} 
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-textPrimary leading-tight">
                Transform Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-accentLight to-amber-400">
                  Digital Presence
                </span>
              </h1>
              <p className="text-xl text-textSecondary max-w-xl">
                We create data-driven marketing strategies that elevate brands and deliver measurable results in the digital landscape.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="btn-primary text-center">
                Start Your Project
              </Link>
              <Link to="/work" className="btn-secondary text-center">
                View Our Work
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 pt-6 md:pt-8 border-t border-borderSubtle">
              <div>
                <div className="text-2xl md:text-3xl font-heading font-bold text-amber-400">150+</div>
                <div className="text-sm text-textSecondary">Happy Clients</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-heading font-bold text-amber-400">$50M+</div>
                <div className="text-sm text-textSecondary">Revenue Generated</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-heading font-bold text-amber-400">10+</div>
                <div className="text-sm text-textSecondary">Years Experience</div>
              </div>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              {/* Placeholder with clear label */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accentLight/20 backdrop-blur-sm flex items-center justify-center">
                {/*  <div className="text-center space-y-4">
                  <div className="text-6xl">🚀</div>
                  <p className="text-textSecondary font-medium">
                    HERO IMAGE PLACEHOLDER
                  </p>
                  <p className="text-sm text-textSecondary/70 max-w-xs mx-auto">
                    Drop your hero image here (1:1 aspect ratio recommended)
                  </p>
                </div> */}
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

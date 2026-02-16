import { Link } from 'react-router-dom'

const CTABand = () => {
  return (
    <section className="py-24">
      <div className="section-container">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background with accent gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent to-accentLight" />
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          
          {/* Content */}
          <div className="relative z-10 px-8 py-16 md:py-20 text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
              Ready to Transform Your Brand?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Let's create something extraordinary together. Get in touch and start your journey to digital excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-white text-accent hover:bg-white/90 font-medium px-8 py-4 rounded-lg transition-all duration-300 inline-block"
              >
                Start Your Project
              </Link>
              <Link
                to="/work"
                className="bg-transparent hover:bg-white/10 text-white font-medium px-8 py-4 rounded-lg border-2 border-white transition-all duration-300 inline-block"
              >
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTABand

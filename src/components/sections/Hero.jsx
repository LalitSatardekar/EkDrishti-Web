import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-[#0B1120]">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-[#F2A020]/5" />
      
      <div className="section-container relative z-10  ">
        <div className="max-w-4xl px-8 pt-8">
          {/* Main Headline */}
          <h1 className="mb-8">
            <span className="block text-3xl sm:text-7xl md:text-8xl lg:text-8xl font-heading font-black text-white leading-none mb-2">
              Dreams Deserve 
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-8xl font-heading font-black text-[#F2A020] leading-none">
              Better Execution.
            </span>
          </h1>

          {/* Subheadline */}
          <div className="mb-12 space-y-1">
            <p className="lg:text-2xl md:text-xl text-white font-medium">
              Behind every dream is a story waiting to be told.
            </p>
            <p className="lg:text-l md:text-lg text-white/90 font-normal">
              We help you bring it out with clarity, creativity, and purpose.               </p>
          </div>
        </div>

        {/* CTAs - Centered */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
              to="/contact" 
              className="px-10 py-4 bg-[#F2A020] hover:bg-[#E89018] text-[#0B1120] font-bold text-lg rounded-lg transition-all duration-300 text-center"
            >
              Start Your Project
            </Link>
            <Link 
              to="/work" 
              className="px-10 py-4 bg-transparent hover:bg-[#F2A020]/10 text-white hover:text-[#F2A020] font-bold text-lg rounded-lg border-2 border-[#F2A020] hover:border-[#F2A020] transition-all duration-300 text-center"
            >
              View Our Work
            </Link>
          </div>
      </div>
    </section>
  )
}

export default Hero

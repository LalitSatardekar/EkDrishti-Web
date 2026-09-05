import { Link } from 'react-router-dom'

const heroBgImage = encodeURI('/assets/webp/Events/Abhijeet & Shirin/Photos/_DSC3881.JPG.webp')

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#0B1120]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 opacity-90"
        style={{ backgroundImage: `url("${heroBgImage}")` }}
      />

      {/* Dark Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/85 via-[#0B1120]/75 to-[#0B1120]/95 z-0" />

      {/* Subtle Accent Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-[#F2A020]/10 z-0" />

      {/* Bottom Dissolve Fade - Seamlessly Blends Photo into Next Section */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/80 to-transparent pointer-events-none z-[1]" />

      <div className="section-container h-[600px] relative flex flex-col items-center justify-end text-center pb-[40px] z-10 ">
        <div className="max-w-4xl px-4 pt-4 pb-0">
          {/* Main Headline */}
          <h1 className="mb-8">
            <span className="block text-4xl sm:text-4xl md:text-7xl lg:text-7xl font-heading font-black text-white leading-none mb-2">
              Dreams Deserve
            </span>
            <span className="block text-4xl sm:text-4xl md:text-7xl lg:text-7xl font-heading font-black text-[#F2A020] leading-none">
              Better Execution.
            </span>
          </h1>

          {/* Subheadline */}
          <div className="space-y-1">
            <p className="sm:text-m lg:text-2xl md:text-xl text-white font-medium">
              Behind every dream is a story waiting to be told.
            </p>
          </div>
        </div>

        {/* CTAs - Centered */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-[40px]">
          <Link
            to="/contact"
            className="px-10 py-4 bg-[#F2A020] hover:bg-[#E89018] text-[#0B1120] font-bold text-lg rounded-lg transition-all duration-300 text-center shadow-lg shadow-[#F2A020]/10"
          >
            Start Your Project
          </Link>
          <Link
            to="/work"
            className="px-10 py-4 bg-transparent hover:bg-[#F2A020]/10 text-white hover:text-[#F2A020] font-bold text-lg rounded-lg border-2 border-[#F2A020] hover:border-[#F2A020] transition-all duration-300 text-center backdrop-blur-sm"
          >
            View Our Work
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero


import { Link } from 'react-router-dom'
import { services } from '../../data/content'
import { useState } from 'react'

const ServicesPreview = () => {
  const [activeService, setActiveService] = useState(0)

  return (
    <section className="relative  overflow-hidden bg-[#0B1120]">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F2A020]/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-6">
      {/*       <span className="px-5 py-2.5 bg-[#F2A020]/10 border border-[#F2A020]/30 rounded-full text-[#F2A020] text-sm font-semibold tracking-wide uppercase">
              ✦ What We Do Best
            </span> */} 
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black text-white mb-6 leading-tight">
          <p>
            What We Do
          </p>
            {/*<span className="block text-[#F2A020]">
              Drive Results
            </span> */}
          </h2>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
          </p>
        </div>

        {/* Services Tabs Layout */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-8 mb-16">
          {/* Left Side - Service Buttons */}
          <div className="flex flex-col gap-4">
            {services.map((service, index) => (
              <button
                key={service.id}
                onClick={() => setActiveService(index)}
                className={`w-full px-6 py-4 rounded-xl font-bold text-left transition-all duration-300 ${
                  activeService === index
                    ? 'bg-[#F2A020] text-[#0B1120] shadow-lg shadow-[#F2A020]/30'
                    : 'bg-[#F2A020]/20 text-white hover:bg-[#F2A020]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{service.icon}</span>
                  <span>{service.title}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Right Side - Content Area */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/10 min-h-[400px] flex flex-col justify-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-6xl">{services[activeService].icon}</span>
                <h3 className="text-3xl lg:text-4xl font-heading font-bold text-white">
                  {services[activeService].title}
                </h3>
              </div>
              
              <p className="text-lg text-white/80 leading-relaxed">
                {services[activeService].description}
              </p>

              <ul className="space-y-3 pt-4">
                {['Strategic Planning', 'Expert Execution', 'Analytics & Growth', 'Continuous Optimization'].map((item) => (
                  <li key={item} className="flex items-center text-white/90">
                    <div className="w-6 h-6 mr-3 rounded-full bg-[#F2A020]/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#F2A020]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            to="/services" 
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#F2A020] hover:bg-[#E89018] text-[#0B1120] font-bold text-lg rounded-lg transition-all duration-300 shadow-lg shadow-[#F2A020]/25 hover:shadow-xl hover:shadow-[#F2A020]/40 hover:scale-105"
          >
            <span className="relative z-10">Explore All Services</span>
            <svg 
              className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#F2A020] to-[#FF8800] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ServicesPreview

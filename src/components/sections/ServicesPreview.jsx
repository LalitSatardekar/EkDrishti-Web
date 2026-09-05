import { Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const servicePreviewData = [
  {
    id: 'event-management',
    buttonTitle: 'EVENT MANAGEMENT - EKDRISHTI EVENTS',
    panelTitle: 'EVENT MANAGEMENT ',
    leftColumnTitle: 'SERVICES',
    leftItems: [
      'All type decorations',
      'Catering services',
      'Photography and videography services',
      'Invitation, graphic, printing services',
      'Professional anchor, event host',
      'Stand up comedian and magicians',
      'Musicians and orchestra',
      'Event managers',
      'Bouncers',
      'Venue selection',
      'Fashion designing',
      'Transport services'
    ],
    rightColumnTitle: 'EVENTS WE DO',
    rightItems: [
      'Corporate events',
      'Weddings',
      'Sports',
      'Bdays and anniversary',
      'Concerts',
      'Poojas',
      'Small fam events (Baby shower and naming ceremony)'
    ]
  },
  {
    id: 'marketing',
    buttonTitle: 'MARKETING - SCRL',
    panelTitle: 'MARKETING',
    leftColumnTitle: 'DIGITAL MARKETING',
    leftItems: [
      'Social media marketing',
      'SEO and SEM',
      'Email marketing',
      'WhatsApp marketing',
      'GMB optimization',
      'Performance marketing (Meta, Google and LinkedIn)',
      'Influencer marketing',
      'Strategic brand building (Digital)',
      'Content creation (Graphics and audio visuals)'
    ],
    rightColumnTitle: 'OFFLINE MARKETING',
    rightItems: [
      'Strategic brand building (Offline)',
      'Content creation (Graphics, printing and audio visuals)',
      'Hoardings and billboards',
      'Public relations',
      'Brand identity designing (Logos and stationary designing)',
      'Media planning and buying'
    ]
  },
  {
    id: 'production',
    buttonTitle: 'PRODUCTION - NON PRODUCTION',
    panelTitle: 'PRODUCTION',
    leftColumnTitle: 'SERVICES',
    leftItems: [
      'Photography',
      'Videography',
      'Cinematography',
      'Audio production (In 21 national and international lang)',
      'Graphic designing',
      'All type of printing services'
    ],
    rightColumnTitle: 'INDUSTRIES',
    rightItems: [
      'Films and short films',
      'Ad films (TVC, DVC and social media ads)',
      'Corporate films',
      'Hoardings, billboards, brochures, catalogs, menus, IDs and digital media designing',
      'E-commerce'
    ]
  }
]

const chunkItems = (items, chunkSize = 4) => {
  const chunks = []
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }
  return chunks
}

const toSentenceCase = (text) => text

const getServiceIconPath = (title) => {
  const value = (title || '').toLowerCase()

  if (value.includes('event')) {
    return 'M7 4v3M17 4v3M4 10h16M5 7h14v13H5z'
  }
  if (value.includes('marketing')) {
    return 'M5 19V9m7 10V5m7 14v-7'
  }
  if (value.includes('production')) {
    return 'M4 7h11v10H4zM15 10l5-3v10l-5-3'
  }
  return 'm4 16 4-4 3 3 5-5M14 7h6v6'
}

const ServiceCornerIcon = ({ title, activeServiceId }) => {
  const isMarketing = activeServiceId === 'marketing'
  const isProduction = activeServiceId === 'production'

  let logoSrc = '/assets/ekdrishti-events-logo.png'
  let logoAlt = 'Ekdrishti Events Logo'

  if (isMarketing) {
    logoSrc = '/assets/scrl-marketing-logo.png'
    logoAlt = 'SCRL Marketing Logo'
  } else if (isProduction) {
    logoSrc = '/assets/non-production-logo.png'
    logoAlt = 'NON Productions Logo'
  }

  return (
    <div className="absolute top-8 right-8 md:top-10 md:right-10 lg:top-12 lg:right-12 z-[1]">
      <img
        src={logoSrc}
        alt={logoAlt}
        className="h-10 md:h-12 lg:h-[48px] w-auto object-contain drop-shadow-md"
      />
    </div>
  )
}

const ItemGroups = ({ items, showDividers = true, formatItem, activeServiceId }) => {
  const groups = chunkItems(items, 4)
  const isMarketing = activeServiceId === 'marketing'
  const isProduction = activeServiceId === 'production'

  let bulletStyle = 'bg-[#F2A020]/80'
  if (isMarketing) bulletStyle = 'bg-white'
  if (isProduction) bulletStyle = 'bg-[#D01C1E]'

  return (
    <div className="space-y-5">
      {groups.map((group, groupIndex) => (
        <div
          key={`group-${groupIndex}`}
          className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-3"
        >
          {group.map((item) => (
            <div
              key={item}
              className="flex items-start gap-2.5 text-white/90 text-xs md:text-base leading-relaxed font-normal"
            >
              <span className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-300 ${bulletStyle}`} />
              <span>{formatItem ? formatItem(item) : item}</span>
            </div>
          ))}
          {showDividers && groupIndex !== groups.length - 1 && (
            <div className="xl:col-span-2 h-px bg-white/10 mt-2" />
          )}
        </div>
      ))}
    </div>
  )
}

const ServicesPreview = () => {
  const [activeService, setActiveService] = useState(0)
  const currentService = servicePreviewData[activeService] ?? servicePreviewData[0]
  const isMarketing = currentService?.id === 'marketing'
  const isProduction = currentService?.id === 'production'
  const isDarkFill = isMarketing || isProduction
  const accordionRefs = useRef([])

  const scrollToRef = (index) => {
    if (window.innerWidth >= 1024) return
    const el = accordionRefs.current[index]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const top = rect.top + window.pageYOffset - window.innerHeight * 0.25
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const handleAccordionToggle = (index) => {
    const next = activeService === index ? -1 : index
    setActiveService(next)
  }

  const getHeadingColor = (serviceId) => {
    if (serviceId === 'marketing') return 'text-white font-bold'
    if (serviceId === 'production') return 'text-[#D01C1E] font-bold'
    return 'text-[#F2A020]'
  }

  return (
    <section className={`relative overflow-hidden transition-colors duration-500 ${isDarkFill ? 'bg-[#1A1A1A]' : 'bg-[#0B1120]'
      }`}>
      {/* Section Meeting Point Seam Blend */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Top Meeting Seam Blend into Hero (#0B1120) */}
        <div
          className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#0B1120] via-[#0B1120]/60 to-transparent transition-opacity duration-500 ${isDarkFill ? 'opacity-100' : 'opacity-0'
            }`}
        />

        {/* Bottom Meeting Seam Blend into Next Section (#0B1120) */}
        <div
          className={`absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/60 to-transparent transition-opacity duration-500 ${isDarkFill ? 'opacity-100' : 'opacity-0'
            }`}
        />
      </div>

      {/* Background Ambient Glow Circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl transition-colors duration-500 ${isMarketing ? 'bg-white/5' : isProduction ? 'bg-[#D01C1E]/10' : 'bg-accent/5'
          }`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl transition-colors duration-500 ${isMarketing ? 'bg-white/5' : isProduction ? 'bg-[#D01C1E]/10' : 'bg-[#F2A020]/5'
          }`} />
      </div>

      <div className="section-container relative z-10 max-w-[1440px]">
        {/* Header */}
        <div className=" py-[40px] text-center mb-12 md:mb-0">
          <h2 className=" text-[28px] sm:text-3xl md:text-[34px] lg:text-[32px] font-heading font-black text-white leading-tight ">
            What We Do
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="text-base font-normal italic text-white/75 mt-2 mb-2"
          >
            To achieve your dream.
          </motion.p>
        </div>
      </div>
      {/* Services Tabs Layout - Desktop */}
      <div className="hidden lg:flex lg:flex-col gap-2 mb-16 section-container max-w-[1440px]">
        {/* Top - Service Tabs (equal width, flush with panel) */}
        <div className="grid gap-[20px] mb-5" style={{ gridTemplateColumns: `repeat(${servicePreviewData.length}, 1fr)` }}>
          {servicePreviewData.map((service, index) => {
            const isActive = activeService === index
            let buttonStyle = ''

            if (isActive) {
              if (service.id === 'marketing') {
                buttonStyle = 'bg-white text-[#1A1A1A] font-bold shadow-lg shadow-white/10 border-2 border-white'
              } else if (service.id === 'production') {
                buttonStyle = 'bg-[#D01C1E] text-white font-bold shadow-lg shadow-[#D01C1E]/20 border-2 border-[#D01C1E]'
              } else {
                buttonStyle = 'bg-[#F2A020] text-[#0B1120] font-bold'
              }
            } else {
              if (isDarkFill) {
                buttonStyle = 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
              } else {
                buttonStyle = 'bg-[#F2A020]/15 text-white/95 hover:bg-[#F2A020]/25'
              }
            }

            return (
              <motion.button
                key={service.id}
                onClick={() => setActiveService(index)}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className={`px-6 py-5 text-center transition-all duration-300 ease-out rounded-[16px] ${buttonStyle}`}
              >
                <span className="text-base font-semibold leading-tight tracking-wide">{toSentenceCase(service.buttonTitle)}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Bottom - Content Area */}
        <div className={`relative backdrop-blur-sm rounded-3xl p-8 md:p-10 lg:p-12 border overflow-hidden transition-all duration-500 ${isDarkFill
          ? 'bg-[#1A1A1A] border-white/20 shadow-2xl shadow-white/5'
          : 'bg-gradient-to-br from-white/10 to-white/5 border-white/10'
          }`}>
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background: isMarketing
                  ? 'radial-gradient(90% 65% at 100% 100%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 42%, rgba(26,26,26,0) 78%), radial-gradient(80% 58% at 0% 0%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 45%, rgba(26,26,26,0) 78%)'
                  : isProduction
                    ? 'radial-gradient(90% 65% at 100% 100%, rgba(208,28,30,0.18) 0%, rgba(208,28,30,0.05) 42%, rgba(26,26,26,0) 78%), radial-gradient(80% 58% at 0% 0%, rgba(208,28,30,0.15) 0%, rgba(208,28,30,0.03) 45%, rgba(26,26,26,0) 78%)'
                    : 'radial-gradient(90% 65% at 100% 100%, rgba(242,160,32,0.18) 0%, rgba(242,160,32,0.06) 42%, rgba(11,17,32,0) 78%), radial-gradient(80% 58% at 0% 0%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 45%, rgba(11,17,32,0) 78%)',
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.1]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
                backgroundSize: '38px 38px',
                maskImage: 'radial-gradient(circle at 72% 70%, #1A1A1A 28%, transparent 80%)',
              }}
            />
            <div className={`absolute inset-x-0 bottom-0 h-[44%] bg-gradient-to-t transition-colors duration-500 ${isMarketing
              ? 'from-white/[0.05] via-transparent to-transparent'
              : isProduction
                ? 'from-[#D01C1E]/15 via-transparent to-transparent'
                : 'from-[#F2A020]/12 via-white/[0.03] to-transparent'
              }`} />

            <svg
              aria-hidden
              viewBox="0 0 620 420"
              className="absolute -right-24 -bottom-24 h-[420px] w-[620px] opacity-45"
              fill="none"
            >
              <path d="M34 362C180 245 300 210 586 214" stroke={isMarketing ? "rgba(255,255,255,0.25)" : isProduction ? "rgba(208,28,30,0.4)" : "rgba(242,160,32,0.34)"} strokeWidth="1.2" />
              <path d="M18 392C190 255 322 223 608 232" stroke="rgba(255,255,255,0.22)" strokeWidth="1.1" />
              <path d="M90 410C230 300 360 268 618 276" stroke={isMarketing ? "rgba(255,255,255,0.15)" : isProduction ? "rgba(208,28,30,0.25)" : "rgba(242,160,32,0.2)"} strokeWidth="1" />
              <ellipse cx="512" cy="320" rx="122" ry="78" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            </svg>

            <svg
              aria-hidden
              viewBox="0 0 360 240"
              className="absolute -left-16 -bottom-14 h-[240px] w-[360px] opacity-20"
              fill="none"
            >
              <path d="M0 196C108 120 206 108 360 120" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <path d="M14 224C128 142 224 134 360 146" stroke={isMarketing ? "rgba(255,255,255,0.2)" : isProduction ? "rgba(208,28,30,0.3)" : "rgba(242,160,32,0.22)"} strokeWidth="1" />
            </svg>

            <div className="absolute right-16 bottom-16 h-px w-44 bg-gradient-to-r from-transparent via-white/38 to-transparent" />
            <div className={`absolute right-10 bottom-12 h-px w-24 bg-gradient-to-r from-transparent ${isMarketing ? 'via-white/50' : isProduction ? 'via-[#D01C1E]/60' : 'via-[#F2A020]/55'
              } to-transparent`} />
          </div>
          <ServiceCornerIcon title={currentService.panelTitle} activeServiceId={currentService.id} />
          <div className="grid">
            {servicePreviewData.map((service, index) => (
              <motion.div
                key={service.id}
                animate={{ opacity: activeService === index ? 1 : 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                style={{
                  gridArea: '1 / 1',
                  pointerEvents: activeService === index ? 'auto' : 'none',
                }}
                aria-hidden={activeService !== index}
                className="space-y-8"
              >
                <h3 className="text-lg lg:text-xl font-heading font-bold text-white">
                  {toSentenceCase(service.panelTitle)}
                </h3>

                <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-start">
                  <div className="space-y-5">
                    <h4 className={`text-base font-medium tracking-wide transition-colors duration-300 ${getHeadingColor(service.id)}`}>
                      {toSentenceCase(service.leftColumnTitle)}:
                    </h4>
                    <ItemGroups
                      items={service.leftItems}
                      showDividers={false}
                      formatItem={toSentenceCase}
                      activeServiceId={currentService.id}
                    />
                  </div>

                  <div className="hidden md:block w-px self-stretch bg-white/15" />

                  <div className="space-y-5">
                    <h4 className={`text-base font-medium tracking-wide transition-colors duration-300 ${getHeadingColor(service.id)}`}>
                      {toSentenceCase(service.rightColumnTitle)}:
                    </h4>
                    <ItemGroups
                      items={service.rightItems}
                      showDividers={false}
                      formatItem={toSentenceCase}
                      activeServiceId={currentService.id}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Accordion Layout */}
      <div className="lg:hidden section-container max-w-[1440px] mb-16">
        <div className="space-y-4">
          {servicePreviewData.map((service, index) => {
            const isAccordionActive = activeService === index
            let accordionBorder = 'border-white/10 hover:border-white/30 hover:shadow-[0_0_24px_rgba(255,255,255,0.1)]'
            let accordionTitleColor = 'text-white'
            let accordionArrowColor = 'text-[#F2A020]'

            if (isAccordionActive) {
              if (service.id === 'marketing') {
                accordionBorder = 'border-white bg-[#1A1A1A] shadow-[0_0_24px_rgba(255,255,255,0.2)]'
                accordionTitleColor = 'text-white font-bold'
                accordionArrowColor = 'text-white'
              } else if (service.id === 'production') {
                accordionBorder = 'border-[#D01C1E] bg-[#1A1A1A] shadow-[0_0_24px_rgba(208,28,30,0.25)]'
                accordionTitleColor = 'text-[#D01C1E] font-bold'
                accordionArrowColor = 'text-[#D01C1E]'
              } else {
                accordionBorder = 'border-[#F2A020] shadow-[0_0_24px_rgba(242,160,32,0.25)]'
                accordionTitleColor = 'text-[#F2A020]'
                accordionArrowColor = 'text-[#F2A020]'
              }
            }

            return (
              <div
                key={service.id}
                ref={(el) => (accordionRefs.current[index] = el)}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${accordionBorder}`}
              >
                <button
                  onClick={() => handleAccordionToggle(index)}
                  className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm hover:from-white/15 hover:to-white/8 text-left transition-colors duration-200"
                  aria-expanded={isAccordionActive}
                  aria-controls={`service-content-${service.id}`}
                >
                  <h3 className={`font-heading font-semibold text-base sm:text-lg transition-colors duration-200 ${accordionTitleColor}`}>
                    {toSentenceCase(service.buttonTitle)}
                  </h3>
                  <svg
                    className={`w-6 h-6 transition-all duration-300 flex-shrink-0 ml-4 ${accordionArrowColor} ${isAccordionActive ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence initial={false}>
                  {isAccordionActive && (
                    <motion.div
                      id={`service-content-${service.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      onAnimationComplete={() => {
                        if (isAccordionActive) {
                          scrollToRef(index)
                        }
                      }}
                      className="overflow-hidden"
                    >
                      <div className={`px-5 py-6 border-t space-y-6 transition-colors duration-300 ${isDarkFill ? 'bg-[#1A1A1A] border-white/20' : 'bg-[#0B1120]/40 border-white/10'
                        }`}>
                        {/* Left Column */}
                        <div className="space-y-4">
                          <h4 className={`text-sm sm:text-base font-medium tracking-wide transition-colors duration-300 ${getHeadingColor(service.id)}`}>
                            {toSentenceCase(service.leftColumnTitle)}:
                          </h4>
                          <div className="space-y-2">
                            {service.leftItems.map((item) => (
                              <div
                                key={item}
                                className="flex items-start gap-2.5 text-white/90 text-xs sm:text-sm leading-relaxed"
                              >
                                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-300 ${service.id === 'marketing' ? 'bg-white' : service.id === 'production' ? 'bg-[#D01C1E]' : 'bg-[#F2A020]/80'
                                  }`} />
                                <span>{toSentenceCase(item)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/10" />

                        {/* Right Column */}
                        <div className="space-y-4">
                          <h4 className={`text-sm sm:text-base font-medium tracking-wide transition-colors duration-300 ${getHeadingColor(service.id)}`}>
                            {toSentenceCase(service.rightColumnTitle)}:
                          </h4>
                          <div className="space-y-2">
                            {service.rightItems.map((item) => (
                              <div
                                key={item}
                                className="flex items-start gap-2.5 text-white/90 text-xs sm:text-sm leading-relaxed"
                              >
                                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-300 ${service.id === 'marketing' ? 'bg-white' : service.id === 'production' ? 'bg-[#D01C1E]' : 'bg-[#F2A020]/80'
                                  }`} />
                                <span>{toSentenceCase(item)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ServicesPreview
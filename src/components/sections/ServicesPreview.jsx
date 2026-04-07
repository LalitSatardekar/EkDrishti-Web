import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const servicePreviewData = [
  {
    id: 'event-management',
    buttonTitle: 'EVENT MANAGEMENT',
    panelTitle: 'EVENT MANAGEMENT',
    leftColumnTitle: 'SERVICES',
    leftItems: [
      'ALL TYPE DECORATIONS',
      'CATERING SERVICES',
      'PHOTOGRAPHY AND VIDEOGRAPHY SERVICES',
      'INVITATION, GRAPHIC, PRINTING SERVICES',
      'PROFESSIONAL ANCHOR, EVENT HOST',
      'STAND UP COMEDIAN AND MAGICIANS',
      'MUSICIANS AND ORCHESTRA',
      'EVENT MANAGERS',
      'BOUNCERS',
      'VENUE SELECTION',
      'FASHION DESIGNING',
      'TRANSPORT SERVICES'
    ],
    rightColumnTitle: 'EVENTS WE DO',
    rightItems: [
      'CORPORATE EVENTS',
      'WEDDINGS',
      'SPORTS',
      'BDAYS AND ANNIVERSARY',
      'CONCERTS',
      'POOJAS',
      'SMALL FAM EVENTS (BABY SHOWER AND NAMING CEREMONY)'
    ]
  },
  {
    id: 'marketing',
    buttonTitle: 'MARKETING',
    panelTitle: 'MARKETING',
    leftColumnTitle: 'DIGITAL MARKETING',
    leftItems: [
      'SOCIAL MEDIA MARKETING',
      'SEO AND SEM',
      'EMAIL MARKETING',
      'WHATSAPP MARKETING',
      'GMB OPTIMIZATION',
      'PERFORMANCE MARKETING (META, GOOGLE AND LINKEDIN)',
      'INFLUENCER MARKETING',
      'STRATEGIC BRAND BUILDING (DIGITAL)',
      'CONTENT CREATION (GRAPHICS AND AUDIO VISUALS)'
    ],
    rightColumnTitle: 'OFFLINE MARKETING',
    rightItems: [
      'STRATEGIC BRAND BUILDING (OFFLINE)',
      'CONTENT CREATION (GRAPHICS, PRINTING AND AUDIO VISUALS)',
      'HORDINGS AND BILLBOARDS',
      'PUBLIC RELATIONS',
      'BRAND IDENTITY DESIGNING (LOGOS AND STATIONARY DESIGNING)',
      'MEDIA PLANNING AND BUYING'
    ]
  },
  {
    id: 'production',
    buttonTitle: 'PRODUCTION',
    panelTitle: 'PRODUCTION',
    leftColumnTitle: 'SERVICES',
    leftItems: [
      'PHOTOGRAPHY',
      'VIDEOGRAPHY',
      'CINEMATOGRAPHY',
      'AUDIO PRODUCTION (IN 21 NATIONAL AND INTERNATIONAL LANG)',
      'GRAPHIC DESIGNING',
      'ALL TYPE OF PRINTING SERVICES'
    ],
    rightColumnTitle: 'INDUSTRIES',
    rightItems: [
      'FILMS AND SHORT FILMS',
      'AD FILMS (TVC, DVC AND SOCIAL MEDIA ADS)',
      'CORPORATE FILMS',
      'HOARDINGS, BILLBOARDS, BROCHURES, CATALOGS, MENUS, IDS AND DIGITAL MEDIA DESIGNING',
      'E-COMMERCE'
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

const toSentenceCase = (text) => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

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

const ServiceCornerIcon = ({ title }) => (
  <div className="pointer-events-none absolute top-5 right-5 z-[1]">
    <div className="relative h-11 w-11 rounded-xl border border-white/15 bg-[#0B1120]/35 backdrop-blur-[2px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F2A020]/25 via-transparent to-transparent" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10 h-5 w-5 text-[#F2A020]/90"
        aria-hidden
      >
        <path d={getServiceIconPath(title)} />
      </svg>
    </div>
  </div>
)

const ItemGroups = ({ items, showDividers = true, formatItem }) => {
  const groups = chunkItems(items, 4)

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
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#F2A020]/80 shrink-0" />
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
  const currentService = servicePreviewData[activeService]

  return (
    <section className="relative  overflow-hidden bg-[#0B1120]">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F2A020]/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10 max-w-[1440px]">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[28px] sm:text-3xl md:text-[34px] lg:text-[38px] font-heading font-black text-white leading-tight">
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
        <div className="hidden lg:grid lg:grid-cols-[290px_1fr] gap-6 lg:gap-8 mb-16 section-container max-w-[1440px]">
          {/* Left Side - Service Buttons */}
          <div className="flex flex-col gap-3">
            {servicePreviewData.map((service, index) => (
              <button
                key={service.id}
                onClick={() => setActiveService(index)}
                className={`w-full px-6 py-4 rounded-xl text-left transition-all duration-300 ease-out transform-gpu hover:scale-[1.02] ${
                  activeService === index
                    ? 'bg-[#F2A020] text-[#0B1120] shadow-md shadow-[#F2A020]/35'
                    : 'bg-[#F2A020]/15 text-white/95 hover:bg-[#F2A020]/25 hover:shadow-md hover:shadow-[#F2A020]/20'
                }`}
              >
                <span className="text-base font-semibold leading-tight tracking-wide">{toSentenceCase(service.buttonTitle)}</span>
              </button>
            ))}
          </div>

          {/* Right Side - Content Area */}
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-10 lg:p-12 border border-white/10 min-h-[520px] overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(90% 65% at 100% 100%, rgba(242,160,32,0.18) 0%, rgba(242,160,32,0.06) 42%, rgba(11,17,32,0) 78%), radial-gradient(80% 58% at 0% 0%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 45%, rgba(11,17,32,0) 78%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-[0.1]"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
                  backgroundSize: '38px 38px',
                  maskImage: 'radial-gradient(circle at 72% 70%, black 28%, transparent 80%)',
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-[44%] bg-gradient-to-t from-[#F2A020]/12 via-white/[0.03] to-transparent" />

              <svg
                aria-hidden
                viewBox="0 0 620 420"
                className="absolute -right-24 -bottom-24 h-[420px] w-[620px] opacity-45"
                fill="none"
              >
                <path d="M34 362C180 245 300 210 586 214" stroke="rgba(242,160,32,0.34)" strokeWidth="1.2" />
                <path d="M18 392C190 255 322 223 608 232" stroke="rgba(255,255,255,0.22)" strokeWidth="1.1" />
                <path d="M90 410C230 300 360 268 618 276" stroke="rgba(242,160,32,0.2)" strokeWidth="1" />
                <ellipse cx="512" cy="320" rx="122" ry="78" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              </svg>

              <svg
                aria-hidden
                viewBox="0 0 360 240"
                className="absolute -left-16 -bottom-14 h-[240px] w-[360px] opacity-20"
                fill="none"
              >
                <path d="M0 196C108 120 206 108 360 120" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <path d="M14 224C128 142 224 134 360 146" stroke="rgba(242,160,32,0.22)" strokeWidth="1" />
              </svg>

              <div className="absolute right-16 bottom-16 h-px w-44 bg-gradient-to-r from-transparent via-white/38 to-transparent" />
              <div className="absolute right-10 bottom-12 h-px w-24 bg-gradient-to-r from-transparent via-[#F2A020]/55 to-transparent" />
            </div>
            <ServiceCornerIcon title={currentService.panelTitle} />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentService.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="relative z-10 space-y-8"
              >
                <h3 className="text-lg lg:text-xl font-heading font-bold text-white">
                  {toSentenceCase(currentService.panelTitle)}
                </h3>

                <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-start">
                  <div className="space-y-5">
                    <h4 className="text-[#F2A020] text-base font-medium tracking-wide">
                      {toSentenceCase(currentService.leftColumnTitle)}:
                    </h4>
                    <ItemGroups
                      items={currentService.leftItems}
                      showDividers={false}
                      formatItem={toSentenceCase}
                    />
                  </div>

                  <div className="hidden md:block w-px self-stretch bg-white/15" />

                  <div className="space-y-5">
                    <h4 className="text-[#F2A020] text-base font-medium tracking-wide">
                      {toSentenceCase(currentService.rightColumnTitle)}:
                    </h4>
                    <ItemGroups
                      items={currentService.rightItems}
                      showDividers={false}
                      formatItem={toSentenceCase}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile/Tablet Accordion Layout */}
        <div className="lg:hidden section-container max-w-[1440px] mb-16">
          <div className="space-y-4">
            {servicePreviewData.map((service, index) => (
              <div
                key={service.id}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  activeService === index
                    ? 'border-[#F2A020] shadow-[0_0_24px_rgba(242,160,32,0.25)]'
                    : 'border-white/10 hover:border-[#F2A020]/50 hover:shadow-[0_0_24px_rgba(242,160,32,0.15)]'
                }`}
              >
                <button
                  onClick={() => setActiveService(activeService === index ? -1 : index)}
                  className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm hover:from-white/15 hover:to-white/8 text-left transition-colors duration-200"
                  aria-expanded={activeService === index}
                  aria-controls={`service-content-${service.id}`}
                >
                  <h3
                    className={`font-heading font-semibold text-base sm:text-lg transition-colors duration-200 ${
                      activeService === index ? 'text-[#F2A020]' : 'text-white'
                    }`}
                  >
                    {toSentenceCase(service.buttonTitle)}
                  </h3>
                  <svg
                    className={`w-6 h-6 transition-all duration-300 flex-shrink-0 ml-4 ${
                      activeService === index ? 'text-[#F2A020] rotate-180' : 'text-[#F2A020]'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {activeService === index && (
                    <motion.div
                      id={`service-content-${service.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 py-6 bg-[#0B1120]/40 border-t border-white/10 space-y-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <h4 className="text-[#F2A020] text-sm sm:text-base font-medium tracking-wide">
                            {toSentenceCase(service.leftColumnTitle)}:
                          </h4>
                          <div className="space-y-2">
                            {service.leftItems.map((item) => (
                              <div
                                key={item}
                                className="flex items-start gap-2.5 text-white/90 text-xs sm:text-sm leading-relaxed"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#F2A020]/80 shrink-0" />
                                <span>{toSentenceCase(item)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/10" />

                        {/* Right Column */}
                        <div className="space-y-4">
                          <h4 className="text-[#F2A020] text-sm sm:text-base font-medium tracking-wide">
                            {toSentenceCase(service.rightColumnTitle)}:
                          </h4>
                          <div className="space-y-2">
                            {service.rightItems.map((item) => (
                              <div
                                key={item}
                                className="flex items-start gap-2.5 text-white/90 text-xs sm:text-sm leading-relaxed"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#F2A020]/80 shrink-0" />
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
            ))}
          </div>
        </div>
      </section>
    )
  }

  export default ServicesPreview
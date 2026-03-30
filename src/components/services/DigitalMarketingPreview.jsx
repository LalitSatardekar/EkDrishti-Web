import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const digitalServiceItems = [
  {
    button: 'SOCIAL MEDIA MARKETING',
    title: '📱 Social Media Marketing',
    body: 'Social media is often the first place people experience your brand - and it needs to feel right. We plan, create, and manage your presence across platforms in a way that feels consistent and natural. From content and communication to timing and engagement, everything is designed to help your brand stay relevant, build trust, and grow steadily over time.'
  },
  {
    button: 'SEO AND SEM',
    title: '🔍 SEO & SEM',
    body: 'Being visible at the right moment can make all the difference. We optimize your digital presence so your brand appears when people are actively searching for what you offer. By combining organic strategies with paid campaigns, we help you attract meaningful traffic - not just more clicks, but the right ones.'
  },
  {
    button: 'EMAIL MARKETING',
    title: '📧 Email Marketing',
    body: 'Some of the most valuable connections happen directly. We create email campaigns that are thoughtful, well-timed, and relevant - helping you stay connected with your audience in a way that feels personal, not overwhelming, and builds long-term trust.'
  },
  {
    button: 'WHATSAPP MARKETING',
    title: '💬 WhatsApp Marketing',
    body: 'Communication works best when it feels simple and direct. We help you connect with your audience through WhatsApp in a way that feels natural and useful - sharing updates, offers, and information without interrupting their experience.'
  },
  {
    button: 'GMB OPTIMIZATION',
    title: '📍 GMB Optimization',
    body: 'Local presence often drives real business. We optimize your Google Business profile so your brand appears clearly and confidently in local searches - making it easier for nearby customers to find, trust, and choose you.'
  },
  {
    button: 'PERFORMANCE MARKETING ( META, GOOGLE AND LINKEDIN )',
    title: '🎯 Performance Marketing (Meta, Google, LinkedIn)',
    body: 'Every campaign should have a clear purpose - and a measurable outcome. We design and manage performance campaigns that focus on results, whether it is awareness, leads, or conversions. By continuously monitoring and refining, we make sure your marketing works efficiently and delivers consistent growth.'
  },
  {
    button: 'INFLUENCER MARKETING',
    title: '🤝 Influencer Marketing',
    body: 'People trust people more than brands. We connect you with creators who align with your brand and audience, ensuring collaborations feel authentic and meaningful - helping you build credibility and reach in a natural way.'
  },
  {
    button: 'STRATEGIC BRAND BUILDING ( DIGITAL )',
    title: '🎨 Strategic Brand Building (Digital)',
    body: 'A strong digital presence starts with clarity. We define how your brand communicates online - from positioning and messaging to overall tone - creating a consistent identity that helps people understand, recognize, and trust your brand over time.'
  },
  {
    button: 'CONTENT CREATION ( GRAPHICS AND AUDIO VISUALS )',
    title: '✨ Content Creation (Graphics & Audio-Visuals)',
    body: 'Content is how your brand shows up every day. We create visuals and media that reflect your brand personality and purpose - designed not just to look good, but to communicate clearly, engage your audience, and perform across platforms.'
  }
]

const offlineMarketingItems = [
  {
    button: 'STRATEGIC BRAND BUILDING ( OFFLINE )',
    title: '🏢 Strategic Brand Building (Offline)',
    body: 'A brand should feel consistent wherever it appears. We carry your brand identity into offline spaces - ensuring everything from communication to visual presence feels aligned, clear, and impactful in the real world.'
  },
  {
    button: 'CONTENT CREATION ( GRAPHICS, PRINTING AND AUDIO VISUALS )',
    title: '🖨️ Content Creation (Graphics, Printing & Audio-Visuals)',
    body: 'Good design should translate seamlessly across formats. We create print materials and offline visuals that maintain your brand look and feel - making sure every touchpoint reflects the same level of thought and quality.'
  },
  {
    button: 'HORDINGS AND BILLBOARDS',
    title: '🪧 Hoardings & Billboards',
    body: 'Outdoor visibility works best when it is clear and intentional. We design and execute campaigns that capture attention quickly and communicate effectively - making your brand stand out even in high-traffic environments.'
  },
  {
    button: 'PUBLIC RELATIONS',
    title: '📰 Public Relations',
    body: 'Reputation is built through the right exposure. We help your brand get featured and recognized in the right places - building credibility, visibility, and trust through meaningful media presence.'
  },
  {
    button: 'BRAND IDENTITY DESIGNING ( LOGOS AND STATIONARY DESIGNING )',
    title: '🎨 Brand Identity Designing (Logos & Stationery)',
    body: 'Your identity is often the first impression. We design logos and brand assets that are simple, distinctive, and aligned with your vision - creating a visual language that people remember and associate with your brand.'
  },
  {
    button: 'MEDIA PLANNING AND BUYING',
    title: '📺 Media Planning & Buying',
    body: 'Where and how you show up matters. We plan and manage media placements strategically - ensuring your brand reaches the right audience, at the right time, through the right channels, with maximum impact.'
  }
]

const toSentenceCase = (text) => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const cleanHeading = (text) => {
  if (!text) return text
  return text.replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji}\uFE0F\u200D\s]+/u, '').trim()
}

const logo = (name, color = 'ffffff') => `https://cdn.simpleicons.org/${name}/${color}`

const getServiceIconTile = (title, isOffline) => {
  const value = (title || '').toLowerCase()

  if (value.includes('whatsapp')) return { src: logo('whatsapp', '25D366'), glow: 'rgba(37,211,102,0.45)' }
  if (value.includes('seo') || value.includes('sem') || value.includes('gmb') || value.includes('google')) return { src: logo('google', 'ffffff'), glow: 'rgba(66,133,244,0.36)' }
  if (value.includes('email')) return { src: logo('gmail', 'EA4335'), glow: 'rgba(234,67,53,0.38)' }
  if (value.includes('influencer') || value.includes('social')) return { src: logo('instagram', 'E4405F'), glow: 'rgba(228,64,95,0.40)' }
  if (value.includes('performance') || value.includes('media planning') || value.includes('buying')) return { src: logo('linkedin', '0A66C2'), glow: 'rgba(10,102,194,0.40)' }
  if (value.includes('content') || value.includes('graphics') || value.includes('audio') || value.includes('visual')) return { src: logo('canva', '00C4CC'), glow: 'rgba(0,196,204,0.40)' }
  if (isOffline) return { src: logo('adobeacrobatreader', 'EC1C24'), glow: 'rgba(236,28,36,0.38)' }

  return { src: logo('meta', '0866FF'), glow: 'rgba(8,102,255,0.36)' }
}

const ServiceThumbnailStrip = ({ title, isOffline }) => {
  const tile = getServiceIconTile(title, isOffline)

  return (
    <div className="pointer-events-none absolute bottom-0 right-0 z-[1] hidden md:block">
      <div className="relative h-[250px] w-[250px] translate-x-[24%] translate-y-[24%] opacity-40">
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 34% 34%, ${tile.glow} 0%, rgba(11,17,32,0) 70%)` }} />
        <img
          src={tile.src}
          alt=""
          className="absolute inset-0 m-auto h-[180px] w-[180px] object-contain opacity-60 saturate-75 drop-shadow-[0_0_26px_rgba(255,255,255,0.12)]"
          loading="lazy"
        />
      </div>
    </div>
  )
}

const DigitalMarketingPreview = () => {
  const [activeMode, setActiveMode] = useState('digital')
  const [activeDigitalService, setActiveDigitalService] = useState(0)
  const [activeOfflineService, setActiveOfflineService] = useState(0)

  const isOffline = activeMode === 'offline'
  const currentItems = isOffline ? offlineMarketingItems : digitalServiceItems
  const activeIndex = isOffline ? activeOfflineService : activeDigitalService
  const activeContent = currentItems[activeIndex]

  const handleSelectService = (index) => {
    if (isOffline) {
      setActiveOfflineService(index)
      return
    }
    setActiveDigitalService(index)
  }

  return (
    <section className="relative overflow-hidden bg-[#0B1120] py-16 md:py-20">
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-[#F2A020]/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10 max-w-[1440px]">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-white/95 tracking-[0.08em]">SERVICES</h2>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-10 items-start">
          <div className="flex flex-col gap-3">
            <div className="self-start mb-2 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-sm">
              <div className="flex items-center">
                <button
                  onClick={() => setActiveMode('digital')}
                  className={`px-4 py-1.5 rounded-full text-xs tracking-[0.12em] transition-all duration-300 ${
                    !isOffline ? 'bg-[#F2A020] text-[#0B1120] font-semibold' : 'text-white/75 hover:text-white/95'
                  }`}
                >
                  Digital
                </button>
                <button
                  onClick={() => setActiveMode('offline')}
                  className={`px-4 py-1.5 rounded-full text-xs tracking-[0.12em] transition-all duration-300 ${
                    isOffline ? 'bg-[#F2A020] text-[#0B1120] font-semibold' : 'text-white/75 hover:text-white/95'
                  }`}
                >
                  Offline
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeMode}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                transition={{ duration: 0.26, ease: 'easeInOut' }}
                className="flex flex-col gap-3 max-h-[600px] overflow-y-auto hide-scrollbar pr-1"
              >
                {currentItems.map((item, index) => (
                  <button
                    key={item.button}
                    onClick={() => handleSelectService(index)}
                    className={`w-full px-5 py-3.5 rounded-lg text-left transition-all duration-300 ease-out transform-gpu hover:scale-[1.008] flex-shrink-0 ${
                      activeIndex === index
                        ? 'bg-[#F2A020] text-[#0B1120] shadow-md shadow-[#F2A020]/35'
                        : 'bg-[#F2A020]/15 text-white/95 hover:bg-[#F2A020]/25 hover:shadow-md hover:shadow-[#F2A020]/20'
                    }`}
                  >
                    <span className="text-[15px] md:text-base font-medium leading-snug tracking-[0.01em]">{toSentenceCase(item.button)}</span>
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative lg:mt-[54px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-9 md:p-12 lg:p-14 border border-white/10 overflow-hidden min-h-[480px] md:min-h-[520px]">
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(90% 65% at 100% 100%, rgba(242,160,32,0.18) 0%, rgba(242,160,32,0.06) 42%, rgba(11,17,32,0) 78%), radial-gradient(80% 58% at 0% 0%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 45%, rgba(11,17,32,0) 78%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-[0.15]"
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
                className="absolute -right-24 -bottom-24 h-[420px] w-[620px] opacity-48"
                fill="none"
              >
                <path d="M34 362C180 245 300 210 586 214" stroke="rgba(242,160,32,0.36)" strokeWidth="1.2" />
                <path d="M18 392C190 255 322 223 608 232" stroke="rgba(255,255,255,0.24)" strokeWidth="1.1" />
                <path d="M90 410C230 300 360 268 618 276" stroke="rgba(242,160,32,0.22)" strokeWidth="1" />
                <ellipse cx="512" cy="320" rx="122" ry="78" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              </svg>

              <div className="absolute right-16 bottom-16 h-px w-44 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="absolute right-10 bottom-12 h-px w-24 bg-gradient-to-r from-transparent via-[#F2A020]/60 to-transparent" />
            </div>

            <ServiceThumbnailStrip title={activeContent.title} isOffline={isOffline} />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#F2A020]/35 to-transparent" />

            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeMode}-${activeIndex}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="relative z-10 space-y-8"
              >
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] md:text-xs tracking-[0.12em] uppercase text-white/75">
                    {isOffline ? 'Offline Marketing' : 'Digital Marketing'}
                  </span>
                </div>

                <h4 className="text-2xl md:text-3xl font-heading font-semibold text-white leading-tight">{cleanHeading(activeContent.title)}</h4>
                <div className="h-px bg-white/10" />
                <p className="text-white/78 text-base md:text-lg leading-8 max-w-[70ch]">{activeContent.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DigitalMarketingPreview

// Made with Bob

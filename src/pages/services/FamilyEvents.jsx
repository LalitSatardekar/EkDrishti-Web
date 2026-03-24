import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const familyServiceItems = [
  {
    button: 'ALL TYPE DECORATIONS',
    title: '🎨 Venue Decor',
    body: 'We don’t just decorate — we shape the way your event feels. Starting from an empty space, we build an atmosphere that reflects your style and the mood you want to create. Whether it’s floral elegance, themed setups, or something more contemporary, every detail is thoughtfully designed to come together beautifully and feel exactly the way you imagined.'
  },
  {
    button: 'CATERING SERVICES',
    title: '🍽 Catering',
    body: 'Great food brings people together — and often becomes one of the most memorable parts of the event. We work closely with experienced chefs to curate menus that suit your taste, your guests, and the style of your event. From elegant dining to more interactive setups, everything is handled with care — from preparation to service — so the experience feels seamless from start to finish.'
  },
  {
    button: 'PHOTOGRAPHY AND VIDEOGRAPHY SERVICES',
    title: '📸 Photography & Videography',
    body: 'Some moments shouldn’t just be remembered — they should be relived. Our team focuses on capturing the real story of your event, from candid emotions to the details you might miss in the moment. The result is a collection of visuals that feel natural, timeless, and true to the experience.'
  },
  {
    button: 'INVITATION,GRAPHIC,PRINTING SERVICES',
    title: '💌 Invitations',
    body: 'Every event begins with an invitation — and first impressions matter. We design invitations that feel personal, clear, and aligned with your event. Whether digital or print, the goal is simple: set the right tone, build anticipation, and give your guests a glimpse of what’s to come.'
  },
  {
    button: 'PROFESSIONAL ANCHOR, EVENT HOST',
    title: '🎤 Professional Anchors & Hosts',
    body: 'A great host keeps everything flowing without you even noticing it. We work with experienced anchors who know how to engage the audience, manage transitions, and maintain the right energy throughout the event — making sure everything feels smooth, natural, and well-paced.'
  },
  {
    button: 'STAND UP COMMEDIAN AND MAGICIANS',
    title: '🎭 Stand-up Comedians & Magicians',
    body: 'Some moments are meant to be enjoyed, not just planned. We bring in performers who know how to read the room and create genuine engagement — adding humor, surprise, and lightness to your event without taking away from its essence.'
  },
  {
    button: 'MUCISIANS AND ORCHESTRA',
    title: '🎶 Musicians & Orchestra',
    body: 'Music quietly shapes the entire experience. Whether it’s soft background melodies or a more lively performance, we curate music that fits the mood and enhances the atmosphere — making every moment feel more complete.'
  },
  {
    button: 'EVENT MANAGERS',
    title: '🧠 Event Management',
    body: 'Behind every seamless event is careful planning and constant attention to detail. We handle coordination, timelines, vendors, and on-ground execution — making sure everything runs as it should. Our role is simple: keep things under control so you can stay present and enjoy the experience.'
  },
  {
    button: 'BOUNCERS',
    title: '🛡 Bouncers & Security',
    body: 'Safety should feel present, but never intrusive. We provide professional security that is reliable, well-managed, and discreet — ensuring your event remains safe while maintaining a comfortable environment for your guests.'
  },
  {
    button: 'VENUE SELECTION',
    title: '📍 Venue Selection',
    body: 'The right venue sets the tone for everything that follows — and we make sure it feels just right. We go beyond availability to find spaces that truly match your vision, your guest list, and the kind of experience you want to create. From shortlisting and visits to handling coordination and paperwork, we take care of the process end-to-end — so you can focus on the bigger picture while we secure a space that fits effortlessly.'
  },
  {
    button: 'FASHION DESIGNING',
    title: '👗 Outfit Designing',
    body: 'What you wear becomes part of the experience. We design outfits that reflect your personality and complement your event, ensuring you and your key guests look and feel confident, comfortable, and completely in sync with the occasion.'
  },
  {
    button: 'TRANSPORT SERVICES',
    title: '🚐 Transport Services',
    body: 'Smooth movement makes everything feel effortless. We manage transportation and logistics to ensure guests, teams, and resources move efficiently — keeping everything on schedule and stress-free.'
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
const getServiceIconTile = (title) => {
  const value = (title || '').toLowerCase()

  if (value.includes('decor') || value.includes('invitation') || value.includes('outfit')) {
    return { src: logo('canva', '00C4CC'), glow: 'rgba(0,196,204,0.42)' }
  }

  if (value.includes('photo') || value.includes('video')) {
    return { src: logo('instagram', 'E4405F'), glow: 'rgba(228,64,95,0.4)' }
  }

  if (value.includes('music') || value.includes('anchor') || value.includes('comedian')) {
    return { src: logo('spotify', '1DB954'), glow: 'rgba(29,185,84,0.42)' }
  }

  return { src: logo('googlemaps', '34A853'), glow: 'rgba(52,168,83,0.4)' }
}

const ServiceThumbnailStrip = ({ title }) => {
  const tile = getServiceIconTile(title)

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

const FamilyServicesPreviewSection = () => {
  const [activeService, setActiveService] = useState(0)
  const activeContent = familyServiceItems[activeService]

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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-white/95 tracking-[0.08em]">
            SERVICES
          </h2>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-10 items-start">
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto hide-scrollbar pr-1">
            {familyServiceItems.map((item, index) => (
              <button
                key={item.button}
                onClick={() => setActiveService(index)}
                className={`w-full px-5 py-3.5 rounded-lg text-left transition-all duration-300 ease-out transform-gpu hover:scale-[1.008] flex-shrink-0 ${
                  activeService === index
                    ? 'bg-[#F2A020] text-[#0B1120] shadow-md shadow-[#F2A020]/35'
                    : 'bg-[#F2A020]/15 text-white/95 hover:bg-[#F2A020]/25 hover:shadow-md hover:shadow-[#F2A020]/20'
                }`}
              >
                <span className="text-[15px] md:text-base font-medium leading-snug tracking-[0.01em]">{toSentenceCase(item.button)}</span>
              </button>
            ))}
          </div>

          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-9 md:p-12 lg:p-14 border border-white/10 overflow-hidden min-h-[480px] md:min-h-[520px]">
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
                className="absolute -right-24 -bottom-24 h-[420px] w-[620px] opacity-52"
                fill="none"
              >
                <path d="M34 362C180 245 300 210 586 214" stroke="rgba(242,160,32,0.36)" strokeWidth="1.2" />
                <path d="M18 392C190 255 322 223 608 232" stroke="rgba(255,255,255,0.24)" strokeWidth="1.1" />
                <path d="M90 410C230 300 360 268 618 276" stroke="rgba(242,160,32,0.22)" strokeWidth="1" />
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

              <div className="absolute right-16 bottom-16 h-px w-44 bg-gradient-to-r from-transparent via-white/42 to-transparent" />
              <div className="absolute right-10 bottom-12 h-px w-24 bg-gradient-to-r from-transparent via-[#F2A020]/62 to-transparent" />
            </div>
            <ServiceThumbnailStrip title={activeContent.title} />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#F2A020]/35 to-transparent" />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="relative z-10 space-y-8"
              >
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] md:text-xs tracking-[0.12em] uppercase text-white/75">
                    Family Events
                  </span>
                </div>

                <h4 className="text-2xl md:text-3xl font-heading font-semibold text-white leading-tight">
                  {cleanHeading(activeContent.title)}
                </h4>
                <div className="h-px bg-white/10" />
                <p className="text-white/78 text-base md:text-lg leading-8 max-w-[70ch]">
                  {activeContent.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

const FamilyEvents = () => {
  return (
    <div className="py-24">
      <div className="section-container">
        {/* Hero */}
        <div className="text-center mb-20">
          <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium">
            Family Events
          </span>
          <h1 className="mt-6 text-5xl md:text-6xl font-heading font-bold text-textPrimary mb-6">
            Celebrate Every
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-accentLight to-amber-400">
              Special Moment
            </span>
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            From intimate gatherings to grand celebrations — we craft unforgettable family events with meticulous attention to every detail.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {[
            { icon: '💍', title: 'Weddings', desc: 'Full-service wedding planning, décor, and coordination tailored to your love story.' },
            { icon: '🎂', title: 'Birthday Celebrations', desc: 'Milestone birthdays made extraordinary — from intimate dinners to lavish parties.' },
            { icon: '🎓', title: 'Graduations', desc: 'Commemorate academic achievements with elegantly styled celebration events.' },
            { icon: '👶', title: 'Baby Showers', desc: 'Warm, whimsical baby shower experiences that celebrate new beginnings.' },
            { icon: '🥂', title: 'Anniversaries', desc: 'Romantic anniversary celebrations crafted to honour your journey together.' },
            { icon: '🏡', title: 'Family Reunions', desc: 'Bringing generations together with expertly organised reunion experiences.' },
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
          <a href="/contact" className="btn-primary inline-block">Plan Your Event</a>
        </div>
      </div>

      <FamilyServicesPreviewSection />
    </div>
  )
}

export default FamilyEvents

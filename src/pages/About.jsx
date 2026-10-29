import SEO from '../components/ui/SEO'
import FAQ from '../components/sections/FAQ'
import { faqItems, teamMembers, leadershipTeam, visionContent, aboutMedia } from '../data/aboutContent'
import { imageFallback, IMAGE_FALLBACK } from '../components/sections/CaseStudiesPreview'

const socialPath = {
  instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.5-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z',
  linkedin: 'M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52zM7.93 18.75H4.98V9.2h2.95v9.55zM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.4-.76 1.36-1.56 2.79-1.56 2.98 0 3.58 1.96 3.58 4.51v5.3z',
}
const profileUrl = value => { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null } catch { return null } }
function MemberCard({ member }) {
  return <article className="member-card">
    <div className="reveal-card member-portrait" tabIndex={0} aria-label={member.name + ', ' + (member.designation || member.role)}>
      <img src={member.image || member.avatar || IMAGE_FALLBACK} alt={member.name} onError={imageFallback} width="600" height="600" loading="lazy" />
      <div className="card-reveal"><h3 className="text-xl font-bold text-white">{member.name}</h3><p className="text-sm text-white/90 mt-1">{member.designation || member.role}</p></div>
    </div>
    <div className="flex justify-center gap-4 mt-4">{Object.entries(socialPath).map(([network, path]) => {
      const url = profileUrl(member[network])
      return url ? <a key={network} href={url} target="_blank" rel="noopener noreferrer" aria-label={member.name + ' on ' + network} className="text-textSecondary hover:text-amber-400 p-2"><svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d={path} /></svg></a> : null
    })}</div>
  </article>
}
export default function About() {
  const members = teamMembers.filter(member => !member.placeholder)
  return <>
    <SEO title="About Us" description="Meet the people and vision behind Ekdrishti Studios." />
    <div className="section-container py-8 md:py-12">
      <section className="relative overflow-hidden rounded-2xl mb-16 md:mb-20">
        <img src={aboutMedia.hero.src} alt={aboutMedia.hero.alt} onError={imageFallback} width="1600" height="650" className="w-full h-[300px] md:h-[440px] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
        <h1 className="absolute bottom-10 left-0 right-0 px-6 text-center text-3xl md:text-5xl font-bold">Refined Vision. Real Impact.</h1>
      </section>
      <section className="grid md:grid-cols-2 gap-8 md:gap-14 items-center mb-16 md:mb-24">
        <div><h2 className="text-3xl font-bold mb-6">{visionContent.title}</h2><div className="space-y-4 text-textSecondary leading-relaxed">{visionContent.paragraphs.map(p => <p key={p}>{p}</p>)}</div></div>
        <img src={aboutMedia.vision.src} alt={aboutMedia.vision.alt} onError={imageFallback} width="800" height="600" loading="lazy" className="w-full aspect-[4/3] rounded-xl object-cover" />
      </section>
      <section className="mb-16"><h2 className="text-center text-3xl font-semibold mb-9">Pillars of Ekdrishti</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{leadershipTeam.map(member => <MemberCard key={member.name} member={member} />)}</div></section>
      <section className="mb-16"><h2 className="text-center text-3xl font-semibold mb-9">The Executors</h2>{members.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{members.map(member => <MemberCard key={member.name} member={member} />)}</div> : <p className="text-center text-textSecondary">Our team profiles are being prepared. Meet more of the people behind our work soon.</p>}</section>
      <FAQ items={faqItems} />
    </div>
  </>
}

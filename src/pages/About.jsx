//original about 
import { stats } from '../data/content'

const About = () => {
  const teamMembers = [
    { name: 'Team Member 1', role: 'Creative Director', avatar: 'https://placehold.co/300x300/2563EB/FFFFFF?text=TM1' },
    { name: 'Team Member 2', role: 'Strategy Lead', avatar: 'https://placehold.co/300x300/38BDF8/FFFFFF?text=TM2' },
    { name: 'Team Member 3', role: 'Marketing Director', avatar: 'https://placehold.co/300x300/2563EB/FFFFFF?text=TM3' },
    { name: 'Team Member 4', role: 'Tech Lead', avatar: 'https://placehold.co/300x300/38BDF8/FFFFFF?text=TM4' },
  ]

  const leadershipTeam = [
    { name: 'Leader Name 1', designation: 'Co-Founder & CEO', image: 'https://placehold.co/300x300/2563EB/FFFFFF?text=Leader1' },
    { name: 'Leader Name 2', designation: 'Co-Founder & Strategy Head', image: 'https://placehold.co/300x300/38BDF8/FFFFFF?text=Leader2' },
    { name: 'Leader Name 3', designation: 'Creative & Operations Head', image: 'https://placehold.co/300x300/2563EB/FFFFFF?text=Leader3' },
  ]

  return (
    <div className="py-24">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-textPrimary mb-6">
            About Us
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            We're a team of creative strategists, designers, and digital marketers passionate about helping brands thrive in the digital age.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <h2 className="text-4xl font-heading font-bold text-textPrimary mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-textSecondary text-lg leading-relaxed">
              <p>
                Founded in 2016, we started with a simple mission: to help businesses build meaningful connections with their audiences through strategic digital marketing.
              </p>
              <p>
                Over the years, we've grown from a small team of three to a dynamic agency of 40+ talented professionals, serving clients across the globe and generating over $50M in revenue for our partners.
              </p>
              <p>
                Our approach combines data-driven insights with creative excellence, ensuring every campaign not only looks great but delivers measurable results.
              </p>
            </div>
          </div>
          <div className="aspect-square rounded-2xl bg-surface flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">🏢</div>
              <p className="text-textSecondary font-medium">ABOUT IMAGE</p>
              <p className="text-sm text-textSecondary/70">Company/Team Photo</p>
            </div>
          </div>
        </div>

        
        

        {/* Leadership */}
        <div className="mb-32">
          <h2 className="text-4xl font-heading font-bold text-textPrimary mb-12 text-center">
            Leadership
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leadershipTeam.map((leader) => (
              <div key={leader.name} className="glass-card p-6 text-center">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full aspect-square object-cover rounded-xl mb-4"
                />
                <h4 className="font-heading font-bold text-textPrimary mb-2">
                  {leader.name}
                </h4>
                <p className="text-textSecondary text-sm">
                  {leader.designation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-24">
          <h2 className="text-4xl font-heading font-bold text-textPrimary mb-12 text-center">
            Meet the Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="glass-card p-6 text-center">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full aspect-square object-cover rounded-xl mb-4"
                />
                <h4 className="font-heading font-bold text-textPrimary mb-2">
                  {member.name}
                </h4>
                <p className="text-textSecondary text-sm">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center glass-card p-12 rounded-3xl">
          <h3 className="text-3xl font-heading font-bold text-textPrimary mb-4">
            Want to Join Our Team?
          </h3>
          <p className="text-textSecondary mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals to join our growing team.
          </p>
          <a href="/contact" className="btn-primary inline-block">
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  )
}

export default About

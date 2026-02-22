import { stats } from '../data/content'

const About = () => {
  const teamMembers = [
    { name: 'Chinmay Shivdikar', role: ' Director', avatar: 'https://placehold.co/300x300/2563EB/FFFFFF?text=TM1' },
    { name: 'Lalit Satardekar', role: 'Director', avatar: 'https://placehold.co/300x300/38BDF8/FFFFFF?text=TM2' },
    { name: 'Shreya Pandav', role: 'Director', avatar: 'https://placehold.co/300x300/2563EB/FFFFFF?text=TM3' },
  ]

  return (
    <div className="py-16 md:py-24">
      <div className="section-container">
        {/* Header */}
          <div className="text-center mb-12 md:mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-textPrimary mb-4 md:mb-6">
            About Us
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            We're a team of creative strategists, designers, and digital marketers passionate about helping brands thrive in the digital age.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 lg:mb-32">
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16 lg:mb-32">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-6 md:p-8 text-center">
              <div className="text-4xl font-heading font-bold text-accent mb-2">
                {stat.value}
              </div>
              <div className="text-textSecondary">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-16 lg:mb-32">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-textPrimary mb-8 md:mb-12 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { title: 'Innovation', desc: 'Pushing boundaries and embracing new ideas', icon: '💡' },
              { title: 'Excellence', desc: 'Delivering quality in everything we do', icon: '⭐' },
              { title: 'Integrity', desc: 'Building trust through transparency', icon: '🤝' },
            ].map((value) => (
              <div key={value.title} className="glass-card p-6 md:p-8 text-center">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-heading font-bold text-textPrimary mb-3">
                  {value.title}
                </h3>
                <p className="text-textSecondary">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-textPrimary mb-8 md:mb-12 text-center">
            Meet the Team
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="glass-card p-6 text-center w-full sm:w-64">
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
        <div className="text-center glass-card p-8 md:p-12 rounded-3xl">
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

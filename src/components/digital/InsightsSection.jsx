import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

gsap.registerPlugin(ScrollTrigger)

/* ─── Chart Data ──────────────────────────────────────────────── */
const lineData = [
  { month: 'Jan', reach: 420, conversions: 180, engagement: 320 },
  { month: 'Feb', reach: 580, conversions: 240, engagement: 410 },
  { month: 'Mar', reach: 510, conversions: 210, engagement: 380 },
  { month: 'Apr', reach: 720, conversions: 310, engagement: 520 },
  { month: 'May', reach: 860, conversions: 390, engagement: 640 },
  { month: 'Jun', reach: 790, conversions: 350, engagement: 590 },
  { month: 'Jul', reach: 1020, conversions: 480, engagement: 780 },
  { month: 'Aug', reach: 1150, conversions: 530, engagement: 870 },
  { month: 'Sep', reach: 980, conversions: 450, engagement: 740 },
  { month: 'Oct', reach: 1280, conversions: 620, engagement: 960 },
  { month: 'Nov', reach: 1400, conversions: 700, engagement: 1080 },
  { month: 'Dec', reach: 1600, conversions: 820, engagement: 1240 },
]

const barData = [
  { platform: 'Instagram', spend: 42, revenue: 148 },
  { platform: 'Google', spend: 38, revenue: 134 },
  { platform: 'Facebook', spend: 28, revenue: 86 },
  { platform: 'LinkedIn', spend: 18, revenue: 72 },
  { platform: 'YouTube', spend: 24, revenue: 92 },
]

const pieData = [
  { name: 'Organic', value: 34 },
  { name: 'Paid Social', value: 28 },
  { name: 'SEM', value: 22 },
  { name: 'Email', value: 10 },
  { name: 'Referral', value: 6 },
]

const PIE_COLORS = ['#2563EB', '#38BDF8', '#F59E0B', '#FBBF24', '#94A3B8']

const KPI_CARDS = [
  { label: 'Cost per Lead',    value: '₹84',   delta: '-18%', up: true },
  { label: 'Click-through Rate', value: '6.7%', delta: '+2.1%', up: true },
  { label: 'Avg. Session',    value: '3m 42s', delta: '+34s', up: true },
  { label: 'Bounce Rate',      value: '28.4%', delta: '-6.2%', up: true },
]

/* ─── Shared Chart Styles ─────────────────────────────────────── */
const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#0F172A',
  border: '1px solid #1F2937',
  borderRadius: '10px',
  color: '#E5E7EB',
  fontSize: 12,
}
const AXIS_TICK = { fill: '#94A3B8', fontSize: 11 }
const GRID_STROKE = '#1F2937'

/* ─── Sub-components ──────────────────────────────────────────── */
const ChartCard = ({ title, children, className = '' }) => (
  <div
    className={`glass-card rounded-2xl p-6 border-borderSubtle
                hover:border-accent/20 hover:shadow-[0_0_32px_rgba(37,99,235,0.08)]
                transition-all duration-300 ${className}`}
  >
    <p className="text-sm font-heading font-semibold text-textSecondary uppercase tracking-widest mb-5">
      {title}
    </p>
    {children}
  </div>
)

const KpiCard = ({ card }) => (
  <div className="glass-card rounded-2xl p-5 flex flex-col gap-2
                  hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]
                  transition-all duration-300">
    <p className="text-xs text-textSecondary uppercase tracking-widest font-medium">{card.label}</p>
    <p className="text-3xl font-heading font-bold text-textPrimary">{card.value}</p>
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start
                  ${card.up ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
    >
      {card.delta} vs last period
    </span>
  </div>
)

/* ─── Main Component ──────────────────────────────────────────── */
const InsightsSection = () => {
  const sectionRef = useRef(null)
  const dashboardRef = useRef(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        dashboardRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0,
          duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: dashboardRef.current,
            start: 'top 78%',
            once: true,
            onEnter: () => setAnimate(true),
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* ambient blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-amber-500/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="section-container">
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-5">
            Data & Analytics
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-textPrimary">
            Insights &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accentLight to-amber-400">
              Growth Analytics
            </span>
          </h2>
          <p className="mt-4 text-textSecondary max-w-xl mx-auto">
            A live view into what drives performance. Every metric tracked, every trend actioned.
          </p>
        </div>

        {/* Dashboard Container */}
        <div
          ref={dashboardRef}
          className="rounded-3xl border border-borderSubtle bg-surface/20 backdrop-blur-xl
                     shadow-[0_0_100px_rgba(37,99,235,0.06)] overflow-hidden p-6 md:p-10 space-y-8"
        >
          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {KPI_CARDS.map((c) => (
              <KpiCard key={c.label} card={c} />
            ))}
          </div>

          {/* Line Graph — full width */}
          <ChartCard title="Monthly Reach · Conversions · Engagement (×1K)">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="month" tick={AXIS_TICK} />
                <YAxis tick={AXIS_TICK} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
                <Line
                  type="monotone" dataKey="reach" stroke="#2563EB" strokeWidth={2.5}
                  dot={false} isAnimationActive={animate} animationDuration={1800}
                />
                <Line
                  type="monotone" dataKey="conversions" stroke="#F59E0B" strokeWidth={2.5}
                  dot={false} isAnimationActive={animate} animationDuration={2000}
                />
                <Line
                  type="monotone" dataKey="engagement" stroke="#38BDF8" strokeWidth={2}
                  dot={false} strokeDasharray="5 3"
                  isAnimationActive={animate} animationDuration={2200}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Bar + Pie side by side */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Bar chart */}
            <ChartCard title="Ad Spend vs Revenue by Platform (₹K)" className="lg:col-span-3">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="platform" tick={AXIS_TICK} />
                  <YAxis tick={AXIS_TICK} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
                  <Bar dataKey="spend" fill="#1E3A5F" radius={[4, 4, 0, 0]} isAnimationActive={animate} animationDuration={1200} />
                  <Bar dataKey="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} isAnimationActive={animate} animationDuration={1400} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Pie chart */}
            <ChartCard title="Traffic Source Breakdown" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={animate}
                    animationDuration={1400}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: '#94A3B8' }}
                    formatter={(value) => <span style={{ color: '#94A3B8' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Footer note */}
          <p className="text-xs text-textSecondary/50 text-center pt-2">
            Dashboard reflects last 12-month performance across managed accounts · Real-time sync available for Pro clients
          </p>
        </div>
      </div>
    </section>
  )
}

export default InsightsSection

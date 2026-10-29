import { useId, useState } from 'react'
import { faqItems } from '../../data/aboutContent'
export const FAQ_ITEMS = faqItems.map(item => ({ q: item.question, a: item.answer }))
export default function FAQ({ items = FAQ_ITEMS }) {
  const [open, setOpen] = useState(0)
  const id = useId()
  return <section className="faq-section py-10 md:py-14 my-10">
    <h2 className="text-2xl md:text-4xl font-bold text-center mb-9">Frequently Asked Questions</h2>
    <div className="max-w-4xl mx-auto space-y-3 px-3">{items.map((item, index) => <div key={index} className={'faq-item rounded-2xl overflow-hidden border ' + (open === index ? 'border-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.14)]' : 'border-borderSubtle')}>
      <h3><button id={id + '-q-' + index} aria-expanded={open === index} aria-controls={id + '-a-' + index} onClick={() => setOpen(open === index ? null : index)} className={'w-full flex justify-between gap-4 text-left px-5 py-5 bg-surface font-semibold ' + (open === index ? 'text-amber-500' : 'text-textPrimary')}><span>{item.q || item.question}</span><span aria-hidden="true" className="text-amber-500">{open === index ? '−' : '+'}</span></button></h3>
      <div hidden={open !== index} id={id + '-a-' + index} role="region" aria-labelledby={id + '-q-' + index} className="px-5 py-5 border-t border-borderSubtle text-textSecondary leading-relaxed">{item.a || item.answer}</div>
    </div>)}</div>
  </section>
}

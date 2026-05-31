'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, getDay, getDaysInMonth, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

type Props = { alertDays: Set<string> }

export default function MiniCalendar({ alertDays }: Props) {
  const [current, setCurrent] = useState(new Date())
  const today = new Date()

  const firstDay = startOfMonth(current)
  const offset = (getDay(firstDay) + 6) % 7
  const daysInMonth = getDaysInMonth(current)
  const year = current.getFullYear()
  const month = current.getMonth()

  const days = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={() => setCurrent(subMonths(current, 1))} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: 4, borderRadius: 6, display: 'flex', cursor: 'pointer' }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>
          {format(current, 'MMMM yyyy', { locale: fr })}
        </span>
        <button onClick={() => setCurrent(addMonths(current, 1))} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: 4, borderRadius: 6, display: 'flex', cursor: 'pointer' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {days.map(d => (
          <div key={d} style={{ fontSize: 10, color: 'var(--text-secondary)', textAlign: 'center', padding: '3px 0', fontWeight: 500 }}>{d}</div>
        ))}
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const hasAlert = alertDays.has(dateStr)
          return (
            <div key={day} style={{
              fontSize: 11, textAlign: 'center', padding: '5px 2px',
              borderRadius: 5,
              background: isToday ? 'var(--accent)' : hasAlert ? 'var(--danger-light)' : 'transparent',
              color: isToday ? '#fff' : hasAlert ? 'var(--danger)' : 'var(--text-secondary)',
              fontWeight: isToday || hasAlert ? 500 : 400,
            }}>{day}</div>
          )
        })}
      </div>
    </div>
  )
}

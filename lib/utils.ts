import { addDays, differenceInDays, startOfDay } from 'date-fns'
import { Vehicle } from './supabase'

export const ALERT_DAYS = 40

export function getAlertDate(v: Vehicle): Date | null {
  if (!v.date_assurance) return null
  return addDays(new Date(v.date_assurance), ALERT_DAYS)
}

export function getDaysUntilAlert(v: Vehicle): number | null {
  const a = getAlertDate(v)
  if (!a) return null
  return differenceInDays(startOfDay(a), startOfDay(new Date()))
}

export type AlertStatus = 'ok' | 'warning' | 'expired' | 'none'

export function getAlertStatus(v: Vehicle): AlertStatus {
  const d = getDaysUntilAlert(v)
  if (d === null) return 'none'
  if (d < 0) return 'expired'
  if (d <= 10) return 'warning'
  return 'ok'
}

export function isCompliant(v: Vehicle): boolean {
  return v.ct_ok && v.cg_ok && v.entretien_ok
}

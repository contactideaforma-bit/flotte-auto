import { createClient as createBrowser } from './supabase-client'

export const supabase = createBrowser()

export type Vehicle = {
  id: string
  created_at: string
  updated_at: string
  immat: string
  model: string
  assurance: string | null
  date_assurance: string | null
  date_sinistre: string | null
  conducteur: string | null
  tel: string | null
  commentaire: string | null
  ct_ok: boolean
  cg_ok: boolean
  entretien_ok: boolean
  user_id: string | null
}

export type VehicleInsert = Omit<Vehicle, 'id' | 'created_at' | 'updated_at' | 'user_id'>

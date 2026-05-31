import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
}

export type VehicleInsert = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>

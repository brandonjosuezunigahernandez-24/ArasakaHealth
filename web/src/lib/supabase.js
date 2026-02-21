import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://xudqdefuoxthkdrsmkqo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZHFkZWZ1b3h0aGtkcnNta3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDg0MTYsImV4cCI6MjA4NzI4NDQxNn0.xtzsawDK1T6pg7onxVsQ_s5rrnzzTs1VngYsvhtGlPI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
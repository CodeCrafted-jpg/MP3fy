import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('downloaded_tracks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ message: 'Supabase error', error }, { status: 500 })
  }

  return NextResponse.json({ data })
}

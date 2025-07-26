import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }



  const { error } = await supabaseAdmin
    .from('downloaded_tracks')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId); // only allow deleting your own files

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
}

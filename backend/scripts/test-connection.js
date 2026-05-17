require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

async function run() {
  console.log('Connecting to:', process.env.SUPABASE_URL)

  // INSERT
  const { data: inserted, error: insertError } = await supabase
    .from('checkins')
    .insert({ mood: 4, energy: 3, wins: ['test connection', 'schema works'] })
    .select()
    .single()

  if (insertError) {
    console.error('INSERT failed:', insertError.message)
    process.exit(1)
  }
  console.log('INSERT ok:', inserted)

  // READ
  const { data: fetched, error: fetchError } = await supabase
    .from('checkins')
    .select('*')
    .eq('id', inserted.id)
    .single()

  if (fetchError) {
    console.error('SELECT failed:', fetchError.message)
    process.exit(1)
  }
  console.log('SELECT ok:', fetched)

  // CLEANUP
  const { error: deleteError } = await supabase
    .from('checkins')
    .delete()
    .eq('id', inserted.id)

  if (deleteError) {
    console.error('DELETE failed:', deleteError.message)
    process.exit(1)
  }
  console.log('DELETE ok — test row cleaned up')
  console.log('\nAll checks passed. Supabase connection is working.')
}

run()

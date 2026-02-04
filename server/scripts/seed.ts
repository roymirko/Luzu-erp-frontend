import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Seeding admin user...');

  const email = 'admin@luzutv.com.ar';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Check if user exists
  const { data: existing } = await supabase
    .from('usuarios')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  if (existing) {
    // Update password and user_type
    const { error } = await supabase
      .from('usuarios')
      .update({
        password_hash: passwordHash,
        user_type: 'administrador',
        active: true
      })
      .eq('id', existing.id);

    if (error) {
      console.error('Failed to update admin:', error);
      process.exit(1);
    }
    console.log('Admin user updated:', email);
  } else {
    // Create new admin
    const { error } = await supabase
      .from('usuarios')
      .insert({
        email: email,
        first_name: 'Admin',
        last_name: 'Luzu',
        password_hash: passwordHash,
        user_type: 'administrador',
        active: true,
        creado_por: 'system'
      });

    if (error) {
      console.error('Failed to create admin:', error);
      process.exit(1);
    }
    console.log('Admin user created:', email);
  }

  console.log('Password:', adminPassword);
  console.log('Done!');
}

seed();

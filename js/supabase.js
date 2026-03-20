// Inicializamos el cliente de Supabase
// NOTA: REEMPLAZAR ESTOS VALORES CON LA URL Y ANOY KEY DEL PROYECTO
const SUPABASE_URL = 'https://bgaujemhaewxxulhsdti.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ezqdN3GCiF1AwVHsg7SmWg_McqBY8W6';

// Solo inicializamos si la librería está cargada
let supabaseClient;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error('Supabase no se ha cargado correctamente.');
}

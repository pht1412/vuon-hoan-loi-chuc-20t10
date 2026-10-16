import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://dlfmqvezojtqhvzpajjc.supabase.co';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_vxqEty0w00MgJLzNa2rrXg_-jLEu2Ec';

/**
 * Supabase Client dùng cho Frontend (Browser)
 * Kết nối Realtime WebSocket để lắng nghe sự kiện xóa / ghim / ẩn / thêm mới lời chúc tức thì
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

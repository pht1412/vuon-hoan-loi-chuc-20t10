-- ==============================================================================
-- VƯỜN LỜI CHÚC 20/10 - SUPABASE DATABASE SCHEMA (PRODUCTION SẠCH 100%)
-- Bảng duy nhất: public_messages (Lưu trữ, ghim nổi bật và kiểm duyệt lời chúc)
-- ==============================================================================

-- 1. Tạo bảng public.public_messages
CREATE TABLE IF NOT EXISTS public.public_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL CHECK (char_length(btrim(content)) BETWEEN 3 AND 300),
  display_name TEXT CHECK (display_name IS NULL OR char_length(btrim(display_name)) <= 40),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  idempotency_key UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Nếu bảng đã tồn tại từ trước, bổ sung các cột cần thiết
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'public_messages' AND column_name = 'is_hidden') THEN
    ALTER TABLE public.public_messages ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'public_messages' AND column_name = 'is_pinned') THEN
    ALTER TABLE public.public_messages ADD COLUMN is_pinned BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- 2. Đánh chỉ mục (Index) tăng tốc truy vấn theo thời gian & độ ưu tiên ghim
CREATE INDEX IF NOT EXISTS idx_public_messages_display
  ON public.public_messages (is_pinned DESC, created_at DESC)
  WHERE is_hidden = false;

CREATE INDEX IF NOT EXISTS idx_public_messages_admin
  ON public.public_messages (created_at DESC);

-- 3. Cấu hình Row Level Security (RLS) và quyền SQL
ALTER TABLE public.public_messages ENABLE ROW LEVEL SECURITY;

-- Chuẩn hóa policy trên riêng bảng này để không giữ lại policy cũ có quyền rộng hơn.
DO $$
DECLARE
  existing_policy RECORD;
BEGIN
  FOR existing_policy IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'public_messages'
  LOOP
    EXECUTE format(
      'DROP POLICY %I ON public.public_messages',
      existing_policy.policyname
    );
  END LOOP;
END $$;

-- Khách chỉ được đọc lời chúc đang hiển thị và gửi lời chúc mới.
REVOKE ALL PRIVILEGES ON TABLE public.public_messages FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.public_messages TO anon, authenticated;
GRANT INSERT (content, display_name, is_anonymous, idempotency_key)
  ON TABLE public.public_messages TO anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.public_messages TO service_role;

CREATE POLICY "Cho phép đọc lời chúc công khai"
  ON public.public_messages
  FOR SELECT
  USING (is_hidden = false);

-- Cho phép gửi lời chúc công khai
CREATE POLICY "Cho phép gửi lời chúc công khai"
  ON public.public_messages
  FOR INSERT
  WITH CHECK (
    char_length(btrim(content)) BETWEEN 3 AND 300
    AND (display_name IS NULL OR char_length(btrim(display_name)) <= 40)
    AND is_hidden = false
    AND is_pinned = false
  );

-- 4. Kích hoạt tính năng Supabase Realtime cho bảng public_messages
-- Đảm bảo sự kiện XÓA / GHIM / ẨN / THÊM MỚI phát sóng tức thì (0ms) đến mọi thiết bị người dùng
DO $$
BEGIN
  -- Bổ sung bảng vào publication supabase_realtime nếu chưa có
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'public_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.public_messages;
  END IF;
END $$;

-- Realtime DELETE không áp dụng lọc RLS; chỉ phát primary key, không phát nội dung bản ghi.
ALTER TABLE public.public_messages REPLICA IDENTITY DEFAULT;

-- Các thao tác ghim/ẩn/xóa chỉ được thực hiện qua Admin API dùng
-- SUPABASE_SERVICE_ROLE_KEY phía server; không cấp quyền ghi cho anon/authenticated.

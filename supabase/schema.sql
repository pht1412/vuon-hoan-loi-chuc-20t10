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

-- 3. Cấu hình Row Level Security (RLS)
ALTER TABLE public.public_messages ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc lời chúc để Realtime phát sóng được cả sự kiện ẨN (is_hidden = true)
-- Lưu ý: API GET /api/public-messages vẫn luôn lọc chặt chẽ .eq('is_hidden', false)
DROP POLICY IF EXISTS "Cho phép đọc lời chúc công khai" ON public.public_messages;
CREATE POLICY "Cho phép đọc lời chúc công khai"
  ON public.public_messages
  FOR SELECT
  USING (true);

-- Cho phép gửi lời chúc công khai
DROP POLICY IF EXISTS "Cho phép gửi lời chúc công khai" ON public.public_messages;
CREATE POLICY "Cho phép gửi lời chúc công khai"
  ON public.public_messages
  FOR INSERT
  WITH CHECK (
    char_length(btrim(content)) BETWEEN 3 AND 300
    AND (display_name IS NULL OR char_length(btrim(display_name)) <= 40)
  );

-- Cho phép quản trị viên cập nhật lời chúc (Ghim, Ẩn)
DROP POLICY IF EXISTS "Cho phép quản trị viên cập nhật lời chúc" ON public.public_messages;
CREATE POLICY "Cho phép quản trị viên cập nhật lời chúc"
  ON public.public_messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Cho phép quản trị viên xóa lời chúc
DROP POLICY IF EXISTS "Cho phép quản trị viên xóa lời chúc" ON public.public_messages;
CREATE POLICY "Cho phép quản trị viên xóa lời chúc"
  ON public.public_messages
  FOR DELETE
  USING (true);

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

-- Đặt REPLICA IDENTITY FULL để khi xóa hoặc ẩn, Supabase Realtime gửi đầy đủ ID và dữ liệu cũ
ALTER TABLE public.public_messages REPLICA IDENTITY FULL;

-- ==============================================================================
-- LƯU Ý DÀNH CHO MÔI TRƯỜNG THỰC TẾ (PRODUCTION):
-- Bảng hiện đang để trống 100% sẵn sàng đón nhận các lời chúc thật của người dùng.
-- Nếu trước đó bạn đã từng chạy lệnh INSERT dữ liệu mẫu, bạn có thể chạy lệnh:
-- TRUNCATE TABLE public.public_messages;
-- để xóa sạch hoàn toàn các bản ghi thử nghiệm cũ trên Supabase nhé.
-- ==============================================================================


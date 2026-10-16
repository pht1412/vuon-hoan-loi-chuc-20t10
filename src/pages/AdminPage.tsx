import React, { useState, useEffect, useMemo } from 'react';
import { PublicMessage, getSenderDisplayName } from '../types/message';
import {
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Flower2,
  Pin,
  EyeOff as HideIcon,
  Eye as ShowIcon,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Home,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './AdminPage.css';

interface AdminPageProps {
  onBackToGarden: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToGarden }) => {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('garden_admin_token');
  });

  // Login Form States
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard Data States
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'visible' | 'pinned' | 'hidden'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Check login status & load messages + kết nối kênh Realtime
  useEffect(() => {
    if (!token) return;

    loadAdminMessages(token);

    // Lắng nghe thay đổi Realtime để đồng bộ giao diện Admin khi có lời chúc mới hoặc thay đổi
    const channel = supabase
      .channel('admin_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'public_messages',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as any;
            if (row && row.id) {
              const newMsg: PublicMessage = {
                id: row.id,
                content: row.content,
                displayName: row.display_name,
                isPinned: Boolean(row.is_pinned),
                isHidden: Boolean(row.is_hidden),
                isAnonymous: Boolean(row.is_anonymous),
                createdAt: row.created_at,
              };
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [newMsg, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as any;
            if (row && row.id) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === row.id
                    ? {
                        ...m,
                        content: row.content,
                        displayName: row.display_name,
                        isPinned: Boolean(row.is_pinned),
                        isHidden: Boolean(row.is_hidden),
                        isAnonymous: Boolean(row.is_anonymous),
                      }
                    : m
                )
              );
            }
          } else if (payload.eventType === 'DELETE') {
            const delId = (payload.old as any)?.id;
            if (delId) {
              setMessages((prev) => prev.filter((m) => m.id !== delId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [token]);

  const loadAdminMessages = async (authToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin?action=messages', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.status === 401) {
        // Token hết hạn
        sessionStorage.removeItem('garden_admin_token');
        setToken(null);
        setLoginError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách quản trị:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('garden_admin_token', data.token);
        setToken(data.token);
        setPassword('');
      } else {
        setLoginError(data.error || 'Mật khẩu quản trị không đúng.');
      }
    } catch {
      setLoginError('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('garden_admin_token');
    setToken(null);
    setMessages([]);
  };

  const handleTogglePin = async (msg: PublicMessage) => {
    if (!token) return;
    setActionLoadingId(msg.id);
    const newPinned = !msg.isPinned;

    try {
      const res = await fetch('/api/admin?action=update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: msg.id, isPinned: newPinned }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((item) => (item.id === msg.id ? { ...item, isPinned: newPinned } : item))
        );
        try {
          supabase.channel('garden_public_messages_realtime').send({
            type: 'broadcast',
            event: 'admin_toggle_pin',
            payload: { id: msg.id, isPinned: newPinned },
          });
        } catch (e) {
          console.warn('Lỗi gửi broadcast ghim:', e);
        }
      }
    } catch (err) {
      console.error('Lỗi đổi trạng thái ghim:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleHide = async (msg: PublicMessage) => {
    if (!token) return;
    setActionLoadingId(msg.id);
    const newHidden = !msg.isHidden;

    try {
      const res = await fetch('/api/admin?action=update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: msg.id, isHidden: newHidden }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((item) => (item.id === msg.id ? { ...item, isHidden: newHidden } : item))
        );
        // Bắn broadcast Realtime tức thì 0ms tới mọi thiết bị đang xem vườn
        try {
          supabase.channel('garden_public_messages_realtime').send({
            type: 'broadcast',
            event: 'admin_toggle_hide',
            payload: { id: msg.id, isHidden: newHidden },
          });
        } catch (e) {
          console.warn('Lỗi gửi broadcast ẩn/hiện:', e);
        }
      }
    } catch (err) {
      console.error('Lỗi đổi trạng thái ẩn:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (msg: PublicMessage) => {
    if (!token) return;
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa vĩnh viễn lời chúc từ "${getSenderDisplayName(msg)}"?`
    );
    if (!confirmDelete) return;

    setActionLoadingId(msg.id);
    try {
      const res = await fetch(`/api/admin?action=delete&id=${encodeURIComponent(msg.id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((item) => item.id !== msg.id));
        // Bắn broadcast Realtime tức thì 0ms tới mọi thiết bị đang xem vườn
        try {
          supabase.channel('garden_public_messages_realtime').send({
            type: 'broadcast',
            event: 'admin_delete',
            payload: { id: msg.id },
          });
        } catch (e) {
          console.warn('Lỗi gửi broadcast xóa:', e);
        }
      }
    } catch (err) {
      console.error('Lỗi xóa lời chúc:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Stats
  const totalCount = messages.length;
  const visibleCount = messages.filter((m) => !m.isHidden).length;
  const pinnedCount = messages.filter((m) => m.isPinned).length;
  const hiddenCount = messages.filter((m) => m.isHidden).length;

  // Filtered list
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Filter by tab
      if (activeFilter === 'visible' && msg.isHidden) return false;
      if (activeFilter === 'pinned' && !msg.isPinned) return false;
      if (activeFilter === 'hidden' && !msg.isHidden) return false;

      // Filter by search
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const sender = getSenderDisplayName(msg).toLowerCase();
        const content = msg.content.toLowerCase();
        return sender.includes(query) || content.includes(query);
      }

      return true;
    });
  }, [messages, activeFilter, searchQuery]);

  // ==================== RENDER: LOGIN FORM ====================
  if (!token) {
    return (
      <div className="admin-page-root">
        <div className="admin-login-wrapper">
          <div className="admin-login-card">
            <div className="admin-login-icon">
              <Lock size={26} />
            </div>
            <h1 className="admin-login-title">Khu Vực Quản Trị</h1>
            <p className="admin-login-desc">
              Vui lòng nhập mật khẩu quản trị viên để quản lý và kiểm duyệt lời chúc.
            </p>

            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="admin-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="admin-input"
                  placeholder="Nhập mật khẩu quản trị..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="admin-input-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {loginError && (
                <div className="admin-login-error">
                  <AlertCircle size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="admin-btn-primary"
                disabled={isLoggingIn || !password.trim()}
              >
                {isLoggingIn ? 'Đang xác thực...' : 'Đăng nhập Quản Trị'}
              </button>

              <button
                type="button"
                className="admin-btn-secondary"
                onClick={onBackToGarden}
              >
                ← Quay lại Khu vườn 20/10
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER: DASHBOARD VIEW ====================
  return (
    <div className="admin-page-root">
      {/* Top Sticky Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <div className="admin-brand-icon">
              <Flower2 size={22} />
            </div>
            <div>
              <div className="admin-brand-title">Vườn Lời Chúc 20/10</div>
              <span className="admin-brand-badge">Trang Quản Trị Viên</span>
            </div>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              className="admin-nav-btn"
              onClick={onBackToGarden}
              title="Xem giao diện ngoài vườn"
            >
              <Home size={15} />
              <span>Xem vườn</span>
            </button>
            <button
              type="button"
              className="admin-nav-btn logout"
              onClick={handleLogout}
              title="Đăng xuất khỏi bảng quản trị"
            >
              <LogOut size={15} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="admin-main">
        {/* Stats Row */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon total">
              <MessageSquare size={22} />
            </div>
            <div>
              <div className="admin-stat-number">{totalCount}</div>
              <div className="admin-stat-label">Tổng lời chúc</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon visible">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="admin-stat-number">{visibleCount}</div>
              <div className="admin-stat-label">Đang hiển thị</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon pinned">
              <Pin size={22} />
            </div>
            <div>
              <div className="admin-stat-number">{pinnedCount}</div>
              <div className="admin-stat-label">Đã ghim nổi bật</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon hidden">
              <HideIcon size={22} />
            </div>
            <div>
              <div className="admin-stat-number">{hiddenCount}</div>
              <div className="admin-stat-label">Đã ẩn (Kiểm duyệt)</div>
            </div>
          </div>
        </section>

        {/* Filters and Search Toolbar */}
        <section className="admin-toolbar">
          <div className="admin-filter-tabs">
            <button
              type="button"
              className={`admin-filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Tất cả ({totalCount})
            </button>
            <button
              type="button"
              className={`admin-filter-tab ${activeFilter === 'visible' ? 'active' : ''}`}
              onClick={() => setActiveFilter('visible')}
            >
              Đang hiển thị ({visibleCount})
            </button>
            <button
              type="button"
              className={`admin-filter-tab ${activeFilter === 'pinned' ? 'active' : ''}`}
              onClick={() => setActiveFilter('pinned')}
            >
              Đã ghim ⭐ ({pinnedCount})
            </button>
            <button
              type="button"
              className={`admin-filter-tab ${activeFilter === 'hidden' ? 'active' : ''}`}
              onClick={() => setActiveFilter('hidden')}
            >
              Đã ẩn ({hiddenCount})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="admin-search-box">
              <Search size={15} color="var(--color-text-muted)" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Tìm lời chúc, người gửi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="admin-nav-btn"
              onClick={() => token && loadAdminMessages(token)}
              title="Làm mới danh sách"
              style={{ padding: '0.45rem 0.65rem' }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </section>

        {/* Messages List */}
        {isLoading ? (
          <div className="admin-empty-state">Đang tải danh sách lời chúc...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="admin-empty-state">Không có lời chúc nào phù hợp với bộ lọc.</div>
        ) : (
          <div className="admin-messages-container">
            {filteredMessages.map((msg) => {
              const isActing = actionLoadingId === msg.id;
              const formattedDate = new Date(msg.createdAt).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });

              return (
                <article
                  key={msg.id}
                  className={`admin-message-card ${msg.isHidden ? 'is-hidden' : ''} ${
                    msg.isPinned ? 'is-pinned' : ''
                  }`}
                >
                  <div className="admin-msg-content-col">
                    <div className="admin-msg-header">
                      <span className="admin-msg-sender">{getSenderDisplayName(msg)}</span>
                      <span className="admin-msg-time">{formattedDate}</span>

                      {msg.isPinned && (
                        <span className="admin-badge-pinned">
                          <Pin size={11} /> Ghim nổi bật
                        </span>
                      )}

                      {msg.isHidden && (
                        <span className="admin-badge-hidden">
                          <HideIcon size={11} /> Đã ẩn
                        </span>
                      )}
                    </div>

                    <p className="admin-msg-text">{msg.content}</p>
                  </div>

                  <div className="admin-msg-actions-col">
                    {/* Nút Ghim */}
                    <button
                      type="button"
                      className={`admin-action-btn pin-btn ${msg.isPinned ? 'active' : ''}`}
                      disabled={isActing}
                      onClick={() => handleTogglePin(msg)}
                      title={msg.isPinned ? 'Bỏ ghim lời chúc này' : 'Ghim lời chúc này lên đầu'}
                    >
                      <Pin size={13} />
                      <span>{msg.isPinned ? 'Bỏ ghim' : 'Ghim'}</span>
                    </button>

                    {/* Nút Ẩn/Hiện */}
                    <button
                      type="button"
                      className={`admin-action-btn hide-btn ${msg.isHidden ? 'active' : ''}`}
                      disabled={isActing}
                      onClick={() => handleToggleHide(msg)}
                      title={msg.isHidden ? 'Hiển thị lại ngoài vườn' : 'Ẩn lời chúc này khỏi vườn'}
                    >
                      {msg.isHidden ? <ShowIcon size={13} /> : <HideIcon size={13} />}
                      <span>{msg.isHidden ? 'Hiện' : 'Ẩn'}</span>
                    </button>

                    {/* Nút Xóa vĩnh viễn */}
                    <button
                      type="button"
                      className="admin-action-btn delete-btn"
                      disabled={isActing}
                      onClick={() => handleDelete(msg)}
                      title="Xóa vĩnh viễn lời chúc"
                    >
                      <Trash2 size={13} />
                      <span>Xóa</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PublicMessage } from '../types/message';
import { PrivateJourneyData } from '../types/journey';
import { initialPublicMessages, devDemoMessages } from '../data/publicMessages';
import { fetchPublicMessages } from '../services/messageApi';
import { supabase } from '../lib/supabaseClient';
import { HeroSection } from '../components/HeroSection';
import { FloatingMessageField } from '../components/FloatingMessageField';
import { ActionArea } from '../components/ActionArea';
import { MessageDetailDialog } from '../components/MessageDetailDialog';
import { SendMessageDialog } from '../components/SendMessageDialog';
import { PasscodeDialog } from '../components/journey/PasscodeDialog';
import { JourneyShell } from '../components/journey/JourneyShell';
import { GardenAmbience } from '../components/GardenAmbience';
import { MusicChoiceDialog } from '../components/MusicChoiceDialog';
import { PublicFlowerGarden } from '../components/PublicFlowerGarden';
import { Lock, Volume2, VolumeX } from 'lucide-react';

const MUSIC_PREF_KEY = 'garden_music_pref';

const CACHE_KEY = 'vuon_public_messages_cache';

// Sắp xếp lời chúc: Tin ghim lên trước, sau đó sắp xếp theo thời gian mới nhất
function sortMessages(list: PublicMessage[]): PublicMessage[] {
  return [...list].sort((a, b) => {
    if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
      return a.isPinned ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// Đọc bộ nhớ tạm để hiển thị tức thì (0ms) ngay khi tải lại trang (F5), tránh hiện tượng giật màn hình rỗng
function getInitialMessages(): { list: PublicMessage[]; hasCache: boolean } {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { list: parsed, hasCache: true };
      }
    }
  } catch {
    // Không đọc được cache, rơi vào chế độ tải từ server
  }
  return { list: initialPublicMessages, hasCache: false };
}

interface GardenPageProps {
  onNavigateToAdmin?: () => void;
}

export const GardenPage: React.FC<GardenPageProps> = ({ onNavigateToAdmin }) => {
  const initialData = getInitialMessages();
  const [messages, setMessages] = useState<PublicMessage[]>(initialData.list);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData.hasCache);
  const [selectedMessage, setSelectedMessage] = useState<PublicMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [isPublicGardenOpen, setIsPublicGardenOpen] = useState(false);
  const [journeyData, setJourneyData] = useState<PrivateJourneyData | null>(null);
  const [activeTriggerEl, setActiveTriggerEl] = useState<HTMLElement | null>(null);

  // Hiệu ứng hạt mầm phát sáng khi gửi lời chúc thành công
  const [isSeedFlaring, setIsSeedFlaring] = useState(false);
  // Chế độ xem trước bố cục 12 lời chúc (Local/Dev only - không lưu vào CSDL)
  const [isDevDemoActive, setIsDevDemoActive] = useState(false);

  // ── Nhạc vườn công khai ──
  const gardenAudioRef = useRef<HTMLAudioElement | null>(null);

  // Preference người dùng: 'on' | 'off' | null (null = chưa chọn lần nào)
  const savedPref = (() => { try { return localStorage.getItem(MUSIC_PREF_KEY); } catch { return null; } })();

  // Hiện dialog lựa chọn nếu chưa có preference
  const [showMusicDialog, setShowMusicDialog] = useState<boolean>(savedPref === null);
  // isMusicOn = ý định của người dùng (preference), KHÔNG đồng nghĩa nhạc đang phát
  const [isMusicOn, setIsMusicOn] = useState<boolean>(savedPref === 'on');
  // isActuallyPlaying = trạng thái phát thực tế từ audio element
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);

  // Khởi tạo Audio một lần duy nhất.
  // Nếu preference là 'on' lúc tải trang, thử phát ngay sau khi instance sẵn sàng.
  useEffect(() => {
    const audio = new Audio('/public.mp3');
    audio.loop = true;
    audio.volume = 0.55;
    gardenAudioRef.current = audio;

    const onPlay  = () => setIsActuallyPlaying(true);
    const onPause = () => setIsActuallyPlaying(false);
    const onError = (e: Event) => {
      const mediaErr = (e.target as HTMLAudioElement)?.error;
      console.warn('[Garden Music] Audio load error:', mediaErr?.code, mediaErr?.message ?? e.type);
      setIsActuallyPlaying(false);
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    // Thử autoplay một lần nếu preference đã lưu là 'on'.
    // savedPref được đọc từ localStorage khi render — đọc lại để chắc chắn đúng giá trị tại thời điểm này.
    const prefAtMount = (() => { try { return localStorage.getItem(MUSIC_PREF_KEY); } catch { return null; } })();
    if (prefAtMount === 'on') {
      audio.play().catch((err: Error) => {
        if (err.name === 'NotAllowedError') {
          // Trình duyệt chặn autoplay — bình thường, không retry, không xóa preference
          // isActuallyPlaying vẫn false → icon VolumeX → user bấm nút là phát được ngay
        } else {
          // Lỗi thực sự khác (file không tồn tại, codec không hỗ trợ, v.v.)
          console.warn('[Garden Music] Autoplay on reload failed:', err.name, err.message);
        }
      });
    }

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.pause();
      gardenAudioRef.current = null;
    };
  }, []); // chỉ chạy một lần khi mount

  // Gọi play() trực tiếp trong click handler — đảm bảo có user activation
  const playGardenAudio = useCallback(() => {
    const audio = gardenAudioRef.current;
    if (!audio) return;
    audio.play().catch((err: Error) => {
      if (err.name === 'NotAllowedError') {
        // Trình duyệt chặn — không log liên tục, giữ trạng thái tắt để user thử lại
        setIsActuallyPlaying(false);
      } else {
        console.warn('[Garden Music] play() failed:', err.name, err.message);
      }
    });
  }, []);

  // Xử lý khi người dùng chọn từ dialog lựa chọn nhạc
  const handleMusicDialogChoice = (wantMusic: boolean) => {
    try { localStorage.setItem(MUSIC_PREF_KEY, wantMusic ? 'on' : 'off'); } catch { /* ignore */ }
    setIsMusicOn(wantMusic);
    setShowMusicDialog(false);
    if (wantMusic) {
      // play() trực tiếp từ click event — user activation còn hiệu lực
      playGardenAudio();
    }
  };

  // Xử lý khi người dùng bấm nút nhạc cố định
  const handleToggleGardenMusic = () => {
    const audio = gardenAudioRef.current;
    if (!audio) return;

    if (isActuallyPlaying) {
      // Đang phát → dừng
      audio.pause();
      setIsMusicOn(false);
      try { localStorage.setItem(MUSIC_PREF_KEY, 'off'); } catch { /* ignore */ }
    } else {
      // Đang tắt → thử phát (có user activation từ click)
      setIsMusicOn(true);
      try { localStorage.setItem(MUSIC_PREF_KEY, 'on'); } catch { /* ignore */ }
      playGardenAudio();
    }
  };

  // Dừng nhạc vườn (khi vào hành trình riêng)
  const pauseGardenMusic = useCallback(() => {
    gardenAudioRef.current?.pause();
  }, []);

  // Tiếp tục nhạc vườn nếu preference là 'on' (khi thoát hành trình riêng)
  // Không gọi play() tự động — để user bấm nút nếu trình duyệt chặn
  const resumeGardenMusicIfNeeded = useCallback(() => {
    if (!isMusicOn) return;
    const audio = gardenAudioRef.current;
    if (!audio) return;
    audio.play().catch(() => {
      // Bị chặn khi resume — giữ icon tắt, user có thể bấm nút để bật lại
      setIsActuallyPlaying(false);
    });
  }, [isMusicOn]);

  // Nạp danh sách lời chúc từ máy chủ VÀ kích hoạt Supabase Realtime Channel
  // Khi Quản trị viên XÓA, ẨN, GHIM hoặc người dùng gửi lời chúc -> Mọi màn hình cập nhật ngay lập tức (0ms)
  useEffect(() => {
    let isMounted = true;

    // 1. Tải danh sách ban đầu từ API
    fetchPublicMessages()
      .then((data) => {
        if (!isMounted) return;
        if (!isDevDemoActive) {
          const list = sortMessages(data || []);
          setMessages(list);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
          } catch {
            // ignore
          }
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    // 2. Kênh Realtime lắng nghe mọi sự kiện INSERT / UPDATE / DELETE trên bảng public_messages
    // và các sự kiện Broadcast tức thì từ trang Quản trị viên (đặc biệt là ẨN/HIỆN 0ms)
    const channel = supabase
      .channel('garden_public_messages_realtime')
      .on(
        'broadcast',
        { event: 'admin_toggle_hide' },
        ({ payload }: any) => {
          if (!payload?.id || !isMounted || isDevDemoActive) return;
          console.log('⚡ [Broadcast] Thay đổi ẩn/hiện từ Admin:', payload);
          if (payload.isHidden) {
            setMessages((prev) => {
              const next = prev.filter((m) => m.id !== payload.id);
              try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(next));
              } catch {
                // ignore
              }
              return next;
            });
            setSelectedMessage((current) => {
              if (current && current.id === payload.id) {
                setIsDetailOpen(false);
                return null;
              }
              return current;
            });
          } else {
            // Nếu admin bật hiển thị lại -> Nạp lại dữ liệu
            fetchPublicMessages().then((data) => {
              if (!isMounted) return;
              const sorted = sortMessages(data || []);
              setMessages(sorted);
              try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(sorted));
              } catch {
                // ignore
              }
            });
          }
        }
      )
      .on(
        'broadcast',
        { event: 'admin_delete' },
        ({ payload }: any) => {
          if (!payload?.id || !isMounted || isDevDemoActive) return;
          console.log('⚡ [Broadcast] Xóa từ Admin:', payload);
          setMessages((prev) => {
            const next = prev.filter((m) => m.id !== payload.id);
            try {
              sessionStorage.setItem(CACHE_KEY, JSON.stringify(next));
            } catch {
              // ignore
            }
            return next;
          });
          setSelectedMessage((current) => {
            if (current && current.id === payload.id) {
              setIsDetailOpen(false);
              return null;
            }
            return current;
          });
        }
      )
      .on(
        'broadcast',
        { event: 'admin_toggle_pin' },
        ({ payload }: any) => {
          if (!payload?.id || !isMounted || isDevDemoActive) return;
          console.log('⚡ [Broadcast] Ghim từ Admin:', payload);
          setMessages((prev) => {
            const next = prev.map((m) =>
              m.id === payload.id ? { ...m, isPinned: Boolean(payload.isPinned) } : m
            );
            const sorted = sortMessages(next);
            try {
              sessionStorage.setItem(CACHE_KEY, JSON.stringify(sorted));
            } catch {
              // ignore
            }
            return sorted;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'public_messages',
        },
        (payload) => {
          if (!isMounted || isDevDemoActive) return;

          console.log('⚡ [Supabase Realtime]', payload.eventType, payload);

          // TRƯỜNG HỢP 1: ADMIN BẤM XÓA
          if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setMessages((prev) => {
                const next = prev.filter((m) => m.id !== deletedId);
                try {
                  sessionStorage.setItem(CACHE_KEY, JSON.stringify(next));
                } catch {
                  // ignore
                }
                return next;
              });

              // Nếu người dùng đang mở xem chi tiết chính lời chúc bị xóa -> Đóng modal ngay tức khắc
              setSelectedMessage((current) => {
                if (current && current.id === deletedId) {
                  setIsDetailOpen(false);
                  return null;
                }
                return current;
              });
            }
          }

          // TRƯỜNG HỢP 2: ADMIN BẤM ẨN HOẶC GHIM / CẬP NHẬT
          else if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new as any;
            if (updatedRow && updatedRow.id) {
              // Nếu bị ẨN -> Biến mất khỏi màn hình người dùng ngay
              if (updatedRow.is_hidden) {
                setMessages((prev) => {
                  const next = prev.filter((m) => m.id !== updatedRow.id);
                  try {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify(next));
                  } catch {
                    // ignore
                  }
                  return next;
                });

                setSelectedMessage((current) => {
                  if (current && current.id === updatedRow.id) {
                    setIsDetailOpen(false);
                    return null;
                  }
                  return current;
                });
              } else {
                // Nếu được GHIM hoặc hiển thị lại
                setMessages((prev) => {
                  const exists = prev.some((m) => m.id === updatedRow.id);
                  let next: PublicMessage[];
                  if (exists) {
                    next = prev.map((m) =>
                      m.id === updatedRow.id
                        ? {
                            ...m,
                            content: updatedRow.content,
                            displayName: updatedRow.display_name,
                            isPinned: Boolean(updatedRow.is_pinned),
                            isAnonymous: Boolean(updatedRow.is_anonymous),
                          }
                        : m
                    );
                  } else {
                    next = [
                      {
                        id: updatedRow.id,
                        content: updatedRow.content,
                        displayName: updatedRow.display_name,
                        isPinned: Boolean(updatedRow.is_pinned),
                        isAnonymous: Boolean(updatedRow.is_anonymous),
                        createdAt: updatedRow.created_at,
                      },
                      ...prev,
                    ];
                  }
                  const sorted = sortMessages(next);
                  try {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify(sorted));
                  } catch {
                    // ignore
                  }
                  return sorted;
                });
              }
            }
          }

          // TRƯỜNG HỢP 3: CÓ NGƯỜI VỪA GỬI LỜI CHÚC MỚI (INSERT)
          else if (payload.eventType === 'INSERT') {
            const newRow = payload.new as any;
            if (newRow && newRow.id && !newRow.is_hidden) {
              const newMsg: PublicMessage = {
                id: newRow.id,
                content: newRow.content,
                displayName: newRow.display_name,
                isPinned: Boolean(newRow.is_pinned),
                isAnonymous: Boolean(newRow.is_anonymous),
                createdAt: newRow.created_at,
              };

              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                const sorted = sortMessages([newMsg, ...prev]);
                try {
                  sessionStorage.setItem(CACHE_KEY, JSON.stringify(sorted));
                } catch {
                  // ignore
                }
                return sorted;
              });
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🌸 [Realtime] Đã kết nối kênh phát sóng lời chúc thời gian thực.');
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [isDevDemoActive]);

  // Bật/tắt chế độ xem thử nghiệm 12 lời chúc
  const handleToggleDevDemo = () => {
    if (isDevDemoActive) {
      setIsDevDemoActive(false);
      setIsLoading(true);
      fetchPublicMessages()
        .then((data) => {
          const list = data || [];
          setMessages(list);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
          } catch {
            // ignore
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsDevDemoActive(true);
      setMessages(devDemoMessages);
    }
  };

  // Mở modal xem chi tiết lời chúc
  const handleSelectMessage = (message: PublicMessage, triggerEl: HTMLElement) => {
    setActiveTriggerEl(triggerEl);
    setSelectedMessage(message);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  // Mở modal gửi lời chúc mới (Milestone 2)
  const handleSendWishClick = (triggerEl: HTMLElement) => {
    setActiveTriggerEl(triggerEl);
    setIsSendDialogOpen(true);
  };

  const handleCloseSendDialog = () => {
    setIsSendDialogOpen(false);
  };

  const handlePublicGardenClick = (triggerEl: HTMLElement) => {
    setActiveTriggerEl(triggerEl);
    setIsPublicGardenOpen(true);
  };

  const handleClosePublicGarden = () => {
    setIsPublicGardenOpen(false);
  };

  // Callback khi gửi lời chúc thành công -> Thêm vào đầu danh sách, lưu cache & phát sáng hạt mầm
  const handleMessageSent = (newMessage: PublicMessage) => {
    setMessages((prev) => {
      const updated = [newMessage, ...prev];
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setIsLoading(false);
    setIsSeedFlaring(true);
    setTimeout(() => {
      setIsSeedFlaring(false);
    }, 2800);
  };

  // Mở modal nhập mật mã phong bì riêng (Milestone 3)
  const handlePrivateEnvelopeClick = (triggerEl: HTMLElement) => {
    setActiveTriggerEl(triggerEl);
    setIsPasscodeOpen(true);
  };

  const handleClosePasscode = () => {
    setIsPasscodeOpen(false);
  };

  // Khi xác thực mật mã thành công -> Chuyển vào Hành trình riêng
  const handlePasscodeSuccess = (data: PrivateJourneyData) => {
    pauseGardenMusic();   // Dừng nhạc vườn TRƯỚC khi mở hành trình
    setIsPasscodeOpen(false);
    setJourneyData(data);
  };

  const handleExitJourney = () => {
    setJourneyData(null);
    // resumeGardenMusicIfNeeded sẽ được gọi sau khi JourneyShell unmount
    // dùng setTimeout nhỏ để đảm bảo nhạc riêng đã dừng
    setTimeout(() => resumeGardenMusicIfNeeded(), 100);
  };

  return (
    <div className="garden-app" id="garden-app-root">
      {/* Background artwork layer with feathered boundaries */}
      <div className="garden-background" aria-hidden="true">
        <div className="garden-background-artwork" />
      </div>
      {/* Atmospheric breathing glow radiating softly around the magical book */}
      <div className="garden-book-aura" aria-hidden="true" />
      {/* Subtle stardust motes, occasional drifting petal & sown seed bloom */}
      <GardenAmbience isSeedFlaring={isSeedFlaring} />
      {/* Delicate top gradient for header typography contrast */}
      <div className="garden-top-gradient" aria-hidden="true" />

      {/* Main Content Sections */}
      <HeroSection />

      <main id="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <FloatingMessageField
          messages={messages}
          isLoading={isLoading}
          onSelectMessage={handleSelectMessage}
          onToggleDevDemo={handleToggleDevDemo}
          isDevDemoActive={isDevDemoActive}
        />
      </main>

      <ActionArea
        onSendWishClick={handleSendWishClick}
        onPublicGardenClick={handlePublicGardenClick}
        onPrivateEnvelopeClick={handlePrivateEnvelopeClick}
      />

      {/* Modals with Focus Management & Accessibility */}
      {/* 1. Modal xem chi tiết lời chúc */}
      <MessageDetailDialog
        isOpen={isDetailOpen}
        message={selectedMessage}
        onClose={handleCloseDetail}
        triggerElement={activeTriggerEl}
      />

      {/* 2. Modal gửi lời chúc (Milestone 2 với State Machine 6 trạng thái) */}
      <SendMessageDialog
        isOpen={isSendDialogOpen}
        onClose={handleCloseSendDialog}
        onMessageSent={handleMessageSent}
        triggerElement={activeTriggerEl}
      />

      <PublicFlowerGarden
        isOpen={isPublicGardenOpen}
        onClose={handleClosePublicGarden}
        triggerElement={activeTriggerEl}
      />

      {/* 3. Modal xác thực mật khẩu mở phong bì riêng (Milestone 3) */}
      <PasscodeDialog
        isOpen={isPasscodeOpen}
        onClose={handleClosePasscode}
        onSuccess={handlePasscodeSuccess}
        triggerElement={activeTriggerEl}
      />

      {/* 4. Không gian Hành trình riêng 5 chặng (khi mở khóa thành công) */}
      {journeyData && (
        <JourneyShell
          data={journeyData}
          onExit={handleExitJourney}
          isMusicPrefOn={isMusicOn}
        />
      )}

      {/* 5. Nút lối tắt đến trang Quản trị viên */}
      {onNavigateToAdmin && (
        <button
          type="button"
          onClick={onNavigateToAdmin}
          className="garden-admin-quick-link"
          title="Khu vực Quản trị viên"
          aria-label="Khu vực Quản trị viên"
        >
          <Lock size={13} />
        </button>
      )}

      {/* 6. Nút bật/tắt nhạc vườn — góc trên trái */}
      <button
        type="button"
        onClick={handleToggleGardenMusic}
        className="garden-music-toggle"
        aria-label={isActuallyPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        title={isActuallyPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
      >
        {isActuallyPlaying ? <Volume2 size={13} /> : <VolumeX size={13} />}
      </button>

      {/* 7. Hộp thoại lựa chọn nhạc — chỉ hiện khi chưa có preference */}
      {showMusicDialog && (
        <MusicChoiceDialog onChoose={handleMusicDialogChoice} />
      )}
    </div>
  );
};

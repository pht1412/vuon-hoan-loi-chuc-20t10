import { PublicMessage } from '../types/message';

// Khởi tạo danh sách lời chúc trống cho môi trường thực tế (Production)
export const initialPublicMessages: PublicMessage[] = [];

// Bộ dữ liệu mẫu 12 lời chúc đa dạng độ dài dùng để kiểm thử bố cục giao diện (Local/Dev demo)
// Không ghi vào Supabase, chỉ phục vụ xem trước 12 vị trí cánh hoa bay lượn
export const devDemoMessages: PublicMessage[] = [
  {
    id: 'demo-1',
    displayName: 'Ban Tổ Chức',
    isAnonymous: false,
    content: 'Chúc toàn thể các cô gái một ngày 20/10 ngập tràn nụ cười, luôn tự tin tỏa sáng và được yêu thương trọn vẹn theo cách riêng của mình!',
    createdAt: '2026-10-16T08:00:00.000Z',
    isPinned: true,
  },
  {
    id: 'demo-2',
    displayName: 'Người Bạn Nhỏ',
    isAnonymous: false,
    content: 'Mong cậu luôn rạng rỡ như ánh mặt trời sớm mai!',
    createdAt: '2026-10-16T08:15:00.000Z',
    isPinned: true,
  },
  {
    id: 'demo-3',
    displayName: null,
    isAnonymous: true,
    content: 'Dù ngoài kia có bộn bề thế nào, mong mỗi tối về nhà cậu đều tìm thấy sự bình yên và một giấc ngủ thật ngon.',
    createdAt: '2026-10-16T08:30:00.000Z',
  },
  {
    id: 'demo-4',
    displayName: 'Hoàng Lan',
    isAnonymous: false,
    content: 'Chúc em gái nhỏ luôn vững vàng trên con đường mình chọn. Cả nhà luôn tự hào về em!',
    createdAt: '2026-10-16T08:45:00.000Z',
  },
  {
    id: 'demo-5',
    displayName: 'Minh Khoa',
    isAnonymous: false,
    content: 'Hôm nay trời rất đẹp, chúc bạn có một ngày 20/10 thật nhiều niềm vui bất ngờ nhé 🌷',
    createdAt: '2026-10-16T09:00:00.000Z',
  },
  {
    id: 'demo-6',
    displayName: null,
    isAnonymous: true,
    content: 'Cảm ơn vì đã luôn là nguồn năng lượng dịu dàng và tích cực cho những người xung quanh.',
    createdAt: '2026-10-16T09:12:00.000Z',
  },
  {
    id: 'demo-7',
    displayName: 'Thùy Chi',
    isAnonymous: false,
    content: 'Chúc chúng ta luôn dịu dàng với chính mình, không cần vội vã, hoa nở đúng mùa sẽ thơm ngát!',
    createdAt: '2026-10-16T09:25:00.000Z',
  },
  {
    id: 'demo-8',
    displayName: 'Đồng nghiệp bàn bên',
    isAnonymous: false,
    content: 'Chúc chị luôn giữ được nụ cười tươi tắn và năng lượng tuyệt vời. Chúc chị 20/10 thật hạnh phúc!',
    createdAt: '2026-10-16T09:40:00.000Z',
  },
  {
    id: 'demo-9',
    displayName: 'Hải Đăng',
    isAnonymous: false,
    content: 'Gửi ngàn đóa hoa thơm ngát đến những người phụ nữ tuyệt vời nhất.',
    createdAt: '2026-10-16T09:55:00.000Z',
  },
  {
    id: 'demo-10',
    displayName: null,
    isAnonymous: true,
    content: 'Cậu luôn xinh đẹp và tỏa sáng nhất khi là chính mình.',
    createdAt: '2026-10-16T10:10:00.000Z',
  },
  {
    id: 'demo-11',
    displayName: 'Khánh Linh',
    isAnonymous: false,
    content: 'Chúc mừng ngày Phụ nữ Việt Nam! Mong cho mọi điều ước ấp ủ của cậu trong năm nay đều trở thành hiện thực.',
    createdAt: '2026-10-16T10:20:00.000Z',
  },
  {
    id: 'demo-12',
    displayName: 'Ẩn danh',
    isAnonymous: true,
    content: 'Một góc nhỏ bình yên gửi đến cậu. Chúc ngày 20/10 thật trọn vẹn và ấm áp nhé!',
    createdAt: '2026-10-16T10:35:00.000Z',
  },
];


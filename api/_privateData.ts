// ==============================================================================
// DỮ LIỆU BẢO MẬT PHÍA SERVER - HÀNH TRÌNH RIÊNG 5 CHẶNG
// Lưu ý: File này nằm ở /api/_privateData.ts (tiền tố '_' ngăn Vercel publish thành route)
// Tuyệt đối không import file này vào bất kỳ file nào trong thư mục src/ (Frontend)
// ==============================================================================

export interface FlowerItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'rose' | 'lotus' | 'sunflower' | 'tulip' | 'clover';
  message: string;
  color: string;
}

export interface JournalItem {
  id: string;
  order: number;
  title: string;
  content: string;
}

export interface AppreciationItem {
  id: string;
  category: string;
  title: string;
  description: string;
  tag: string;
}

export interface FinalLetterData {
  title: string;
  date: string;
  paragraphs: string[];
  signature: string;
}

export interface PrivateJourneyData {
  welcome: {
    greeting: string;
    subtitle: string;
    message: string;
    invitation: string;
  };
  flowers: FlowerItem[];
  easterEggFlower: FlowerItem;
  journal: JournalItem[];
  psNote: {
    title: string;
    content: string;
  };
  appreciations: AppreciationItem[];
  finalLetter: FinalLetterData;
}

export const privateJourneyContent: PrivateJourneyData = {
  welcome: {
    greeting: 'Chào cậu,',
    subtitle: 'Một góc nhỏ được chuẩn bị riêng cho ngày hôm nay',
    message:
      'Cảm ơn cậu đã dành một chút thời gian để ghé vào góc nhỏ này giữa những ngày bận rộn. Nơi đây không có gì ồn ào hay vội vã, chỉ có một chút không gian yên ả và những điều dịu dàng được gửi trao riêng cho cậu.',
    invitation:
      'Hãy hít một hơi thật sâu, thả lỏng đôi vai và bước đi thật thong thả qua từng chặng nhỏ nhé.',
  },
  flowers: [
    {
      id: 'flower-1',
      title: 'Bình yên',
      subtitle: 'Một khoảng lặng êm đềm',
      iconName: 'lotus',
      color: '#E8B4B8',
      message:
        'Mong cậu luôn tìm thấy những khoảng lặng bình yên trong tâm hồn. Dù ngày hôm đó có nhiều điều làm cậu mệt mỏi, mong cậu luôn có một nơi chốn để trở về, tự pha cho mình một tách trà ấm và cảm thấy lòng mình dịu lại.',
    },
    {
      id: 'flower-2',
      title: 'Niềm vui',
      subtitle: 'Những điều lấp lánh giản đơn',
      iconName: 'sunflower',
      color: '#F4C095',
      message:
        'Chúc cậu có thật nhiều những niềm vui nhỏ bé mỗi ngày: một buổi sáng trời đẹp, một bản nhạc tình cờ nghe được hợp tâm trạng, hay một lời hỏi han bất ngờ từ người cậu quý mến.',
    },
    {
      id: 'flower-3',
      title: 'Can đảm',
      subtitle: 'Vững vàng với những lựa chọn',
      iconName: 'rose',
      color: '#D48C94',
      message:
        'Mong cậu luôn có đủ sự can đảm để bước tiếp trên con đường mình đã chọn, và cũng đủ can đảm để buông tay những điều không còn phù hợp. Cậu luôn mạnh mẽ hơn những gì cậu nghĩ đấy.',
    },
    {
      id: 'flower-4',
      title: 'Khởi đầu mới',
      subtitle: 'Tươi tắn như sớm mai',
      iconName: 'tulip',
      color: '#9CAF88',
      message:
        'Mỗi ngày mới đều là một trang giấy sạch sẽ để bắt đầu lại. Mong những dự định ấp ủ của cậu sẽ dần đơm hoa kết trái, mang lại sự thỏa nguyện và nụ cười rạng rỡ cho cậu.',
    },
  ],
  easterEggFlower: {
    id: 'flower-secret',
    title: 'Hạt mầm bí mật',
    subtitle: 'Một chút bất ngờ dễ thương',
    iconName: 'clover',
    color: '#88B2A6',
    message:
      'Ồ, cậu đã tìm thấy nụ mầm nhỏ này rồi! Chúc cậu hôm nay có một bất ngờ ngọt ngào nho nhỏ nhé, người bạn tinh tế và tỉ mỉ!',
  },
  journal: [
    {
      id: 'journal-1',
      order: 1,
      title: 'Không phải lúc nào cũng cần gồng mình mạnh mẽ',
      content:
        'Có những ngày chỉ cần vượt qua được đã là một sự nỗ lực rất lớn rồi. Nếu thấy mệt, cứ cho phép bản thân được yếu lòng một chút, được im lặng và được nghỉ ngơi.',
    },
    {
      id: 'journal-2',
      order: 2,
      title: 'Cậu không cần phải hoàn hảo mới xứng đáng được trân trọng',
      content:
        'Những vết xước, những vụng về hay những lúc bối rối cũng là một phần tạo nên sự chân thật và đáng mến của cậu. Chính sự chân thành ấy mới là điều kết nối sâu sắc nhất.',
    },
    {
      id: 'journal-3',
      order: 3,
      title: 'Những niềm vui nhỏ bé mỗi ngày vẫn luôn có ý nghĩa riêng',
      content:
        'Đôi khi ta quá mải miết nhìn về những mục tiêu to lớn mà quên mất rằng hạnh phúc thực ra được dệt nên từ những điều rất đỗi bình thường diễn ra xung quanh mỗi ngày.',
    },
    {
      id: 'journal-4',
      order: 4,
      title: 'Cho phép mình nghỉ ngơi một nhịp không bao giờ là thất bại',
      content:
        'Dừng lại để thở, để ngắm mây trời, để nghe một bài hát yêu thích... đó là cách cậu nạp lại năng lượng để đi đường dài, chứ tuyệt đối không phải là sự thụt lùi.',
    },
  ],
  psNote: {
    title: 'Một ghi chú nhỏ (P.S.)',
    content:
      'Cậu đang làm rất tốt hành trình của mình rồi. Hãy tin tưởng vào nhịp điệu của riêng cậu nhé, không cần phải so sánh với bất kỳ ai khác cả.',
  },
  appreciations: [
    {
      id: 'apprec-1',
      category: 'Giọng nói & Đồng cảm',
      title: 'Những tập podcast cậu chia sẻ',
      description:
        'Cách giọng nói của cậu cất lên rất tự nhiên, ấm áp và mang lại cảm giác bình yên lạ kỳ. Những câu chuyện cậu chia sẻ như một chiếc ôm vô hình sau một ngày dài mệt mỏi.',
      tag: 'Ấm áp & Chân thành',
    },
    {
      id: 'apprec-2',
      category: 'Góc nhìn cuộc sống',
      title: 'Cách cậu kể về những điều bình thường',
      description:
        'Biến những mẩu chuyện đời thường giản dị, những quan sát nhỏ nhặt xung quanh trở nên thi vị và đáng yêu. Cậu có một đôi mắt nhìn cuộc đời rất dịu dàng.',
      tag: 'Tinh tế & Giản dị',
    },
    {
      id: 'apprec-3',
      category: 'Tư duy & Chiều sâu',
      title: 'Những góc nhìn giản đơn mà sâu sắc',
      description:
        'Không giáo điều, không đao to búa lớn, nhưng những đúc kết tự nhiên của cậu luôn khiến người nghe có thêm một góc nhìn mới mẻ để suy ngẫm và sống chậm lại.',
      tag: 'Sâu sắc & Tự nhiên',
    },
    {
      id: 'apprec-4',
      category: 'Năng lượng tích cực',
      title: 'Những khoảnh khắc dễ chịu trong các buổi livestream',
      description:
        'Sự gần gũi, thoải mái và năng lượng tích cực tự nhiên mà cậu mang đến giúp bất kỳ ai theo dõi đều cảm thấy một ngày dài bỗng trở nên nhẹ nhõm hơn.',
      tag: 'Gần gũi & Dễ chịu',
    },
  ],
  finalLetter: {
    title: 'Gửi cậu,',
    date: 'Ngày 20 tháng 10 năm 2026',
    paragraphs: [
      'Mong rằng trong những ngày sắp tới, cậu sẽ có thật nhiều niềm vui nhỏ, những điều khiến cậu mỉm cười và những khoảng thời gian dành cho chính mình. Mong những điều cậu đang cố gắng sẽ dần có kết quả tốt đẹp, và cậu vẫn có thể vui với những điều giản dị trên hành trình ấy.',
      'Tớ quý những điều cậu chia sẻ, cả những câu chuyện giản dị lẫn những lời nhắn khiến người nghe có thêm điều để suy nghĩ. Tớ nghĩ đôi khi chính những điều bình thường ấy lại làm một ngày trở nên dễ chịu hơn. Vì vậy, tớ cũng muốn gửi đến cậu một điều dễ chịu như thế.',
      'Tớ muốn làm một điều gì đó khác một chút cho ngày hôm nay, nên đã chọn làm món quà này bằng chính thứ tớ biết làm. Có thể nó không lớn lao, nhưng tớ đã dành thời gian để nghĩ về từng phần và hy vọng cậu sẽ thích nó.',
      'Chúc cậu có một ngày 20/10 thật vui nhé. Cảm ơn cậu vì đã tạo nên những khoảnh khắc dễ chịu mà tớ có dịp được đồng hành từ phía bên kia màn hình.',
    ],
    signature: 'Một người luôn dõi theo và chúc cậu bình an 🌷',
  },
};

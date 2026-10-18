// ==============================================================================
// DỮ LIỆU BẢO MẬT PHÍA SERVER - HÀNH TRÌNH RIÊNG 5 CHẶNG
// Module server-only, nằm ngoài thư mục api để Vercel không tạo endpoint cho dữ liệu riêng.
// Tuyệt đối không import file này vào bất kỳ file nào trong thư mục src/ (Frontend)
// ==============================================================================
//
// PHÂN VAI GIỮA CÁC CHẶNG (chuẩn kiểm tra khi biên tập)
//   Chặng 2 — Bốn đóa hoa : LỜI CHÚC dành cho người nhận (không phân tích tính cách, không liệt kê điều trân trọng)
//   Chặng 3 — Nhật ký + P.S.: suy ngẫm mở, dịu, có thể giữ lại; không phải lời chúc, không phải lời khen
//   Chặng 4 — Trân trọng    : điều người gửi THỰC SỰ đã quan sát/nghe/đọc/trải nghiệm
//   Chặng 5 — Lá thư cuối   : khép hành trình, lý do làm món quà, dấu ấn người gửi
//
// DỮ KIỆN ĐÃ XÁC NHẬN (chỉ viết trong phạm vi này)
//   - Livestream game (ZingSpeed PC, đôi khi Audition); người gửi hay ghé xem, có vài tương tác nhỏ trong live.
//   - Có chia sẻ bài đăng và podcast. Podcast dùng giọng đọc AI -> KHÔNG gọi là giọng của người nhận, không nói người nhận tự thu âm.
//   - Có kể vài chuyện thường ngày trong livestream; người gửi nhớ một số mẩu.
//   - Từng công khai chia sẻ góc nhìn về tình yêu và cuộc sống (trên livestream thì rất ít).
//   - Cảm nhận đã xác nhận của người gửi: podcast cho một lúc dừng lại suy nghĩ / thấy dịu hơn; chuyện thường ngày
//     nhớ lâu hơn tưởng và có mẩu khiến mỉm cười; góc nhìn công khai khiến nghĩ thêm; ghé livestream thấy dễ chịu.
//   - KHÔNG suy diễn: tổn thương, cô đơn, tự ti, cần chữa lành, tìm tình yêu, mệt mỏi, khó khăn; không gán phẩm chất
//     (tinh tế, sâu sắc, dịu dàng, can đảm...) khi chưa có bằng chứng cụ thể.
//
// DÒNG CÓ NHÃN [CẦN XÁC NHẬN] = đề xuất của biên tập, chưa được người gửi chốt.
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
  badge?: string;
  title: string;
  image?: string;
  content: string;
}

export interface Stage3Ending {
  title?: string;
  paragraphs: string[];
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
  stage3Ending?: Stage3Ending;
  psNote: {
    title: string;
    content: string;
  };
  appreciations: AppreciationItem[];
  finalLetter: FinalLetterData;
}

export const privateJourneyContent: PrivateJourneyData = {
  // CHẶNG 1 — giữ nguyên (giọng văn đã thống nhất "cậu – tớ").
  // Ghi chú tùy chọn: cụm "giữa những ngày bận rộn" hơi giả định người nhận đang bận.
  welcome: {
    greeting: 'Chào cậu,',
    subtitle: 'Một góc nhỏ được chuẩn bị riêng cho ngày hôm nay',
    message:
      'Cảm ơn cậu đã dành một chút thời gian để ghé vào góc nhỏ này giữa những ngày bận rộn. Nơi đây không có gì ồn ào hay vội vã, chỉ có một chút không gian yên ả và những điều dịu dàng được gửi trao riêng cho cậu.',
    invitation:
      'Hãy hít một hơi thật sâu, thả lỏng đôi vai và bước đi thật thong thả qua từng chặng nhỏ nhé.',
  },
  // ---------------------------------------------------------------------------
  // CHẶNG 2 — BỐN ĐÓA HOA = LỜI CHÚC. Quan sát về podcast/chuyện thường ngày/livestream/góc nhìn đã chuyển sang chặng 4.
  // F1 Bình yên (chúc có lúc bình yên) · F2 Niềm vui (chúc niềm vui giản dị)
  // F3 Khỏe mạnh: NHÃN do người gửi chọn (thay "Can đảm"); CÂU CHỮ là bản đề xuất của biên tập [CẦN XÁC NHẬN],
  // cố ý không dặn dò việc cụ thể (ngủ, ăn) và không giả định tình trạng sức khỏe.
  // F4 Khởi đầu mới (chúc, không giả định dự định, không áp lực phải bắt đầu)
  // ---------------------------------------------------------------------------
  flowers: [
    {
      id: 'flower-1',
      title: 'Bình yên',
      subtitle: 'Từ những tập podcast cậu chia sẻ',
      iconName: 'lotus',
      color: '#E8B4B8',
      message:
        'Có những tập podcast cậu chia sẻ khiến tớ dừng lại một lúc.\n\nNhân ngày 20/10, tớ mong cậu cũng có những lúc bình yên cho riêng mình, ngắn thôi cũng được.',
    },
    {
      id: 'flower-2',
      title: 'Niềm vui',
      subtitle: 'Những mẩu chuyện rất đỗi thường',
      iconName: 'sunflower',
      color: '#F4C095',
      message:
        'Cậu có kể vài chuyện thường ngày trong live, và có những mẩu tớ nhớ lâu hơn mình tưởng.\n\nNên tớ chúc cậu thật nhiều niềm vui giản dị: một bữa ăn ngon, một ván game thuận lợi, một ngày không có gì trục trặc.',
    },
    {
      id: 'flower-3',
      title: 'Khỏe mạnh',
      subtitle: 'Một lời chúc giản dị',
      iconName: 'rose',
      color: '#D48C94',
      message:
        'Nhân ngày 20/10, tớ chúc cậu luôn khỏe mạnh, và có đủ năng lượng cho những điều cậu yêu thích.',
    },
    {
      id: 'flower-4',
      title: 'Khởi đầu mới',
      subtitle: 'Một điều mới, nếu cậu muốn',
      iconName: 'tulip',
      color: '#9CAF88',
      message:
        'Nếu sắp tới cậu muốn thử một điều mới, tớ mong cậu thấy thoải mái để bắt đầu. Có thể là một trò chơi mới, một thói quen nhỏ, hoặc chỉ là đổi một chút trong ngày.\n\nCòn nếu chưa muốn bắt đầu gì cả thì cũng chẳng sao. Tớ chỉ mong mọi lựa chọn đều là của cậu.',
    },
  ],
  // Hạt mầm bí mật: vui, tinh nghịch, không mang thông điệp tình cảm, không khen vô căn cứ, không phụ thuộc "hôm nay".
  easterEggFlower: {
    id: 'flower-secret',
    title: 'Hạt mầm bí mật',
    subtitle: 'Một chút bất ngờ dễ thương',
    iconName: 'clover',
    color: '#88B2A6',
    message:
      'Ồ, cậu tìm thấy tớ rồi! 🤭 Vậy thì phần thưởng cho người khám phá được bí mật là… \n\nTớ chúc cậu luôn gặp thật nhiều may mắn, để những điều cậu mong đợi có thể đến vào lúc thích hợp, những dự định cậu ấp ủ dần thành hiện thực, và trên hành trình ấy, cậu sẽ luôn có những niềm vui nho nhỏ để mỉm cười. 🍀',
  },
  // ---------------------------------------------------------------------------
  // CHẶNG 3 — NHỮNG ĐIỀU NHỎ TỚ VẪN NHỚ: Hai mảnh ghép kỷ niệm + đoạn kết khép lại chặng
  // ---------------------------------------------------------------------------
  journal: [
    {
      id: 'journal-1',
      order: 1,
      badge: 'Mảnh ghép thứ nhất',
      title: 'Một góc quen thuộc',
      image: '/coimay.png',
      content:
        'Có những điều thoạt nhìn rất đỗi bình thường, nhưng vì gắn với một khoảng thời gian nào đó nên lại trở nên đáng nhớ.\n\nVới tớ, điều đáng quý không nằm ở việc khoảnh khắc ấy đặc biệt đến đâu, mà ở niềm vui nho nhỏ nó mang lại. Đôi khi, chỉ một điều giản dị như thế cũng đủ khiến tớ nhớ về một buổi live bằng cảm giác dễ chịu.',
    },
    {
      id: 'journal-2',
      order: 2,
      badge: 'Mảnh ghép thứ hai',
      title: 'Một giai điệu thân quen',
      image: '/tinhkhongmau.png',
      content:
        'Những niềm vui chẳng cần điều gì lớn lao. Đôi khi chỉ là một giai điệu mình thích vang lên đúng lúc, hay một điều nho nhỏ khiến ngày hôm ấy dễ chịu hơn.\n\nNgười tạo nên khoảnh khắc ấy có lẽ không nghĩ nhiều, nhưng người nhận được vẫn có thể vui và nhớ đến nó. Tớ nghĩ những khoảnh khắc như vậy cũng rất đáng quý.',
    },
  ],
  stage3Ending: {
    paragraphs: [
      'Có lẽ cậu không nghĩ những điều ấy có gì đặc biệt, nhưng tớ vẫn muốn nói rằng tớ có để ý và trân trọng chúng.',
      'Không phải vì chúng cần mang một ý nghĩa nào lớn lao, mà vì đó là những khoảnh khắc nhỏ đã khiến tớ vui. Và đôi khi, chỉ vậy thôi cũng đủ để tớ muốn giữ chúng lại trong ký ức của mình. 🌷',
    ],
  },
  // P.S. — người gửi đã chọn đổi sang câu này: nhắc dịp 20/10 mà không thành thời hạn mở quà, không lộ nụ mầm.
  psNote: {
    title: 'Một ghi chú nhỏ (P.S.)',
    content:
      'Tớ chọn ngày 20/10 để gửi cậu món quà nhỏ này. Mong rằng khi ghé qua, cậu sẽ tìm thấy đôi chút niềm vui nhé.',
  },
  // ---------------------------------------------------------------------------
  // CHẶNG 4 — TRÂN TRỌNG: chỉ điều thật sự đã quan sát/nghe/trải nghiệm + cảm nhận của người gửi.
  // Không gán phẩm chất; category/tag nêu chủ đề thay vì tính cách.
  // ---------------------------------------------------------------------------
  appreciations: [
    {
      id: 'apprec-1',
      category: 'Podcast',
      title: 'Những tập podcast cậu chia sẻ',
      description:
        'Những tập podcast cậu chia sẻ đã mang đến cho tớ những câu chuyện và góc nhìn để lắng nghe, suy ngẫm. Có những lúc, tớ chỉ đơn giản muốn nghe một chút gì đó để lòng mình dịu lại. Tớ trân trọng những nội dung ấy, cũng như việc cậu đã chia sẻ chúng.',
      tag: 'Để nghe và nghĩ',
    },
    {
      id: 'apprec-2',
      category: 'Chuyện thường ngày',
      title: 'Những chuyện cậu kể trong live',
      description:
        'Ngoài những ván game, đôi khi cậu còn kể vài chuyện rất đỗi thường ngày. Có những mẩu chuyện chẳng có gì lớn lao, nhưng lại khiến buổi live trở nên gần gũi hơn và làm tớ bật cười đôi chút. Tớ nghĩ chính những điều giản dị ấy cũng góp phần tạo nên nét riêng của những buổi live.',
      tag: 'Chuyện thường ngày',
    },
    {
      id: 'apprec-3',
      category: 'Góc nhìn công khai',
      title: 'Cách cậu nhìn cuộc sống',
      description:
      'Có những điều cậu chia sẻ khiến tớ muốn dừng lại để lắng nghe và suy ngẫm thêm. Tớ nghĩ mỗi người đều có cách nhìn riêng về cuộc sống, và việc được biết thêm một góc nhìn khác cũng là một điều đáng quý. Tớ trân trọng những điều cậu đã chia sẻ, cũng như sự chân thành trong việc cậu cho mọi người biết thêm một chút về suy nghĩ của mình',
      tag: 'Góc nhìn riêng',
    },
    {
      id: 'apprec-4',
      category: 'Livestream',
      title: 'Một khoảng thời gian để tận hưởng',
      description:
        'Tớ thường ghé xem những buổi live của cậu. Có hôm tớ chỉ vào một chút, có hôm lại ở lâu hơn, nghe nhạc, theo dõi những ván game và tận hưởng không khí của buổi live. Với tớ, đôi khi chỉ cần có một khoảng thời gian như thế là đủ — Tớ có thể đơn giản ngồi xem, nghe nhạc và tận hưởng những gì đang diễn ra. Dần dần, những buổi live ấy trở thành một khoảng thời gian quen thuộc mà tớ luôn thấy cảm thấy dễ chịu.',
      tag: 'Những buổi live',
    },
  ],
  // ---------------------------------------------------------------------------
  // CHẶNG 5 — LÁ THƯ CUỐI: (1) khép hành trình, cảm ơn (2) lý do & công sức (3) lời chúc, không áp lực (4) dấu ấn người gửi.
  // Không lặp lời chúc chặng 2, suy ngẫm chặng 3, lời khen chặng 4.
  // Signature: người gửi CHỌN phương án "Người ghé qua từ phía bên kia màn hình" trong 3 đề xuất, thay "luôn dõi theo".
  // Đoạn 4: người gửi đã xác nhận giữ câu "tớ vẫn hay ghé xem live như mọi khi".
  // Đã bỏ câu "cậu không cần phản hồi..." ở đoạn 3: nhắc thẳng chuyện phản hồi có thể làm nó nổi lên; để giọng văn tự không áp đặt.
  // ---------------------------------------------------------------------------
  finalLetter: {
    title: 'Gửi cậu,',
    date: 'Ngày 20 tháng 10 năm 2026',
    paragraphs: [
      'Vậy là cậu đã đi đến chặng cuối của khu vườn nhỏ này rồi.',
      'Thật ra, tớ cũng không biết phải viết điều gì thật đặc biệt vào những dòng cuối cùng. Tớ chỉ muốn nhân ngày 20/10, gửi đến cậu một món quà nhỏ do chính tay tớ lên ý tưởng, viết từng dòng chữ và tự mình hoàn thiện. Có thể nó chẳng phải điều gì quá lớn lao, nhưng tớ đã dành thời gian để chăm chút cho từng góc nhỏ, với mong muốn mang đến cho cậu một chút niềm vui.',
      'Cảm ơn cậu vì những tập podcast cậu chia sẻ, những câu chuyện thường ngày và những buổi live mà tớ có dịp ghé qua. Có những lúc, tớ tìm thấy một góc nhìn đáng để suy ngẫm từ những nội dung ấy; cũng có những lúc, tớ chỉ đơn giản tận hưởng không khí của một buổi live và mỉm cười vì một chuyện nhỏ nào đó. Tất cả đã góp lại thành những khoảnh khắc dễ chịu mà tớ trân trọng. Tớ vui vì đã có cơ hội biết đến cậu theo cách giản dị như thế.',
      'Nhân ngày 20/10, tớ mong cậu luôn khỏe mạnh, bình an, có nhiều niềm vui trong cuộc sống và đủ tự tin để bước tiếp trên con đường mà cậu lựa chọn. Mong rằng giữa những ngày bận rộn, cậu vẫn có thời gian cho bản thân, cho những điều cậu thích và cho cả những phút giây chẳng cần phải làm gì cả.',
      'Còn về khu vườn nhỏ này, tớ hy vọng cậu đã tìm thấy một điều gì đó khiến mình mỉm cười. Thế là đủ vui với tớ rồi.',
      'Chúc cậu có một ngày 20/10 thật dịu dàng, và cả những ngày bình thường sau đó cũng có nhiều điều đáng mong đợi nhé. 🌷',
    ],
    signature: 'Người ghé qua từ phía bên kia màn hình 🌷',
  },
};
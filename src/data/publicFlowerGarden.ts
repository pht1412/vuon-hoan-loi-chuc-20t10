export interface PublicGardenFlower {
  id: string;
  name: string;
  meaning: string;
  accent: string;
  letter: string;
}

/**
 * Sáu đóa hoa công khai — « Khu vườn dành cho bạn ».
 * Nội dung theo sáu chủ đề đã chỉ định; giọng vườn công khai, không phải hành trình riêng.
 */
export const publicGardenFlowers: PublicGardenFlower[] = [
  {
    id: 'binh-yen',
    name: 'Bình Yên',
    meaning: 'Một khoảng nghỉ không cần lý do',
    accent: '#9CAF88',
    letter:
      'Có những ngày chẳng cần điều gì đặc biệt xảy ra, chỉ cần mọi thứ chậm lại một chút là đã thấy dễ chịu.\n\nMong bạn có những buổi sáng không phải vội, những chiều ngồi ngắm trời lâu hơn thường lệ, và những phút giây được làm điều mình thích mà chẳng cần nhìn đồng hồ.\n\nChúc bạn luôn tìm được một khoảng bình yên để trở về, ngay cả giữa những ngày bận rộn nhất.',
  },
  {
    id: 'can-dam',
    name: 'Can Đảm',
    meaning: 'Dũng khí của những bước chân nhỏ',
    accent: '#C57780',
    letter:
      'Có những bước đi chẳng hề dễ dàng. Có khi bạn vẫn lo lắng, vẫn chưa biết kết quả sẽ ra sao, nhưng rồi vẫn quyết định thử thêm một lần.\n\nCan đảm đâu có nghĩa là không biết sợ. Đôi khi, đó chỉ là không để nỗi sợ quyết định tất cả thay mình.\n\nChúc bạn có đủ dũng khí để bắt đầu, đủ kiên nhẫn để đi tiếp, và đủ dịu dàng với mình trong những ngày chưa làm được như mong muốn.',
  },
  {
    id: 'niem-vui',
    name: 'Niềm Vui',
    meaning: 'Những điều bé xíu mà đáng yêu',
    accent: '#D4A574',
    letter:
      'Mong hôm nay bạn gặp một điều khiến mình bật cười bất ngờ, ăn được món ngon đúng lúc thèm, nghe trúng bài hát yêu thích, hay nhận một tin vui chẳng hẹn trước.\n\nVà nếu hôm nay chỉ là một ngày bình thường thì cũng chẳng sao. Một ly nước ngon, một cơn gió mát, một việc nhỏ hoàn thành — đôi khi vui vẻ chỉ đơn giản như thế thôi.\n\nChúc niềm vui tìm được đường đến với bạn, cả trong những ngày chẳng có gì để mong chờ.',
  },
  {
    id: 'tu-hao',
    name: 'Tự Hào',
    meaning: 'Ghi nhận những điều mình đã làm được',
    accent: '#D48C94',
    letter:
      'Có lẽ bạn nhớ rất rõ những điều mình chưa làm được, nhưng lại dễ quên mất mình đã cố gắng đến nhường nào để đi đến hôm nay.\n\nVậy nên, hãy thử ngoảnh lại một chút nhé. Những lần bạn tự mình giải quyết một chuyện khó, những ngày vẫn hoàn thành điều cần làm dù chẳng có nhiều động lực, cả những lần đứng dậy sau một chuyện không như ý — tất cả đều là những phần đáng quý của hành trình này.\n\nMong bạn không chỉ đặt ra những mục tiêu để tiến về phía trước, mà còn biết mỉm cười với chính mình vì đã đi được đến đây.',
  },
  {
    id: 'diu-dang',
    name: 'Dịu Dàng',
    meaning: 'Một chút tử tế dành cho nhau',
    accent: '#E8B4B8',
    letter:
      'Đôi khi, sự dịu dàng nằm trong những điều rất nhỏ: một lời nói được cân nhắc thêm một chút, một lần kiên nhẫn lắng nghe, hay một sự giúp đỡ không cần phải nhắc đến.\n\nMong bạn gặp được những người khiến mình cảm thấy được tôn trọng, được lắng nghe và được là chính mình. Và mong bạn cũng có thể trao đi sự tử tế ấy mà không phải quên mất nhu cầu của bản thân.\n\nChúc bạn giữ được nét dịu dàng của riêng mình, bởi thế giới luôn cần thêm những điều tử tế như thế.',
  },
  {
    id: 'tu-do',
    name: 'Tự Do',
    meaning: 'Được sống theo cách mình lựa chọn',
    accent: '#7BA89A',
    letter:
      'Mong bạn có thể thử những điều mình tò mò, theo đuổi những điều mình yêu thích, và thay đổi hướng đi khi nhận ra bản thân đã khác trước.\n\nBạn không cần phải có sẵn mọi câu trả lời cho tương lai. Cũng không cần sống giống một ai đó mới được xem là đang đi đúng đường. Có những lựa chọn chỉ cần thật sự phù hợp với mình là đã đủ tốt rồi.\n\nChúc bạn có đủ tự do để lựa chọn, đủ tin tưởng để bước đi, và đủ rộng lòng để cho phép mình đổi thay.',
  },
];

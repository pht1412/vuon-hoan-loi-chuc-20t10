export interface PublicGardenFlower {
  id: string;
  name: string;
  meaning: string;
  imageSrc?: string;
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
    meaning: 'Một chỗ được phép chậm lại',
    imageSrc: '/hoa1.jpg',
    accent: '#9CAF88',
    letter:
      'Chúc bạn có những phút được phép chậm lại.\n\nGiữa nhịp ngày thường, mong bạn tìm được một chỗ vừa đủ yên — để ngồi xuống, uống một ngụm nước, và không phải vội giải thích gì cả.\n\n20/10 này, chúc bạn bình yên theo cách bạn cần.',
  },
  {
    id: 'can-dam',
    name: 'Can Đảm',
    meaning: 'Sức mạnh không cần lớn tiếng',
    imageSrc: '/hoa3.jpg',
    accent: '#C57780',
    letter:
      'Can đảm không phải lúc nào cũng lớn tiếng.\n\nĐôi khi đó chỉ là việc bạn vẫn bước tiếp một ngày bình thường, vẫn giữ lấy điều mình tin, vẫn nói không khi cần.\n\nChúc bạn đủ vững để chọn những điều đúng với mình, kể cả khi không ai nhìn thấy.',
  },
  {
    id: 'niem-vui',
    name: 'Niềm Vui',
    meaning: 'Những điều nhỏ làm ngày sáng hơn',
    imageSrc: '/hoa2.jpg',
    accent: '#D4A574',
    letter:
      'Chúc bạn gặp những niềm vui không cần dịp lớn.\n\nMột câu chuyện hay, một bữa ăn ngon, một tin nhắn đúng lúc — những thứ nhỏ ấy cũng đủ làm một ngày trở nên đáng nhớ.\n\n20/10, mong tiếng cười của bạn được ở lại lâu hơn một chút.',
  },
  {
    id: 'tu-hao',
    name: 'Tự Hào',
    meaning: 'Nhìn lại đoạn đường đã đi',
    accent: '#D48C94',
    letter:
      'Bạn không cần phải hoàn hảo mới đáng được tự hào.\n\nChúc bạn nhìn lại những điều mình đã làm được — dù nhỏ, dù chưa ai khen — và thấy rằng mình đã đi được một đoạn đường tử tế.\n\nHôm nay, hãy dành một lời khen cho chính mình.',
  },
  {
    id: 'diu-dang',
    name: 'Dịu Dàng',
    meaning: 'Sự mềm mại không làm ta yếu đi',
    imageSrc: '/hoa4.jpg',
    accent: '#E8B4B8',
    letter:
      'Dịu dàng là một cách ở đời, không phải điều phải giấu đi.\n\nChúc bạn được đối xử nhẹ nhàng, và cũng được phép dịu dàng với chính mình khi mệt.\n\nMong ngày 20/10 này có đủ sự tử tế để bạn không phải cứng rắn suốt cả ngày.',
  },
  {
    id: 'tu-do',
    name: 'Tự Do',
    meaning: 'Sống theo nhịp của mình',
    accent: '#7BA89A',
    letter:
      'Chúc bạn được chọn nhịp sống của riêng mình.\n\nKhông phải lúc nào cũng phải đáp ứng. Không phải lúc nào cũng phải ở đúng chỗ người khác đặt sẵn.\n\n20/10, mong bạn có khoảng trời đủ rộng để đi, nghỉ, và trở thành phiên bản mình muốn trở thành.',
  },
];

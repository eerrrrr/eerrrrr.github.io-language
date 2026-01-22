
import { Scenario, TargetLanguage } from './types';

export const LANGUAGES: { name: TargetLanguage; flag: string }[] = [
  { name: 'Finnish', flag: '🇫🇮' },
  { name: 'German', flag: '🇩🇪' },
  { name: 'Japanese', flag: '🇯🇵' },
  { name: 'Swedish', flag: '🇸🇪' },
  { name: 'Korean', flag: '🇰🇷' },
  { name: 'English', flag: '🇺🇸' },
];

export const SCENARIOS: Scenario[] = [
  {
    id: 'coffee',
    title: '點咖啡 (Ordering Coffee)',
    icon: 'fa-coffee',
    description: '練習在當地的咖啡館點餐與客製化飲品。',
    cheatSheet: ['我想點一杯...', '微糖少冰', '內用還是外帶？', '多少錢？'],
  },
  {
    id: 'checkin',
    title: '飯店辦理入住 (Hotel Check-in)',
    icon: 'fa-hotel',
    description: '處理預訂資訊、詢問設施與早餐時間。',
    cheatSheet: ['我有預約', '早餐幾點開始？', '有提供 Wi-Fi 嗎？', '延遲退房'],
  },
  {
    id: 'emergency',
    title: '緊急情況 (Emergency)',
    icon: 'fa-ambulance',
    description: '迷路、遺失物品或身體不適時的求助。',
    cheatSheet: ['請幫幫我', '我的護照丟了', '最近的醫院在哪？', '我迷路了'],
  },
  {
    id: 'casual',
    title: '日常閒聊 (Casual Chat)',
    icon: 'fa-comments',
    description: '與新朋友交談，分享愛好與週末計劃。',
    cheatSheet: ['你最近好嗎？', '你平常喜歡做什麼？', '很高興認識你', '這天氣真不錯'],
  },
];

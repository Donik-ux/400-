/* Essential travel phrasebook — phrase value = [local text, pronunciation in Cyrillic] */

export const PHRASE_LABELS = [
  { key: 'hello',        ru: 'Здравствуйте' },
  { key: 'thanks',       ru: 'Спасибо' },
  { key: 'please',       ru: 'Пожалуйста' },
  { key: 'yes',          ru: 'Да' },
  { key: 'no',           ru: 'Нет' },
  { key: 'sorry',        ru: 'Извините' },
  { key: 'howMuch',      ru: 'Сколько стоит?' },
  { key: 'where',        ru: 'Где находится…?' },
  { key: 'help',         ru: 'Помогите!' },
  { key: 'noUnderstand', ru: 'Я не понимаю' },
  { key: 'bill',         ru: 'Счёт, пожалуйста' },
  { key: 'bye',          ru: 'До свидания' },
];

export const LANGUAGES = [
  {
    code: 'en', name: 'Английский', flag: '🇬🇧',
    phrases: {
      hello: ['Hello', 'хэлло'], thanks: ['Thank you', 'сэнк ю'], please: ['Please', 'плиз'],
      yes: ['Yes', 'йес'], no: ['No', 'ноу'], sorry: ['Sorry', 'сорри'],
      howMuch: ['How much?', 'хау мач'], where: ['Where is…?', 'уэр из'], help: ['Help!', 'хелп'],
      noUnderstand: ["I don't understand", 'ай донт андэрстэнд'], bill: ['The bill, please', 'зэ билл плиз'], bye: ['Goodbye', 'гудбай'],
    },
  },
  {
    code: 'tr', name: 'Турецкий', flag: '🇹🇷',
    phrases: {
      hello: ['Merhaba', 'мерхаба'], thanks: ['Teşekkürler', 'тешеккюрлер'], please: ['Lütfen', 'лютфен'],
      yes: ['Evet', 'эвет'], no: ['Hayır', 'хайыр'], sorry: ['Özür dilerim', 'озюр дилерим'],
      howMuch: ['Ne kadar?', 'не кадар'], where: ['…nerede?', 'нереде'], help: ['İmdat!', 'имдат'],
      noUnderstand: ['Anlamıyorum', 'анламыйорум'], bill: ['Hesap, lütfen', 'хесап лютфен'], bye: ['Hoşça kal', 'хошча кал'],
    },
  },
  {
    code: 'ar', name: 'Арабский', flag: '🇦🇪',
    phrases: {
      hello: ['مرحبا', 'мархабан'], thanks: ['شكرا', 'шукран'], please: ['من فضلك', 'мин фадлик'],
      yes: ['نعم', 'наам'], no: ['لا', 'ля'], sorry: ['آسف', 'аасиф'],
      howMuch: ['كم الثمن؟', 'кам аль-таман'], where: ['أين…؟', 'айна'], help: ['النجدة!', 'ан-найда'],
      noUnderstand: ['لا أفهم', 'ля афхам'], bill: ['الحساب من فضلك', 'аль-хисаб мин фадлик'], bye: ['مع السلامة', 'маа ас-саляма'],
    },
  },
  {
    code: 'th', name: 'Тайский', flag: '🇹🇭',
    phrases: {
      hello: ['สวัสดี', 'савадди'], thanks: ['ขอบคุณ', 'кхоп кхун'], please: ['กรุณา', 'каруна'],
      yes: ['ใช่', 'чай'], no: ['ไม่', 'май'], sorry: ['ขอโทษ', 'кхо тхот'],
      howMuch: ['เท่าไหร่', 'тао рай'], where: ['…อยู่ที่ไหน', 'ю тхи най'], help: ['ช่วยด้วย', 'чуай дуай'],
      noUnderstand: ['ไม่เข้าใจ', 'май кхао чай'], bill: ['เก็บเงิน', 'кеп нгэн'], bye: ['ลาก่อน', 'ла кон'],
    },
  },
  {
    code: 'zh', name: 'Китайский', flag: '🇨🇳',
    phrases: {
      hello: ['你好', 'ни хао'], thanks: ['谢谢', 'сесе'], please: ['请', 'цин'],
      yes: ['是', 'шы'], no: ['不', 'бу'], sorry: ['对不起', 'дуйбуци'],
      howMuch: ['多少钱', 'дошао цянь'], where: ['…在哪里', 'цзай нали'], help: ['救命', 'цзюмин'],
      noUnderstand: ['我不明白', 'во бу минбай'], bill: ['买单', 'майдань'], bye: ['再见', 'цзайцзянь'],
    },
  },
  {
    code: 'ja', name: 'Японский', flag: '🇯🇵',
    phrases: {
      hello: ['こんにちは', 'коннитива'], thanks: ['ありがとう', 'аригато'], please: ['お願いします', 'онэгай симас'],
      yes: ['はい', 'хай'], no: ['いいえ', 'ииэ'], sorry: ['すみません', 'сумимасэн'],
      howMuch: ['いくらですか', 'икура дэс ка'], where: ['…はどこですか', 'ва доко дэс ка'], help: ['助けて', 'таскэтэ'],
      noUnderstand: ['わかりません', 'вакаримасэн'], bill: ['お会計お願いします', 'окайкэй онэгай симас'], bye: ['さようなら', 'саёнара'],
    },
  },
  {
    code: 'ko', name: 'Корейский', flag: '🇰🇷',
    phrases: {
      hello: ['안녕하세요', 'аннёнхасэё'], thanks: ['감사합니다', 'камсахамнида'], please: ['주세요', 'чусэё'],
      yes: ['네', 'нэ'], no: ['아니요', 'анийо'], sorry: ['죄송합니다', 'чвесонхамнида'],
      howMuch: ['얼마예요?', 'ольмаэё'], where: ['…어디예요?', 'одиеё'], help: ['도와주세요', 'товаджусэё'],
      noUnderstand: ['이해 못해요', 'ихэ мотэё'], bill: ['계산서 주세요', 'кесансо чусэё'], bye: ['안녕히 가세요', 'аннёнхи касэё'],
    },
  },
  {
    code: 'es', name: 'Испанский', flag: '🇪🇸',
    phrases: {
      hello: ['Hola', 'ола'], thanks: ['Gracias', 'грасиас'], please: ['Por favor', 'пор фавор'],
      yes: ['Sí', 'си'], no: ['No', 'но'], sorry: ['Lo siento', 'ло сьенто'],
      howMuch: ['¿Cuánto cuesta?', 'куанто куэста'], where: ['¿Dónde está…?', 'дондэ эста'], help: ['¡Ayuda!', 'айуда'],
      noUnderstand: ['No entiendo', 'но энтьендо'], bill: ['La cuenta, por favor', 'ла куэнта пор фавор'], bye: ['Adiós', 'адиос'],
    },
  },
];

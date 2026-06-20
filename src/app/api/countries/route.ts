import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const COUNTRIES_DATA = [
  { name: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', code: 'SA', phoneCode: '+966', currency: 'SAR', flagEmoji: '🇸🇦', cities: ['الرياض', 'جدة', 'مكة', 'المدينة المنورة', 'الدمام', 'الخبر', 'أبها', 'تبوك', 'حائل', 'القصيم', 'الطائف', 'نجران', 'جازان', 'الأحساء'] },
  { name: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', code: 'AE', phoneCode: '+971', currency: 'AED', flagEmoji: '🇦🇪', cities: ['دبي', 'أبوظبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة', 'أم القيوين'] },
  { name: 'مصر', nameEn: 'Egypt', code: 'EG', phoneCode: '+20', currency: 'EGP', flagEmoji: '🇪🇬', cities: ['القاهرة', 'الإسكندرية', 'الجيزة', 'شبرا الخيمة', 'بورسعيد', 'السويس', 'الأقصر', 'أسوان', 'المنصورة', 'طنطا'] },
  { name: 'المغرب', nameEn: 'Morocco', code: 'MA', phoneCode: '+212', currency: 'MAD', flagEmoji: '🇲🇦', cities: ['الرباط', 'الدار البيضاء', 'فاس', 'مراكش', 'طنجة', 'أكادير', 'مكناس', 'وجدة'] },
  { name: 'الأردن', nameEn: 'Jordan', code: 'JO', phoneCode: '+962', currency: 'JOD', flagEmoji: '🇯🇴', cities: ['إربد', 'عجلون', 'جرش', 'المفرق', 'العاصمة عمّان', 'البلقاء', 'الزرقاء', 'مادبا', 'الكرك', 'الطفيلة', 'معان', 'العقبة'] },
  { name: 'لبنان', nameEn: 'Lebanon', code: 'LB', phoneCode: '+961', currency: 'LBP', flagEmoji: '🇱🇧', cities: ['بيروت', 'طرابلس', 'صيدا', 'جونية', 'زحلة', 'عاليه'] },
  { name: 'الكويت', nameEn: 'Kuwait', code: 'KW', phoneCode: '+965', currency: 'KWD', flagEmoji: '🇰🇼', cities: ['الكويت', 'الفروانية', 'الأحمدي', 'حولي', 'الجهراء'] },
  { name: 'قطر', nameEn: 'Qatar', code: 'QA', phoneCode: '+974', currency: 'QAR', flagEmoji: '🇶🇦', cities: ['الدوحة', 'الريان', 'الوكرة', 'الخور', 'أم صلال'] },
  { name: 'البحرين', nameEn: 'Bahrain', code: 'BH', phoneCode: '+973', currency: 'BHD', flagEmoji: '🇧🇭', cities: ['المنامة', 'المحرق', 'الرفاع', 'مدينة عيسى'] },
  { name: 'عُمان', nameEn: 'Oman', code: 'OM', phoneCode: '+968', currency: 'OMR', flagEmoji: '🇴🇲', cities: ['مسقط', 'صلالة', 'صحار', 'نزوى', 'الرستاق', 'صور'] },
  { name: 'العراق', nameEn: 'Iraq', code: 'IQ', phoneCode: '+964', currency: 'IQD', flagEmoji: '🇮🇶', cities: ['بغداد', 'البصرة', 'أربيل', 'الموصل', 'النجف', 'كربلاء', 'السليمانية'] },
  { name: 'تونس', nameEn: 'Tunisia', code: 'TN', phoneCode: '+216', currency: 'TND', flagEmoji: '🇹🇳', cities: ['تونس', 'صفاقس', 'سوسة', 'قابس', 'بنزرت', 'المنستير'] },
  { name: 'الجزائر', nameEn: 'Algeria', code: 'DZ', phoneCode: '+213', currency: 'DZD', flagEmoji: '🇩🇿', cities: ['الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'سطيف', 'تلمسان'] },
  { name: 'ليبيا', nameEn: 'Libya', code: 'LY', phoneCode: '+218', currency: 'LYD', flagEmoji: '🇱🇾', cities: ['طرابلس', 'بنغازي', 'مصراتة', 'البيضاء', 'سبها'] },
  { name: 'السودان', nameEn: 'Sudan', code: 'SD', phoneCode: '+249', currency: 'SDG', flagEmoji: '🇸🇩', cities: ['الخرطوم', 'أم درمان', 'بورتسودان', 'كسلا', 'مروي'] },
  { name: 'موريتانيا', nameEn: 'Mauritania', code: 'MR', phoneCode: '+222', currency: 'MRU', flagEmoji: '🇲🇷', cities: ['نواكشوط', 'نواذيبو', 'روصو', 'كيفه'] },
  { name: 'فلسطين', nameEn: 'Palestine', code: 'PS', phoneCode: '+970', currency: 'ILS', flagEmoji: '🇵🇸', cities: ['رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'جنين', 'غزة'] },
  { name: 'سوريا', nameEn: 'Syria', code: 'SY', phoneCode: '+963', currency: 'SYP', flagEmoji: '🇸🇾', cities: ['دمشق', 'حلب', 'حمص', 'اللاذقية', 'حماة', 'طرطوس'] },
  { name: 'اليمن', nameEn: 'Yemen', code: 'YE', phoneCode: '+967', currency: 'YER', flagEmoji: '🇾🇪', cities: ['صنعاء', 'عدن', 'تعز', 'المكلا', 'إب', 'الحديدة'] },
  { name: 'تركيا', nameEn: 'Turkey', code: 'TR', phoneCode: '+90', currency: 'TRY', flagEmoji: '🇹🇷', cities: ['إسطنبول', 'أنقرة', 'إزمير', 'أنطاليا', 'بورصة', 'قونيا', 'أضنة'] },
  { name: 'الولايات المتحدة', nameEn: 'United States', code: 'US', phoneCode: '+1', currency: 'USD', flagEmoji: '🇺🇸', cities: ['نيويورك', 'لوس أنجلوس', 'شيكاغو', 'هيوستن', 'ميامي', 'واشنطن', 'سان فرانسيسكو'] },
  { name: 'المملكة المتحدة', nameEn: 'United Kingdom', code: 'GB', phoneCode: '+44', currency: 'GBP', flagEmoji: '🇬🇧', cities: ['لندن', 'برمنغهام', 'مانشستر', 'ليدز', 'غلاسكو', 'ليفربول'] },
  { name: 'فرنسا', nameEn: 'France', code: 'FR', phoneCode: '+33', currency: 'EUR', flagEmoji: '🇫🇷', cities: ['باريس', 'مرسيليا', 'ليون', 'تولوز', 'نيس', 'نانت', 'ستراسبورغ'] },
  { name: 'ألمانيا', nameEn: 'Germany', code: 'DE', phoneCode: '+49', currency: 'EUR', flagEmoji: '🇩🇪', cities: ['برلين', 'ميونخ', 'هامبورغ', 'فرانكفورت', 'شتوتغارت', 'كولونيا'] },
  { name: 'إيطاليا', nameEn: 'Italy', code: 'IT', phoneCode: '+39', currency: 'EUR', flagEmoji: '🇮🇹', cities: ['روما', 'ميلانو', 'نابولي', 'تورينو', 'فلورنسا', 'بولونيا'] },
  { name: 'إسبانيا', nameEn: 'Spain', code: 'ES', phoneCode: '+34', currency: 'EUR', flagEmoji: '🇪🇸', cities: ['مدريد', 'برشلونة', 'فالنسيا', 'إشبيلية', 'بلباو', 'مالقة'] },
  { name: 'كندا', nameEn: 'Canada', code: 'CA', phoneCode: '+1', currency: 'CAD', flagEmoji: '🇨🇦', cities: ['تورنتو', 'فانكوفر', 'مونتريال', 'كالغاري', 'أوتاوا', 'إدمونتون'] },
  { name: 'أستراليا', nameEn: 'Australia', code: 'AU', phoneCode: '+61', currency: 'AUD', flagEmoji: '🇦🇺', cities: ['سيدني', 'ملبورن', 'بريسبان', 'برث', 'أديليد', 'كانبرا'] },
  { name: 'الهند', nameEn: 'India', code: 'IN', phoneCode: '+91', currency: 'INR', flagEmoji: '🇮🇳', cities: ['مومباي', 'دلهي', 'بنغالور', 'كولكاتا', 'تشيناي', 'حيدر أباد'] },
  { name: 'باكستان', nameEn: 'Pakistan', code: 'PK', phoneCode: '+92', currency: 'PKR', flagEmoji: '🇵🇰', cities: ['كراتشي', 'لاهور', 'إسلام آباد', 'فيصل آباد', 'راولبندي'] },
  { name: 'إندونيسيا', nameEn: 'Indonesia', code: 'ID', phoneCode: '+62', currency: 'IDR', flagEmoji: '🇮🇩', cities: ['جاكرتا', 'بالي', 'سورابايا', 'ميدان', 'ماكاسار'] },
  { name: 'ماليزيا', nameEn: 'Malaysia', code: 'MY', phoneCode: '+60', currency: 'MYR', flagEmoji: '🇲🇾', cities: ['كوالالمبور', 'جورج تاون', 'إيبوه', 'جوهور باهرو', 'مالاكا'] },
  { name: 'نيجيريا', nameEn: 'Nigeria', code: 'NG', phoneCode: '+234', currency: 'NGN', flagEmoji: '🇳🇬', cities: ['لاغوس', 'أبوجا', 'كانو', 'إبادان', 'بورت هاركورت'] },
  { name: 'جنوب أفريقيا', nameEn: 'South Africa', code: 'ZA', phoneCode: '+27', currency: 'ZAR', flagEmoji: '🇿🇦', cities: ['جوهانسبرغ', 'كيب تاون', 'ديربان', 'بريتوريا', 'بورت إليزابيث'] },
  { name: 'الصين', nameEn: 'China', code: 'CN', phoneCode: '+86', currency: 'CNY', flagEmoji: '🇨🇳', cities: ['بكين', 'شنغهاي', 'قوانغتشو', 'شنتشن', 'تشينغداو'] },
  { name: 'اليابان', nameEn: 'Japan', code: 'JP', phoneCode: '+81', currency: 'JPY', flagEmoji: '🇯🇵', cities: ['طوكيو', 'أوساكا', 'يوكوهاما', 'ناغويا', 'سابورو'] },
  { name: 'كوريا الجنوبية', nameEn: 'South Korea', code: 'KR', phoneCode: '+82', currency: 'KRW', flagEmoji: '🇰🇷', cities: ['سيول', 'بوسان', 'إنتشون', 'دايجو', 'أولسان'] },
  { name: 'البرازيل', nameEn: 'Brazil', code: 'BR', phoneCode: '+55', currency: 'BRL', flagEmoji: '🇧🇷', cities: ['ساو باولو', 'ريو دي جانيرو', 'برازيليا', 'سلفادور', 'فورتاليزا'] },
  { name: 'المكسيك', nameEn: 'Mexico', code: 'MX', phoneCode: '+52', currency: 'MXN', flagEmoji: '🇲🇽', cities: ['مكسيكو سيتي', 'غوادالاخارا', 'مونتيري', 'كانكون', 'بويبلا'] },
  { name: 'الأرجنتين', nameEn: 'Argentina', code: 'AR', phoneCode: '+54', currency: 'ARS', flagEmoji: '🇦🇷', cities: ['بوينس آيرس', 'كوردوبا', 'روزاريو', 'ميندوزا'] },
  { name: 'روسيا', nameEn: 'Russia', code: 'RU', phoneCode: '+7', currency: 'RUB', flagEmoji: '🇷🇺', cities: ['موسكو', 'سانت بطرسبرغ', 'نوفوسيبيرسك', 'يزكاترينبرغ'] },
  { name: 'هولندا', nameEn: 'Netherlands', code: 'NL', phoneCode: '+31', currency: 'EUR', flagEmoji: '🇳🇱', cities: ['أمستردام', 'روتردام', 'لاهاي', 'أوترخت'] },
  { name: 'بلجيكا', nameEn: 'Belgium', code: 'BE', phoneCode: '+32', currency: 'EUR', flagEmoji: '🇧🇪', cities: ['بروكسل', 'أنتويرب', 'غنت', 'لياج'] },
  { name: 'السويد', nameEn: 'Sweden', code: 'SE', phoneCode: '+46', currency: 'SEK', flagEmoji: '🇸🇪', cities: ['ستوكهولم', 'غوتنبرغ', 'مالمو', 'أوبسالا'] },
  { name: 'النرويج', nameEn: 'Norway', code: 'NO', phoneCode: '+47', currency: 'NOK', flagEmoji: '🇳🇴', cities: ['أوسلو', 'برغن', 'تروندهايم', 'ستافانغر'] },
  { name: 'الدنمارك', nameEn: 'Denmark', code: 'DK', phoneCode: '+45', currency: 'DKK', flagEmoji: '🇩🇰', cities: ['كوبنهاغن', 'آرهوس', 'أودنسه', 'آلبورغ'] },
  { name: 'سويسرا', nameEn: 'Switzerland', code: 'CH', phoneCode: '+41', currency: 'CHF', flagEmoji: '🇨🇭', cities: ['زيورخ', 'جنيف', 'بازل', 'برن', 'لوزان'] },
  { name: 'البرتغال', nameEn: 'Portugal', code: 'PT', phoneCode: '+351', currency: 'EUR', flagEmoji: '🇵🇹', cities: ['لشبونة', 'بورتو', 'فارو', 'كويمبرا'] },
  { name: 'اليونان', nameEn: 'Greece', code: 'GR', phoneCode: '+30', currency: 'EUR', flagEmoji: '🇬🇷', cities: ['أثينا', 'سالونيك', 'باتراس', 'هيراكليون'] },
  { name: 'تايلاند', nameEn: 'Thailand', code: 'TH', phoneCode: '+66', currency: 'THB', flagEmoji: '🇹🇭', cities: ['بانكوك', 'شيانغ ماي', 'فوكيت', 'باتايا', 'بانتايا'] },
  { name: 'الفلبين', nameEn: 'Philippines', code: 'PH', phoneCode: '+63', currency: 'PHP', flagEmoji: '🇵🇭', cities: ['مانيلا', 'سيبو', 'دايفاو', 'كيزون سيتي'] },
  { name: 'فيتنام', nameEn: 'Vietnam', code: 'VN', phoneCode: '+84', currency: 'VND', flagEmoji: '🇻🇳', cities: ['هانوي', 'هو تشي منه', 'دا نانغ', 'هايفونغ'] },
  { name: 'إيران', nameEn: 'Iran', code: 'IR', phoneCode: '+98', currency: 'IRR', flagEmoji: '🇮🇷', cities: ['طهران', 'مشهد', 'أصفهان', 'شيراز', 'تبريز'] },
  { name: 'أفغانستان', nameEn: 'Afghanistan', code: 'AF', phoneCode: '+93', currency: 'AFN', flagEmoji: '🇦🇫', cities: ['كابول', 'هرات', 'قندهار', 'مزار الشريف'] },
  { name: 'إسرائيل', nameEn: 'Israel', code: 'IL', phoneCode: '+972', currency: 'ILS', flagEmoji: '🇮🇱', cities: ['تل أبيب', 'القدس', 'حيفا', 'بئر السبع'] },
];

// GET /api/countries — List all active countries
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const withCities = searchParams.get('withCities') === 'true';
  
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: withCities ? {
        Cities: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      } : undefined,
    });

    return NextResponse.json({ countries });
  } catch (error) {
    console.error('GET /api/countries error:', error);
    return NextResponse.json({ error: 'فشل في جلب الدول' }, { status: 500 });
  }
}

// POST /api/countries — Seed countries and cities (run once)
export async function POST(req: NextRequest) {
  try {
    const count = await prisma.country.count();
    if (count > 0) {
      return NextResponse.json({ message: 'الدول موجودة بالفعل', count }, { status: 200 });
    }

    for (let i = 0; i < COUNTRIES_DATA.length; i++) {
      const c = COUNTRIES_DATA[i];
      const country = await prisma.country.create({
        data: {
          name: c.name,
          nameEn: c.nameEn,
          code: c.code,
          phoneCode: c.phoneCode,
          currency: c.currency,
          flagEmoji: c.flagEmoji,
          sortOrder: i,
        },
      });

      await prisma.city.createMany({
        data: c.cities.map((cityName, idx) => ({
          countryId: country.id,
          name: cityName,
          sortOrder: idx,
        })),
      });
    }

    return NextResponse.json({
      message: 'تم تعبئة الدول والمدن بنجاح',
      countriesCount: COUNTRIES_DATA.length,
      totalCities: COUNTRIES_DATA.reduce((sum, c) => sum + c.cities.length, 0),
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/countries/seed error:', error);
    return NextResponse.json({ error: 'فشل في تعبئة الدول' }, { status: 500 });
  }
}

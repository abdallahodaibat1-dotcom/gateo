import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Detect user's country from IP address using free ipapi.co service
 * Falls back to ip-api.com if first fails
 */
export async function GET(req: NextRequest) {
  try {
    // Get the real client IP from headers (works with reverse proxies)
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';

    // Don't geolocate localhost / private IPs — return null so UI can show a message
    if (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.')) {
      return NextResponse.json({ 
        country: null,
        source: 'localhost',
        ip: clientIp,
      });
    }

    // Try ipapi.co first
    try {
      const res = await fetch(`https://ipapi.co/${clientIp}/json/`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 0 },
      });
      const data = await res.json();
      
      if (data.country_code) {
        const country = await prisma.country.findFirst({
          where: { code: data.country_code },
          select: { id: true, name: true, flagEmoji: true, code: true, phoneCode: true },
        });
        if (country) {
          return NextResponse.json({ 
            country,
            source: 'ipapi',
            ip: clientIp,
          });
        }
      }
    } catch {
      // fallback to ip-api.com
    }

    // Fallback to ip-api.com
    try {
      const res = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,countryCode`, {
        next: { revalidate: 0 },
      });
      const data = await res.json();
      
      if (data.status === 'success' && data.countryCode) {
        const country = await prisma.country.findFirst({
          where: { code: data.countryCode },
          select: { id: true, name: true, flagEmoji: true, code: true, phoneCode: true },
        });
        if (country) {
          return NextResponse.json({ 
            country,
            source: 'ip-api',
            ip: clientIp,
          });
        }
      }
    } catch {
      // fallback failed
    }

    // Ultimate fallback: Saudi Arabia
    const defaultCountry = await prisma.country.findFirst({
      where: { code: 'SA' },
      select: { id: true, name: true, flagEmoji: true, code: true, phoneCode: true },
    });
    return NextResponse.json({ 
      country: defaultCountry,
      source: 'fallback',
      ip: clientIp,
    });
  } catch (error) {
    console.error('Geo detect error:', error);
    return NextResponse.json({ 
      country: null,
      error: 'فشل في تحديد الدولة',
    }, { status: 500 });
  }
}

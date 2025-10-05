const TZ = 'America/New_York';

// Parse New York wall time components reliably, even with limited ICU
function getNYComponents(date: Date) {
  // "MM/DD/YYYY, HH:MM:SS"
  const s = date.toLocaleString('en-US', {
    timeZone: TZ,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2}):(\d{2})/);
  if (!m) throw new Error('Unable to parse NY components');
  // m: [full, MM, DD, YYYY, HH, MM, SS]
  const mm = Number(m[1]);
  const dd = Number(m[2]);
  const yyyy = Number(m[3]);
  const HH = Number(m[4]);
  const MM = Number(m[5]);
  const SS = Number(m[6]);
  return { yyyy, mm, dd, HH, MM, SS };
}

// Compute GMT offset like GMT-0400 or GMT-0500 for that instant in NY
function nyOffsetMinutes(date: Date) {
  const { yyyy, mm, dd, HH, MM, SS } = getNYComponents(date);
  // Pretend the NY wall time is UTC and compare to the actual UTC
  const utcFromNY = Date.UTC(yyyy, mm - 1, dd, HH, MM, SS);
  const actualUTC = date.getTime();
  // Positive 240 => EDT (UTC-4). Positive 300 => EST (UTC-5).
  return Math.round((actualUTC - utcFromNY) / 60000);
}

export function formatForDjangoNY(date: Date) {
  const { yyyy, mm, dd, HH, MM, SS } = getNYComponents(date);

  // Weekday (short) using NY timezone (this is usually supported even with slim ICU)
  const weekday = date.toLocaleString('en-US', { timeZone: TZ, weekday: 'short' });

  // Month short names (avoid relying on ICU here)
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthShort = MONTHS[mm - 1];

  const offMin = nyOffsetMinutes(date);           // 240 (EDT) or 300 (EST), etc.
  const tzOffset = -offMin;                       // JS-style sign for GMT±HHMM
  const sign = tzOffset >= 0 ? '+' : '-';
  const offHH = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
  const offMM = String(Math.abs(tzOffset) % 60).padStart(2, '0');
  const gmt = `GMT${sign}${offHH}${offMM}`;

  // Simple DST name mapping (avoids timeZoneName dependence)
  const tzName = offMin === 240 ? 'Eastern Daylight Time' : 'Eastern Standard Time';

  const dayStr = String(dd).padStart(2, '0');
  const hourStr = String(HH).padStart(2, '0');
  const minStr = String(MM).padStart(2, '0');
  const secStr = String(SS).padStart(2, '0');

  // Mon Oct 06 2025 20:45:00 GMT-0400 (Eastern Daylight Time)
  return `${weekday} ${monthShort} ${dayStr} ${yyyy} ` +
         `${hourStr}:${minStr}:${secStr} ${gmt} (${tzName})`;
}

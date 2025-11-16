/**
 * iCal file generation utility
 */

/**
 * Format date to iCal format with timezone (YYYYMMDDTHHMMSS)
 */
function formatICalDate(date: Date, timezone: string = 'UTC'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Escape text for iCal format
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a unique ID for the event
 */
function generateUID(prefix: string = 'reservation'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${random}@rentila.co.uk`;
}

/**
 * Interface for iCal event data
 */
export interface ICalEventData {
  summary: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  url?: string;
  organizer?: {
    name: string;
    email: string;
  };
  attendee?: {
    name: string;
    email: string;
  };
}

/**
 * Generate iCal file content from event data
 */
export function generateICalFile(data: ICalEventData): string {
  // Get timezone (default to UTC, but can be customized)
  const timezone = 'UTC';
  const dtstart = formatICalDate(data.startDate, timezone);
  const dtend = formatICalDate(data.endDate, timezone);
  
  let ical = 'BEGIN:VCALENDAR\r\n';
  ical += 'VERSION:2.0\r\n';
  ical += 'CALSCALE:GREGORIAN\r\n';
  ical += 'BEGIN:VEVENT\r\n';
  ical += `SUMMARY:${escapeICalText(data.summary)}\r\n`;
  ical += `DTSTART;TZID=${timezone}:${dtstart}\r\n`;
  ical += `DTEND;TZID=${timezone}:${dtend}\r\n`;
  
  if (data.location) {
    ical += `LOCATION:${escapeICalText(data.location)}\r\n`;
  }
  
  if (data.description) {
    ical += `DESCRIPTION:${escapeICalText(data.description)}\r\n`;
  }
  
  ical += 'STATUS:CONFIRMED\r\n';
  ical += 'SEQUENCE:0\r\n';
  
  // Add reminder alarm (10 minutes before)
  ical += 'BEGIN:VALARM\r\n';
  ical += 'TRIGGER:-PT10M\r\n';
  ical += 'DESCRIPTION:Reservation Reminder\r\n';
  ical += 'ACTION:DISPLAY\r\n';
  ical += 'END:VALARM\r\n';
  
  ical += 'END:VEVENT\r\n';
  ical += 'END:VCALENDAR\r\n';
  
  return ical;
}

/**
 * Download iCal file
 */
export function downloadICalFile(icalContent: string, filename: string = 'reservation.ics'): void {
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Share iCal file via WhatsApp
 * Uses Web Share API when available (supports file sharing)
 * Falls back to download + WhatsApp link if Web Share API is not available
 */
export function shareICalViaWhatsApp(icalContent: string, message: string = 'Reservation Calendar Event'): void {
  const filename = 'reservation.ics';
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const file = new File([blob], filename, { type: 'text/calendar;charset=utf-8' });

  // Check if Web Share API is available and supports files
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    // Use Web Share API to share the file directly
    navigator.share({
      title: 'Reservation Calendar',
      text: message,
      files: [file],
    })
      .then(() => {
        console.log('File shared successfully via Web Share API');
      })
      .catch((error) => {
        console.error('Error sharing file:', error);
        // Fallback to download + WhatsApp link
        fallbackShareMethod(blob, filename, message);
      });
  } else {
    // Fallback: Download file and open WhatsApp
    fallbackShareMethod(blob, filename, message);
  }
}

/**
 * Fallback method: Download file and open WhatsApp with message
 */
function fallbackShareMethod(blob: Blob, filename: string, message: string): void {
  // Download the file
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Small delay to ensure file download starts
  setTimeout(() => {
    URL.revokeObjectURL(url);
    
    // Open WhatsApp with the message
    // The user can then manually attach the downloaded .ics file
    const whatsappMessage = encodeURIComponent(`${message}\n\nPlease attach the downloaded calendar file (${filename})`);
    const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
  }, 300);
}


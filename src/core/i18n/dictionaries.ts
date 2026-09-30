import type { Locale } from "./locales";

/**
 * Invitation-facing strings: UI labels templates need, and the default copy
 * each section starts with. Wedding identity (names, dates, places) is never
 * here — only generic phrases.
 */
export interface InvitationDictionary {
  ui: {
    openInvitation: string;
    tapToOpen: string;
    scroll: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    today: string;
    married: string;
    directions: string;
    addToCalendar: string;
    music: string;
    playMusic: string;
    pauseMusic: string;
    photo: string;
    close: string;
    previous: string;
    next: string;
  };
  defaults: {
    hero: { eyebrow: string; tagline: string };
    couple: { eyebrow: string; heading: string; message: string };
    date: { heading: string; note: string };
    countdown: { heading: string };
    story: { heading: string; body: string };
    ceremony: { heading: string; note: string };
    reception: { heading: string; note: string };
    venue: { heading: string; note: string };
    gallery: { heading: string; caption: string };
    schedule: { heading: string };
    rsvp: { heading: string; message: string; deadline: string };
    closing: { heading: string; message: string; signature: string };
    footer: { note: string };
  };
}

const en: InvitationDictionary = {
  ui: {
    openInvitation: "Open invitation",
    tapToOpen: "Tap the seal to open",
    scroll: "Scroll",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    today: "Today is the day",
    married: "Just married",
    directions: "Get directions",
    addToCalendar: "Add to calendar",
    music: "Music",
    playMusic: "Play music",
    pauseMusic: "Pause music",
    photo: "Photo",
    close: "Close",
    previous: "Previous",
    next: "Next",
  },
  defaults: {
    hero: { eyebrow: "We're getting married", tagline: "" },
    couple: {
      eyebrow: "Together with their families",
      heading: "Two hearts, one beginning",
      message:
        "With joy in our hearts, we invite you to celebrate the day we begin our life together.",
    },
    date: { heading: "Save the date", note: "" },
    countdown: { heading: "Counting down to forever" },
    story: { heading: "Our story", body: "" },
    ceremony: { heading: "The ceremony", note: "" },
    reception: { heading: "The celebration", note: "" },
    venue: { heading: "Finding your way", note: "" },
    gallery: { heading: "Moments", caption: "" },
    schedule: { heading: "The day" },
    rsvp: {
      heading: "Kindly reply",
      message: "Online replies will open soon. We can't wait to celebrate with you.",
      deadline: "",
    },
    closing: {
      heading: "We hope to see you there",
      message: "Your presence is the greatest gift we could ask for.",
      signature: "",
    },
    footer: { note: "" },
  },
};

const ar: InvitationDictionary = {
  ui: {
    openInvitation: "افتح الدعوة",
    tapToOpen: "اضغط على الختم لفتح الدعوة",
    scroll: "مرّر",
    days: "أيام",
    hours: "ساعات",
    minutes: "دقائق",
    seconds: "ثوانٍ",
    today: "اليوم هو يومنا",
    married: "تزوّجنا",
    directions: "الاتجاهات",
    addToCalendar: "أضف إلى التقويم",
    music: "الموسيقى",
    playMusic: "تشغيل الموسيقى",
    pauseMusic: "إيقاف الموسيقى",
    photo: "صورة",
    close: "إغلاق",
    previous: "السابق",
    next: "التالي",
  },
  defaults: {
    hero: { eyebrow: "سنتزوّج", tagline: "" },
    couple: {
      eyebrow: "بمشاركة عائلتيهما",
      heading: "قلبان وبداية واحدة",
      message: "بقلوب يملؤها الفرح، ندعوكم لمشاركتنا فرحة بداية حياتنا معًا.",
    },
    date: { heading: "احفظوا الموعد", note: "" },
    countdown: { heading: "العدّ التنازلي" },
    story: { heading: "قصتنا", body: "" },
    ceremony: { heading: "مراسم الزفاف", note: "" },
    reception: { heading: "الحفل", note: "" },
    venue: { heading: "كيف تصلون إلينا", note: "" },
    gallery: { heading: "لحظات", caption: "" },
    schedule: { heading: "برنامج اليوم" },
    rsvp: { heading: "تأكيد الحضور", message: "سيتاح تأكيد الحضور عبر الإنترنت قريبًا.", deadline: "" },
    closing: { heading: "نتطلع لرؤيتكم", message: "حضوركم هو أجمل هدية لنا.", signature: "" },
    footer: { note: "" },
  },
};

export const dictionaries: Record<Locale, InvitationDictionary> = { en, ar };

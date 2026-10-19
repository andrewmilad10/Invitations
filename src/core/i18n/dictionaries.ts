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
    location: string;
    time: string;
  };
  defaults: {
    hero: { eyebrow: string; tagline: string };
    couple: { eyebrow: string; heading: string; message: string };
    date: { heading: string; note: string };
    countdown: { heading: string };
    story: { heading: string; body: string; quote: string; quoteSource: string };
    ceremony: { heading: string; note: string };
    reception: { heading: string; note: string };
    venue: { heading: string; note: string };
    gallery: { heading: string; caption: string };
    schedule: { heading: string };
    rsvp: { heading: string; message: string; deadline: string; linkUrl: string; linkLabel: string };
    wishes: { heading: string; message: string };
    gifts: { heading: string; note: string; method: string; account: string };
    faq: { heading: string };
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
    location: "Location",
    time: "Time",
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
    story: { heading: "Our story", body: "", quote: "", quoteSource: "" },
    ceremony: { heading: "The ceremony", note: "" },
    reception: { heading: "The celebration", note: "" },
    venue: { heading: "Finding your way", note: "" },
    gallery: { heading: "Moments", caption: "" },
    schedule: { heading: "The day" },
    rsvp: {
      heading: "Kindly reply",
      message: "Let us know if you can join us. We can't wait to celebrate with you.",
      deadline: "",
      linkUrl: "",
      linkLabel: "Reply here",
    },
    wishes: { heading: "Leave us a wish", message: "A few words for us to keep." },
    gifts: { heading: "A gift for us", note: "Your presence is the greatest gift. If you'd like to send something, you can use:", method: "InstaPay", account: "" },
    faq: { heading: "Questions & answers" },
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
    location: "المكان",
    time: "الموعد",
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
    story: { heading: "قصتنا", body: "", quote: "", quoteSource: "" },
    ceremony: { heading: "مراسم الزفاف", note: "" },
    reception: { heading: "الحفل", note: "" },
    venue: { heading: "كيف تصلون إلينا", note: "" },
    gallery: { heading: "لحظات", caption: "" },
    schedule: { heading: "برنامج اليوم" },
    rsvp: { heading: "تأكيد الحضور", message: "يسعدنا أن تخبرونا إن كنتم ستشاركوننا فرحتنا.", deadline: "", linkUrl: "", linkLabel: "أكّدوا حضوركم" },
    wishes: { heading: "اتركوا لنا أمنية", message: "كلمات نحتفظ بها للذكرى." },
    gifts: { heading: "هدية لنا", note: "حضوركم هو أجمل هدية. وإن أحببتم إرسال هدية يمكنكم استخدام:", method: "إنستاباي", account: "" },
    faq: { heading: "أسئلة شائعة" },
    closing: { heading: "نتطلع لرؤيتكم", message: "حضوركم هو أجمل هدية لنا.", signature: "" },
    footer: { note: "" },
  },
};

export const dictionaries: Record<Locale, InvitationDictionary> = { en, ar };

export type EventItem = {
  id: string;
  seriesId: string;
  title: string;
  summary: string;
  description: string;
  location: string;
  host: string;
  startDate: string;
  endDate: string;
  capacity: number;
  accent: string;
  coverImage: string;
  galleryImages: string[];
};

export type EventDraft = Omit<EventItem, "id">;

export const defaultEvents: EventItem[] = [
  {
    id: "sunset-baithak-winter-edition",
    seriesId: "sunset-baithak",
    title: "Sunset Baithak Winter Edition",
    summary: "A courtyard chai evening focused on winter spice pours and acoustic sets.",
    description:
      "The earlier edition of Sunset Baithak brought acoustic performances, winter spice chai flights, and long-table kulhad service into the courtyard for a colder-season version of the house format.",
    location: "Woaste Paend Courtyard, Hyderabad",
    host: "Woaste Paend House",
    startDate: "2026-02-14T18:30:00.000Z",
    endDate: "2026-02-14T21:00:00.000Z",
    capacity: 90,
    accent: "#8d6148",
    coverImage: "/events/sunset-cover.svg",
    galleryImages: [
      "/events/sunset-gallery-1.svg",
      "/events/sunset-gallery-2.svg",
      "/events/sunset-gallery-3.svg",
    ],
  },
  {
    id: "woategi-sunset-baithak",
    seriesId: "sunset-baithak",
    title: "Sunset Baithak",
    summary: "An open-air kullad chai evening with acoustic sets and clay workshops.",
    description:
      "Woategi turns the courtyard into a low-lit chai baithak with live acoustic sessions, hand-painted kullad counters, and a slow-brew menu made for long conversations.",
    location: "Woaste Paend Courtyard, Hyderabad",
    host: "Woaste Paend House",
    startDate: "2026-04-18T18:30:00.000Z",
    endDate: "2026-04-18T21:00:00.000Z",
    capacity: 120,
    accent: "#5f8f72",
    coverImage: "/events/sunset-cover.svg",
    galleryImages: [
      "/events/sunset-gallery-1.svg",
      "/events/sunset-gallery-2.svg",
      "/events/sunset-gallery-3.svg",
    ],
  },
  {
    id: "woategi-monsoon-market",
    seriesId: "monsoon-market-pour",
    title: "Monsoon Market Pour",
    summary: "A rainy-season tea market with snacks, ceramics, and limited chai blends.",
    description:
      "A weekend market built around monsoon chai service, fresh bakery pairings, local ceramic makers, and a special saffron pour line available only during the event.",
    location: "Banjara Courtyard Hall",
    host: "Woaste Paend x Local Makers",
    startDate: "2026-05-02T11:00:00.000Z",
    endDate: "2026-05-02T16:00:00.000Z",
    capacity: 200,
    accent: "#355f85",
    coverImage: "/events/market-cover.svg",
    galleryImages: [
      "/events/market-gallery-1.svg",
      "/events/market-gallery-2.svg",
      "/events/market-gallery-3.svg",
    ],
  },
  {
    id: "woategi-midnight-steam",
    seriesId: "midnight-steam-session",
    title: "Midnight Steam Session",
    summary: "A late-night tasting event for smoky chai flights and dessert pairings.",
    description:
      "A tighter seated tasting featuring the Coastal Blue and Monsoon Saffron signatures, plated desserts, and a guided walk-through of the house spice profiles.",
    location: "Studio Room, Woaste Paend",
    host: "Head Brew Team",
    startDate: "2026-05-16T19:30:00.000Z",
    endDate: "2026-05-16T22:00:00.000Z",
    capacity: 60,
    accent: "#4f8b7e",
    coverImage: "/events/midnight-cover.svg",
    galleryImages: [
      "/events/midnight-gallery-1.svg",
      "/events/midnight-gallery-2.svg",
      "/events/midnight-gallery-3.svg",
    ],
  },
];

export const EVENT_STORAGE_KEY = "woaste-paend.events";

export const sortEventsByDate = (events: EventItem[]) => {
  return [...events].sort((first, second) => {
    return (
      new Date(first.startDate).getTime() - new Date(second.startDate).getTime()
    );
  });
};

export const sortEventsForDisplay = (
  events: EventItem[],
  referenceTime = Date.now(),
) => {
  const upcoming = events
    .filter((event) => new Date(event.endDate).getTime() >= referenceTime)
    .sort((first, second) => {
      return (
        new Date(first.startDate).getTime() - new Date(second.startDate).getTime()
      );
    });

  const past = events
    .filter((event) => new Date(event.endDate).getTime() < referenceTime)
    .sort((first, second) => {
      return (
        new Date(second.startDate).getTime() - new Date(first.startDate).getTime()
      );
    });

  return [...upcoming, ...past];
};

const EVENT_TIME_ZONE = "Asia/Kolkata";

const getDateParts = (value: string) => {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: EVENT_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const parts = formatter.formatToParts(new Date(value));

  return {
    day: parts.find((part) => part.type === "day")?.value ?? "",
    month: parts.find((part) => part.type === "month")?.value ?? "",
    year: parts.find((part) => part.type === "year")?.value ?? "",
  };
};

const getTimeParts = (value: string) => {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: EVENT_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const parts = formatter.formatToParts(new Date(value));

  return {
    hour: parts.find((part) => part.type === "hour")?.value ?? "",
    minute: parts.find((part) => part.type === "minute")?.value ?? "",
    dayPeriod:
      parts.find((part) => part.type === "dayPeriod")?.value.toLowerCase() ?? "",
  };
};

export const formatEventDateRange = (startDate: string, endDate: string) => {
  const startDateParts = getDateParts(startDate);
  const endDateParts = getDateParts(endDate);
  const startTimeParts = getTimeParts(startDate);
  const endTimeParts = getTimeParts(endDate);

  const startDateLabel = `${startDateParts.day} ${startDateParts.month} ${startDateParts.year}`;
  const endDateLabel = `${endDateParts.day} ${endDateParts.month} ${endDateParts.year}`;
  const startTimeLabel = `${startTimeParts.hour}:${startTimeParts.minute} ${startTimeParts.dayPeriod}`;
  const endTimeLabel = `${endTimeParts.hour}:${endTimeParts.minute} ${endTimeParts.dayPeriod}`;

  if (startDateLabel === endDateLabel) {
    return `${startDateLabel}, ${startTimeLabel} - ${endTimeLabel}`;
  }

  return `${startDateLabel}, ${startTimeLabel} - ${endDateLabel}, ${endTimeLabel}`;
};

const toCalendarDate = (value: string) => {
  return value.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
};

export const createGoogleCalendarLink = (event: EventItem) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toCalendarDate(event.startDate)}/${toCalendarDate(event.endDate)}`,
    details: event.description,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const buildCalendarIcs = (event: EventItem) => {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Woaste Paend//Woategi Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@woaste-paend.local`,
    `DTSTAMP:${toCalendarDate(new Date().toISOString())}`,
    `DTSTART:${toCalendarDate(event.startDate)}`,
    `DTEND:${toCalendarDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};

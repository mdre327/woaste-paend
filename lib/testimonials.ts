export type TestimonialItem = {
  id: string;
  quote: string;
  author: string;
  role: string;
  accent: string;
};

export const testimonials: TestimonialItem[] = [
  {
    id: "repeat-guest-1",
    quote:
      "The kullad service changes the entire first sip. It feels like a designed ritual, not just tea in a cup.",
    author: "Aarav Mehta",
    role: "Repeat guest",
    accent: "#5f8f72",
  },
  {
    id: "event-visitor-1",
    quote:
      "Woategi nights feel half tasting room, half cultural gathering. The chai and the atmosphere land together.",
    author: "Sana Qureshi",
    role: "Woategi visitor",
    accent: "#355f85",
  },
  {
    id: "market-guest-1",
    quote:
      "Even the visual language feels intentional. The clay, the colors, the steam, the pours, everything connects.",
    author: "Ishaan Rao",
    role: "Market attendee",
    accent: "#8d6148",
  },
];

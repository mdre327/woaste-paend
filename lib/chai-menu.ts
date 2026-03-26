export type ChaiItem = {
  id: string;
  label: string;
  mood: string;
  description: string;
  spice: string;
  temperature: string;
  price: string;
  accent: string;
  notes: string[];
  pairings: string[];
};

export const chaiMenu: ChaiItem[] = [
  {
    id: "mitti-classic",
    label: "Mitti Classic",
    mood: "Earthy and slow",
    description:
      "The signature kullad chai with deep Assam leaves, cardamom lift, and a warm clay finish that lingers after the sip.",
    spice: "Cardamom and toasted jaggery",
    temperature: "Sunset pours",
    price: "Rs 90",
    accent: "#5f8f72",
    notes: ["Assam tea", "Clay aroma", "Jaggery finish"],
    pairings: ["Methi khari", "Masala bun"],
  },
  {
    id: "nilgiri-breeze",
    label: "Nilgiri Breeze",
    mood: "Cool, herbal, and bright",
    description:
      "A lighter kullad chai with mint and tulsi, designed to bring a fresh green-blue contrast against the roasted body of the tea.",
    spice: "Tulsi, mint, and soft fennel",
    temperature: "Late morning",
    price: "Rs 110",
    accent: "#2f6f86",
    notes: ["Nilgiri leaf", "Mint top note", "Soft fennel"],
    pairings: ["Lemon rusk", "Jeera toast"],
  },
  {
    id: "monsoon-saffron",
    label: "Monsoon Saffron",
    mood: "Velvet and fragrant",
    description:
      "A richer house blend with saffron milk, roasted spices, and a smooth body that feels built for rainy evenings.",
    spice: "Saffron, cinnamon, and clove",
    temperature: "Rainy evenings",
    price: "Rs 130",
    accent: "#4f8b7e",
    notes: ["Saffron milk", "Cinnamon glow", "Rainy-day warmth"],
    pairings: ["Ghee toast", "Shakkar para"],
  },
  {
    id: "coastal-blue",
    label: "Coastal Blue",
    mood: "Smoky with a cool finish",
    description:
      "A bold kullad chai folded with smoked sugar and a blue-leaning spice profile to echo sea breeze against hot clay.",
    spice: "Smoked sugar and star anise",
    temperature: "After dark",
    price: "Rs 125",
    accent: "#355f85",
    notes: ["Smoked sweetness", "Star anise", "Sea-breeze lift"],
    pairings: ["Salt biscuit", "Crisp toastie"],
  },
];

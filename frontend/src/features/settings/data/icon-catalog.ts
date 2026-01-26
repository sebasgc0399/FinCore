import type { LucideIcon } from "lucide-react"

export const PINNED_ICONS = [
  "Wallet",
  "CreditCard",
  "Banknote",
  "Coins",
  "PiggyBank",
  "HandCoins",
  "Receipt",
  "ReceiptText",
  "ShoppingCart",
  "Home",
  "Car",
  "Utensils",
  "HeartPulse",
  "Laptop",
] as const

export const ICON_GROUPS = {
  finance: [
    "Wallet",
    "CreditCard",
    "Banknote",
    "Coins",
    "PiggyBank",
    "HandCoins",
    "Receipt",
    "ReceiptText",
    "BadgeDollarSign",
    "CircleDollarSign",
    "Landmark",
  ],
  shopping: [
    "Tag",
    "ShoppingCart",
    "ShoppingBag",
    "Store",
    "Gift",
    "Package",
    "Barcode",
    "QrCode",
  ],
  food: [
    "Utensils",
    "Coffee",
    "Pizza",
    "Burger",
    "IceCream",
    "Cake",
    "Beer",
    "Wine",
    "Apple",
    "Salad",
    "Fish",
  ],
  homeServices: [
    "Home",
    "Building",
    "Bed",
    "Lightbulb",
    "Plug",
  ],
  transport: ["Car", "Bus", "Train", "Bike", "Fuel"],
  health: ["Stethoscope", "Pill", "Hospital", "HeartPulse"],
  entertainment: ["Gamepad2", "Music", "Film", "Camera", "Headphones"],
  educationWork: [
    "BookOpen",
    "GraduationCap",
    "Pen",
    "Pencil",
    "Briefcase",
    "Calendar",
    "Clock",
  ],
  technology: ["Laptop", "Smartphone", "Monitor", "Wifi"],
  travel: ["Plane", "MapPin", "Compass", "Globe", "Ticket", "Luggage", "Hotel"],
  petsFamily: ["Baby", "PawPrint"],
  sports: ["Dumbbell"],
  utilities: ["Droplet", "Flame", "Leaf", "ShieldCheck", "Wrench", "Scissors"],
} as const

const GROUP_ORDER = [
  "finance",
  "shopping",
  "food",
  "homeServices",
  "transport",
  "health",
  "entertainment",
  "educationWork",
  "technology",
  "travel",
  "petsFamily",
  "sports",
  "utilities",
] as const

const FALLBACK_KEYWORDS = [
  "wallet",
  "banknote",
  "receipt",
  "coin",
  "cash",
  "dollar",
  "euro",
  "yen",
  "pound",
  "cart",
  "bag",
  "store",
  "gift",
  "package",
  "barcode",
  "qrcode",
  "utensil",
  "coffee",
  "pizza",
  "burger",
  "icecream",
  "cake",
  "beer",
  "wine",
  "salad",
  "fish",
  "home",
  "building",
  "hotel",
  "bed",
  "lightbulb",
  "plug",
  "droplet",
  "flame",
  "leaf",
  "car",
  "bus",
  "train",
  "plane",
  "bike",
  "fuel",
  "mappin",
  "compass",
  "stethoscope",
  "pill",
  "hospital",
  "heartpulse",
  "dumbbell",
  "gamepad",
  "music",
  "film",
  "camera",
  "headphones",
  "bookopen",
  "graduation",
  "briefcase",
  "calendar",
  "clock",
  "laptop",
  "smartphone",
  "monitor",
  "wifi",
  "shieldcheck",
  "wrench",
  "scissors",
  "baby",
  "pawprint",
  "globe",
  "ticket",
  "luggage",
] as const

export const MAX_ICONS = 500
const MIN_ICONS = 200

export const buildIconCatalog = (
  iconMap: Record<string, LucideIcon>
): string[] => {
  const seen = new Set<string>()
  const unique: string[] = []

  const addNames = (names: readonly string[]): void => {
    for (const name of names) {
      if (!(name in iconMap) || seen.has(name)) {
        continue
      }
      seen.add(name)
      unique.push(name)
      if (unique.length >= MAX_ICONS) {
        return
      }
    }
  }

  addNames(PINNED_ICONS)

  for (const group of GROUP_ORDER) {
    addNames(ICON_GROUPS[group])
    if (unique.length >= MAX_ICONS) {
      return unique.slice(0, MAX_ICONS)
    }
  }

  if (unique.length < MIN_ICONS) {
    const fallback = Object.keys(iconMap)
      .filter(
        (name) =>
          !seen.has(name) &&
          FALLBACK_KEYWORDS.some((keyword) =>
            name.toLowerCase().includes(keyword)
          )
      )
      .sort((a, b) => a.localeCompare(b))

    addNames(fallback)
  }

  return unique.slice(0, MAX_ICONS)
}

import {
  Scissors,
  Sparkles,
  UtensilsCrossed,
  Trees,
  SprayCan,
  BookOpen,
  Home,
  Building2,
  ShoppingCart,
  Flower2,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

export type Category = {
  slug: string;
  label: string;
  icon: LucideIcon;
};

export const categories: Category[] = [
  { slug: "haircut", label: "Haircut", icon: Scissors },
  { slug: "beauty", label: "Beauty", icon: Sparkles },
  { slug: "fitness", label: "Fitness", icon: Dumbbell },
  { slug: "food", label: "Food", icon: UtensilsCrossed },
  { slug: "landscaping", label: "Landscaping", icon: Trees },
  { slug: "cleaning", label: "Cleaning", icon: SprayCan },
  { slug: "textbooks", label: "Textbooks", icon: BookOpen },
  { slug: "subleasing", label: "Subleasing", icon: Home },
  { slug: "temporary-stays", label: "Temporary Stays", icon: Building2 },
  { slug: "shopping", label: "Shopping", icon: ShoppingCart },
  { slug: "flowers", label: "Flowers", icon: Flower2 },
];

import {
  Briefcase,
  Car,
  Circle,
  Dumbbell,
  Film,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Plane,
  ShoppingCart,
  Utensils,
  Wifi,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  ShoppingCart,
  Utensils,
  Home,
  Car,
  HeartPulse,
  Plane,
  Film,
  GraduationCap,
  Wifi,
  Dumbbell,
  Gift,
  Briefcase,
};

export function getIcon(name: string): LucideIcon {
  return map[name] ?? Circle;
}

export function CategoryIcon({
  icon,
  color,
  className = "",
}: {
  icon: string;
  color: string;
  className?: string;
}) {
  const Icon = getIcon(icon);
  return (
    <span
      className={`inline-grid h-10 w-10 shrink-0 place-items-center rounded-xl ${className}`}
      style={{
        backgroundColor: `color-mix(in oklab, var(--${color}) 14%, transparent)`,
        color: `var(--${color})`,
      }}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

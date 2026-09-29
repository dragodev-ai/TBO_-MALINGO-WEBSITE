"use client";

import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel";

// High quality verified stock photography and creative showcase art
const WORKS: WorksWheelItem[] = [
  {
    title: "Prismatic Horizon",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    href: "#prismatic-horizon",
  },
  {
    title: "Ember Atmosphere",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop",
    href: "#ember-atmosphere",
  },
  {
    title: "Cybernetic Portal",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop",
    href: "#cybernetic-portal",
  },
  {
    title: "Scarlet Ribbon",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop",
    href: "#scarlet-ribbon",
  },
  {
    title: "Celestial Glow",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
    href: "#celestial-glow",
  },
  {
    title: "Neon Portrait",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop",
    href: "#neon-portrait",
  },
  {
    title: "Indigo Fluidity",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop",
    href: "#indigo-fluidity",
  },
  {
    title: "Apex Trajectory",
    image: "https://images.unsplash.com/photo-1517976487515-56455ffdf96d?q=80&w=1200&auto=format&fit=crop",
    href: "#apex-trajectory",
  },
  {
    title: "Cosmic Nebula",
    image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop",
    href: "#cosmic-nebula",
  },
];

export default function WorksWheelDemo() {
  return (
    <div className="bg-background text-foreground w-full h-screen">
      <WorksWheel items={WORKS} label="Works '26" action="View Project" />
    </div>
  );
}

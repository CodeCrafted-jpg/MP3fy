import HeroSectionOne from "@/components/HeroSection";
import { ModeToggle } from "@/components/ModeToggler";
import { Vortex } from "@/components/votext";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fullscreen Vortex Background */}
      <Vortex
        className="absolute inset-0 w-full h-full z-0"
        rangeY={1500}
        particleCount={600}
       // optional background color
      />

      {/* Foreground Content */}
      <div className="relative z-10 p-4">
        <div className="text-right">
          
        </div>
        <HeroSectionOne />
        {/* You can add more content here */}
      </div>
         <Vortex
        className="absolute inset-0 w-full h-full z-0"
        rangeY={1500}
        particleCount={400}
       // optional background color
      />

    </div>
  );
}

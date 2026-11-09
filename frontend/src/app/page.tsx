import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Spotlight from "@/components/sections/Spotlight";
import MetadataBar from "@/components/sections/MetadataBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-background text-brand-foreground">
      <Hero />
      <About />
      <Spotlight />
      <MetadataBar />
    </main>
  );
}


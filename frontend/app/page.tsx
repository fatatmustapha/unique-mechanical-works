import Hero from "@/components/home/Hero";
import ServicesSection from "@/components/home/ServicesSection";
import WhyVision from "@/components/home/WhyVision";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <WhyVision />
        <ServicesSection />
      </main>

      <Footer />
    </>
  );
}
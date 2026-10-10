import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Contacts } from '@/components/sections/Contacts';
import { Dresscode } from '@/components/sections/Dresscode';
import { Faq } from '@/components/sections/Faq';
import { Gifts } from '@/components/sections/Gifts';
import { Hero } from '@/components/sections/Hero';
import { Locations } from '@/components/sections/Locations';
import { Photos } from '@/components/sections/Photos';
import { RsvpSection } from '@/components/sections/rsvp/RsvpSection';
import { Schedule } from '@/components/sections/Schedule';
import { Stay } from '@/components/sections/Stay';
import { Story } from '@/components/sections/Story';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="inhalt">
        <Hero />
        <Story />
        <Schedule />
        <Locations />
        <Stay />
        <Dresscode />
        <Gifts />
        <Photos />
        <RsvpSection />
        <Faq />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}

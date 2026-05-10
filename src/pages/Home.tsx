import { SideNav, TopBar } from '../components/SideNav'
import { Hero } from '../components/Hero'
import { SelectedWork } from '../components/SelectedWork'
import { AIEngineering } from '../components/AIEngineering'
import { Experience } from '../components/Experience'
import { About } from '../components/About'
import { AskPetro } from '../components/AskPetro'
import { Testimonials } from '../components/Testimonials'
import { Contact } from '../components/Contact'

export function Home() {
  return (
    <div className="relative min-h-screen">
      <TopBar />
      <SideNav />
      <main className="lg:pl-56">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          <Hero />
        </div>
        <SelectedWork />
        <AIEngineering />
        <Experience />
        <About />
        <AskPetro />
        <Testimonials />
        <Contact />
      </main>
    </div>
  )
}

import React from 'react'
import Navbar from './Navbar'
import Hero from './Hero' // The new 3D cinematic hero
import Services from './Services'
import About from './About'
import Work from './Work'
// import Blogs from './blogs'
// import ServiceCard from './ServiceCard'
import ServiceCarousel from './ServiceCarousel'
import Footer from './Footer'
import CallButton from './CallButton'


function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Services />
      <Work />
      <About />
      <Footer />
      <CallButton />
    </div>
  )
}

export default Home









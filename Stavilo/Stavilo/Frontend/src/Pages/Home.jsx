import React from 'react'
import Hero from '../Components/Hero'
import MostPicked from '../Components/MostPicked'
import PopularRooms from '../Components/PopularRooms'
import TextReviews from '../Components/TextReviews'
import SearchResults from '../Components/SearchResults'

function Home() {
  return (
    <div className='py-24'>
      <Hero/>
      <SearchResults />
      <MostPicked/>
      <PopularRooms/>
      
    </div>
  )
}

export default Home
//import { useState } from 'react'
import {Routes, Route} from 'react-router'
import './App.css'
import ContactPage from './pages/ContactPage'
import SupportPage from './pages/SupportPage'
import ArticlePage from './components/ArticlePage'
function App() {


  return (
    <>
    
    <Routes>
      <Route path="/Support" element={<SupportPage />} />
      <Route path ="/contactpage" element={<ContactPage />} />
      <Route path = "/article/:id" element = {<ArticlePage />} />
    </Routes>

    
{/* <AboutPage />*/}

    </>
  )
}

export default App

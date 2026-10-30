import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { routerBasename } from './lib/basename.ts'
import { AboutPage } from './pages/About.tsx'
import { ContactPage } from './pages/Contact.tsx'
import { HomePage } from './pages/Home.tsx'
import { ProductsPage } from './pages/Products.tsx'

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  )
}

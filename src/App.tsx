import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.tsx'
import { routerBasename } from './lib/basename.ts'
import { AboutPage } from './pages/About.tsx'
import { ContactPage } from './pages/Contact.tsx'
import { HomePage } from './pages/Home.tsx'
import { ProductsPage } from './pages/Products.tsx'

const AdminGate = lazy(() => import('./pages/admin/AdminGate.tsx').then((module) => ({ default: module.AdminGate })))
const AdminDetail = lazy(() => import('./pages/admin/AdminDetail.tsx').then((module) => ({ default: module.AdminDetail })))

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<p>讀取中</p>}>
                <AdminGate />
              </Suspense>
            }
          />
          <Route
            path="/admin/:id"
            element={
              <Suspense fallback={<p>讀取中</p>}>
                <AdminDetail />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

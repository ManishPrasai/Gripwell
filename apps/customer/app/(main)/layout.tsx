import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
        <Navbar />
      </div>
      {children}
      <Footer />
    </>
  )
}

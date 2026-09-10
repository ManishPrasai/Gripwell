import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* .nv-shared-chrome lets a single page opt out of the shared Navbar /
         Footer at a chosen breakpoint. The homepage uses it to hide both on
         mobile, where it renders its own header + bottom tab bar
         (see (main)/page.tsx). Every other page keeps them at all widths. */}
      <div className="nv-shared-chrome"><Navbar /></div>
      {children}
      <div className="nv-shared-chrome"><Footer /></div>
    </>
  )
}

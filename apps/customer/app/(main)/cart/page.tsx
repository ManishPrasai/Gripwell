import CartContents from '../../components/cart/CartContents'
import MobileCart from '../../components/cart/mobile/MobileCart'

export const metadata = {
  title: 'Your Cart — Nova Tyres',
  description: 'Review your cart, select your vehicle type and choose a fitting station.',
}

export default function CartPage() {
  return (
    <>
      {/*
        Two designs, one route — same [data-vw] split as / , /tyres , /wheels ,
        /service. globals.css shows exactly one tree per viewport with no JS.
        This scoped rule hides the shared Navbar/Footer below 1024px on /cart
        only, where MobileCart brings its own header + sticky summary bar.
      */}
      <style>{`@media (max-width:1023.98px){.nv-shared-chrome{display:none!important}}`}</style>

      <div data-vw="desktop"><CartContents /></div>
      <div data-vw="mobile"><MobileCart /></div>
    </>
  )
}

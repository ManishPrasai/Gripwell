import CartContents from '../components/cart/CartContents'

export const metadata = {
  title: 'Your Cart — Nova Tyres',
  description: 'Review your cart, select your vehicle type and choose a fitting station.',
}

export default function CartPage() {
  return (
    <main style={{ background: '#F2F2F2', minHeight: '100vh', paddingTop: '100px', paddingBottom: '60px' }}>
      <CartContents />
    </main>
  )
}

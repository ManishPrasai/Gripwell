import Link from 'next/link'
import LegalPage from '../../components/legal/LegalPage'

export const metadata = {
  title: 'Terms — Gripwell',
  description: 'Terms of sale for the Gripwell demo store.',
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of sale">
      <h2>Prices</h2>
      <p>All prices are in pounds sterling and include VAT at 20%. Fitting is charged once per wheel position, at the rate for your vehicle type shown in the basket. Collecting without fitting has no fitting charge.</p>

      <h2>Orders</h2>
      <p>You can order up to 8 tyres and 8 wheels per order. Your order is confirmed once payment succeeds. The total shown at checkout is the amount charged.</p>

      <h2>Fitting</h2>
      <p>After you order, the branch you chose contacts you to arrange a fitting time.</p>

      <h2>Returns and faults</h2>
      <p>Your rights under the Consumer Rights Act 2015 are not affected. See our <Link href="/warranty">warranty and returns page</Link> for how claims work.</p>

      <h2>This is a demo</h2>
      <p>Gripwell does not trade. No contract of sale is formed, no goods are supplied and no real payment is taken.</p>
    </LegalPage>
  )
}

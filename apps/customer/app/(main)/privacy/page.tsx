import LegalPage from '../../components/legal/LegalPage'

export const metadata = {
  title: 'Privacy — Gripwell',
  description: 'What the Gripwell demo store stores about you and why.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <h2>What we store</h2>
      <ul>
        <li><strong>Your basket:</strong> the items and quantities, kept against a random guest ID in a cookie so the basket survives a page reload.</li>
        <li><strong>Your choices on this device:</strong> basket contents, fitting choice and chosen branch are saved in your browser&rsquo;s local storage.</li>
        <li><strong>Orders:</strong> when you pay, we record your name, email, the items, the total and any order notes you add.</li>
        <li><strong>Newsletter:</strong> your email address, only if you sign up and confirm.</li>
      </ul>

      <h2>Payments</h2>
      <p>Card details go straight to Stripe and never reach our servers. In this demo Stripe runs in test mode, so use a test card such as 4242 4242 4242 4242.</p>

      <h2>Emails</h2>
      <p>Order confirmations are sent through our email provider to the address you give at checkout.</p>

      <h2>Analytics</h2>
      <p>We use Vercel Analytics to count page views. It does not use cookies to track you across sites.</p>

      <h2>Your rights</h2>
      <p>Under UK GDPR you can ask to see, correct or delete the data we hold about you. Because this is a demo, data may also be wiped at any time without notice.</p>
    </LegalPage>
  )
}

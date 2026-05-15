import { notFound } from 'next/navigation';

// Mobile KYC has been removed from this system.
// All authentication is handled directly via wallet connect on the login page.
export default function MobileKYCPage() {
  notFound();
}

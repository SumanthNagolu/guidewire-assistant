import { redirect } from 'next/navigation';
export default async function ProductivityPage() {
  // Redirect to new productivity insights page
  redirect('/productivity/insights');
}

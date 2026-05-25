import { redirect } from 'next/navigation';

export default function MobileKYCPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const session = searchParams?.session;
  const ekey = searchParams?.ekey;
  if (session && ekey) {
    redirect(`/?uuid=${session}&pub=${ekey}`);
  }
  redirect('/');
}

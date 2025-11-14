import Image from 'next/image';
import SignInButton from '../components/SignInButton';
import SignOutButton from '../components/SignOutButton/SignOutButton';
import { auth } from '../lib/auth';
import { cn } from '../utils/cn';

export default async function Home() {
    const session = await auth();

    console.log(session);

    return (
        <div>
            <main>
                {!session?.user ? (
                    <SignInButton />
                ) : (
                    <div className={cn('flex flex-col justify-center items-center min-h-screen')}>
                        <div>{session.user.name}</div>
                        <div>{session.user.email}</div>
                        <Image src={session.user.image ?? ''} width={80} height={80} alt="profile" />
                        <SignOutButton />
                    </div>
                )}
            </main>
        </div>
    );
}

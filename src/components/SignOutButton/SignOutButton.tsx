import { signOut } from '@/src/lib/auth';

function SignOutButton() {
    return (
        <form
            action={async () => {
                'use server';
                await signOut();
            }}
        >
            <button type="submit">Sign Out</button>
        </form>
    );
}

export default SignOutButton;

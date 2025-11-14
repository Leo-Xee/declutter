import { signIn } from '@/src/lib/auth';

function SignInButton() {
    return (
        <form
            action={async () => {
                'use server';
                await signIn('google');
            }}
        >
            <button type="submit">Sign in With Google</button>
        </form>
    );
}

export default SignInButton;

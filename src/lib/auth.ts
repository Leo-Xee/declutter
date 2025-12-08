import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const providerEnv = {
    google: {
        endpoint: 'https://oauth2.googleapis.com/token',
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
    },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            authorization: {
                params: {
                    scope: [
                        'openid',
                        'https://www.googleapis.com/auth/userinfo.email',
                        'https://www.googleapis.com/auth/userinfo.profile',
                        'https://www.googleapis.com/auth/youtube.readonly',
                        'https://www.googleapis.com/auth/youtube',
                    ].join(' '),
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    expiresAt: account.expires_at,
                };
            }

            if (token.expiresAt && Date.now() < (token.expiresAt - 10 * 60) * 1000) {
                return token;
            }

            try {
                const res = await fetch(providerEnv.google.endpoint, {
                    method: 'POST',
                    body: new URLSearchParams({
                        client_id: providerEnv.google.clientId!,
                        client_secret: providerEnv.google.clientSecret!,
                        grant_type: 'refresh_token',
                        refresh_token: token.refreshToken!,
                    }),
                });

                const tokenOrError = await res.json();

                if (!res.ok) throw tokenOrError;

                const newToken = tokenOrError as {
                    access_token: string;
                    expires_in: number;
                    refresh_token?: string;
                };

                return {
                    ...token,
                    accessToken: newToken.access_token,
                    expiresAt: Math.floor(Date.now() / 1000 + newToken.expires_in),
                    refreshToken: newToken.refresh_token ? newToken.refresh_token : token.refreshToken,
                };
            } catch (err) {
                console.error('Error Refreshing AccessToken', err);
                token.error = 'RefreshTokenError';
                return token;
            }
        },

        session({ session, token }) {
            session.accessToken = token.accessToken;
            session.error = token.error;

            return session;
        },
    },
});

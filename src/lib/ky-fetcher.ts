import ky, { Options } from 'ky';
import { auth } from './auth';
import { getSession } from 'next-auth/react';

type Method = 'get' | 'post' | 'delete' | 'patch' | 'put';

export async function clientFetcher<T>(method: Method, url: string, options?: Options) {
    const session = await getSession();

    const kyInstance = ky.create({
        prefixUrl: process.env.API_BASE_URL,
        retry: 0,
        hooks: {
            beforeRequest: [
                (req) => {
                    if (session?.accessToken) {
                        req.headers.set('Authorization', `Bearer ${session.accessToken}`);
                    }
                },
            ],
        },
    });

    return kyInstance[method]<T>(url, options);
}

export async function serverFetcher<T>(method: Method, url: string, options?: Options) {
    const session = await auth();

    const kyInstance = ky.create({
        prefixUrl: process.env.API_BASE_URL,
        retry: 0,
        hooks: {
            beforeRequest: [
                (req) => {
                    if (session?.accessToken) {
                        req.headers.set('Authorization', `Bearer ${session.accessToken}`);
                    }
                },
            ],
        },
    });

    return kyInstance[method]<T>(url, options);
}

import React from 'react';
import Head from 'next/head';
import './index.css';

export default function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
                />
                <meta name="theme-color" content="#363636" />
                <meta name="description" content="Lampify website"/>
                <meta name="theme-color" content="#317EFB" />

                <title>Lampify</title>

                <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/favicon.ico"></link>
            </Head>
            <Component {...pageProps} />
        </>
    )
};

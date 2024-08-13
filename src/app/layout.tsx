import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Kanit as FontSans } from 'next/font/google'

const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans',
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
})

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={fontSans.className}>{children}</body>
        </html>
    )
}

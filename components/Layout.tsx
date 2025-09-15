import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-40">
        <Sidebar />
      </div>

      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-64 w-full">
        <Header />

        <main className="flex-1 p-4 md:p-6 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
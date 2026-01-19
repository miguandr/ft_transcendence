import { Bell, Search, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function TopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsDropdownOpen(false);
    navigate("/welcome");
  };

  return (
    <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks, updates..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-cyan-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-400 rounded-full"></span>
        </button>

        <div className="relative pl-4 border-l border-gray-100">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right">
              <p className="text-sm text-gray-900">Sarah Chen</p>
              <p className="text-xs text-gray-500">Product Manager</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-200 to-blue-300 flex items-center justify-center">
              <span className="text-sm text-cyan-900">SC</span>
            </div>
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
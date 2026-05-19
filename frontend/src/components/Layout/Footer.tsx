export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-700 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">Scholar Tech</h3>
            <p className="text-sm">A modern educational platform for managing classes, grades, and student progress.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/dashboard" className="hover:text-white transition">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/classes" className="hover:text-white transition">
                  Classes
                </a>
              </li>
              <li>
                <a href="/settings" className="hover:text-white transition">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/settings" className="hover:text-white transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/settings" className="hover:text-white transition">
                  API Docs
                </a>
              </li>
              <li>
                <a href="/settings" className="hover:text-white transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: support@scholartech.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Location: San Francisco, CA</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col gap-4 text-sm md:flex-row md:justify-between md:items-center">
          <p>&copy; {currentYear} Scholar Tech. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 md:gap-6">
            <a href="/settings" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="/settings" className="hover:text-white transition">
              Terms of Service
            </a>
            <a href="/settings" className="hover:text-white transition">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

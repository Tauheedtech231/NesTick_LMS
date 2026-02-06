"use client";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#0f1220] via-[#15192f] to-[#0f1220] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Logo & About */}
          <div>
            <img
              src="/newlogo.jpg"
              alt="MansolHab Logo"
              className="w-48 mb-6"
            />

            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Excellence in education since 2005. <br />
              Shaping future leaders through quality education and character building.
            </p>

            {/* Social Icons */}
           <div className="flex space-x-4">
  {/* Facebook */}
  <a
    href="https://web.facebook.com/profile.php?id=61567152315949"
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 flex items-center justify-center rounded-md
               bg-[#1877F2] text-white
               transition hover:text-[#B11217]"
  >
    <FaFacebookF size={18} />
  </a>

  {/* Instagram */}
  <a
    href="https://www.instagram.com/mansol.hab.training.services/?hl=en"
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 flex items-center justify-center rounded-md
               bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]
               text-white transition hover:text-[#B11217]"
  >
    <FaInstagram size={18} />
  </a>

  {/* LinkedIn */}
  <a
    href="https://www.linkedin.com/in/mansol-hab-traning-services-b7b4b1296/"
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 flex items-center justify-center rounded-md
               bg-[#0A66C2] text-white
               transition hover:text-[#B11217]"
  >
    <FaLinkedinIn size={18} />
  </a>

  {/* TikTok */}
  <a
    href="https://www.tiktok.com/@mansol.skp"
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 flex items-center justify-center rounded-md
               bg-black text-white
               transition hover:text-[#B11217]"
  >
    <FaTiktok size={18} />
  </a>
</div>

          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-gray-300">
              {["Home", "Courses", "About", "Contact"].map((item) => (
                <li
                  key={item}
                  className="cursor-pointer transition hover:text-[#B11217]"
                >
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Programs</h3>
            <ul className="space-y-3 text-gray-300">
              {[
                "BOSH (Building Operating System Hardware)",
                "Fire Safety",
                "OSHA (Occupational Safety and Health Administration)",
                "Hole Watcher",
                "Permit to Work System (PTW System)",
              ].map((program) => (
                <li
                  key={program}
                  className="transition hover:text-[#B11217]"
                >
                  • {program}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Contact Info</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li><strong className="text-white">General:</strong> 03224700200</li>
              <li><strong className="text-white">Lahore:</strong> 03104700200</li>
              <li><strong className="text-white">Sheikhupura:</strong> 03054700202</li>
              <li><strong className="text-white">Rawalpindi:</strong> 03204700607</li>

              <li className="transition hover:text-[#B11217]">
                <strong className="text-white">Email:</strong> info@mansolhab.com
              </li>

              <li className="transition hover:text-[#B11217]">
                <strong className="text-white">WhatsApp:</strong> 03224700200
              </li>

              <li className="pt-3">
                <strong className="text-white">Office Hours:</strong><br />
                Monday to Saturday<br />
                9 to 5
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} MansolHab. All Rights Reserved.
      </div>
    </footer>
  );
}

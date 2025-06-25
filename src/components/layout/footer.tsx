"use client";
import React from "react";

export default function Footer() {
  return (
      <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                      <div className="flex items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">S</span>
                          </div>
                          <span className="text-xl font-bold">Synvibes HRMS</span>
                      </div>
                      <p className="text-gray-400">The complete HR management system for modern businesses.</p>
                  </div>

                  <div>
                      <h4 className="font-semibold mb-4">Features</h4>
                      <ul className="space-y-2 text-gray-400">
                          <li>Employee Management</li>
                          <li>Attendance Tracking</li>
                          <li>Payroll Software</li>
                          <li>HR Analytics</li>
                      </ul>
                  </div>

                  <div>
                      <h4 className="font-semibold mb-4">Company</h4>
                      <ul className="space-y-2 text-gray-400">
                          <li>About Us</li>
                          <li>Contact</li>
                          <li>Privacy Policy</li>
                          <li>Terms of Service</li>
                      </ul>
                  </div>

                  <div>
                      <h4 className="font-semibold mb-4">Support</h4>
                      <ul className="space-y-2 text-gray-400">
                          <li>Help Center</li>
                          <li>Documentation</li>
                          <li>API Reference</li>
                          <li>System Status</li>
                      </ul>
                  </div>
              </div>

              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                  <p>&copy; 2024 Synvibes HRMS. All rights reserved.</p>
              </div>
          </div>
      </footer>
  );
}
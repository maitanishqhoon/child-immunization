"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import dynamic from "next/dynamic";

// ✅ Dynamically import Map component — disables SSR
const HealthCentersByPincode = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <p className="text-center text-gray-500 py-4">Loading map...</p>
  ),
});

const vaccines = [
  {
    category: "For Infants",
    items: [
      { name: "BCG", when: "At birth or as early as possible till one year of age" },
      { name: "Hepatitis B - Birth dose", when: "At birth or as early as possible within 24 hours" },
      { name: "OPV-0", when: "At birth or as early as possible within the first 15 days" },
      { name: "OPV 1, 2 & 3", when: "At 6 weeks, 10 weeks & 14 weeks (till 5 years of age)" },
      { name: "Pentavalent 1, 2 & 3", when: "At 6 weeks, 10 weeks & 14 weeks (till one year of age)" },
      { name: "Rotavirus", when: "At 6 weeks, 10 weeks & 14 weeks (till one year of age)" },
      { name: "IPV", when: "Two fractional doses at 6 and 14 weeks of age" },
      { name: "Measles / MR 1st Dose", when: "9–12 months (can be given till 5 years)" },
      { name: "JE - 1", when: "9–12 months" },
      { name: "Vitamin A (1st dose)", when: "At 9 completed months with measles-Rubella" },
    ],
  },
  {
    category: "For Children",
    items: [
      { name: "DPT Booster-1", when: "16–24 months" },
      { name: "Measles / MR 2nd Dose", when: "16–24 months" },
      { name: "OPV Booster", when: "16–24 months" },
      { name: "JE-2", when: "16–24 months" },
      { name: "Vitamin A (2nd to 9th dose)", when: "16–18 months, then every 6 months till 5 years" },
      { name: "DPT Booster-2", when: "5–6 years" },
      { name: "TT", when: "At 10 years & 16 years" },
    ],
  },
];

export default function VaccineAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeMapIndex, setActiveMapIndex] = useState<string | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
    setActiveMapIndex(null); // Close map when switching section
  };

  const handleMapToggle = (vaccineKey: string) => {
    setActiveMapIndex(activeMapIndex === vaccineKey ? null : vaccineKey);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl shadow-lg divide-y divide-gray-200">
      {vaccines.map((section, index) => (
        <div key={index} className="accordion-item">
          {/* Header */}
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full flex justify-between items-center px-6 py-4 text-lg font-semibold text-left bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {section.category}
            {openIndex === index ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
          </button>

          {/* Content */}
          {openIndex === index && (
            <div className="p-6 bg-gray-50 text-gray-700">
              <ul className="space-y-4">
                {section.items.map((vaccine, idx) => {
                  const vaccineKey = `${index}-${idx}`;
                  const isMapVisible = activeMapIndex === vaccineKey;

                  return (
                    <li key={idx} className="border-b border-gray-200 pb-3">
                      <p className="font-medium text-blue-700">{vaccine.name}</p>
                      <p className="text-sm text-gray-600 mb-3">{vaccine.when}</p>

                      {/* Buttons */}
                      <div className="flex gap-4 mb-3">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow transition">
                          ✅ Vaccine Taken
                        </button>

                        <button
                          onClick={() => handleMapToggle(vaccineKey)}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
                        >
                          ❌ Vaccine Not Taken
                        </button>
                      </div>

                      {/* Render map when "Not Taken" clicked */}
                      {isMapVisible && (
                        <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                          <HealthCentersByPincode />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

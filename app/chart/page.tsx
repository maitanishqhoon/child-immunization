import VaccineAccordion from "@/components/VaccineAccordion";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 p-6">
      <h1 className="text-3xl font-bold text-center text-white mb-8">
        National Immunization Schedule
      </h1>
      <VaccineAccordion />
    </main>
  );
}

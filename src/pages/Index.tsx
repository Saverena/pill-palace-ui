import { Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Header } from "@/components/Header";
import { MedicationCard } from "@/components/MedicationCard";
import { AddMedicationDialog } from "@/components/AddMedicationDialog";
import { StatsCard } from "@/components/StatsCard";

const Index = () => {
  // Sample medication data
  const medications = [
    {
      id: "1",
      name: "Vitamin D3",
      dosage: "1000 IU",
      time: "08:00",
      taken: true,
      frequency: "daily",
      pillsLeft: 28
    },
    {
      id: "2", 
      name: "Omega-3",
      dosage: "500mg",
      time: "08:00",
      taken: true,
      frequency: "daily",
      pillsLeft: 45
    },
    {
      id: "3",
      name: "Metformin",
      dosage: "500mg",
      time: "12:00",
      taken: false,
      frequency: "twice-daily",
      pillsLeft: 15
    },
    {
      id: "4",
      name: "Lisinopril",
      dosage: "10mg",
      time: "18:00",
      taken: false,
      frequency: "daily",
      pillsLeft: 22
    }
  ];

  const todayStats = {
    taken: medications.filter(med => med.taken).length,
    total: medications.length,
    streak: 7,
    adherence: Math.round((medications.filter(med => med.taken).length / medications.length) * 100)
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Medications Taken Today"
            value={`${todayStats.taken}/${todayStats.total}`}
            icon={<CheckCircle className="h-4 w-4" />}
            description={`${todayStats.adherence}% adherence rate`}
            trend="up"
          />
          <StatsCard
            title="Current Streak"
            value={`${todayStats.streak} days`}
            icon={<TrendingUp className="h-4 w-4" />}
            description="Keep it up!"
            trend="up"
          />
          <StatsCard
            title="Next Medication"
            value="12:00 PM"
            icon={<Clock className="h-4 w-4" />}
            description="Metformin 500mg"
          />
          <StatsCard
            title="This Week"
            value="96%"
            icon={<Calendar className="h-4 w-4" />}
            description="Adherence rate"
            trend="up"
          />
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Today's Medications</h2>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <AddMedicationDialog />
        </div>

        {/* Medications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((medication) => (
            <MedicationCard
              key={medication.id}
              {...medication}
            />
          ))}
        </div>

        {/* Empty State for no medications */}
        {medications.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No medications yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first medication to start tracking your health journey.
            </p>
            <AddMedicationDialog />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

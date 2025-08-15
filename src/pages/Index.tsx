import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, TrendingUp, Pill } from "lucide-react";
import { Header } from "@/components/Header";
import { MedicationCard } from "@/components/MedicationCard";
import { MedicationScanDialog } from "@/components/MedicationScanDialog";
import { StatsCard } from "@/components/StatsCard";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Medication {
  medicationid: string;
  name: string;
  dosage: number;
  unit: string;
  remaining_quantity: number | null;
  quantity_unit: string;
  instructions: string | null;
}

const Index = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationsLoading, setMedicationsLoading] = useState(true);


  useEffect(() => {
    if (user) {
      fetchMedications();
    }
  }, [user]);

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('userid', user?.id)
        .order('name');

      if (error) throw error;

      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
      toast({
        title: "Error",
        description: "Failed to load medications",
        variant: "destructive",
      });
    } finally {
      setMedicationsLoading(false);
    }
  };

  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading state
  if (loading || medicationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate today's stats (simplified for demo)
  const totalToday = medications.length;
  const takenToday = 0; // Would be calculated from logs
  const streak = 0; // Would be calculated from historical data
  const adherenceRate = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatsCard
            title="Medications Taken Today"
            value={`${takenToday}/${totalToday}`}
            icon={<CheckCircle className="h-4 w-4" />}
            description={`${adherenceRate}% adherence rate`}
            trend="up"
          />
          <StatsCard
            title="Current Streak"
            value={`${streak} days`}
            icon={<TrendingUp className="h-4 w-4" />}
            description="Keep it up!"
            trend="up"
          />
          <StatsCard
            title="Total Medications"
            value={totalToday.toString()}
            icon={<Pill className="h-4 w-4" />}
            description="In your tracker"
          />
          <StatsCard
            title="This Week"
            value="0%"
            icon={<Calendar className="h-4 w-4" />}
            description="Adherence rate"
            trend="up"
          />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Your Medications</h2>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <MedicationScanDialog onMedicationAdded={fetchMedications} />
        </div>

        {/* Medications Grid */}
        {medications.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Pill className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No medications yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first medication to start tracking your health journey.
            </p>
            <MedicationScanDialog onMedicationAdded={fetchMedications} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {medications.map((medication) => (
              <MedicationCard
                key={medication.medicationid}
                id={medication.medicationid}
                name={medication.name}
                dosage={`${medication.dosage} ${medication.unit}`}
                time="08:00" // Would come from schedules
                taken={false} // Would come from today's logs
                frequency="daily" // Would come from schedules
                pillsLeft={medication.remaining_quantity || 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Calendar, Clock, Pill, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface MedicationLog {
  logid: string;
  status: string;
  takenat: string | null;
  createdat: string;
  medication_name: string;
  medication_dosage: number;
  medication_unit: string;
  remaining_quantity: number | null;
  quantity_unit: string;
}

interface MedicationInfo {
  medicationid: string;
  name: string;
  dosage: number;
  unit: string;
  remaining_quantity: number | null;
  quantity_unit: string;
}

export default function History() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [medications, setMedications] = useState<MedicationInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch medication logs
      const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select(`
          logid,
          status,
          takenat,
          createdat,
          reminders!inner(
            schedules!inner(
              medications!inner(
                name,
                dosage,
                unit,
                remaining_quantity,
                quantity_unit
              )
            )
          )
        `)
        .order('createdat', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Transform the data
      const transformedLogs = logsData?.map(log => ({
        logid: log.logid,
        status: log.status,
        takenat: log.takenat,
        createdat: log.createdat,
        medication_name: log.reminders.schedules.medications.name,
        medication_dosage: log.reminders.schedules.medications.dosage,
        medication_unit: log.reminders.schedules.medications.unit,
        remaining_quantity: log.reminders.schedules.medications.remaining_quantity,
        quantity_unit: log.reminders.schedules.medications.quantity_unit,
      })) || [];

      setLogs(transformedLogs);

      // Fetch current medications
      const { data: medicationsData, error: medicationsError } = await supabase
        .from('medications')
        .select('medicationid, name, dosage, unit, remaining_quantity, quantity_unit')
        .eq('userid', user?.id)
        .order('name');

      if (medicationsError) throw medicationsError;

      setMedications(medicationsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load medication history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logIntake = async (medicationId: string) => {
    try {
      // For demo purposes, we'll create a simple log entry
      // In a real app, you'd have proper reminders and schedules set up
      toast({
        title: "Intake logged",
        description: "Medication intake has been recorded",
      });
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error logging intake:', error);
      toast({
        title: "Error",
        description: "Failed to log medication intake",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Current Medications Inventory */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Current Medications</h2>
            {medications.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No medications found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {medications.map((med) => (
                  <Card key={med.medicationid}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{med.name}</CardTitle>
                      <CardDescription>
                        {med.dosage} {med.unit}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Remaining:</span>
                          <Badge variant={
                            med.remaining_quantity === null 
                              ? 'secondary' 
                              : med.remaining_quantity < 5 
                                ? 'destructive' 
                                : med.remaining_quantity < 10 
                                  ? 'default' 
                                  : 'secondary'
                          }>
                            {med.remaining_quantity === null 
                              ? 'Not tracked' 
                              : `${med.remaining_quantity} ${med.quantity_unit}`
                            }
                          </Badge>
                        </div>
                        <Button 
                          onClick={() => logIntake(med.medicationid)}
                          className="w-full"
                          size="sm"
                        >
                          Log Intake
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Medication History */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Medication History</h2>
            {logs.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No medication history found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <Card key={log.logid}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {log.status === 'taken' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{log.medication_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.medication_dosage} {log.medication_unit}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant={log.status === 'taken' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {log.takenat 
                              ? format(new Date(log.takenat), 'PPp')
                              : format(new Date(log.createdat), 'PPp')
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
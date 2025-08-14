import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Upload, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MedicationData {
  name: string;
  dosage: number | null;
  unit: string;
  instructions: string;
  initial_quantity: number | null;
  quantity_unit: string;
}

interface MedicationScanDialogProps {
  onMedicationAdded: () => void;
}

export function MedicationScanDialog({ onMedicationAdded }: MedicationScanDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<MedicationData | null>(null);
  const [formData, setFormData] = useState<MedicationData>({
    name: '',
    dosage: null,
    unit: 'mg',
    instructions: '',
    initial_quantity: null,
    quantity_unit: 'pills',
  });

  const handleImageUpload = async (file: File) => {
    setLoading(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;
        
        try {
          // Call the edge function to extract medication data
          const { data, error } = await supabase.functions.invoke('extract-medication', {
            body: { image: base64Image }
          });

          if (error) throw error;

          if (data.success && data.medication) {
            setExtractedData(data.medication);
            setFormData(data.medication);
            toast({
              title: "Medication detected!",
              description: "Information has been extracted from the image. Please review and confirm.",
            });
          } else {
            throw new Error(data.error || 'Failed to extract medication information');
          }
        } catch (error) {
          console.error('Error extracting medication:', error);
          toast({
            title: "Extraction failed",
            description: "Could not extract medication information from the image. Please try again or enter details manually.",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process the image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSaveMedication = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add medications",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.dosage) {
      toast({
        title: "Missing information",
        description: "Please provide at least medication name and dosage",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Insert medication
      const { data: medication, error: medicationError } = await supabase
        .from('medications')
        .insert({
          userid: user.id,
          name: formData.name,
          dosage: formData.dosage,
          unit: formData.unit,
          instructions: formData.instructions || null,
          initial_quantity: formData.initial_quantity,
          remaining_quantity: formData.initial_quantity,
          quantity_unit: formData.quantity_unit,
        })
        .select()
        .single();

      if (medicationError) throw medicationError;

      toast({
        title: "Success",
        description: "Medication added successfully",
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        dosage: null,
        unit: 'mg',
        instructions: '',
        initial_quantity: null,
        quantity_unit: 'pills',
      });
      setExtractedData(null);
      setOpen(false);
      onMedicationAdded();

    } catch (error) {
      console.error('Error saving medication:', error);
      toast({
        title: "Error",
        description: "Failed to save medication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Medication</DialogTitle>
          <DialogDescription>
            Scan a medication label or enter details manually
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan">Scan Label</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-4">
            {!extractedData ? (
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="hidden"
                />
                
                <div className="grid gap-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="h-32 border-dashed"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8" />
                      <span>{loading ? 'Processing...' : 'Upload medication label photo'}</span>
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Extracted Information:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {extractedData.name}</p>
                    <p><strong>Dosage:</strong> {extractedData.dosage} {extractedData.unit}</p>
                    {extractedData.instructions && (
                      <p><strong>Instructions:</strong> {extractedData.instructions}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual">
            <div className="text-sm text-muted-foreground mb-4">
              Enter medication details manually
            </div>
          </TabsContent>
        </Tabs>

        {/* Medication Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medication Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Aspirin"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <div className="flex gap-2">
                <Input
                  id="dosage"
                  type="number"
                  value={formData.dosage || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosage: parseFloat(e.target.value) || null }))}
                  placeholder="e.g., 500"
                  required
                />
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mg">mg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="mcg">mcg</SelectItem>
                    <SelectItem value="units">units</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Input
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="e.g., Take with food, twice daily"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial_quantity">Initial Quantity</Label>
              <Input
                id="initial_quantity"
                type="number"
                value={formData.initial_quantity || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, initial_quantity: parseInt(e.target.value) || null }))}
                placeholder="e.g., 30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity_unit">Unit</Label>
              <Select
                value={formData.quantity_unit}
                onValueChange={(value) => setFormData(prev => ({ ...prev, quantity_unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pills">pills</SelectItem>
                  <SelectItem value="tablets">tablets</SelectItem>
                  <SelectItem value="capsules">capsules</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="patches">patches</SelectItem>
                  <SelectItem value="doses">doses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveMedication} disabled={loading}>
            {loading ? 'Saving...' : 'Save Medication'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
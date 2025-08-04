import { useState } from "react";
import { Check, Clock, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MedicationCardProps {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  frequency: string;
  pillsLeft?: number;
}

export const MedicationCard = ({
  name,
  dosage,
  time,
  taken,
  frequency,
  pillsLeft
}: MedicationCardProps) => {
  const [isTaken, setIsTaken] = useState(taken);

  const handleMarkTaken = () => {
    setIsTaken(!isTaken);
  };

  return (
    <Card className="bg-gradient-card border shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isTaken ? 'bg-success/10' : 'bg-primary/10'}`}>
              <Pill className={`h-5 w-5 ${isTaken ? 'text-success' : 'text-primary'}`} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">{dosage}</p>
            </div>
          </div>
          <Badge variant={isTaken ? "secondary" : "outline"} className="text-xs">
            {frequency}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
            {pillsLeft && (
              <span className="ml-2 text-xs">• {pillsLeft} pills left</span>
            )}
          </div>
          
          <Button
            variant={isTaken ? "success" : "hero"}
            size="sm"
            onClick={handleMarkTaken}
            className="min-w-[100px]"
          >
            {isTaken ? (
              <>
                <Check className="h-4 w-4" />
                Taken
              </>
            ) : (
              "Mark Taken"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
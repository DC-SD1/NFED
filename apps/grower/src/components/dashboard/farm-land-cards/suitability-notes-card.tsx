"use client";
import { Card, CardContent } from "@cf/ui";

interface SuitabilityNotesCardProps {
  suitabilityNotes?: string[];
}

export default function SuitabilityNotesCard({
  suitabilityNotes,
}: SuitabilityNotesCardProps) {
  if (!suitabilityNotes || suitabilityNotes.length === 0) {
    return null;
  }

  return (
    <Card className="w-full rounded-lg border-none bg-white shadow-lg">
      <CardContent className="p-6">
        <ul className="space-y-3">
          {suitabilityNotes.map((note, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-3 mt-1.5 inline-block size-1 shrink-0 rounded-full bg-black"></span>
              <p className="text-foreground text-sm leading-relaxed">{note}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

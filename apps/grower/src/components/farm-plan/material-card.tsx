import React from "react";

interface MaterialCardProps {
  name: string;
  details: string;
  cost: string;
  category: string;
  notes?: string;
  categoryColors?: string;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  name,
  details,
  cost,
  category,
  notes,
  categoryColors,
}) => {
  return (
    <div className="rounded-2xl p-4 shadow-md transition-shadow">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-thin">{name}</h3>

          <div className="my-2 flex items-center gap-2">
            <p className="text-gray-dark  text-sm">{details}</p>
            <p className="text-gray-dark text-sm font-thin">{cost}</p>
          </div>
          {notes && <p className="text-sm font-thin">{notes}</p>}
        </div>
        <div className="ml-4 text-right">
          <span
            className={`rounded-full px-2 py-1 text-xs font-thin ${categoryColors || "bg-gray-200 text-black"}`}
          >
            {category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;

'use client';

import { cn } from '@/lib/utils';
import { Edit2, Trash2 } from 'lucide-react';

interface CareRecipientCardProps {
  id: string;
  name: string;
  birthYear: number;
  careLevel?: string;
  diseases?: string[];
  mobilityLevel?: string;
  specialNotes?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

function getAgeFromBirthYear(birthYear: number): string {
  const age = new Date().getFullYear() - birthYear;
  return `${age}세`;
}

export default function CareRecipientCard({
  id,
  name,
  birthYear,
  careLevel,
  diseases = [],
  mobilityLevel,
  specialNotes,
  onEdit,
  onDelete,
  className,
}: CareRecipientCardProps) {
  const age = getAgeFromBirthYear(birthYear);

  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-2xl flex-shrink-0">
            👴
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{name}</span>
              {careLevel && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary-100 text-primary-600">
                  {careLevel}
                </span>
              )}
              {mobilityLevel && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-600">
                  {mobilityLevel}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">{age}</span>
            {diseases.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {diseases.map((d) => (
                  <span key={d} className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-500">
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(id)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {specialNotes && (
        <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
          {specialNotes}
        </p>
      )}
    </div>
  );
}

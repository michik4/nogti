import React from 'react';
import { Master } from '@/types/user.types';
import { Skeleton } from '@/components/ui/skeleton';
import MasterCard from './MasterCard';
import styles from './MastersGrid.module.css';

interface MastersGridProps {
  masters: Master[];
  isLoading: boolean;
  onMasterClick: (masterId: string) => void;
}

const MastersGrid: React.FC<MastersGridProps> = ({
  masters,
  isLoading,
  onMasterClick
}) => {
  if (isLoading) {
    return (
      <div className={styles.mastersGrid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={styles.masterCardSkeleton}>
            <Skeleton className="w-full h-48 rounded-lg" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.mastersGrid}>
      {masters.map(master => (
        <MasterCard
          key={master.id}
          master={master}
          onClick={() => onMasterClick(master.id)}
        />
      ))}
    </div>
  );
};

export default MastersGrid; 
import { Suspense } from 'react';

import { VoicesPageClient } from '@/src/components/voices/VoicesPageClient';

export default function VoicesPage() {
  return (
    <Suspense>
      <VoicesPageClient />
    </Suspense>
  );
}

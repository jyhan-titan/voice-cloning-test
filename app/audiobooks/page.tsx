import { Suspense } from 'react';

import { AudiobooksPageClient } from '@/src/components/audiobooks/AudiobooksPageClient';

export default function AudiobooksPage() {
  return (
    <Suspense>
      <AudiobooksPageClient />
    </Suspense>
  );
}

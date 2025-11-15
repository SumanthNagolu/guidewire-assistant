'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface TopicEditButtonProps {
  topicId: string;
  title?: string;
}

export default function TopicEditButton({ topicId, title }: TopicEditButtonProps) {
  const router = useRouter();

  const handleClick = () => {
        router.push(`/admin/topics/${topicId}`);
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleClick}
      type="button"
      title={title || `Edit topic ${topicId}`}
    >
      Edit
    </Button>
  );
}


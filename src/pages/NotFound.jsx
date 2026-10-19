import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { buttonStyles } from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

export default function NotFound() {
  return (
    <>
      <h1 className="sr-only">Page not found</h1>
      <EmptyState icon={Compass} title="We couldn't find that page" description="The link may be broken or the page may have moved.">
        <Link to="/" className={buttonStyles('primary')}>
          Back to dashboard
        </Link>
      </EmptyState>
    </>
  );
}

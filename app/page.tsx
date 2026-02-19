import StorefrontPage from './[slug]/page';
import StorefrontLayout from './[slug]/layout';

export default function RootPage() {
  // Hardcode the slug to 'teomotos' for the root path
  return (
    <StorefrontLayout>
      <StorefrontPage />
    </StorefrontLayout>
  );
}

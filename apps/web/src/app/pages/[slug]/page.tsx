import { notFound } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await fetch(`${API}/content/pages/${slug}`, { cache: 'no-store' });
  if (!res.ok) notFound();
  const page = await res.json();
  if (!page) notFound();

  return (
    <main className="tmh-section container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="tmh-panel">
            <h1 className="tmh-display h2">{page.title}</h1>
            <pre className="mb-0 mt-3" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7 }}>
              {page.body}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}

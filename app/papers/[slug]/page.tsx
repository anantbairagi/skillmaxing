import { PaperView } from '@/components/Learn';
import { papers } from '@/lib/catalog';
export function generateStaticParams(){ return papers.map((paper) => ({ slug: paper.slug })); }
export default function Page(){ return <PaperView />; }

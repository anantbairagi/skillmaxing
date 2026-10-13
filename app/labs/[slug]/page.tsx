import { LabView } from '@/components/Learn';
import { labs } from '@/lib/labs';
export function generateStaticParams(){ return labs.map((lab) => ({ slug: lab.slug })); }
export default function Page(){ return <LabView />; }

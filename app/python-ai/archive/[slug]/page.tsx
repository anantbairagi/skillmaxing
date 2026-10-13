import { LessonView } from '@/components/Learn';
import { courseById, flatLessons } from '@/lib/catalog';
export function generateStaticParams(){ return flatLessons(courseById('python-ai')).map((lesson) => ({ slug: lesson.slug })); }
export default function Page(){ return <LessonView courseId="python-ai" />; }

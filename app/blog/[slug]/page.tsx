import { BlogPost } from '@/components/Learn';
import { posts } from '@/lib/catalog';
export function generateStaticParams(){ return posts.map((post) => ({ slug: post.slug })); }
export default function Page(){ return <BlogPost />; }

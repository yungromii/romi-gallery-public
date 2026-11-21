export const buckets=['daily:original','daily:generated','favorite:original','favorite:generated'];
export function initialLayout(person){return Object.fromEntries(buckets.map(key=>{const [category,kind]=key.split(':');return [key,[...new Set((person.outfits||[]).filter(o=>o.category===category).flatMap(o=>o[kind==='original'?'originalFiles':'generatedFiles']))]]}));}

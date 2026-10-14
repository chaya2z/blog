import type { APIRoute } from 'astro';

const robotsTxt = `User-agent: *
Allow: /
`;

export const GET: APIRoute = () => new Response(robotsTxt);

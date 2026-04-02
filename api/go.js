export default function handler(req, res) {
  const target = process.env.REDIRECT_URL || 'https://baby-nini-site.vercel.app';
  res.writeHead(302, { Location: target });
  res.end();
}

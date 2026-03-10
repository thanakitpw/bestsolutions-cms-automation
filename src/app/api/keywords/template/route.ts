import { NextResponse } from 'next/server'

export async function GET() {
  const csv = `title,primary_keyword,slug,cluster,content_type,priority
วิธีทำ SEO เบื้องต้น,SEO เบื้องต้น,seo-beginners-guide,SEO & Digital Marketing,Blog,High
ซอฟต์แวร์บัญชีสำหรับธุรกิจ,ซอฟต์แวร์บัญชี,accounting-software-sme,บัญชีและการเงิน,Pillar Page,Medium`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="keywords_template.csv"',
    },
  })
}

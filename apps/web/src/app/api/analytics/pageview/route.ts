/**
 * Pageview Analytics API
 * POST /api/analytics/pageview — Anonymous, records a page view
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@traceroutex/db"
import { pageviewSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = pageviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { postSlug, visitorId, referrer, scrollDepth } = parsed.data

    // Extract country from Vercel's geo header
    const country = req.headers.get("x-vercel-ip-country") || null
    const userAgent = req.headers.get("user-agent") || null

    // Record individual page view
    await prisma.pageView.create({
      data: {
        postSlug,
        visitorId,
        country,
        referrer: referrer || null,
        userAgent,
      },
    })

    // Count unique visitors for this post
    const uniqueCount = await prisma.pageView.groupBy({
      by: ["visitorId"],
      where: { postSlug },
    })

    // Upsert aggregated analytics
    await prisma.postAnalytics.upsert({
      where: { postSlug },
      update: {
        viewCount: { increment: 1 },
        uniqueVisitors: uniqueCount.length,
        ...(scrollDepth !== undefined && {
          avgReadDepth: scrollDepth,
        }),
      },
      create: {
        postSlug,
        viewCount: 1,
        uniqueVisitors: 1,
        avgReadDepth: scrollDepth || 0,
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("POST /api/analytics/pageview error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

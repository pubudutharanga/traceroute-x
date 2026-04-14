/**
 * Admin Analytics Summary API
 * GET /api/admin/analytics?period=7d|30d|90d
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@traceroutex/db"
import { periodSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const periodRaw = req.nextUrl.searchParams.get("period") || "30d"
    const parsed = periodSchema.safeParse(periodRaw)
    const period = parsed.success ? parsed.data : "30d"

    const daysMap = { "7d": 7, "30d": 30, "90d": 90 }
    const since = new Date()
    since.setDate(since.getDate() - daysMap[period])

    // Daily views over the period
    const dailyViews = await prisma.pageView.groupBy({
      by: ["postSlug"],
      _count: { id: true },
      where: { createdAt: { gte: since } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    })

    // Referrer breakdown
    const referrers = await prisma.pageView.groupBy({
      by: ["referrer"],
      _count: { id: true },
      where: { createdAt: { gte: since }, referrer: { not: null } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    })

    // Country breakdown
    const countries = await prisma.pageView.groupBy({
      by: ["country"],
      _count: { id: true },
      where: { createdAt: { gte: since }, country: { not: null } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    })

    // Totals
    const [totalViews, totalUniqueVisitors, totalLikes, totalComments] =
      await Promise.all([
        prisma.pageView.count({ where: { createdAt: { gte: since } } }),
        prisma.pageView
          .groupBy({
            by: ["visitorId"],
            where: { createdAt: { gte: since } },
          })
          .then((r) => r.length),
        prisma.like.count({ where: { createdAt: { gte: since } } }),
        prisma.comment.count({
          where: { createdAt: { gte: since }, isDeleted: false },
        }),
      ])

    return NextResponse.json({
      period,
      totals: {
        views: totalViews,
        uniqueVisitors: totalUniqueVisitors,
        likes: totalLikes,
        comments: totalComments,
      },
      topPosts: dailyViews.map((d) => ({
        postSlug: d.postSlug,
        views: d._count.id,
      })),
      referrers: referrers.map((r) => ({
        referrer: r.referrer,
        count: r._count.id,
      })),
      countries: countries.map((c) => ({
        country: c.country,
        count: c._count.id,
      })),
    })
  } catch (error) {
    console.error("GET /api/admin/analytics error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

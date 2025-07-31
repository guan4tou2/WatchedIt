import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("perPage") || "10";

  if (!query) {
    return NextResponse.json({ error: "搜尋詞是必需的" }, { status: 400 });
  }

  try {
    const graphqlQuery = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(search: $search, type: ANIME, sort: [POPULARITY_DESC, SCORE_DESC]) {
            id
            title {
              romaji
              english
              native
            }
            type
            format
            episodes
            duration
            status
            season
            seasonYear
            description
            genres
            averageScore
            coverImage {
              large
              medium
            }
            bannerImage
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            synonyms
            countryOfOrigin
          }
        }
      }
    `;

    const response = await fetch("https://trace.moe/anilist/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: {
          search: query,
          page: parseInt(page),
          perPage: parseInt(perPage),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0]?.message || "AniList API error");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("AniList API error:", error);
    return NextResponse.json(
      { error: "搜尋失敗，請稍後再試" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/config";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, params.path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, params.path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, params.path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, params.path, "DELETE");
}

async function handleApiRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const baseUrl = getApiBaseUrl();
    const path = pathSegments.join("/");
    const url = new URL(request.url);
    const queryString = url.search;

    // 如果 baseUrl 是相對路徑，表示沒有外部後端服務
    if (baseUrl === "/api") {
      return NextResponse.json(
        {
          error: "API 端點未配置",
          message:
            "請設定 NEXT_PUBLIC_API_URL 環境變數或部署後端服務。目前僅支援本地儲存模式。",
        },
        { status: 503 }
      );
    }

    // 構建目標 URL
    const targetUrl = `${baseUrl}/${path}${queryString}`;

    console.log(`代理 API 請求: ${method} ${targetUrl}`);

    // 準備請求選項
    const requestOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...Object.fromEntries(request.headers.entries()),
      },
    };

    // 如果是 POST、PUT 等需要 body 的請求
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const body = await request.text();
      if (body) {
        requestOptions.body = body;
      }
    }

    // 發送請求到後端
    const response = await fetch(targetUrl, requestOptions);

    // 獲取回應內容
    const responseText = await response.text();

    // 構建 Next.js 回應
    const nextResponse = new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
    });

    // 複製回應標頭
    response.headers.forEach((value, key) => {
      nextResponse.headers.set(key, value);
    });

    return nextResponse;
  } catch (error) {
    console.error("API 代理錯誤:", error);
    return NextResponse.json(
      {
        error: "API 代理錯誤",
        message: error instanceof Error ? error.message : "未知錯誤",
      },
      { status: 500 }
    );
  }
}

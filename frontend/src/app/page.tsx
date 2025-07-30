'use client'

import { useEffect } from 'react'
import { useWorkStore } from '@/store/useWorkStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Film, Book, Tv, Monitor } from 'lucide-react'

export default function HomePage() {
  const { works, stats, loading, fetchWorks, fetchStats } = useWorkStore()

  useEffect(() => {
    fetchWorks()
    fetchStats()
  }, [fetchWorks, fetchStats])

  const workTypes = [
    { name: '動畫', icon: Film, count: stats?.type_stats?.動畫 || 0 },
    { name: '電影', icon: Monitor, count: stats?.type_stats?.電影 || 0 },
    { name: '電視劇', icon: Tv, count: stats?.type_stats?.電視劇 || 0 },
    { name: '小說', icon: Book, count: stats?.type_stats?.小說 || 0 },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">看過了</h1>
        <p className="text-muted-foreground">記錄你的觀影、閱讀體驗</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {workTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card key={type.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{type.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{type.count}</div>
                <p className="text-xs text-muted-foreground">部作品</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 最近作品 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">最近作品</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新增作品
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">載入中...</div>
        ) : works.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">還沒有任何作品記錄</p>
              <Button>開始記錄</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.slice(0, 6).map((work) => (
              <Card key={work.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{work.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{work.type} • {work.status}</p>
                </CardHeader>
                <CardContent>
                  {work.rating && (
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-muted-foreground mr-2">評分:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < work.rating! ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {work.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {work.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 
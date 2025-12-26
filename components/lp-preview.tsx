"use client"

import { LPStructure } from "@/lib/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface LPPreviewProps {
    data: LPStructure
    onReset: () => void
}

export function LPPreview({ data, onReset }: LPPreviewProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h2 className="text-2xl font-bold">{data.meta.title}</h2>
                    <p className="text-muted-foreground">{data.meta.description}</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => window.print()} variant="secondary">PDF出力</Button>
                    <Button onClick={onReset} variant="outline">新規作成</Button>
                </div>
            </div>

            <ScrollArea className="h-[700px] w-full border rounded-md p-4 bg-slate-50">
                <div className="space-y-8">
                    {data.sections.map((section, index) => (
                        <Card key={index} className="overflow-hidden border-2" style={{ borderColor: section.style?.layout === 'highlight' ? 'var(--primary)' : undefined }}>
                            <CardHeader className="bg-white border-b">
                                <div className="flex justify-between items-center">
                                    <Badge variant="secondary">{section.type.toUpperCase()}</Badge>
                                    {section.style?.layout && <span className="text-xs text-muted-foreground">Layout: {section.style.layout}</span>}
                                </div>
                                <CardTitle className="text-xl mt-2">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                                <div className="prose prose-sm max-w-none">
                                    <h4 className="font-semibold text-sm text-gray-500 mb-2">コピー / 内容</h4>
                                    <div className="whitespace-pre-wrap text-gray-800">{section.content}</div>
                                </div>
                                {section.imagePrompt && (
                                    <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex flex-col">
                                        <div className="relative aspect-video w-full bg-slate-200">
                                            {/* Using Pollinations.ai for simple, free image generation demo */}
                                            <img
                                                src={`https://image.pollinations.ai/prompt/${encodeURIComponent(section.imagePrompt)}?width=800&height=450&nologo=true`}
                                                alt={section.imagePrompt}
                                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="p-3 bg-white border-t">
                                            <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-1">画像プロンプト (AI用)</h4>
                                            <p className="text-xs text-gray-600 line-clamp-2" title={section.imagePrompt}>{section.imagePrompt}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

"use client"

import { useState } from "react"
import { useApiKey } from "@/context/api-key-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Key } from "lucide-react"

export function ApiKeyInput() {
    const { setApiKey, hasKey } = useApiKey()
    const [inputKey, setInputKey] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (inputKey.trim().length > 0) {
            setApiKey(inputKey.trim())
        }
    }

    if (hasKey) {
        return (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <Key className="w-4 h-4" />
                <span>API Key 設定済み</span>
                <Button variant="ghost" size="sm" onClick={() => setApiKey("")} className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive">変更</Button>
            </div>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Gemini API 設定
                </CardTitle>
                <CardDescription>
                    LP構成案を生成するために、Gemini APIキーを入力してください。
                    <br />
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        APIキーの取得はこちら
                    </a>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                            type="password"
                            id="apiKey"
                            placeholder="AIzaSy..."
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={!inputKey}>利用開始</Button>
                </form>
            </CardContent>
        </Card>
    )
}

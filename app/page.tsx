"use client"

import { useState } from "react"
import { useApiKey } from "@/context/api-key-context"
import { ApiKeyInput } from "@/components/api-key-input"
import { LPForm, LPRequirements } from "@/components/lp-form"
import { LPPreview } from "@/components/lp-preview"
import { generateLPStructure } from "@/app/actions"
import { LPStructure } from "@/lib/schema"

export default function Home() {
  const { apiKey, hasKey } = useApiKey()
  const [isLoading, setIsLoading] = useState(false)
  const [lpData, setLpData] = useState<LPStructure | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleGenerate = async (requirements: LPRequirements) => {
    if (!apiKey) return
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const result = await generateLPStructure(apiKey, requirements)
      if (result.success && result.data) {
        setLpData(result.data)
      } else {
        setErrorMsg(typeof result.error === 'string' ? result.error : "生成に失敗しました。時間をおいて再試行してください。")
      }
    } catch (error: any) {
      console.error(error)
      if (error.message?.includes("body")) {
         setErrorMsg("画像サイズが大きすぎます。より小さな画像を使用してください。")
      } else {
         setErrorMsg("エラーが発生しました。コンソールをご確認ください。")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setLpData(null)
    setErrorMsg(null)
  }

  return (
    <main className="container mx-auto p-4 min-h-screen pb-20">
      <div className="mb-8 text-center space-y-2 pt-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">構成案作るくん</h1>
        <p className="text-muted-foreground">AIを活用したランディングページ構成ジェネレーター</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {!hasKey && <ApiKeyInput />}

        {hasKey && (
          <>
            <div className="flex justify-end">
              <ApiKeyInput />
            </div>

            {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    {errorMsg}
                </div>
            )}

            {!lpData ? (
              <LPForm onSubmit={handleGenerate} isLoading={isLoading} />
            ) : (
              <LPPreview data={lpData} onReset={handleReset} />
            )}
          </>
        )}
      </div>
    </main>
  );
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface LPRequirements {
    productName: string
    targetAudience: string
    usp: string // Unique Selling Proposition
    goal: string // Conversion goal (e.g., Purchase, Newsletter)
    mood: string // Design mood
    otherNotes: string
    modelId?: string // Optional manual override
    refImage?: string // Base64 encoded image
}

interface LPFormProps {
    onSubmit: (data: LPRequirements) => void
    isLoading: boolean
}

export function LPForm({ onSubmit, isLoading }: LPFormProps) {
    const [formData, setFormData] = useState<LPRequirements>({
        productName: "",
        targetAudience: "",
        usp: "",
        goal: "purchase",
        mood: "professional",
        otherNotes: "",
        modelId: "",
        refImage: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: keyof LPRequirements, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>LP構成要件</CardTitle>
                <CardDescription>作成したい製品やサービスの情報を入力してください。</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="productName">製品・サービス名</Label>
                        <Input
                            id="productName"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            placeholder="例: 次世代アナリティクス Pro"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="targetAudience">ターゲット層</Label>
                        <Input
                            id="targetAudience"
                            name="targetAudience"
                            value={formData.targetAudience}
                            onChange={handleChange}
                            placeholder="例: 中小企業の経営者, マーケティング担当者"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="usp">独自の強み (USP)</Label>
                        <Textarea
                            id="usp"
                            name="usp"
                            value={formData.usp}
                            onChange={handleChange}
                            placeholder="他社との違いは？ なぜ顧客はこれを選ぶべきですか？"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="goal">コンバージョン目標</Label>
                            <Select name="goal" value={formData.goal} onValueChange={(val) => handleSelectChange("goal", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="目標を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="purchase">購入 / 販売</SelectItem>
                                    <SelectItem value="lead">リード獲得 / お問い合わせ</SelectItem>
                                    <SelectItem value="app_install">アプリインストール</SelectItem>
                                    <SelectItem value="webinar">ウェビナー登録</SelectItem>
                                    <SelectItem value="branding">ブランド認知拡大</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mood">デザインの雰囲気</Label>
                            <Input
                                id="mood"
                                name="mood"
                                value={formData.mood}
                                onChange={handleChange}
                                placeholder="例: 親しみやすい、高級感のある黒ベース、など"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>デザイン参考画像 (任意)</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData(prev => ({ ...prev, refImage: reader.result as string }));
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {formData.refImage ? (
                                <div className="relative h-32 w-full max-w-[200px] mx-auto">
                                    <img src={formData.refImage} alt="Reference" className="object-contain h-full w-full" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setFormData(prev => ({ ...prev, refImage: "" }));
                                        }}
                                    >
                                        ×
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-gray-500 text-sm">
                                    <p>画像をドラッグ&ドロップ</p>
                                    <p className="text-xs mt-1">またはクリックして選択</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="otherNotes">その他メモ (任意)</Label>
                        <Textarea
                            id="otherNotes"
                            name="otherNotes"
                            value={formData.otherNotes}
                            onChange={handleChange}
                            placeholder="特定のセクション希望など (例: FAQ, 料金表, チーム紹介)"
                        />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? "構成案を生成する" : "LP構成案を生成"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

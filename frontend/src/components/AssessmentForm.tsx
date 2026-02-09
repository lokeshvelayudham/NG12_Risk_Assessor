"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function AssessmentForm() {
    const [patientId, setPatientId] = React.useState("")
    const [result, setResult] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState("")

    const handleAssess = async () => {
        if (!patientId.trim()) return
        setIsLoading(true)
        setError("")
        setResult(null)

        try {
            const response = await fetch(`${API_URL}/api/assess`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patient_id: patientId }),
            })

            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.detail || "Assessment failed")
            }

            const data = await response.json()
            setResult(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <div className="grid gap-6 md:grid-cols-2">
        <Card>
        <CardHeader>
            <CardTitle>New Assessment</CardTitle>
            <CardDescription>
            Enter Patient ID to retrieve data and assess risk.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Patient ID</label>
                <Input 
                    placeholder="e.g. PT-101" 
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter>
            <Button onClick={handleAssess} disabled={isLoading} className="w-full">
                {isLoading ? "Analyzing..." : "Run Assessment"}
            </Button>
        </CardFooter>
        </Card>

        {result && (
            <Card className={result.assessment === "Urgent Referral" ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "border-green-500 bg-green-50 dark:bg-green-950/20"}>
                <CardHeader>
                    <CardTitle>Assessment Result</CardTitle>
                    <CardDescription>Model Recommendation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">{result.assessment}</h3>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm">Reasoning</h4>
                        <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                    </div>
                    {result.citations && (
                        <div>
                             <h4 className="font-medium text-sm">Citations</h4>
                             <ul className="list-disc pl-4 text-sm text-muted-foreground">
                                {result.citations.map((c: string, i: number) => <li key={i}>{c}</li>)}
                             </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
    </div>
  )
}

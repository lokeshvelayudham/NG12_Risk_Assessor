import { AssessmentForm } from "@/components/AssessmentForm";

export default function AssessmentPage() {
  return (
    <div className="h-full p-4 lg:p-8 space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Risk Assessment</h1>
        <p className="text-muted-foreground">
          Analyze patient data against NICE NG12 suspected cancer guidelines.
        </p>
      </div>
      <AssessmentForm />
    </div>
  );
}

import { AppraisalTabs } from "@/systems/pam/components/appraisal-tabs";
import { AppraisalDrawer } from "@/systems/pam/components/appraisal-drawer";
import { AppraisalsLoader } from "@/systems/pam/components/appraisal-loader";
export default function AppraisalsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold">Performance Appraisals</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Monitor probationary employee appraisal milestones
        </p>
      </div>

      {/* Data + tabs — client component handles fetch */}
      <AppraisalsLoader />

      {/* Drawer — mounted once, controlled via store */}
      <AppraisalDrawer />
    </div>
  );
}
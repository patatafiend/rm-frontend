"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppraisalTable } from "./appraisal-table";
import { useAppraisalStore } from "@/systems/pam/store/appraisals.store";
import type { AppraisalRecord } from "@/systems/pam/types/appraisal";

interface Props {
  third: AppraisalRecord[];
  fifth: AppraisalRecord[];
  extension: AppraisalRecord[];
}

export function AppraisalTabs({ third, fifth, extension }: Props) {
  const { activeTab, setActiveTab } = useAppraisalStore();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as "third" | "fifth" | "extension")}
    >
      <TabsList className="mb-4">
        <TabsTrigger value="third" className="gap-2">
          3rd Month
          <TabCount count={third.length} />
        </TabsTrigger>
        <TabsTrigger value="fifth" className="gap-2">
          5th Month
          <TabCount count={fifth.length} />
        </TabsTrigger>
        <TabsTrigger value="extension" className="gap-2">
          Extension
          <TabCount count={extension.length} />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="third">
        <AppraisalTable
          records={third}
          dueDateField="third_month_due_date"
          dueDateLabel="3rd Month Due"
        />
      </TabsContent>

      <TabsContent value="fifth">
        <AppraisalTable
          records={fifth}
          dueDateField="fifth_month_due_date"
          dueDateLabel="5th Month Due"
        />
      </TabsContent>

      <TabsContent value="extension">
        <AppraisalTable
          records={extension}
          dueDateField="extension_until"
          dueDateLabel="Extension Until"
        />
      </TabsContent>
    </Tabs>
  );
}

function TabCount({ count }: { count: number }) {
  return (
    <span className="ml-0.5 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
      {count}
    </span>
  );
}
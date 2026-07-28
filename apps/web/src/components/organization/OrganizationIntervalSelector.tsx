"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export type OrganizationInterval =
  | "WEEK"
  | "MONTH"
  | "QUARTER";

interface OrganizationIntervalSelectorProps {
  value: OrganizationInterval;
  onChange: (value: OrganizationInterval) => void;
  disabled?: boolean;
}

const intervals: {
  value: OrganizationInterval;
  label: string;
}[] = [
  {
    value: "WEEK",
    label: "Week",
  },
  {
    value: "MONTH",
    label: "Month",
  },
  {
    value: "QUARTER",
    label: "Quarter",
  },
];

export default function OrganizationIntervalSelector({
  value,
  onChange,
  disabled = false,
}: OrganizationIntervalSelectorProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => {
        onChange(nextValue as OrganizationInterval);
      }}
    >
      <TabsList>
        {intervals.map((interval) => (
          <TabsTrigger
            key={interval.value}
            value={interval.value}
            disabled={disabled}
          >
            {interval.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
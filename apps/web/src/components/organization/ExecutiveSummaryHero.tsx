"use client";

import {
    Brain,
    GitBranch,
    ShieldAlert,
    ShieldCheck
} from "lucide-react";

import ExecutiveStat from "./ExecutiveStat";

interface Props{

overview:any;

}

export default function ExecutiveSummaryHero({
overview
}:Props){

return(

<div className="grid gap-5 xl:grid-cols-4">

<ExecutiveStat
title="Repositories"
value={overview.totalRepositories}
subtitle="Tracked"
icon={<GitBranch className="h-6 w-6"/>}
/>

<ExecutiveStat
title="Engineering"
value={overview.averageEngineeringQualityScore}
subtitle="Average quality"
icon={<Brain className="h-6 w-6"/>}
/>

<ExecutiveStat
title="Production"
value={overview.averageProductionReadinessScore}
subtitle="Readiness"
icon={<ShieldCheck className="h-6 w-6"/>}
/>

<ExecutiveStat
title="Risk"
value={overview.averageRiskScore}
subtitle={overview.overallRiskLevel}
icon={<ShieldAlert className="h-6 w-6"/>}
/>

</div>

);

}
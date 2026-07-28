"use client";

import {
Lightbulb
} from "lucide-react";

import {
Card,
CardContent,
CardHeader,
CardTitle
} from "@/components/ui/card";

export default function SmartInsights({

overview

}:{

overview:any;

}){

const insights:string[]=[];

if(
overview.averageArchitectureScore>
overview.averageProductionReadinessScore
){

insights.push(
"Architecture quality currently exceeds production readiness."
);

}

if(
overview.averageEngineeringQualityScore>=90
){

insights.push(
"Engineering quality remains consistently excellent."
);

}

if(
overview.averageRiskScore>60
){

insights.push(
"Several repositories require engineering attention."
);

}else{

insights.push(
"Overall engineering risk remains under control."
);

}

return(

<Card>

<CardHeader>

<CardTitle className="flex items-center gap-2">

<Lightbulb className="h-5 w-5"/>

Engineering Insights

</CardTitle>

</CardHeader>

<CardContent>

<div className="space-y-3">

{insights.map((item,index)=>(

<div
key={index}
className="rounded-lg border p-4"
>

{item}

</div>

))}

</div>

</CardContent>

</Card>

);

}
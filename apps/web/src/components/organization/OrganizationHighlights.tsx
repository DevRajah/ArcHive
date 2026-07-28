"use client";

import { Trophy } from "lucide-react";

import {
Card,
CardContent
} from "@/components/ui/card";

export default function OrganizationHighlights({

repositories

}:{

repositories:any[];

}){

const best=[...repositories]
.sort((a,b)=>b.overallScore-a.overallScore)[0];

const risk=[...repositories]
.sort((a,b)=>b.riskScore-a.riskScore)[0];

return(

<div className="grid gap-5 lg:grid-cols-2">

<Card>

<CardContent className="p-6">

<div className="flex items-center gap-3">

<Trophy className="h-6 w-6 text-yellow-500"/>

<div>

<h2 className="font-bold">
Best Repository
</h2>

<p className="text-muted-foreground">
{best?.repositoryName}
</p>

</div>

</div>

</CardContent>

</Card>

<Card>

<CardContent className="p-6">

<div className="flex items-center gap-3">

<Trophy className="h-6 w-6 text-red-500"/>

<div>

<h2 className="font-bold">
Highest Risk
</h2>

<p className="text-muted-foreground">
{risk?.repositoryName}
</p>

</div>

</div>

</CardContent>

</Card>

</div>

);

}
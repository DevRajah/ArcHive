@'
CREATE UNIQUE INDEX "Repository_githubRepoId_key"
ON "Repository"("githubRepoId");
'@ |
Set-Content "$folder/migration.sql"
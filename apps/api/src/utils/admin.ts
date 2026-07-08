export const isPlatformAdmin = (githubUsername?: string | null) => {
  if (!githubUsername) {
    return false;
  }

  const adminGithubUsername = process.env.ADMIN_GITHUB_USERNAME;

  if (!adminGithubUsername) {
    return false;
  }

  return githubUsername.toLowerCase() === adminGithubUsername.toLowerCase();
};
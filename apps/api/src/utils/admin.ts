export const isPlatformAdmin = (githubUsername?: string | null) => {
  if (!githubUsername) {
    return false;
  }

  return (
    githubUsername.toLowerCase() ===
    process.env.ADMIN_GITHUB_USERNAME?.toLowerCase()
  );
};
export interface ResolvedIssueInput {
  rawInput: string;
  sourceType: 'key' | 'url' | 'git_branch' | 'empty';
  extractedKey: string | null;
  normalizedBranchName?: string;
  isValid: boolean;
}

/**
 * Extracts a Linear issue key (e.g. ENG-104, LIN-42, PROD-891) from:
 * 1. Direct key input ("ENG-104")
 * 2. Linear Issue URL ("https://linear.app/workspace/issue/ENG-104/slug")
 * 3. Git branch name ("9icksA/eng-104-auth" or "feature/ENG-104-auth")
 */
export function resolveIssueKey(input: string, currentGitBranch = ''): ResolvedIssueInput {
  const trimmed = (input || '').trim();

  // If input is provided
  if (trimmed) {
    // 1. Check if it's a URL
    const urlMatch = trimmed.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?linear\.app\/[^\/]+\/issue\/([A-Za-z0-9]+-\d+)/i);
    if (urlMatch && urlMatch[1]) {
      return {
        rawInput: trimmed,
        sourceType: 'url',
        extractedKey: urlMatch[1].toUpperCase(),
        isValid: true,
      };
    }

    // 2. Check if it's a direct issue key: e.g. ENG-104 or LIN-12
    const keyMatch = trimmed.match(/^([A-Za-z0-9]+-\d+)$/i);
    if (keyMatch && keyMatch[1]) {
      return {
        rawInput: trimmed,
        sourceType: 'key',
        extractedKey: keyMatch[1].toUpperCase(),
        isValid: true,
      };
    }

    // 3. Check if user typed a branch name into the field
    const branchInInput = trimmed.match(/(?:(?:feature|feat|bugfix|fix|chore|refactor|[a-zA-Z0-9_-]+)\/)?([A-Za-z0-9]+-\d+)/i);
    if (branchInInput && branchInInput[1]) {
      return {
        rawInput: trimmed,
        sourceType: 'git_branch',
        extractedKey: branchInInput[1].toUpperCase(),
        normalizedBranchName: trimmed,
        isValid: true,
      };
    }
  }

  // If input was empty or no match, inspect current git branch fallback
  if (currentGitBranch && currentGitBranch.trim()) {
    const branchMatch = currentGitBranch.trim().match(/(?:(?:feature|feat|bugfix|fix|chore|refactor|[a-zA-Z0-9_-]+)\/)?([A-Za-z0-9]+-\d+)/i);
    if (branchMatch && branchMatch[1]) {
      return {
        rawInput: currentGitBranch,
        sourceType: 'git_branch',
        extractedKey: branchMatch[1].toUpperCase(),
        normalizedBranchName: currentGitBranch.trim(),
        isValid: true,
      };
    }
  }

  return {
    rawInput: trimmed,
    sourceType: 'empty',
    extractedKey: null,
    isValid: false,
  };
}

/**
 * Formats canonical git branch name according to Linear standard:
 * username/issueKey-slug
 */
export function formatLinearBranchName(username: string, issueKey: string, title: string): string {
  const safeUser = (username || '9icksA').toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const safeKey = issueKey.toLowerCase();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return `${safeUser}/${safeKey}-${slug}`;
}
